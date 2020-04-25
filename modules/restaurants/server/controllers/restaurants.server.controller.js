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
  uuid = require('uuid/v4');

// Define return
// id | name | phoneNumber | email | streetAddress | zip | city | state | createdAt | updatedAt | userId 
const retAttributes = ['id', 'name', 'email', 'description', 'phoneNumber', 'streetAddress', 'zip', 'city', 'state'];

/**
 * Create a restaurant
 */
exports.create = function(req, res) {
  delete req.body.id;
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