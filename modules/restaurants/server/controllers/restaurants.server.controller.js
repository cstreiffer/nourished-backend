'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Restaurant = db.restaurant,
  Order = db.order,
  uuid = require('uuid/v4');

// Define return
// id | name | phoneNumber | email | streetAddress | zip | city | state | createdAt | updatedAt | userId 
const retAttributes = ['id', 'name', 'email', 'description', 'phoneNumber', 'streetAddress', 'zip', 'city', 'state', 'restaurantStripeAccountId', 'verified'];
const userRetAttributes = [ 'username', 'email', 'phoneNumber', 'firstName', 'lastName' ]

/**
 * Create a restaurant
 */
exports.create = function(req, res) {
  delete req.body.id;
  delete req.body.restaurantStripeAccountId;
  delete req.body.verified;

  req.body.id = uuid();
  req.body.userId = req.user.id;

  Restaurant.create(req.body).then(function(restaurant) {
    if (!restaurant) {
      return res.status(404).send({
        message: 'Could not create the restaurant'
      });
    } else {
      var ret = _.pick(restaurant, retAttributes);
      return res.jsonp({restaurant: ret, message: "Restaurant successfully created"});
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Show the current restaurant
 */
exports.read = function(req, res) {
  var ret = _.pick(req.restaurant, retAttributes);
  res.json({restaurant: ret, message: "Restaurant successfully found"});
};

/**
 * Update a restaurant
 */
exports.update = function(req, res) {
  delete req.body.id;
  delete req.body.userId;
  var restaurant = req.restaurant;

  restaurant.update({
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    streetAddress: req.body.streetAddress,
    zip: req.body.zip,
    city: req.body.city,
    state: req.body.state
  }).then(function(restaurant) {
    var ret = _.pick(req.restaurant, retAttributes);
    return res.jsonp({restaurant: ret, message: "Restaurant successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete an restaurant
 */
exports.delete = function(req, res) {
  var restaurant = req.restaurant;
  // Delete the restaurant
  restaurant
    .destroy()
    .then(function() {
      var ret = _.pick(req.restaurant, retAttributes);
      return res.jsonp({restaurant: ret, message: "Restaurant successfully deleted"});
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * List of Restaurants
 */
exports.list = function(req, res) {
  var query = {};
  if(req.query.city) query.city = req.query.city;
  if(req.query.state) query.state = req.query.state;
  if(req.query.zip) query.zip = req.query.zip;
  if(req.query.name) query.name = req.query.name;
  if(req.query.streetAddress) query.streetAddress = req.query.streetAddress;

  Restaurant.findAll({
    where: query,
    attributes: retAttributes
  }).then(function(restaurants) {
    if (!restaurants) {
      return res.status(404).send({
        message: 'No restaurants found'
      });
    } else {
      res.json({restaurants: restaurants, message: "Restaurants successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * List of user restaurants Restaurants
 */
exports.userList = function(req, res) {
  var query = {userId : req.user.id};
  if(req.query.city) query.city = req.query.city;
  if(req.query.state) query.state = req.query.state;
  if(req.query.zip) query.zip = req.query.zip;
  if(req.query.name) query.name = req.query.name;
  if(req.query.streetAddress) query.streetAddress = req.query.streetAddress;

  Restaurant.findAll({
    where: query,
    attributes: retAttributes
  }).then(function(restaurants) {
    if (!restaurants) {
      return res.status(404).send({
        message: 'No restaurants found for user'
      });
    } else {
      res.json({restaurants: restaurants, message: "Restaurants successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};


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
exports.export = function(req, res) {
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
      
      if (!orders) {
        return res.status(404).send({
          message: 'No orders found'
        });
      } else {
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
            user: order.user.username,
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

        var data = parser.parse(ret);
        var outFile = path.resolve('private/restaurants/' + new Date().toISOString() + '.csv');
        fs.writeFile(outFile, data, function(err, data) {
          if(err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
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
                res.jsonp({message: "Orders successfully sent"});
              }).catch(function(err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              })
          }
        });
      }
    }).catch(function(err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Restaurant middleware
 */
exports.restaurantByID = function(req, res, next, id) {

  // if ((id % 1 === 0) === false) { //check if it's integer
  //   return res.status(404).send({
  //     message: 'Restaurant is invalid'
  //   });
  // }

  Restaurant.findOne({
    where: {
      id: id
    }
  }).then(function(restaurant) {
    if (!restaurant) {
      return res.status(404).send({
        message: 'No restaurant with that identifier has been found'
      });
    } else {
      req.restaurant = restaurant;
      return next();
    }
  }).catch(function(err) {
    return next(err);
  });

};