"use strict";

const _ = require("lodash");
const path = require("path");
const sequelize = require(path.resolve("./config/lib/sequelize-connect"));
const { QueryTypes } = require("sequelize");
const Sequelize = require(path.resolve("./config/lib/sequelize")).sequelize;
var db = require(path.resolve("./config/lib/sequelize")).models,
  Restaurant = db.restaurant
const async = require("async");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const chalk = require("chalk");
const config = require(path.resolve("./config/config"));
const smtpTransport = nodemailer.createTransport(config.mailer.options);
const os = require("os");
const ejs = require("ejs");
const pdf = require("html-pdf");
const cron = require("node-cron");
const moment = require("moment");

const TEST_DATE = process.env.TEST_DATE || null;
const DEFAULT_EMAIL = "jpatel@syncro-tech.com";


/**
 * This module will lookup all orders for the previouse week and send each restaraunt a PDF report
 */

const queryOrders = async (timeslotRange, done) => {
  var orderMap = {};

  // iterate through all restaurants that signed up for the given timeslot range
  try {
    let restaurants = await Restaurant.findAll();

    //restaurants.map( async (r) => {
    for (const i in restaurants) {
      let r = restaurants[i];
      console.log(
        "Restaurant to be processed: ",
        r.name,
        "(",
        r.id,
        ")  ...find scheduled timeslots for restaurant..."
      );

        var thisDate = moment()
        if (TEST_DATE != null) {
            //this is useful depending on the date range of data exists in the db
            console.log('setting TEST_DATE: ', TEST_DATE)
            thisDate.set('date', TEST_DATE);
        }
        
        //determine start and end time of previous week (assuming this job runs on Monday morning)
        //let yesterday = thisDate.subtract(1, "days");
        var fromDate = thisDate.startOf("week").isoWeekday(1);
        var toDate = fromDate.clone().add(6, 'days')


        console.log('fromDate: ', fromDate.format('YYYY-MM-DD'), ', toDate: ', toDate.format('YYYY-MM-DD'))
        
      const result = await Sequelize.query(
        ' SELECT row_number() OVER () as id, \
              r.name as RestaurantName, ts.date as Timeslot, o."mealName", o."dietaryRestrictions", o."payStatus", o.quantity, o.id, o.price, o.total as OrderTotal, \
              sum(o.total) OVER (PARTITION BY ts.date) as OrderTotalByTimeslot, \
              sum(o.total) OVER (PARTITION BY r.name) as OrderTotalByRestaurant, \
        	    sum(o.quantity) OVER (PARTITION BY ts.date) as OrderQuantityTotalByTimeslot, \
	            sum(o.quantity) OVER (PARTITION BY r.name) as OrderQuantityTotalByRestaurant \
              from restaurants r, timeslots ts, orders o \
              where r.id = ts."restaurantId"  \
              and o."deliveryDate" = ts.date  \
              and o."payStatus" = \'COMPLETE\' \
              and ts.date between :fromDate and :toDate \
              and r.id = :restaurantid \
              order by r.name desc, ts.date desc',
        {
          replacements: { restaurantid: r.id, fromDate: fromDate.format('YYYY-MM-DD'), toDate: toDate.format('YYYY-MM-DD') },        
          type: QueryTypes.SELECT,
        }
      );

      //Print result on screen
      if (result.length > 0) {
        
        let timeslot = null;

        // this is so we can break up the orders timeslot
        var final = [];
        var totalPrice = 0;
        var totalQuantity = 0;

        result.map((el, index) => {
          let deliveryDate = new Date(el.timeslot).toLocaleString("en-US", {
            timeZone: "America/New_York",
          });
          if (deliveryDate !== timeslot && index != 0) {
            //add summary for previous orders
            console.log(
              "   Timeslot: ",
              deliveryDate,
              "  - Order total: ",
              el.ordertotalbytimeslot
            );
            final.push({
              type: "TimeslotSummary",
              totalSummaryPrice: totalPrice,
              totalSummaryQuantity: totalQuantity,
            });
            totalPrice = 0;
            totalQuantity = 0;
            timeslot = deliveryDate;
          } else if (index == 0) {
            //special case so we can set the timeslot
            timeslot = deliveryDate;
          }

          totalPrice += parseFloat(el.ordertotal);
          totalQuantity += parseInt(el.quantity);
          final.push({ type: "Order", data: el });
        });
        //Last record
        //console.log("adding last timeslot summary: totalSummaryPrice: ", totalPrice, ", totalSummaryQuantity: ", totalQuantity);
        final.push({
          type: "TimeslotSummary",
          totalSummaryPrice: totalPrice,
          totalSummaryQuantity: totalQuantity,
        });

        //Print result to pdf file
        ejs.renderFile(
          path.resolve(
            "./modules/restaurants/server/views/weeklyorderReport.ejs"
          ),
          { orders: final, restaurantName: r.name, moment: moment },
          (err, data) => {
            if (err) {
              console.error(chalk.red("Failed to render HTML report: ") + err);
            } else {
              let options = {
                height: "11.25in",
                width: "8.5in",
                header: {
                  height: "20mm",
                },
                footer: {
                  height: "20mm",
                },
              };
              //console.log(data);
              pdf
                .create(data, options)
                .toFile(path.join(os.tmpdir(), "_weeklyOrderReport_" + r.name + ".pdf"), function (err, data) {
                  if (err) {
                    console.error(
                      chalk.red("Failed to render PDF report: ") + err
                    );
                  } else {
                      console.log(data)
                      sendMessage(r.emailRecipient, data ,fromDate, toDate);
                      
                    console.log(chalk.green("File created successfully"));
                  }
                });
            }
          }
        );
      } else {
        console.log("No order for restaurant: ", r.name);
      }
    } 

    done(null, orderMap);
  } catch (err) {
    console.log(err);
  }
};

/**
 * This will flatten all the order details into a CSV string and submit a request to send an email to the
 * recipient at the restaurant
 *
 *
 * @param {object} data     JSON object representing the restaurant recipient and all the orders
 */
var sendMessage = function (receipient, data, fromDate, toDate) {

    //
    // REPLACE IN PRODUCTION 
    //
    var receipient = process.env.NODE_ENV === "development" ? [DEFAULT_EMAIL] : [DEFAULT_EMAIL];        //recipient
  
    
    var date = new Date().toLocaleString("en-US", {timeZone: "America/New_York",});

    var mailOptions = {
      to: receipient,
      from: config.mailer.from,
      subject: "Weekly order report for "+fromDate.format('YYYY-MM-DD') +" until "+toDate.format('YYYY-MM-DD'),
      text:
        "See attached report for complete list of orders for previous week " +
        "\n\nRegards,\nTeam Nourshed",
      attachments: [
        {
          filename: "Weekly order report ("+fromDate.format('YYYY-MM-DD') +" until "+toDate.format('YYYY-MM-DD') + ").pdf",
          path: data.filename
        },
      ],
    };

    (async () => {
        try {
            console.log("sending email...", config.mailer.options);
            console.log("sending to: ", mailOptions);
            console.log("sending message to :", receipient);
            await smtpTransport.sendMail(mailOptions);
            console.log(new Date() + " - Email sent to: ", receipient);
        } catch (err) {
            console.log(err);
        }
    })();

};

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
      console.log("size of ordermap: ", ordermap);
      //send email
      Promise.all(
        Object.keys(ordermap).map((r) => {
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

if (process.env.NODE_ENV === "development" && process.argv[2] == "--adhoc") {
  process.env.DISTRIBUTE_EMAILS == "ALLOW" && cronDailyUpdate();
} else {
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
