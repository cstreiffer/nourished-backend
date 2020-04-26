'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  express = require('express'),
  stripePolicy = require('../policies/stripe.server.policy'),
  stripe = require('../controllers/stripe.server.controller');

module.exports = function(app) {

  // STRIPE MODEL ROUTES -------------------------------------
  app.route('/api/user/stripe')
    .all(passport.authenticate('jwt', {session: false}))
    .all(stripePolicy.isAllowed)
    .get(stripe.userList); // Good

  // Single stripe routes
  app.route('/api/user/stripe/:stripeId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(stripePolicy.isAllowed)
    .get(stripe.read); // Good

  app.param('stripeId', stripe.stripeByID);

  // STRIPE CHECKOUT ROUTES ROUTES ----------------------------------
	app.use(
	  express.json({
	    // We need the raw body to verify webhook signatures.
	    // Let's compute it only when hitting the Stripe webhook endpoint.
	    verify: function(req, res, buf) {
	      if (req.originalUrl.startsWith("/api/stripe/webhook")) {
	        req.rawBody = buf.toString();
	      }
	    }
	  })
	);


  // app.route('/api/stripe/checkout')
  //   .all(passport.authenticate('jwt', {session: false}))
  //   .get(stripe.checkout); // Good

  // if (process.env.NODE_ENV === 'development') {
  //   app.route('/api/stripe/create-payment-intent')
  //     .all(passport.authenticate('jwt', {session: false}))
  //     .all(stripePolicy.isNewOrder)
  //     .all(stripePolicy.isOrderPaymentAllowed)
  //     .post(stripe.createPaymentIntent); // Good
  // } else {
  app.route('/api/stripe/create-payment-intent')
    .all(passport.authenticate('jwt', {session: false}))
    .all(stripePolicy.isNewOrder)
    .all(stripePolicy.isOrderPaymentAllowed)
    .post(stripe.createPaymentIntent); // Good
  // }

  // the webhook route does not need authentication.  The signature is checked based on the data
  // that is posted to the webhook.
  app.route('/api/stripe/webhook')
    .post(stripe.webhook); // Good

  app.route('/api/stripe/oauth')
    .all(passport.authenticate('jwt', {session: false}))
    .post(stripe.oauth); // Good

  // Finish by binding the stripe middleware
  // app.param('groupId', stripe.orderByGroupId);

};
