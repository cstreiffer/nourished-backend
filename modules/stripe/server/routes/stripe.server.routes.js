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
  app.route('/api/user/:stripeId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(stripePolicy.isAllowed)
    .get(stripe.read); // Good

  app.param('stripeId', stripe.stripeByID);

  // STRIPE CHECKOUT ROUTES ROUTES ---------------------------------- 

	// app.use(express.static(process.env.STATIC_DIR));
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

  app.route('/api/stripe/checkout')
    .all(passport.authenticate('jwt', {session: false}))
    .get(stripe.checkout) // Good

  app.route('/api/stripe/create-payment-intent/:groupId')
    .all(passport.authenticate('jwt', {session: false}))
    .post(stripe.createPaymentIntent) // Good

  app.route('/api/stripe/webhook')
    .all(passport.authenticate('jwt', {session: false}))
    .post(stripe.webhook) // Goods  

  // Finish by binding the stripe middleware
  app.param('groupId', stripe.orderByGroupId);

};