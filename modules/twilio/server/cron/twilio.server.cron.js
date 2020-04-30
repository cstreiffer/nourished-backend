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

var sendDailyMessage = function(tm, user) {
  var to = '+1' + user.user.phoneNumber;
  var from = config.twilio.phoneNumber;
  var message = util.format(tm.messageBody, user.type, user.restaurant, user.location);
  return twilio.messages
    .create({
       body: message,
       from: from,
       to: to
     });
}

var sendMessage = function(tm, user) {
  var url = config.app.webURL + '?token=' + user.magicLinkToken;
  var to = '+1' + user.phoneNumber;
  var from = config.twilio.phoneNumber;
  return twilio.messages
    .create({
       body: tm.messageBody + url,
       from: from,
       to: to
     });
}

var getStartDate = function() {
  return Date.now() - 15*60*1000+5000;
}

var getEndDate = function() {
  return Date.now() + 15*60*1000+5000;
}

module.exports = function() {
  cron.schedule(config.cron.twilio.dailyUpdate, () => {
    cronDailyUpdate();
  }, {timezone: config.cron.twilio.timezone});

  cron.schedule(config.cron.twilio.weeklyUpdate, () => {
    cronWeeklyUpdate();
  }, {timezone: config.cron.twilio.timezone});
}

var cronDailyUpdate = function() {
  console.log("Daily update");
  async.waterfall([
    function(done) {
      var query = {
        deleted: false,
        payStatus: 'COMPLETE',
        deliveryDate: {
          [Op.gte] : getStartDate(),
          [Op.lte] : getEndDate()
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
      Promise.all(users.map((user) => sendDailyMessage(tm, user)))
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
      Promise.all(users.map((user) => sendMessage(tm, user)))
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