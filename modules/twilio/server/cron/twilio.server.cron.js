'use strict';

var 
  path = require('path'),
  config = require(path.resolve('./config/config')),
  twilio = require(path.resolve('./config/lib/twilio')),
  async = require('async'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Menu = db.menu,
  Order = db.order,
  User = db.user,
  TwilioMessage = db.twiliomessage,
  crypto = require('crypto'),
  cron = require('node-cron');

const {Op} = require('sequelize');
const util = require('util');

var sendMessage = function(message, user) {
  console.log(user.username, message);
  var to = '+1' + user.phoneNumber;
  var from = config.twilio.phoneNumber;
  return twilio.messages
    .create({
       body: message,
       from: from,
       to: to
     });
}

var getStartDate = function(minutes, offset) {
  var ret = Date.now() - minutes*60*1000 + offset - 5000 ;
  return ret;
}

var getEndDate = function(minutes, offset) {
  var ret = Date.now() + minutes*60*1000 + offset + 5000;
  return ret;
}

const getTime = function(date) {
  return new Date(date)
    .toLocaleTimeString("en-US", {timeZone: config.cron.twilio.timezone, hour: '2-digit', minute:'2-digit'})
    .replace(/^0+/, '');
}

module.exports = function() {
  cron.schedule(config.cron.twilio.dailyUpdate, () => {
    cronDailyUpdate();
  }, {timezone: config.cron.twilio.timezone});

  cron.schedule(config.cron.twilio.weeklyUpdate, () => {
    cronWeeklyUpdate();
  }, {timezone: config.cron.twilio.timezone});

  cron.schedule(config.cron.twilio.dailyPrenotify, () => {
    cronDailyPrenotify();
  }, {timezone: config.cron.twilio.timezone});
}

var cronDailyPrenotify = function() {
  console.log("Daily prenotify");
  async.waterfall([
    function(done) {
      var query = {
        deleted: false,
        payStatus: 'COMPLETE',
        deliveryDate: {
          [Op.gte] : getStartDate(15, config.orderTimeCutoff),
          [Op.lte] : getEndDate(15, config.orderTimeCutoff)
        }
      };
      var userQuery = {phoneNumber: {[Op.ne]: ''}};
      Order.findAll({
        where: query,
        include: 
        [{
          model: db.user,
          where: userQuery
        },
        {
          model: db.hospital,
        },
        {
          model: db.restaurant
        }]
      }).then(function(orders) {
        done(null, orders);
      }).catch(function(err) {
        done(err);
      })
    }, 
    function(orders, done) {
      var userKeys = {};
      orders.map((order) => {
        var key = order.user.id + order.restaurantId;
        console.log(key);
        if(! (key in userKeys)) {
          userKeys[key] = {
            user: order.user,
            type: order.type,
            restaurant: order.restaurant.name,
            hospital: order.hospital.name,
            time: getTime(order.deliveryDate),
            location: order.hospital.dropoffLocation
          }
        }
      });
      var users = [];
      Object.keys(userKeys).forEach(function(key) {
        users.push(userKeys[key]);
      });
      done(null, users);
    },
    function(users, done) {
      TwilioMessage.findOne({
        where: {
          subtype: 'DAILY_PRENOTIFY',
        }
      }).then(function(tm) {
        done(null, users, tm);
      }).catch(function(err) {
        done(err);
      });
    },
    function(users, tm, done) {
      Promise.all(users.map((user) => {
        var message = util.format(tm.messageBody, user.restaurant, user.hospital, user.time, user.location);
        sendMessage(message, user.user)
      }))
        .then(function(messageIds) {
          done(null);
        }).catch(function(err) {
          done(err);
        });
    }
    ], 
    function(err){
      if(err) {
        console.log(err);
      }
    }
  );
}


var cronDailyUpdate = function() {
  console.log("Daily update");
  async.waterfall([
    function(done) {
      var query = {
        deleted: false,
        payStatus: 'COMPLETE',
        deliveryDate: {
          [Op.gte] : getStartDate(15, 0),
          [Op.lte] : getEndDate(15, 0)
        }
      };
      var userQuery = {phoneNumber: {[Op.ne]: ''}};
      Order.findAll({
        attributes: ['quantity', 'restStatus', 'userStatus', 'payStatus', 'restaurantId', 'type'],
        where: query,
        include: 
        [{
          model: db.user,
          where: userQuery
        },
        {
          model: db.hospital,
        },
        {
          model: db.restaurant
        }]
      }).then(function(orders) {
        done(null, orders);
      }).catch(function(err) {
        done(err);
      })
    }, 
    function(orders, done) {
      // console.log(orders);
      var userKeys = {};
      orders.map((order) => {
        var key = order.user.id + order.restaurantId;
        console.log(key);
        if(! (key in userKeys)) {
          userKeys[key] = {
            user: order.user,
            type: order.type,
            restaurant: order.restaurant.name,
            location: order.hospital.dropoffLocation
          }
        }
      });
      var users = [];
      Object.keys(userKeys).forEach(function(key) {
        users.push(userKeys[key]);
      });
      done(null, users);
    },
    function(users, done) {
      TwilioMessage.findOne({
        where: {
          subtype: 'DAILY_ORDER',
        }
      }).then(function(tm) {
        done(null, users, tm);
      }).catch(function(err) {
        done(err);
      });
    },
    function(users, tm, done) {
      Promise.all(users.map((user) => {
        var message = util.format(tm.messageBody, user.restaurant, user.location);
        sendMessage(message, user.user);
      }))
        .then(function(messageIds) {
          done(null);
        }).catch(function(err) {
          done(err);
        });
    }
    ], 
    function(err){
      if(err) {
        console.log(err);
      }
    }
  );
}

var cronWeeklyUpdate = function() {
  async.waterfall([
    function(done) {
      User.findAll({
        where: {
          phoneNumber: {
            [Op.ne]: ''
          },
          roles: {
            [Op.contains] : ["user"]
          }
        }
      }).then(function(users) {
        done(null, users);
      }).catch(function(err) {
        done(err);
      });
    },
    function(users, done) {
      Promise.all(users.map((user) => {
          user.magicLinkToken = crypto.randomBytes(20).toString('hex');;
          user.magicLinkExpires = Date.now() + config.twilio.tokenExpiry; // 3 hours
          return user.save();
      }))
      .then(function(users) {
        done(null, users)
      }).catch(function(err) {
        done(err);
      });
    },
    function(users, done) {
      TwilioMessage.findOne({
        where: {
          subtype: 'WEEKLY_MENU',
        }
      }).then(function(tm) {
        done(null, users, tm);
      }).catch(function(err) {
        done(err);
      });
    },
    function(users, tm, done) {
      Promise.all(users.map((user) => {
        // var url = config.app.webURL + '?token=' + user.magicLinkToken;
        var url = config.app.webURL + 'my-menu';
        var message = tm.messageBody + url;
        return sendMessage(message, user);
      }))
        .then(function(messageIds) {
          done(null);
        }).catch(function(err) {
          done(err);
        });
    }], 
    function(err){
      if(err) {
        console.log(err);
      }
    }
  );
}