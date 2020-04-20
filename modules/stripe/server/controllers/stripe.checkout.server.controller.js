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
  Menu = db.menu,
  Restaurant = db.restaurant;

const {Op} = require('sequelize');
const retAttributes = ['id', 'groupId', 'amount', 'paymentIntentId'];
const restRetAttributes = ['id', 'name', 'email', 'description', 'phoneNumber', 'streetAddress', 'zip', 'city', 'state', 'restaurantStripeAccountId'];

exports.checkout = function(req, res) {
  // Display checkout page
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
};

const calculateOrderAmount = orders => {
  var sum = orders.map((order) => Number(order.quantity) * Number(order.menu.meal.mealinfo.price)).reduce((a,b) => a + b, 0)
  return Math.floor(sum * 100);
};

const substr = (value) => {
  return (value ? String(value).substring(0, 450) : '');
}

exports.createPaymentIntent = function(req, res) {
  // const { currency } = req.body;
  // Create a PaymentIntent with the order amount and currency

  // Remap the orders
  var orders = req.orders.reduce(function(map, obj) {
    var timeslotid = obj.menu.timeslot.id;
    if(!(timeslotid in map)) {
      map[timeslotid] = [];
    }
    map[timeslotid].push(obj);
    return map;
  }, {});

  // Remap the striper orders by timeslot
  var stripeorders = req.stripeorders.reduce(function(map, obj) {
    map[obj.timeslotId] = obj;
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
        groupId: substr(req.groupId),
        timeslotId: substr(timeslotid),
        email: substr(req.user.email),
        phoneNumber: substr(req.user.phoneNumber),
        firstName: substr(req.user.firstName),
        lastName: substr(req.user.lastName),
        restaurantName: substr(orders[timeslotid][0].menu.timeslot.restaurant.name),
        menuDate: substr(orders[timeslotid][0].menu.timeslot.date),
      }
    });
  });

  // TO DO: GRAB THE RESTAURANT STRIPE ID ------------------------------------
  // transfer_data: {
  //   destination: order.restaurantStripeAccountId,
  // },

  // Check if payment exists 

  Promise.all(ret.map((order) => {
      if(order.timeslotid in stripeorders) {
        return stripe.paymentIntents.retrieve(stripeorders[order.timeslotid].paymentIntentId)
      } 
      else {
        var payload = {
          amount: order.amount,
          currency: 'usd',
          payment_method_types: ['card'],
          metadata: order.metadata
        }
        if (order.restaurantStripeAccountId && process.env.NODE_ENV === 'production') {
          payload.transfer_data = {destination: order.restaurantStripeAccountId}
        }
        return stripe.paymentIntents.create(payload);
      }
    })
  ).then(function(paymentIntents) {
    // Comnbine the arrays together
    var retMod = ret.map(function(e, i) {
      return [e, paymentIntents[i]];
    });
    Promise.all(retMod.map((order) => {
        if(order[0].timeslotid in stripeorders) {
          return stripeorders[order[0].timeslotid];
        } else {
          return Stripe.create({
            id: uuid(),
            userId: req.user.id,
            groupId: req.groupId,
            timeslotId: order[0].timeslotid,
            paymentIntentId: order[1].id,
            amount: order[0].amount,
          }); 
        }
      })
    ).then(function(stripeOrders) {
      // console.log(stripeOrders);
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
        totalAmount: (retMod.map((order) => order[0].amount).reduce((a,b) => a + b, 0)/100.0).toFixed(2),
        message: "Payment intents successfully created"
      });
    }).catch(function(err) {
      console.log(err);
      res.status(400).send({
        message: 'Error processing the order: ' + errorHandler.getErrorMessage(err)
      });
    });
  }).catch(function(err) {
    console.log(err);
    res.status(400).send({
      message: 'Error processing the order: ' + errorHandler.getErrorMessage(err)
    });
  });
};

exports.oauth = function(req, res) {
  var user = req.user;
  const { code, state } = req.query;

  // Assert the state matches the state you provided in the OAuth link (optional).
  if(!stateMatches(state)) {
    return res.status(403).json({ error: 'Incorrect state parameter: ' + state });
  }

  // Send the authorization code to Stripe's API.
  stripe.oauth.token({
    grant_type: 'authorization_code',
    code
  }).then(
    (response) => {
      var connected_account_id = response.stripe_user_id;

      Restaurant.findOne({
        where : {
          id: req.user.id,
          restaurantStripeAccountId: {
            [Op.ne] : null
          }
        }
      }).then(function(rest) {
        if(!rest) {
          return res.status(404).json({message: 'No restaurant attached to user'});
        } else {
          restaurant.restaurantStripeAccountId = connected_account_id;
          restaurant.save()
            .then(function(rest) {
              var ret = _.pick(order, retAttributes);
              return res.status(200).json({message: 'Stripe ID attached to restaurant'});
            })
            .catch(function(err) {
              return res.status(500).json({message: 'Restaurant failed to save'});
            });  
        }
      }).catch(function(err) {
        return res.status(500).json({message: 'An unknown error occurred'});
      });
    },
    (err) => {
      if (err.type === 'StripeInvalidGrantError') {
        return res.status(400).json({message: 'Invalid authorization code: ' + code});
      } else {
        return res.status(500).json({message: 'An unknown error occurred'});
      }
    }
  );
};

const stateMatches = (state_parameter) => {
  // Load the same state value that you randomly generated for your OAuth link.
  const saved_state = process.env.STRIPE_STATE;
  return saved_state == state_parameter;
};

/**
 * Updates orders attached to paymentIntentId
 */

const updateOrderStatus = (paymentIntentId, statusUpdate, res) => {
    Stripe.findOne({
      where: {
        paymentIntentId: paymentIntentId
      }
    }).then(function(stripeorder) {
      Order.findAll({
        where: {
          groupId: stripeorder.groupId,
        },
        include: db.menu,
      }).then(function(orders) {
        var orders = orders.filter((order) => order.menu.timeslotId === stripeorder.timeslotId);
        var orderIds = orders.map((order) => order.id);
        Order.update(statusUpdate, {
          where: {
            id: orderIds
          }
        }).then(function(orders) {
          return res.status(200).json({received: true, message: "Orders updated"});
        });
      }).catch(function(err) {
        console.log(err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      })
    }).catch(function(err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

// Expose a endpoint as a webhook handler for asynchronous events. https://dashboard.stripe.com/test/webhooks
exports.webhook = function(req, res) {
  let data, eventType;

  // Check if webhook signing is configured.
  // if (process.env.STRIPE_WEBHOOK_SECRET || process.env.NODE_ENV === 'production') {
   if (process.env.NODE_ENV === 'production') {
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
    data = req.body.data;
    eventType = req.body.type;
  }

  // event types are here https://stripe.com/docs/api/events/types
  switch(eventType) {

    case 'payment_intent.created':
      console.log('stripe.webhook payment_intent.created: ' + JSON.stringify(data, null, 2));
      return res.json({received: true, msg: 'Payment intent created'});
      break;

    case 'payment_intent.amount_capturable_updated':
      console.log('stripe.webhook payment_intent.amount_capturable_updated: ' + JSON.stringify(data, null, 2));
      return res.json({received: true, msg: 'Payment intent updated'});
      break;

    case 'payment_intent.processing':
      console.log('stripe.webhook payment_intent.processing: ' + JSON.stringify(data, null, 2));
      return res.json({received: true, msg: 'Payment intent processing'});
      break;

    case 'payment_intent.payment_failed':
      console.log('payment_intent.payment_failed: ' + JSON.stringify(data, null, 2));
      updateOrderStatus(data.id, {payStatus: 'ERROR'}, res);
      break;

    case "payment_intent.succeeded":
      console.log('payment_intent.succeeded: ' + JSON.stringify(data, null, 2));
      updateOrderStatus(data.id, {payStatus: 'COMPLETE'}, res);
      break;

    case 'payment_intent.canceled':
      console.log('stripe.webhook payment_intent.canceled: ' + JSON.stringify(data, null, 2));
      updateOrderStatus(data.id, {payStatus: 'REFUNDED'}, res);
      break;

    default:
      console.log('stripe.webhook: Unknown event type ' + eventType);
      return res.status(400).json({message: "Error unknown"});
  }
};
