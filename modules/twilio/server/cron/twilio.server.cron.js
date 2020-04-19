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

var sendMessage = function(tm, user) {
  var url = config.app.webURL + '?token=' + user.resetPasswordToken;
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
  return new Date(new Date().getTime() - 60*60000)
}

var getEndDate = function() {
  return new Date(new Date().getTime() + 60*60000)
}

module.exports = function() {
  cron.schedule(config.cronConfigs.twilioDailyUpdate, () => {
    cronDailyUpdate();
  });

  cron.schedule(config.cronConfigs.twilioWeeklyUpdate, () => {
    cronWeeklyUpdate();
  });
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
        include: {
          model: db.timeslot,
          where: timeSlotQuery,
          attributes: ['id']
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
        include: {
          model: db.user,
          where: userQuery
        }
      }).then(function(orders) {
        done(null, orders);
      }).catch(function(err) {
        done(err);
      })
    }, 
    function(orders, done) {
      var userKeys = {};
      orders.map((order) => {
        if(! (order.user.id in userKeys)) {
          userKeys[order.user.id] = order.user;
        }
      });
      var users = [];
      Object.keys(userKeys).forEach(function(key) {
        users.push(userKeys[key]);
      });
      done(null, users);
    },
    function(users, done) {
      Promise.all(users.map((user) => {
          user.resetPasswordToken = crypto.randomBytes(20).toString('hex');;
          user.resetPasswordExpires = Date.now() + 3600000*3; // 3 hours
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
          subtype: 'DAILY_ORDER',
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
          user.resetPasswordToken = crypto.randomBytes(20).toString('hex');;
          user.resetPasswordExpires = Date.now() + 3600000*3; // 3 hours
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