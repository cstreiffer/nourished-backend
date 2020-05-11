'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Order = db.order;

const { Parser } = require('json2csv');
const parser = new Parser();
var fs = require('fs');
const {Op} = require('sequelize');
var  nodemailer = require('nodemailer');
var config = require(path.resolve('./config/config'));
var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * List of restaurant orders itemized
 */
var sendUserList = function() {
    Order.findAll({where: {},
      include: [db.restaurant, db.user, db.hospital]
    })
      .then(function(orders) {
        // Flatten that bad boy (extract values)
        var ret = orders.map((order) => {
          return {
            email: order.user.email,
            firstName: order.user.firstName,
            lastName: order.user.lastName,
            phoneNumber: order.user.phoneNumber,
            orderDate: order.orderDate,
            deliveryDate: order.deliveryDate,
            restName: order.restaurant.name,
            mealName: order.mealName,
            payStatus: order.payStatus,
            quantity: order.quantity,
            price: order.price,
            total: order.total,
            hospital: order.hospital.name,
            orderId: order.id,
            groupId: order.groupId
          }
        });
        console.log("Sending this: "  + ret);

        var data = parser.parse(ret);
        var outFile = path.resolve('private/user-export' + new Date().toISOString() + '.csv');
        fs.writeFile(outFile, data, function(err, data) {
          if(err) {
            console.log(err);
          } else {
            // To Do (send Email);
            var date = new Date().toLocaleString("en-US", {timeZone: "America/New_York"})
            var mailOptions = {
              to: ['ccstreiffer@gmail.com', 'nourished@pennmedicine.upenn.edu'],
              from: config.mailer.from,
              subject: 'Nourished Order List',
              attachments: [
                {
                  filename: 'Order List '+ ' - ' + date + ' Report.csv',
                  content: fs.createReadStream(outFile)
                }
              ]
            };
            smtpTransport.sendMail(mailOptions)
              .then(function(){
                // Send the response
                console.log({message: "Users successfully sent"});
              }).catch(function(err) {
                console.log(err);
              })
          }
        });
      });
};

sendUserList();
