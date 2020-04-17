'use strict';

/**
 * Module dependencies.
 */
var
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  async = require('async'),
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

  // The restaurant's stripe connect id should be stored on the restaurant model.
  // TODO: follow the order to the restaurant
  // var restaurantStripeAccountId = 'something';
  var orders = req.orders.reduce(function(map, obj) {
    var timeslotid = obj.menu.timeslot.id;
    if(!(timeslotid in map)) {
      map[timeslotid] = [];
    }
    map[timeslotid].push(obj);
    return map;
  }, {});

  // Map the values to a new array
  var ret = [];
  Object.keys(orders).forEach(function(timeslotid) {
    ret.push({
      timeslotid: timeslotid,
      amount: calculateOrderAmount(orders[timeslotid]),
      restaurantid: orders[timeslotid][0].menu.timeslot.restaurant.id,
      restaurantStripeAccountId: orders[timeslotid][0].menu.timeslot.restaurant.restaurantStripeAccountId,
      metadata: {
        email: req.user.email.substring(0, 450),
        phoneNumber: req.user.phoneNumber.substring(0, 450),
        fullName: req.user.fullName.substring(0, 450),
        groupId: req.groupId.substring(0, 450),
        restaurantName: orders[timeslotid][0].menu.timeslot.restaurant.name.substring(0, 450),
        menuDate: orders[timeslotid][0].menu.timeslot.date.toString().substring(0, 450),
      }
    });
  });

  // TO DO: GRAB THE RESTAURANT STRIPE ID ------------------------------------
  // transfer_data: {
  //   destination: order.restaurantStripeAccountId,
  // },

  Promise.all(ret.map((order) => {
      return stripe.paymentIntents.create({
        amount: order.amount,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: order.metadata
      })
    })
  ).then(function(paymentIntents) {
    // Comnbine the arrays together
    var retMod = ret.map(function(e, i) {
      return [e, paymentIntents[i]];
    });
    Promise.all(retMod.map((order) => {
      return Stripe.create({
          id: uuid(),
          userId: req.user.id,
          groupId: req.groupId,
          timeslotId: order[0].timeslotid,
          paymentIntentId: order[1].id,
          amount: order[0].amount,
        })
      })
    ).then(function(stripeOrders) {
      var ret = stripeOrders.map((order) => _.pick(order, retAttributes));
      res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        stripeData: retMod.map(function(order) {
          return {
            clientSecret: order[1].client_secret,
            amount: order[0].amount,
            groupId: req.groupId,
            timeslotId: order[0].timeslotid
          }
        }),
        stripeOrders: ret,
        totalAmount: retMod.map((order) => order[0].ammount).reduce((a,b) => a + b, 0),
        message: "Payment intents successfully created"
      });
    }).catch(function(err) {
      res.status(400).send({
        message: 'Error processing the order: ' + err
      });
    });
  }).catch(function(err) {
    res.status(400).send({
      message: 'Error processing the order: ' + err
    });
  });
};

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
// This route is /api/stripe/webhook
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

  let responseMessage = 'unknown';
  // event types are here https://stripe.com/docs/api/events/types
  // in data the 'metadata' object should be present from the payment_intent above
  switch(eventType) {
  case 'payment_intent.created':
    // when an intent is created
    console.log('  stripe.webhook payment_intent.created: ' + JSON.stringify(data.object.metadata, null, 2));
    // see example_data.txt for what is sent
    break;

  case "charge.succeeded":
    // logging the payment was charge.succeeded
    console.log('charge.succeeded: ' + data.object.receipt_url);
    responseMessage = 'charge.succeded';
    break;

  case "charge.failed":
    // logging the payment was charge.failed
    console.log('charge.failed: ' + data.object.receipt_url);
    responseMessage = 'charge.failed';
    break;

  case "payment_intent.succeeded":
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)

    // TODO: mark the order succeeded.

    console.log('payment_intent.succeeded: ' + JSON.stringify(data.object.metadata));
    responseMessage = 'payment success';

    break;
  case 'payment_intent.payment_failed':
    // TODO: in this case mark the order failed - so the user knows they will not get their order
    console.log('payment_intent.payment_failed: ' + JSON.stringify(data.object.metadata));
    break;

  default:
    // log the event type is unknown and will be unprocessed.   If there are too many of these, stripe will
    // disable the webhook - so monitor these error logs and act on them if you see them
    console.log('stripe.webhook: Unknown event type ' + eventType);
    responseMessage = 'payment failed';
    return res.sendStatus(400);
  }

  // respond with a 200 OK so stripe knows we processed the webhook and will not re-send the event.
  return res.json({received: true, msg: responseMessage});
};
