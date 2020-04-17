'use strict';

var 
  _ = require('lodash'),
  uuid = require('uuid/v4'),
  path = require('path'),
  fs = require('fs'),
  jwt = require('jsonwebtoken'),
  express = require(path.resolve('./config/lib/express')),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  config = require(path.resolve('./config/config')),
  twilio = require(path.resolve('./config/lib/twilio')),
  app = express.init(sequelize),
  config = require(path.resolve('./config/config')),
  async = require('async'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Menu = db.menu,
  Order = db.order,
  TwilioMessage = db.twiliomessage,
  cron = require('node-cron'),
  TinyUrl = require('tinyurl');

const {Op} = require('sequelize');
const jwtSecret = fs.readFileSync(path.resolve(config.jwt.privateKey), 'utf8');

var sendMessage = function(tm, user, url) {
  console.log(user[1]);
  var to = '+1' + user[0].phoneNumber;
  var from = config.twilio.phoneNumber;
  return twilio.messages
    .create({
       body: tm.messageBody + user[1],
       from: from,
       to: to
     });
}

var generateURL = function(user) {
  // Generate the JWT/MagicLink for the user
  var url = config.app.webURL + '?sign_in=' + jwt.sign(user.toJSON(), jwtSecret, config.jwt.signOptions);
  console.log(url);
  return TinyUrl.shorten(url);
}

var getStartDate = function() {
  return new Date(new Date().getTime() - 60*60000)
}

var getEndDate = function() {
  return new Date(new Date().getTime() + 60*60000)
}

cron.schedule(config.cronConfigs.twilioOrderReminder, () => {
  cronTask();
});

var cronTask = function() {
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
      Promise.all(users.map((user) => generateURL(user)))
        .then(function(urls) {
          done(null, users, urls)
        }).catch(function(err) {
          done(err);
        })
    },
    function(users, urls, done) {
      var retMod = users.map(function(e, i) {
        return [e, urls[i]];
      });
      done(null, retMod)
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

cronTask();