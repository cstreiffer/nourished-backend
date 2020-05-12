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
    payStatus: ['COMPLETE', 'CANCELLED', 'REFUNDED'],
    deliveryDate: {
      [Op.gte]: new Date(Date.now()),
      [Op.lte] : new Date(Date.now() + 4*60*60*1000),
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

var pumpkin = {
  restaurant : {
    name: 'Pumpkin',
    id: '5590ad8f-7f6d-5015-aae5-1ed887e96b60'
  },
  user: {
    email: ['admin@pumpkinphilly.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
  }
}

var renatas = {
  restaurant : {
    name: 'Renata\'s Kitchen',
    id: 'bac71df9-9968-534d-bd3b-50663f2a9a90'
  },
  user: {
    email: ['katie.steenstra@gmail.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
  }
}

var baology = {
  restaurant : {
    name: 'Baology',
    id: 'c22d4fbb-c9df-5cea-a11b-79ecf3c05e43'
  },
  user: {
    email: ['judy.ni@baology.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
  }
}

var cafeynez = {
  restaurant : {
    name: 'Cafe Ynez',
    id: 'fc7a1b45-06e8-56c6-815c-814e08810424'
  },
  user: {
    email: ['jill@jetwinebar.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
  }
}

var elmerkury = {
  restaurant : {
    name: 'El Merkury',
    id: '571ab7c1-e8cd-5d8f-af51-7cbc35eed917'
  },
  user: {
    email: ['sofia@elmerkury.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
  }
}

var opb = {
  restaurant : {
    name: 'On Point Bistro',
    id: 'e18672e4-4f9b-56be-b008-a8c9531edf88'
  },
  user: {
    email: ['fix.mallory@gmail.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
  }
}

var satekampar = {
  restaurant : {
    name: 'Sate Kampar',
    id: '5b05ae36-b872-53b2-a67a-7391e90b711c'
  },
  user: {
    email: ['angebranca@kampargroup.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
  }
}

var simplygood = {
  restaurant : {
    name: 'Simply Good Jars',
    id: 'd2cfddd5-5157-4f88-b263-6c27db4237c9'
  },
  user: {
    email: ['jared@simplygoodjars.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
  }
}

var rex1516 = {
  restaurant: {
    name: 'Rex 1516',
    id: '1b02b116-61d2-4bb9-b9b3-090e1ba4015a'
  },
  user: {
    email: ['lucio@sojournphilly.com', 'nourished@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com']
  }
}

sendList(rex1516);
// sendList(simplygood);
// sendList(satekampar);
// sendList(cafeynez);
// sendList(elmerkury);
//sendList(baology);
// sendList(renatas);
// sendList(pumpkin);
// sendList(opb);
