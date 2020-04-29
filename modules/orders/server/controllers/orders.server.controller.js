'use strict';

/**
 * Module dependencies.
 */
var
  _ = require('lodash'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  uuid = require('uuid/v4'),
  async = require('async'),
  nodemailer = require('nodemailer'),
  stripe = require(path.resolve('./config/lib/stripe')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Order = db.order,
  Cart = db.cart,
  Menu = db.menu,
  Restaurant = db.restaurant,
  Stripe = db.stripe;

const {Op} = require('sequelize');
var smtpTransport = nodemailer.createTransport(config.mailer.options);


// const menuRetAttributes = ['id', 'timeslotId', 'mealId', 'finalized', 'visible'];
// const mealRetAttributes = ['id', 'name', 'description', 'allergens', 'dietaryRestrictions', 'mealinfoId'];
// const mealinfoRetAttributes = ['id', 'type', 'price'];
// const timeslotRetAttributes = ['id', 'date', 'restaurantId', 'hospitalId'];

//  id | date | userStatus | restStatus | payStatus | quantity | information | groupId | deleted | createdAt | updatedAt | hospitalId | mealId | userId
const retAttributes = [
  'id', 'orderDate', 'userStatus', 'restStatus', 'payStatus', 'quantity', 'information', 'groupId',
  'deliveryDate', 'mealName', 'mealDescription',  'allergens', 'dietaryRestrictions', 'type', 'price',
  'total', 'hospitalId', 'restaurantId'
];
const restRetAttributes = ['id', 'name', 'description', 'phoneNumber', 'email'];
const hospRetAttributes = [ 'id' , 'name', 'phoneNumber', 'email', 'streetAddress', 'zip', 'city', 'state', 'dropoffLocation', 'dropoffInfo'];
const userRetAttributes = [ 'username', 'email', 'phoneNumber', 'firstName', 'lastName' ]
/**
 * Create a order
 */
exports.create = function(req, res) {
  var groupId = uuid();

  // Map the menu ids to their items
  var menus = req.menus.reduce(function(acc, cur) {
      acc[cur.id] = cur;
      return acc;
    }, {});

  // Generate the meal copies and add the uuid to each order, then bulk create
  // the meals, then bulk create the orders
  var orders = req.body.orders.map((order) => {
    var menu = menus[order.menuId]

    var ret = {};
    // Include info
    ret.id = uuid();
    ret.information = order.information;
    ret.quantity = order.quantity;

    // Meal info
    ret.deliveryDate = menu.timeslot.date;
    ret.mealName = menu.mealName;
    ret.mealDescription = menu.mealDescription;
    ret.allergens = menu.allergens;
    ret.dietaryRestrictions = menu.dietaryRestrictions;
    ret.type = menu.mealinfo.type;
    ret.price = menu.mealinfo.price;

    // Compute total
    ret.total = menu.mealinfo.price*order.quantity;

    // Id info
    ret.hospitalId = menu.timeslot.hospitalId;
    ret.restaurantId = menu.timeslot.restaurantId;
    ret.groupId = groupId;
    ret.userId = req.user.id;

    return ret;
  });

  Order.bulkCreate(orders, {validate: true}).then(function() {
    if (!orders) {
      return res.status(404).send({
        message: 'Could not create the order'
      });
    } else {
      var menuIds = orders.map(order => order.menuId);
      var ret = orders.map((order)=> _.pick(order, retAttributes));
      Cart.destroy({
        where: {
          userId: req.user.id
        }
      }).then(function() {
        return res.jsonp({orders: ret, groupId: groupId, message: "Orders successfully created"});
      }).catch(function(err) {
        return res.jsonp({orders: ret, groupId: groupId, message: "Orders successfully created. Error deleting cart."});
      });
    };
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

// /**
//  * Show the current order
//  */
// exports.read = function(req, res) {
//   res.jsonp({order: req.order, message: "Order successfully found"});
// };

/**
 * Update an order
 */
exports.update = function(req, res) {
  // // For each, set same date, set same groupId, set individual id, set userId
  // var updateOrders = {};
  // req.body.orders.map((order)=> updateOrders[order.id] = order);
  // var groupId = '';
  // var orders = req.orders.map((order) => {
  //   var order = order.toJSON();
  //   var ord = updateOrders[order.id];
  //   order.information = ord.information ? ord.information : order.information;
  //   order.quantity = ord.quantity ? ord.quantity : order.quantity;
  //   order.hospitalId = ord.hospitalId ? ord.hospitalId : order.hospitalId;
  //   groupId = order.groupId;
  //   return order;
  // });

  // // TO DO -- SEND OUT EMAIL!!!

  // Order.bulkCreate(orders, {updateOnDuplicate : ["information", "quantity", "hospitalId"]}).then(function() {
  //   var ret = orders.map((order)=> _.pick(order, retAttributes));
  //   res.jsonp({orders: ret, groupId: groupId, message: "Orders successfully updated"});
  // }).catch(function(err) {
  //   return res.status(400).send({
  //     message: errorHandler.getErrorMessage(err)
  //   });
  // });
};

/**
 * Update an order
 */
exports.userStatusUpdate = function(req, res) {
  // Check to make sure either group or order ids specified
  if(req.body.orderIds && req.body.userStatus) {
    var query = {userId: req.user.id}
    if(req.body.orderIds) query.id = req.body.orderIds;
    // if(req.body.groupId) query.groupId = req.body.groupId;
    // if(req.body.menuIds) query.menuId = req.body.menuIds;

    Order.update({userStatus: req.body.userStatus}, {
      where: query
    }).then(function(orders) {
      var ret = orders.map((order)=> _.pick(order, retAttributes));
      res.jsonp({orders: orders, message: "Orders successfully updated"});
    })
  } else {
     return res.status(400).send({
      message: "Please include orderids/menuids/userstatus"
    });
  }
};

/**
 * NEEDS TO FIND THEIR RESTAURANT IDS
 */
exports.restStatusUpdate = function(req, res) {

  // TODO: Grab restuarant Ids then perform the update
  if(req.body.orderIds && req.body.restStatus) {

    var orderQuery = {};
    if(req.body.orderIds) orderQuery.id = req.body.orderIds;

    Restaurant.findAll({
      where: {
        userId: req.user.id
      }
    }).then(function(restuarants) {
      if(restuarants) {
        orderQuery.restaurantId = restuarants.map((rest) => rest.id);



        Order.findAll({
          where: orderQuery,
          attributes: retAttributes
        }).then(function(orders) {
          if (!orders) {
            return res.status(404).send({
              message: 'No orders found'
            });
          } else {
            var orderIds = orders.map((order) => order.id);
            Order.update({restStatus: req.body.restStatus}, {
              where: {
                id: orderIds
              }
            }).then(function() {
              var ret = orders.map((order)=> _.pick(order, retAttributes));
              return res.jsonp({orders: ret, message: "Orders successfully updated"});
            }).catch(function(err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            });
          }
        }).catch(function(err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        });



      } else {
        return res.status(400).send({
          message: "Please include orderids/menuids/reststatus"
        });
      }
    }).catch(function(err) {
      return res.status(500).send({
        message: "An error occured"
      });
    });
  } else {
    return res.status(400).send({
      message: "Please include orderids/menuids/reststatus"
    });
  }
};


const calculateOrderAmount = orders => {
  if(orders) {
    var sum = orders.map((order) => order.total).reduce((a,b) => a + b, 0)
    return Math.floor(sum * 100);
  } else {
    return 0;
  }
};

const calculateTotalAmount = orders => {
  var sum = 0;
  if(orders.length){
    sum = orders.map((order) => (order.oldAmount - order.newAmount)/100.00).reduce((a,b) => a + b, 0);
  }
  return sum
}

/**
 * Delete an order
 */
exports.delete = function(req, res) {
  var orderIds = req.orders.map((order) => order.id);
  var groupId = req.body.groupId;
  async.waterfall([
      function(done) {
        // Sort the orders by
        Order.findAll({
          where: {
            userId: req.user.id,
            groupId: groupId,
            deleted: false
          },
          include: db.restaurant
        }).then(function(ordersRet) {
          var orders = ordersRet.reduce(function(map, obj) {
            var restaurantId = obj.restaurantId;
            if(!(restaurantId in map)) {
              map[restaurantId] = [];
            }
            if(!(orderIds.includes(obj.id))) {
              map[restaurantId].push(obj);
            }
            return map;
          }, {});
          done(null, orders);
        }).catch(function(err) {
          done(err);
        });
      },
      function(orders, done) {
        Stripe.findAll({
          where: {
            userId: req.user.id,
            groupId: groupId
          }
        })
        .then(function(stripeorders) {
          var stripeorders = stripeorders.reduce(function(map, obj) {
            map[obj.restaurantId] = obj;
            return map;
          }, {});
          var refunds = [];
          Object.keys(orders).map(function(key) {
            if(key in stripeorders) {
              refunds.push({
                oldAmount: stripeorders[key].amount,
                newAmount: calculateOrderAmount(orders[key]),
                refundAmount: stripeorders[key].amount - calculateOrderAmount(orders[key]),
                stripePaymentId: stripeorders[key].paymentIntentId,
                restaurantId: key
              });
            }
          });
          done(null, refunds);
        }).catch(function(err) {
          done(err);
        });
      },
        // Issue the refunds
        function(refunds, done) {
          const refundIntents = [];

          refunds.forEach((refund) => {
            const options = {
              payment_intent: refund.stripePaymentId,
              amount: refund.oldAmount - refund.newAmount,
              reverse_transfer: true,
            };
            refundIntents.push(stripe.refunds.create(options));
          });

          Promise
              .all(refundIntents)
              .then(function(refundResponses) {
                const refs = refundResponses.map(function(e, i) {
                  return [e, refunds[i]];
                });
                done(null, refs, refunds);
              })
              .catch(function(err) {
                console.log('Issue refunds error:', err);
                return done(err);
              });
        },
        // Mark the orders as deleted
        function(refunds, originalRefundsObj, done) {
          Order.update({deleted: true, payStatus: 'REFUNDED', userStatus: 'CANCELLED'}, {
            where: {
              userId: req.user.id,
              id: orderIds
            }
          }).then(function(orders) {
            if(refunds.length) {
              var ret = req.orders.map((order)=> _.pick(order, retAttributes));
              res.jsonp({orders: ret, message: "Orders marked as deleted"});
              done(null, originalRefundsObj);
            } else {
              return res.status(402).send({
                message: 'Orders marked as deleted but no associated payment intents'
              });
            }
          }).catch(function(err) {
            console.log('Mark the orders as deleted error:', err);
            done(err);
          });
        },
        // send email confirmations
        function(refunds, done) {
          if(refunds.length) {
            var ors = req.orders.map((order) => {
              return {
                name: order.mealName,
                quantity: order.quantity,
                totalPrice: order.total,
                restaurant: order.restaurant.name
              }
            });
            res.render(path.resolve('modules/orders/server/templates/user-order-cancel-confirmation'), {
              date: new Date().toISOString(),
              emailAddress: config.mailer.email,
              totalAmount: calculateTotalAmount(refunds),
              orders: ors
            }, function(err, emailHTML) {
              done(err, emailHTML, refunds);
            });
          } else {
            done(null, null, refunds);
          }
        },
        function(emailHTML, refunds, done) {
          if(refunds.length) {
            var mailOptions = {
              to: req.user.email,
              from: config.mailer.from,
              subject: 'Order Cancellation - Confirmation',
              html: emailHTML
            };
            smtpTransport.sendMail(mailOptions)
                .then(function(){
                  done(null, refunds);
                }).catch(function(err) {
              done(err);
            })
          } else {
            done(null, refunds);
          }
        },
        function(refunds, done) {
          res.render(path.resolve('modules/orders/server/templates/admin-order-cancel-confirmation'), {
            fullName: req.user.firstName + ' ' + req.user.lastName,
            phoneNumber: req.user.phoneNumber,
            date: new Date().toISOString(),
            emailAddress: req.user.email,
            totalAmount: calculateTotalAmount(refunds),
            refunds: refunds
          }, function(err, emailHTML) {
            done(err, emailHTML, refunds);
          });
        },
        function(emailHTML, refunds, done) {
          var mailOptions = {
            to: config.mailer.errorEmails,
            from: config.mailer.from,
            subject: 'Order Cancellation - Report',
            html: emailHTML
          };
          smtpTransport.sendMail(mailOptions)
              .then(function(){
                done(null, refunds);
              }).catch(function(err) {
            done(err);
          });
        },
    ],
    function(err) {
      // TODO get actual error messages language from Ryan
      if(err) {
        console.log(err);

        if (err.code === 'charge_already_refunded') {
          return res.status(400).json({ message: 'This charge has already been refunded.' });
        }

        return res.status(500).send({
          message: 'There was a problem processing your payment refund.'
        });
      }
    });
};

var formatDate = function(query) {
  if (query.startDate && query.endDate) return{[Op.gte]: query.startDate, [Op.lte] : query.endDate};
  if (query.startDate) return {[Op.gte] : query.startDate};
  if (query.endDate) return {[Op.lte] : query.endDate};
};

/**
 * List of Orders
 */
exports.userList = function(req, res) {
  var query = {userId: req.user.id, payStatus: 'COMPLETE'};
  // if(req.query.startDate || req.query.endDate) query.deliveryDate = formatDate(req.query);

  Order.findAll({
    where: query,
    attributes: retAttributes,
    include:
    [{
      model: db.restaurant,
      attributes: restRetAttributes
    }, {
      model: db.hospital,
      attributes: hospRetAttributes
    }]
  }).then(function(orders) {
    if (!orders) {
      return res.status(404).send({
        message: 'No orders found'
      });
    } else {
      res.json({orders: orders, message: "Orders successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * List of restaurant orders (NEED TO SOLVE FOR THIS)
 */
exports.restList = function(req, res) {
  var orderQuery = {payStatus: 'COMPLETE'};

  // TODO: Grab restuarant Ids then perform query
  // if(req.query.startDate || req.query.endDate) orderQuery.deliveryDate = formatDate(req.query);

  Restaurant.findAll({
    where: {
      userId: req.user.id
    }
  }).then(function(restuarants) {
    if(restuarants) {
      orderQuery.restaurantId = restuarants.map((rest) => rest.id);

      Order.findAll({
        where: orderQuery,
        attributes: retAttributes,
        include:
          [{
            model: db.restaurant,
            attributes: restRetAttributes
          }, {
            model: db.hospital,
            attributes: hospRetAttributes
          }, {
            model: db.user,
            attributes: userRetAttributes
          }]
      }).then(function(orders) {
        if (!orders) {
          return res.status(404).send({
            message: 'No orders found'
          });
        } else {
          res.jsonp({orders: orders, message: "Orders successfully found"});
        }
      }).catch(function(err) {
        console.log(err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      });
    } else {
      return res.status(400).send({
        message: "No restuarants associated with user"
      });
    }
  }).catch(function(err) {
    return res.status(500).send({
      message: "An error occured"
    });
  });
};

/**
 * List of restaurant orders itemized
 */
exports.restListItemized = function(req, res) {
  var orderQuery = {};

  // TODO: Grab restuarant Ids then perform query
  // if(req.query.startDate || req.query.endDate) orderQuery.deliveryDate = formatDate(req.query);

  Restaurant.findAll({
    where: {
      userId: req.user.id
    }
  }).then(function(restuarants) {
    if(restuarants) {
      orderQuery.restaurantId = restuarants.map((rest) => rest.id);

      Order.findAll({
        where: orderQuery,
        attributes: retAttributes,
        include:
        [{
          model: db.restaurant,
          attributes: restRetAttributes
        }, {
          model: db.hospital,
          attributes: hospRetAttributes
        }, {
            model: db.user,
            attributes: userRetAttributes
          }]
      }).then(function(orders) {
        if (!orders) {
          return res.status(404).send({
            message: 'No orders found'
          });
        } else {
          // Map out the orders
          var ret = orders.map(function(order) {
            var orderList = [];
            var orderQuantity = Number(order.quantity);
            for(var i=0; i < orderQuantity; i++) {
              var toPush = order.toJSON();
              toPush.quantity = 1;
              orderList.push(toPush);
            }
            return orderList
          });
          // Flatten that bad boy
          ret = ret.flat(1);
          res.jsonp({orders: ret, message: "Orders successfully found - itemized"});
        }
      }).catch(function(err) {
        console.log(err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      });

    } else {
      return res.status(400).send({
        message: "No restuarants associated with user"
      });
    }
  }).catch(function(err) {
    console.log(err);
    return res.status(500).send({
      message: "An error occured"
    });
  });
};

/**
 * Order middleware
 */
exports.orderByID = function(req, res, next, id) {

  Order.findOne({
    where: {
      id: id
    },
    include: [db.hospital, db.restaurant]
  }).then(function(order) {
    if (!order) {
      return res.status(404).send({
        message: 'No order with that identifier has been found'
      });
    } else {
      req.order = order;
      next();
    }
  }).catch(function(err) {
    return next(err);
  });
};
