"use strict";

const _ = require("lodash")
const path = require("path")
const sequelize = require(path.resolve("./config/lib/sequelize-connect"))
var db = require(path.resolve("./config/lib/sequelize")).models,
  Restaurant = db.restaurant,
  TimeSlot = db.timeslot,
  Order = db.order,
  uuid = require("uuid/v4");
const async = require("async")
const { Parser } = require("json2csv")
const parser = new Parser()
const  fs = require("fs")
const { Op } = require("sequelize")
const  nodemailer = require("nodemailer")
const chalk = require('chalk')
const config = require(path.resolve("./config/config"))
const smtpTransport = nodemailer.createTransport(config.mailer.options)
const util = require("util")
const os = require("os")
const ejs = require("ejs");
const cron = require("node-cron");


const TIMESLOT_DAYRANGE = 1
const TIMESLOT_HOURRANGE = 4

/**
 * This module will lookup all orders for the upcoming timeslots for each respective restaurant and
 * send an email notification with order details (the email will contain a CSV file attachment)
 */

var orderMap = {};

const queryOrders = async (timeslotRange, done) => {      


  // iterate through all restaurants that signed up for the given timeslot range
  try {
    let restaurants = await Restaurant.findAll();

    for (const i in restaurants) {
      //restaurants.map(r => {
      let r = restaurants[i];
      console.log(
        "Restaurant to be processed: ",
        r.name,
        "(",
        r.id,
        ")  ...find scheduled timeslots for restaurant..."
      );
      let timeslots = await TimeSlot.findAll({
        where: {
          date: {
            [Op.gte]: new Date(Date.now()),
            [Op.lte]: new Date(Date.now() + TIMESLOT_DAYRANGE * TIMESLOT_HOURRANGE * 60 * 60 * 1000),
          },
          restaurantId: r.id,
        },
        include: [
          {
            model: db.user,
          },
          {
            model: db.restaurant,
          },
        ],
      });

      //console.log('timeslots: ',timeslots)
      if (!timeslots || !timeslots.length)
        console.warn(chalk.red("No timeslot found\n"));
      else
        for (const t of timeslots) {
          //timeslots.map( t => {
          //console.log(t)
          console.log("Timeslot=> ",t.restaurant.name,", ",t.restaurantId,", ",t.user.email,", ",t.user.username,", ",t.date," for hospital: ",t.hospitalId);

          console.log("Run " + chalk.blue.bold("order") + " query...");
          let orders = await Order.findAll({
            where: {
              deliveryDate: {
                [Op.eq]: t.date,
              },
              restaurantId: t.restaurantId,
              hospitalId: t.hospitalId,
              payStatus: 'COMPLETE'
            },
            include: [
              {
                model: db.user,
              },
              {
                model: db.restaurant,
              },
              {
                model: db.hospital,
              },
            ],
            order: [
              ["deliveryDate", "ASC"],
              [{ model: db.hospital }, "name", "ASC"],
              ["groupId", "ASC"],
              [{ model: db.user }, "username", "ASC"],
              ["id", "ASC"],
            ],
          });

          //Push into map
          orderMap[t.restaurantId] = {
            orders: orders,
            emailRecipient: r.email,
            timeslot: t.date,            
            restaurantName: r.name,           
          };

          console.log("Orders for restaurant: ", r.name);
          //for (const o in orders) {
          orders.map((el) => {
            //let el = orders[o];
            //console.log(JSON.stringify(el,null,4))
            console.log(
              "[Restaurant/",
              el.restaurant.id,
              "],",
              "[Timeslot/ ",
              t.id,
              "],",
              "[Hospital/ ",
              el.hospitalId,
              "],",
              "[GroupId/",
              el.groupId,
              "],",
              "[OrderId/",
              el.id,
              "],",
              "[MealName/",
              el.mealName,
              "], ",
              "[User/",
              el.user.username,
              "], ",
              "]"
            );
          });

          console.log(
            "Done querying orders for restaurant ",
            t.restaurantId,
            ", Email: ",
            t.restaurant.email
          );
          console.log("\n\n");
        } //end timeslot mapping
    }
    done(null, orderMap)
  } catch (err) {
    console.log(err);
  }
}

/**
 * This will flatten all the order details into a CSV string and submit a request to send an email to the 
 * recipient at the restaurant
 * 
 * TODO: Future improvements should include an in-memory stream rather than writing to disc and reading
 * 
 * @param {object} data     JSON object representing the restaurant recipient and all the orders
 */
var sendMessage = function (data) {
    
  console.debug('<sendMessage>'); console.group()
    
  // TODO During dev this should be forced to a personal email
  var receipient = process.env.NODE_ENV === "development" ? "ccstreiffer@gmail.com" : "ccstreiffer@gmail.com"   //data.emailRecipient
  var restaurantName = data.restaurantName

  var orders = data.orders.map(function(order) {
    var orderList = [];
    var orderQuantity = Number(order.quantity);
    for(var i=0; i < orderQuantity; i++) {
      var toPush = order.toJSON();
      toPush.quantity = 1;
      orderList.push(toPush);
    }
    return orderList
  });

  // flatten for csv
  var ret = orders.flat(1).map((order) => {
            
    return {
      deliveryDate: new Date(order.deliveryDate).toLocaleString("en-US", { timeZone: "America/New_York", }),
      hospital: order.hospital.name,
      firstName: order.user.firstName,
      lastName: order.user.lastName,
      phoneNumber: order.user.phoneNumber,
      email: order.user.email,
      order: order.mealName,
      quantity: order.quantity,
      price: order.price,
      total: order.price,
      orderDate: new Date(order.orderDate).toLocaleString("en-US", { timeZone: "America/New_York", }),
      payStatus: order.payStatus,
      dietaryRestrictions: order.dietaryRestrictions,
      allergies: order.information,
    };
  });
        
  new Promise((resolve, reject) => {      
    resolve(new Buffer.from(parser.parse(ret)));
  })
  .then((data) => {
        
        // To Do (send Email);
        var date = new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        
        var mailOptions = {
          to: [receipient],
          from: config.mailer.from,
          subject: "Nourished Order List for " + restaurantName,
          html:
            "See attached for complete list of orders for upcoming delivery</br></br>Regards,</br>Team Nourshed",
          attachments: [
            {
              filename:
                "Order List " +
                " - " +
                new Date().toDateString() +
                " Report.csv",
              content: data.toString()  //fs.createReadStream(outFile),
            },
          ],
        };

        (async () => {
            try {
                await smtpTransport.sendMail(mailOptions);
                console.log('Email sent')
            } catch (err) {
                console.log(err)
            }
        })();        
  })

  console.groupEnd(); console.log('</sendMessage>')
}

const cronDailyUpdate = () => {
  async.waterfall([
    function (done) {
      //first pull all order
      var timeslotRange = {
        date: {
          [Op.gte]: new Date(Date.now()),
          [Op.lte]: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
      };
      queryOrders(timeslotRange, done);
    },
    function (ordermap, done) {
      //send email
      Promise.all(
        Object.keys(orderMap).map((r) => {
          console.log(chalk.italic("..sending to restaurant id: "), r);
          let data = ordermap[r];

          sendMessage(data);
        })
      )
        .then(function () {
          done(null);
        })
        .catch(function (err) {
          done(err);
        });
    },
    function (done) {
      console.log(chalk.green.bold("Finished sending emails"));
    },
  ]);
};





if (process.env.NODE_ENV === 'development' && process.argv[2] == '--adhoc') {
  process.env.DISTRIBUTE_EMAILS == "ALLOW" && cronDailyUpdate();
}
else {
  module.exports = function () {
    cron.schedule(
      config.cron.restaurant.dailyUpdate,
      () => {
        process.env.DISTRIBUTE_EMAILS == "ALLOW" && cronDailyUpdate();
      },
      { timezone: config.cron.restaurant.timezone }
    );
  };
}