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

var getStartDate = function(minutes, offset) {
  var ret = Date.now() - minutes*60*1000 + offset - 5000 ;
  return ret;
}

var getEndDate = function(minutes, offset) {
  var ret = Date.now() + minutes*60*1000 + offset + 5000;
  return ret;
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
        // userId: userIds,
        settings: {
          [Op.contains] : ["ALL"]
        }
      }
    });
    let userSettingsIds = new Set(userSettings.map(setting => setting.userId));

    // Filter them out
    let usersFiltered = users.filter(user => {
      (! userOrderIds.has(user.id) && ! userSettingsIds.has(user.id))
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
    let restNames = rests.map(rest => rest.restaurant.name);
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
    console.log(messageBody)
    // for (const user of usersFiltered) {
    //   let msg;
    //   try {
    //     msg = await sendMessageAsync(user, message);
    //     console.log(msg);
    //   } catch (err) {
    //     console.log("Error sending to user: %j", user);
    //   }
    //   msleep(300); 
    // };

  } catch (err) {
    console.log("Error sending to message");
    console.log(err);
  }
}

cronDailyNotify()