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
  Stripe = db.stripe,
  uuid = require('uuid/v4');

// Define return
// id | name | phoneNumber | email | streetAddress | zip | city | state | createdAt | updatedAt | userId 
const retAttributes = ['id', 'groupId', 'paymentIntentId'];

/**
 * Show the current stripe
 */
exports.read = function(req, res) {
  var ret = _.pick(req.stripe, retAttributes);
  res.json({stripe: ret, message: "Stripe successfully found"});
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
      res.json({stripe: stripe, message: "Stripe entries successfully found"});
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