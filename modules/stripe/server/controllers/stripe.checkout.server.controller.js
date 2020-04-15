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

const retAttributes = ['id', 'groupId', 'amount'];

exports.checkout = function(req, res) {
  // Display checkout page
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
};

const calculateOrderAmount = orders => {
  var sum = orders.map((order) => Number(order.quantity) * Number(order.menu.meal.mealinfo.price)).reduce((a,b) => a + b, 0)
  return Math.floor(sum * 100);
};

exports.createPaymentIntent = function(req, res) {
  // const { currency } = req.body;
  // Create a PaymentIntent with the order amount and currency
  var orderAmount = calculateOrderAmount(req.orders);
  stripe.paymentIntents.create({
    amount: calculateOrderAmount(req.orders),
    currency: 'usd',
    payment_method_types: ['card'],
    metadata: {
      userId: req.user.id,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber,
      fullName: req.user.fullName,
      orderId: req.groupId,
    }
  }).then(function(paymentIntent) {
    // Store the order in the db
    Stripe.create({
      id: uuid(),
      userId: req.user.id,
      groupId: req.groupId,
      paymentIntentId: paymentIntent.id,
      amount: orderAmount,
    }).then(function(stripeorder) {
      var ret = _.pick(stripeorder, retAttributes);
      res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        clientSecret: paymentIntent.client_secret,
        stripeorder: ret,
        message: "Payment intent successfully created"
      });
    }).catch(function(err) {
      console.log(err);
      res.status(400).send({
        message: 'Error processing the order: ' + err
      });
    });
  }).catch(function(err) {
    console.log(err);
      res.status(400).send({
        message: 'Error processing the order: ' + err
      });
  });
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
