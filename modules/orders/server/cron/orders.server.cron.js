'use strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var 
  path = require('path'),
  config = require(path.resolve('./config/config')),
  async = require('async'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Order = db.order,
  cron = require('node-cron');

const { Parser } = require("json2csv")
const parser = new Parser()
const { Op } = require("sequelize")
const  nodemailer = require("nodemailer")
const smtpTransport = nodemailer.createTransport(config.mailer.options)

// const PPMC_HOSPITAL_ID = '7d2cee64-3e99-565d-b27a-462947dbd144';
const PPMC_HOSPITAL_ID = 'c8e20bfc-f2ad-51a3-8f73-56488d3a1cc5';
const USER_EMAILS = ['zene.colt@pennmedicine.upenn.edu', 'ingrid.doralice@pennmedicine.upenn.edu', 'michelle.langston-smith@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com'];
// const USER_EMAILS = ['ccstreiffer@gmail.com']

var getStartDate = function(minutes, offset) {
  var ret = Date.now() - minutes*60*1000 + offset - 5000 ;
  return ret;
}

var getEndDate = function(minutes, offset) {
  var ret = Date.now() + minutes*60*1000 + offset + 5000;
  return ret;
}

module.exports = function() {
  cron.schedule(config.cron.order.PPMCLunchUpdate, () => {
    cronPPMCLunchUpdate();
  }, {timezone: config.cron.order.timezone});
}

var cronPPMCLunchUpdate = function() {
  console.log("Daily PPMC Lunch Update");
  async.waterfall([
    function(done) {
      var query = {
        deleted: false,
        payStatus: 'COMPLETE',
        deliveryDate: {
          [Op.gte] : getStartDate(0, 0),
          [Op.lte] : getEndDate(60*4, 30)
        },
        hospitalId: PPMC_HOSPITAL_ID
      };
      // var query = {}

      Order.findAll({
        where: query,
        include: [db.user, db.hospital, db.restaurant]
      }).then(function(orders) {
        if(orders.length){
          done(null, orders);
        } else {
          done("No orders found.")
        }
      }).catch(function(err) {
        done(err);
      })
    }, 
    function(orders, done) {
      var ret = orders.map((order) => {
        return {
          deliveryDate: new Date(order.deliveryDate).toLocaleString("en-US", {
            timeZone: "America/New_York",
          }),
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          phoneNumber: order.user.phoneNumber,
          email: order.user.email,
          order: order.mealName,
          quantity: order.quantity,
          mealPrice: order.price,
          total: order.total,
          orderDate: new Date(order.orderDate).toLocaleString("en-US", {
            timeZone: "America/New_York",
          }),
          payStatus: order.payStatus,
          dietaryRestrictions: order.dietaryRestrictions,
          allergies: order.information,
        };
      });

      new Promise((resolve, reject) => {
        let parsedData = "No orders available"
        try {
          parsedData = parser.parse(ret);
          resolve(new Buffer.from(parsedData));
        } catch (err) {
          console.error('Caught exception while parsing JSON data - ex: ', err)  
          done(err);    
        }
      }).then((data) => {
        // To Do (send Email);
        var date = new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
        });

        var mailOptions = {
          to: USER_EMAILS,
          from: config.mailer.from,
          subject: "Orders for PPMC",
          text:
            "See attached report for complete list of orders for lunch delivery!" + 
            "\n\nRegards,\nTeam Nourished",
          attachments: [
            {
              filename:
                "Orders for PPMC" +
                " - " +
                new Date().toDateString() +
                " Report.csv",
              content: data.toString(),
            },
          ],
        };

        smtpTransport.sendMail(mailOptions)
          .then(function() {
            done(null)
          })
          .catch(function(err) {
            done(err);
          });
      });
    },
    ], 
    function(err){
      if(err) {
        console.log(err);
      }
    }
  );
}

// cronPPMCLunchUpdate()
