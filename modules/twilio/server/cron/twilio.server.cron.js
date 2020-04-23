'use strict';

var 
  path = require('path'),
  config = require(path.resolve('./config/config')),
  twilio = require(path.resolve('./config/lib/twilio')),
  async = require('async'),
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
  var message = util.format(tm.messageBody, "meal", user.restaurant, user.location);
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
  return Date.now() - 15*60*1000;
}

var getEndDate = function() {
  return Date.now() + 15*60*1000;
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
  async.waterfall([
    function(done) {
      var timeSlotQuery = {
        date: {
          [Op.gte] : getStartDate(),
          [Op.lte] : getEndDate()
        }
      };
      Menu.findAll({
        attributes: ['id'],
        include: 
          {
            model: db.timeslot,
            where: timeSlotQuery,
            attributes: ['id', 'date'],
          }
      }).then(function(menus) {
        done(null, menus);
      }).catch(function(err) {
        done(err);
      })
    }, 
    function(menus, done) {
      var query = {
        deleted: false,
        menuId: menus.map((menu) => menu.id)
      };
      var userQuery = {phoneNumber: {[Op.ne]: ''}};
      Order.findAll({
        attributes: ['quantity', 'restStatus', 'userStatus', 'payStatus'],
        where: query,
        include: [{
          model: db.user,
          where: userQuery
        },
        {
          model: db.menu,
          include: [
            {
              model: db.meal,
              include: db.mealinfo
            },
            {
              model: db.timeslot,
              include: [db.hospital, db.restaurant]
            }
          ]
        }
        ]
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
        var key = order.user.id + order.menu.timeslot.restaurantId;
        console.log(key);
        if(! (key in userKeys)) {
          userKeys[key] = {
            user: order.user,
            type: order.menu.meal.mealinfo.type,
            restaurant: order.menu.timeslot.restaurant.name,
            location: order.menu.timeslot.hospital.dropoffLocation
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