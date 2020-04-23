'use strict';

var
  path = require('path'),
  config = require(path.resolve('./config/config'));

// console.log(config.stripe);
// console.log(config.stripe.STRIPE_SECRET_KEY);
const stripe = require('stripe')(config.stripe.secretKey);

module.exports = stripe;
