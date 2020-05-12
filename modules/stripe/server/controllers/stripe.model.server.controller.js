'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  config = require(path.resolve('./config/config')),
  stripe = require(path.resolve('./config/lib/stripe')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Stripe = db.stripe,
  uuid = require('uuid/v4');

// Define return
// id | name | phoneNumber | email | streetAddress | zip | city | state | createdAt | updatedAt | userId 
const retAttributes = ['id', 'groupId', 'restaurantId', 'amount'];

/**
 * Show the current stripe
 */
exports.read = function(req, res) {

  console.log("Entering the function");
  var ret = _.pick(req.stripe, retAttributes);
  console.log("got the goods: " + ret);

  // Get the payment intent
  stripe.paymentIntents.retrieve(req.stripe.paymentIntentId)
    .then(function(paymentIntent) {
      res.json({
        publishableKey: config.stripe.pubKey,
        clientSecret: paymentIntent.client_secret,
        stripeOrder: ret,
        message: "Payment intent successfully created"
      });
    }).catch(function(err) {
      res.status(400).send({
        message: 'Error processing the order: ' + err
      });
    });
};

/**
 * List of Stripes
 */
exports.userList = function(req, res) {
  var query = {userId: req.user.id};
  Stripe.findAll({
    where: query,
    attributes: retAttributes
  }).then(function(stripe) {
    if (!stripe) {
      return res.status(404).send({
        message: 'No stripe entries found'
      });
    } else {
      res.json({stripeOrders: stripe, message: "Stripe entries successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};


/**
 * Stripe middleware
 */
exports.stripeByID = function(req, res, next, id) {

  Stripe.findOne({
    where: {
      id: id
    }
  }).then(function(stripe) {
    if (!stripe) {
      return res.status(404).send({
        message: 'No stripe with that identifier has been found'
      });
    } else {
      req.stripe = stripe;
      return next();
    }
  }).catch(function(err) {
    return next(err);
  });

};