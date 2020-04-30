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
  crypto = require('crypto'),
  cron = require('node-cron');

const {Op} = require('sequelize');
const util = require('util');

var sendDailyMessage = function(tm, user) {
  var to = '+1' + user.user.phoneNumber;
  var from = config.twilio.phoneNumber;
  var message = util.format(tm.messageBody, user.type, user.restaurant, user.hospital, user.time, user.location);
  console.log(message);
  // return message;
  return twilio.messages
    .create({
       body: message,
       from: from,
       to: to
     });
}

var getStartDate = function() {
  return Date.now() - 15*60*1000+5000;
}

var getEndDate = function() {
  return Date.now() + 3*60*60*1000+5000;
}

const getTime = function(date) {
	console.log(date);
	return new Date(date)
		.toLocaleTimeString("en-US", {timeZone: "America/New_York", hour: '2-digit', minute:'2-digit'})
		.replace(/^0+/, '')
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
    		messageBody: 'Your %s from %s will be delivered tonight to the %s at %s! You will be able to pick-up your order at the %s. Enjoy!🍴'
    	};
    	done(null, users, tm)
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

cronDailyUpdate();
