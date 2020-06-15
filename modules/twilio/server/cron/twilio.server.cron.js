'use strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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
  TwilioUser = db.twiliouser,
  TimeSlot = db.timeslot,
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

  // cron.schedule(config.cron.twilio.dailyNotify, () => {
  //   cronDailyNotify();
  // }, {timezone: config.cron.twilio.timezone});

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
          [Op.gte] : getStartDate(10, config.orderTimeCutoff),
          [Op.lte] : getEndDate(10, config.orderTimeCutoff)
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
          [Op.gte] : getStartDate(10, 0),
          [Op.lte] : getEndDate(10, 0)
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
            phoneNumber: order.restaurant.phoneNumber.replace(/-|\(|\)| /g, ''),
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
        var ph = util.format('%s-%s-%s', user.phoneNumber.substring(0,3), user.phoneNumber.substring(3,6), user.phoneNumber.substring(6,10));
        var message = util.format(tm.messageBody, user.restaurant, user.location, ph);
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

var sendMessageAsync = async function(user, textBody) {
  console.log(user.cell_phone, textBody);
  var to = '+1' + user.cell_phone;
  var from = config.twilio.phoneNumber;
  var message = textBody;

  let ret;
  try {
    ret = await twilio.messages
    .create({
       body: message,
       from: from,
       to: to
     });
  } catch (err) {
    console.log(err);
    console.log("Error sending to user: %j", user);
  }
  return await ret;
}

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

var cronWeeklyUpdate = async function() {
  
  try {

    let users = await User.findAll({
        where: {
          phoneNumber: {
            [Op.ne]: ''
          },
          roles: {
            [Op.contains] : ["user"]
          }
        }
      });

    let tm = await TwilioMessage.findOne({
        where: {
          subtype: 'WEEKLY_MENU',
        }
      });

    var userMessages = [];
    for (const user of users) {
      user.magicLinkToken = crypto.randomBytes(20).toString('hex');;
      user.magicLinkExpires = Date.now() + config.twilio.tokenExpiry; // 3 hours
      let usr = await user.save();
      userMessages.push(usr);
    }

    for (const user of userMessages) {
      var url = config.app.webURL + 'my-menu';
      var message = tm.messageBody + url;      
      let msg;
      try {
        msg = await sendMessageAsync(user, message);
        console.log(msg);
      } catch (err) {
        console.log("Error sending to user: %j", user);
      }
      msleep(300); 
    };

  } catch (err) {
    console.log("Error sending to message");
    console.log(err);
  }
}

var cronDailyNotify = async function() {
  
  try {

    let users = await User.findAll({
      where: {
        phoneNumber: {
          [Op.ne]: ''
        },
        roles: {
          [Op.contains] : ["user"]
        }
      }
    });
    let userIds = users.map(user => user.id);

    let userOrders = await Order.findAll({
      where: {
        userId: userIds,
        deliveryDate: {
          [Op.gte] : getStartDate(15, 0),
          [Op.lte] : getEndDate(60*16, 0)
        }
      }
    });
    let userOrderIds = new Set(userOrders.map(order => order.userId));

    let userSettings = await TwilioUser.findAll({
      where: {
        userId: userIds,
        settings: {
          [Op.contains] : ["NONE"]
        }
      }
    });
    let userSettingsIds = new Set(userSettings.map(setting => setting.userId));

    // Filterf them out
    let usersFiltered = users.filter(user => {
      var userOrder = (! userOrderIds.has(user.id))
      var userSetting = (! userSettingsIds.has(user.id))
      return userOrder && userSetting
    });

    // Get the message for today
    let day = new Date().getDay()
    let tm = await TwilioMessage.findAll({
      where: {
        type: 'DAILY_NOTIFY',
        subtype: ['NOTIFY_' + day, 'DEFAULT']
      }
    });
    var index = Math.floor(Math.random() * tm.length)
    var message = tm[index].messageBody;

    // Get the restaurants for the next timeslot
    let rests = await TimeSlot.findAll({
      where: {
        date: {
          [Op.gte]: getStartDate(15, 0),
          [Op.lte]: getEndDate(60*6, 0)
        }
      },
      include: [db.restaurant]
    });

    // Put it all together
    let restNames = Array.from(new Set(rests.map(rest => rest.restaurant.name)));
    let restMessagePortion = "";
    for(const [i, v] of restNames.entries()) {
      if (i === restNames.length - 2) {
        restMessagePortion = restMessagePortion + v + " & "
      } else if (i === restNames.length - 1) {
        restMessagePortion = restMessagePortion + v
      } else {
        restMessagePortion = restMessagePortion + v + ", "
      }
    }
    var url = config.app.webURL + 'my-menu';
    var messageBody = util.format(message, restMessagePortion || "Philly's best") + url

    // Blast it out there 
    for (const user of usersFiltered) {
      let msg;
      try {
        console.log(user.email, messageBody)
        // msg = await sendMessageAsync(user, message);
        // console.log(msg);
      } catch (err) {
        console.log("Error sending to user: %j", user);
      }
      msleep(300); 
    };

  } catch (err) {
    console.log("Error sending to message");
    console.log(err);
  }
}
