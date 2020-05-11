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
  // return message;
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

var cronDailyPrenotify = function() {
  console.log("Daily prenotify");
  async.waterfall([
    function(done) {
      var query = {
        deleted: false,
        payStatus: 'COMPLETE',
        deliveryDate: {
          [Op.gte] : getStartDate(30, 0),
          [Op.lte] : getEndDate(30, 0)
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
      var tm = {
        messageBody: "Nourished here! We're so sorry but delicious takes some prep time and we're running a little late! Your lunch will be delivered at the following times: PPMC - 12:15pm, HUP - 12:30pm, PAH - 12:45pm"
      }
      done(null, users, tm);
    },
    function(users, tm, done) {
      Promise.all(users.map((user) => {
        sendMessage(tm.messageBody, user.user);
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

cronDailyPrenotify();