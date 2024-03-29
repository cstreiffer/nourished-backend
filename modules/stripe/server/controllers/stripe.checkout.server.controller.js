'use strict';

/**
 * Module dependencies.
 */
var
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  util = require('util'),
  async = require('async'),
  config = require(path.resolve('./config/config')),
  twilio = require(path.resolve('./config/lib/twilio')),
  stripe = require(path.resolve('./config/lib/stripe')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Stripe = db.stripe,
  Order = db.order,
  Menu = db.menu,
  TwilioMessage = db.twiliomessage,
  Restaurant = db.restaurant;

const {Op} = require('sequelize');
const retAttributes = ['id', 'groupId', 'restaurantId', 'amount', 'paymentIntentId'];
const restRetAttributes = ['id', 'name', 'email', 'description', 'phoneNumber', 'streetAddress', 'zip', 'city', 'state', 'restaurantStripeAccountId', 'verified'];


var eventResponses;


const loadResponse = () => {
  return TwilioMessage.findAll({
    where: {
      type: 'STRIPE_RESPONSE',
      subtype: 'STRIPE_RESPONSE_MESSAGE',
    }
  });
}

const mapResponse = (values) => {
  return values.reduce(function(acc, cur) {
    acc[cur.keyword] = cur.messageBody;
    return acc;
  }, {});
}

const calculateOrderAmount = orders => {
  var sum = orders.map((order) => Number(order.total)).reduce((a,b) => a + b, 0)
  return Math.floor(sum * 100);
};

const substr = (value) => {
  return (value ? String(value).substring(0, 450) : '');
}

const calculateStripeFee = total => {
  return Math.floor(total*(1-.029)-.3*100)
}

exports.createPaymentIntent = function(req, res) {
  var amount = calculateOrderAmount(req.orders);
  var response = {
    publishableKey: config.stripe.pubKey,
    totalAmount: amount,
    message: "Payment intents successfully created"
  };

  if(req.stripeOrder) {
    stripe.paymentIntents.retrieve(req.stripeOrder.paymentIntentId)
      .then(function(paymentIntent) {
        response.stripeData = [{
                  clientSecret: paymentIntent.client_secret,
                  amount: amount,
                  groupId: req.groupId,
                }],
        response.stripeOrders = [_.pick(req.stripeOrder, retAttributes)];
        res.json(response)
      })
      .catch(function(err) {
        console.log(err);
        res.status(400).send({
          message: 'Error processing the order: ' + errorHandler.getErrorMessage(err)
        });
      })
  } else {
    var payload = {
      amount: amount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        groupId: substr(req.groupId),
        email: substr(req.user.email),
        phoneNumber: substr(req.user.phoneNumber),
        firstName: substr(req.user.firstName),
        lastName: substr(req.user.lastName),
      }
    }
    stripe.paymentIntents.create(payload)
      .then(function(paymentIntent) {
        // Create the stripe payment
        Stripe.create({
            id: uuid(),
            userId: req.user.id,
            groupId: req.groupId,
            paymentIntentId: paymentIntent.id,
            amount: amount,
          })
          .then(function(stripeOrder) {
            response.stripeData = [{
                  clientSecret: paymentIntent.client_secret,
                  amount: amount,
                  groupId: req.groupId,
                }],
            response.stripeOrders = [_.pick(stripeOrder, retAttributes)];
            res.json(response);
          })
          .catch(function(err) {
            console.log(err);
            res.status(400).send({
              message: 'Error processing the order: ' + errorHandler.getErrorMessage(err)
            });            
          })
      })
      .catch(function(err) {
        console.log(err);
        res.status(400).send({
          message: 'Error processing the order: ' + errorHandler.getErrorMessage(err)
        });
      }); 
  }
};

exports.createPaymentIntentDepricated = function(req, res) {
  // const { currency } = req.body;
  // Create a PaymentIntent with the order amount and currency

  // Remap the orders
  var orders = req.orders.reduce(function(map, obj) {
    var restaurantId = obj.restaurantId;
    if(!(restaurantId in map)) {
      map[restaurantId] = [];
    }
    map[restaurantId].push(obj);
    return map;
  }, {});

  // Remap the striper orders by restaurantId
  var stripeorders = req.stripeorders.reduce(function(map, obj) {
    map[obj.restaurantId] = obj;
    return map;
  }, {});

  // Map the values to a new array
  var ret = [];
  Object.keys(orders).forEach(function(restaurantId) {
    ret.push({
      restaurantId: restaurantId,
      amount: calculateOrderAmount(orders[restaurantId]),
      restaurantStripeAccountId: orders[restaurantId][0].restaurant.restaurantStripeAccountId,
      metadata: {
        groupId: substr(req.groupId),
        email: substr(req.user.email),
        phoneNumber: substr(req.user.phoneNumber),
        firstName: substr(req.user.firstName),
        lastName: substr(req.user.lastName),
        restaurantName: substr(orders[restaurantId][0].restaurant.name),
        deliveryDate: substr(orders[restaurantId][0].deliveryDate),
      }
    });
  });

  // TO DO: GRAB THE RESTAURANT STRIPE ID ------------------------------------
  // transfer_data: {
  //   destination: order.restaurantStripeAccountId,
  // },

  // Check if payment exists

  Promise.all(ret.map((order) => {
      if(order.restaurantId in stripeorders) {
        return stripe.paymentIntents.retrieve(stripeorders[order.restaurantId].paymentIntentId)
      }
      else {
        var payload = {
          amount: order.amount,
          currency: 'usd',
          payment_method_types: ['card'],
          metadata: order.metadata
        }
        if (order.restaurantStripeAccountId && (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development')) {
          payload.transfer_data = {
            destination: order.restaurantStripeAccountId,
            amount: calculateStripeFee(order.amount)
          }
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
        if(order[0].restaurantId in stripeorders) {
          return stripeorders[order[0].restaurantId];
        } else {
          return Stripe.create({
            id: uuid(),
            userId: req.user.id,
            groupId: req.groupId,
            restaurantId: order[0].restaurantId,
            paymentIntentId: order[1].id,
            amount: order[0].amount,
          });
        }
      })
    ).then(function(stripeOrders) {
      var ret = stripeOrders.map((order) => _.pick(order, retAttributes));
      // console.log(stripeOrders);
      var response = {
            publishableKey: config.stripe.pubKey,
            stripeData: retMod.map(function(order) {
              return {
                clientSecret: order[1].client_secret,
                amount: order[0].amount,
                groupId: req.groupId,
                restaurantId: order[0].restaurantId
              }
            }),
            stripeOrders: ret,
            totalAmount: (retMod.map((order) => order[0].amount).reduce((a,b) => a + b, 0)/100.0).toFixed(2),
            message: "Payment intents successfully created"
        };

      loadResponse()
        .then(function(eventResponses) {
          var respMap = mapResponse(eventResponses);
          var message = respMap['CREATED'];
          sendMessage(req.user, message)
            .then(function(err) {
              res.json(response);
            })
            .catch(function(err) {
              console.log(err);
              res.json(response);
            })
        })
        .catch(function(err) {
          console.log(err);
          res.json(response);
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

  // Send the authorization code to Stripe's API.
  stripe.oauth.token({
    grant_type: 'authorization_code',
    code
  }).then(
    (response) => {
      var connected_account_id = response.stripe_user_id;

      Restaurant.findOne({
        where : {
          userId: req.user.id
        }
      }).then(function(restaurant) {
        if(!restaurant) {
          return res.status(404).json({message: 'No restaurant attached to user'});
        } else {
          restaurant.restaurantStripeAccountId = connected_account_id;
          restaurant.verified = true;
          restaurant.save()
            .then(function(rest) {
              var ret = _.pick(rest, retAttributes);
              return res.status(200).json({restaurant:rest, message: 'Stripe ID attached to restaurant'});
            })
            .catch(function(err) {
              console.log(err);
              return res.status(500).json({message: 'Restaurant failed to save'});
            });
        }
      }).catch(function(err) {
        console.log(err);
        return res.status(500).json({message: 'An unknown error occurred'});
      });
    },
    (err) => {
      console.log(err);
      if (err.type === 'StripeInvalidGrantError') {
        return res.status(400).json({message: 'Invalid authorization code: ' + code});
      } else {
        return res.status(500).json({message: 'An unknown error occurred'});
      }
    }
  );
};

var sendMessage = function(user, message) {
  var to = '+1' + user.phoneNumber;
  var from = config.twilio.phoneNumber;

  return twilio.messages
    .create({
       body: message,
       from: from,
       to: to
     });
}

/**
 * Updates orders attached to paymentIntentId
 */

const updateOrderStatus = (paymentIntentId, statusUpdate, res, messageType) => {
    Stripe.findOne({
      where: {
        paymentIntentId: paymentIntentId
      },
      include: [db.user, db.restaurant]
    }).then(function(stripeorder) {
      if(stripeorder) {
        Order.findAll({
          where: {
            groupId: stripeorder.groupId,
          },
          include: db.restaurant,
        })
        .then(function(orders) {
          // var orders = orders.filter((order) => order.restaurantId === stripeorder.restaurantId);
          var orderIds = orders.map((order) => order.id);
          
          Order.update(statusUpdate, {
            where: {
              id: orderIds
            }
          })
          .then(function(orders) {
            if (messageType) {            
                  loadResponse()
                    .then(function(eventResponses) {
                      var respMap = mapResponse(eventResponses);
                      // var message = util.format(respMap[messageType], stripeorder.restaurant.name);
                      var message = respMap[messageType];
                      sendMessage(stripeorder.user, message)
                        .then(function(err) {
                          // console.log(err);
                          return res.status(200).json({received: true, message: "Orders updated"});
                        })
                        .catch(function(err) {
                          console.log(err);
                          return res.status(200).json({received: true, message: "Orders updated"});
                        });
                    }).catch(function(err) {
                      console.log(err);
                      return res.status(200).json({received: true, message: "Orders updated"});
                    });

            } else {
              return res.status(200).json({received: true, message: "Orders updated"});
            }
          })
          .catch(function(err) {
            return res.status(400).send({message: errorHandler.getErrorMessage(err)});
          });
        })
      .catch(function(err) {
        return res.status(400).send({message: errorHandler.getErrorMessage(err)});
      })

      } else {
        return res.status(400).send({message: "No associated stripe order"});
      }
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    });
};

// Expose a endpoint as a webhook handler for asynchronous events. https://dashboard.stripe.com/test/webhooks
exports.webhook = function(req, res) {
  let data, eventType, event, object;

   if (process.env.NODE_ENV === 'production' || config.stripe.webhookSecretKey) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        config.stripe.webhookSecretKey
      );
    } catch (err) {
      console.log(err);
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    eventType = event.type;
    data = event.data.object;
  } else {
    var body = JSON.parse(req.body.toString());
    eventType = body.type;
    data = body.data.object;
  }

  // event types are here https://stripe.com/docs/api/events/types
  switch(eventType) {

    case 'payment_intent.created':
      console.log('stripe.webhook payment_intent.created: ');
      // return res.json({received: true, msg: 'Payment intent created'});
      updateOrderStatus(data.id, {payStatus: 'PENDING'}, res, 'CREATED');
      break;

    case 'payment_intent.amount_capturable_updated':
      console.log('stripe.webhook payment_intent.amount_capturable_updated: ');
      return res.json({received: true, msg: 'Payment intent updated'});
      break;

    case 'payment_intent.processing':
      console.log('stripe.webhook payment_intent.processing: ');
      return res.json({received: true, msg: 'Payment intent processing'});
      break;

    case 'payment_intent.payment_failed':
      console.log('payment_intent.payment_failed: ');
      updateOrderStatus(data.id, {payStatus: 'ERROR'}, res, 'FAILED');
      break;

    case "payment_intent.succeeded":
      console.log('payment_intent.succeeded: ');
      updateOrderStatus(data.id, {payStatus: 'COMPLETE'}, res, 'SUCCEEDED');
      break;

    case 'payment_intent.canceled':
      console.log('stripe.webhook payment_intent.canceled: ');
      updateOrderStatus(data.id, {payStatus: 'CANCELLED'}, res, 'CANCELLED');
      break;

    case 'charge.refunded':
    case 'charge.succeeded':
    case 'transfer.reversed':
    case 'account.application.authorized':
      console.log('stripe.webhook charge.succeeded, charge.refunded, transfer.reversed, or account.application.authorized');
      res.status(200).json({ received: true });
      break;

    default:
      console.log('stripe.webhook: Unknown event type ' + eventType);
      console.log('Body data: ' + data);
      console.log('Body: ' + req.body);
      console.log('Event: ' + event);
      return res.status(400).json({message: "Error unknown"});
  }
};
