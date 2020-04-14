'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  stripe = require(path.resolve('./config/lib/stripe')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Stripe = db.stripe,
  Order = db.order,
  uuid = require('uuid/v4');

exports.checkout = function(req, res) {
  // Display checkout page
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
};

const calculateOrderAmount = items => {
  var sum = orders.map((order) => order.quantity * order.meal.mealinfo.price).reduce((a,b) => a + b, 0)
  return sum;
};

exports.createPaymentIntent = function(req, res) {
  // const { currency } = req.body;
  // Create a PaymentIntent with the order amount and currency
  stripe.paymentIntents.create({
    amount: calculateOrderAmount(req.orders),
    currency: 'usd',
    payment_method_types: ['card']
  }).then(function(paymentIntent) {
    // Store the order in the db
    Stripe.create({
      userId: req.user.id,
      groupId: req.groupId,
      paymentIntentId: paymentIntent.id
    }).then(function(stripeOrder) {
      res.send({
        // Send publishable key and PaymentIntent details to client
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        clientSecret: paymentIntent.client_secret
      });
    }).catch(function(err) {
      res.status(400).send({
        message: 'Error processing the order'
      })
    });
  }).catch(function(err) {
      res.status(400).send({
        message: 'Error processing the order'
      })
  })
};

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
exports.webhook = function(req, res) {
  let data, eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === "payment_intent.succeeded") {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log("💰 Payment captured!");
  } else if (eventType === "payment_intent.payment_failed") {
    console.log("❌ Payment failed.");
  }
};

/**
 * Stripe middleware
 */
exports.orderByGroupId = function(req, res, next, id) {

  Order.findAll({
    where: {
      groupId: id,
      userId: req.user.id
    },
    include: {
      model: db.meal,
      include: {
        model: db.mealinfo
      }
    }
  }).then(function(orders) {
    if (!orders) {
      return res.status(404).send({
        message: 'No orders with that identifier has been found'
      });
    } else {
      req.groupId = id;
      req.orders = orders;
      return next();
    }
  }).catch(function(err) {
    return next(err);
  });
};
