'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Restaurant = db.restaurant,
  Order = db.order,
  uuid = require('uuid/v4');

const { Parser } = require('json2csv');
const parser = new Parser();
var fs = require('fs');
const {Op} = require('sequelize');
var  nodemailer = require('nodemailer');
var  path = require('path');
var config = require(path.resolve('./config/config'));
var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * List of restaurant orders itemized
 */
var sendList = function(req) {
  var orderQuery = {
    restaurantId : req.restaurant.id,
    deliveryDate: {
      [Op.gte]: new Date(Date.now()),
      [Op.lte] : new Date(Date.now() + 24*60*60*1000),
    }
  };
    Order.findAll({
      where: orderQuery,
      include: [db.restaurant, db.hospital, db.user]
    }).then(function(orders) {
        // Map out the orders
        var ret = orders.map(function(order) {
          var orderList = [];
          var orderQuantity = Number(order.quantity);
          for(var i=0; i < orderQuantity; i++) {
            var toPush = order.toJSON();
            toPush.quantity = 1;
            orderList.push(toPush);
          }
          return orderList
        });

        // Flatten that bad boy (extract values)
        ret = ret.flat(1).map((order) => {
          return {
            firstName: order.user.firstName,
            lastName: order.user.lastName,
            phoneNumber: order.user.phoneNumber,
            email: order.user.email,
            order: order.mealName,
            deliveryDate: new Date(order.deliveryDate).toLocaleString("en-US", {timeZone: "America/New_York"}),
            orderDate: new Date(order.orderDate).toLocaleString("en-US", {timeZone: "America/New_York"}),
            payStatus: order.payStatus,
            allergies: order.information,
            hospital: order.hospital.name
          }
        });
        console.log("Sending this: "  + ret);

        var data = parser.parse(ret);
        var outFile = path.resolve('private/restaurants/' + new Date().toISOString() + '.csv');
        fs.writeFile(outFile, data, function(err, data) {
          if(err) {
            console.log(err);
          } else {
            // To Do (send Email);
            var date = new Date().toLocaleString("en-US", {timeZone: "America/New_York"})
            var mailOptions = {
              to: req.user.email,
              from: config.mailer.from,
              subject: 'Nourished Order Report - ' + req.restaurant.name,
              attachments: [
                {
                  filename: req.restaurant.name + ' - ' + date + ' Report.csv',
                  content: fs.createReadStream(outFile)
                }
              ]
            };
            smtpTransport.sendMail(mailOptions)
              .then(function(){
                // Send the response
                console.log({message: "Orders successfully sent"});
              }).catch(function(err) {
                console.log(err);
              })
          }
        });
      });
};

// var baology = {
//   restaurant : {
//     name: 'Baology',
//     id: 'c22d4fbb-c9df-5cea-a11b-79ecf3c05e43'
//   },
//   user: {
//     email: ['judy.ni@baology.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
//     // email: 'ccstreiffer@gmail.com'
//   }
// }

var cafeynez = {
  restaurant : {
    name: 'Cafe Ynez',
    id: 'fc7a1b45-06e8-56c6-815c-814e08810424'
  },
  user: {
    email: ['jill@jetwinebar.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
    // email: 'ccstreiffer@gmail.com'
  }
}

// var opb = {
//   restaurant : {
//     name: 'On Point Bistro',
//     id: 'e18672e4-4f9b-56be-b008-a8c9531edf88'
//   },
//   user: {
//     email: ['fix.mallory@gmail.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
//     // email: 'ccstreiffer@gmail.com'
//   }
// }

// sendList(baology);
sendList(cafeynez);
// sendList(opb);
