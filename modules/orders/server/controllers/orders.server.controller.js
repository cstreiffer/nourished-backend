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
  Stripe = db.stripe;

const {Op} = require('sequelize');
var smtpTransport = nodemailer.createTransport(config.mailer.options);

//  id | date | userStatus | restStatus | payStatus | quantity | information | groupId | deleted | createdAt | updatedAt | hospitalId | mealId | userId 
const retAttributes = ['id', 'date', 'userStatus', 'restStatus', 'payStatus', 'quantity', 'information', 'groupId', 'menuId'];
const menuRetAttributes = ['id', 'timeslotId', 'mealId', 'finalized', 'visible'];
const mealRetAttributes = ['id', 'name', 'description', 'allergens', 'dietaryRestrictions', 'mealinfoId'];
const mealinfoRetAttributes = ['id', 'type', 'price'];
const timeslotRetAttributes = ['id', 'date', 'restaurantId', 'hospitalId'];
const restRetAttributes = ['id', 'name', 'description', 'phoneNumber', 'email'];
const hospRetAttributes = [ 'id' , 'name', 'phoneNumber', 'email', 'streetAddress', 'zip', 'city', 'state', 'dropoffLocation', 'dropoffInfo'];

/**
 * Create a order
 */
exports.create = function(req, res) {
  var groupId = uuid();
  var date = new Date().toISOString();

  // For each, set same date, set same groupId, set individual id, set userId
  var orders = req.body.orders.map((order) => {
    var ret = {};
    ret.groupId = groupId;
    ret.userId = req.user.id;
    ret.date= date;
    ret.id = uuid();
    ret.information = order.information;
    ret.quantity = order.quantity;
    ret.menuId = order.menuId;
    ret.hospitalId = order.hospitalId || req.user.hospitalId;
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
  // For each, set same date, set same groupId, set individual id, set userId
  var updateOrders = {};
  req.body.orders.map((order)=> updateOrders[order.id] = order);
  var groupId = '';
  var orders = req.orders.map((order) => {
    var order = order.toJSON();
    var ord = updateOrders[order.id];
    order.information = ord.information ? ord.information : order.information;
    order.quantity = ord.quantity ? ord.quantity : order.quantity;
    order.hospitalId = ord.hospitalId ? ord.hospitalId : order.hospitalId;
    groupId = order.groupId;
    return order;
  });

  // TO DO -- SEND OUT EMAIL!!!

  Order.bulkCreate(orders, {updateOnDuplicate : ["information", "quantity", "hospitalId"]}).then(function() {
    var ret = orders.map((order)=> _.pick(order, retAttributes));
    res.jsonp({orders: ret, groupId: groupId, message: "Orders successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Update an order
 */
exports.userStatusUpdate = function(req, res) {
  // Check to make sure either group or order ids specified
  if((req.body.orderIds || req.body.menuIds) && req.body.userStatus) {
    var query = {userId: req.user.id}
    if(req.body.orderIds) query.id = req.body.orderIds;
    // if(req.body.groupId) query.groupId = req.body.groupId;
    if(req.body.menuIds) query.menuId = req.body.menuIds;

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
 * User status an order
 */
exports.restStatusUpdate = function(req, res) {
  if((req.body.orderIds || req.body.menuIds) && req.body.restStatus) {
    var orderQuery = {};
    if(req.body.orderIds) orderQuery.id = req.body.orderIds;
    if(req.body.menuIds) orderQuery.menuId = req.body.menuIds;

    var menuQuery = {userId: req.user.id};
    // if(req.body.mealIds) menuQuery.mealId = req.body.mealIds;

    Order.findAll({
      where: orderQuery,
      attributes: retAttributes,
      include: {
        model: db.menu,
        where: menuQuery
      }
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
};


const calculateOrderAmount = orders => {
  if(orders) {
    var sum = orders.map((order) => Number(order.quantity) * Number(order.menu.meal.mealinfo.price)).reduce((a,b) => a + b, 0)
    return Math.floor(sum * 100);
  } else {
    return 0;
  }
};

const calculateTotalAmount = orders => {
  var sum = orders.map((order) => (order.oldAmount - order.newAmount)/100.00).reduce((a,b) => a + b, 0)
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
          include: {
            model: db.menu,
            include: {
              model: db.meal,
              include: db.mealinfo
            }
          }
        }).then(function(ordersRet) {
          var orders = ordersRet.reduce(function(map, obj) {
            var timeslotid = obj.menu.timeslotId;
            if(!(timeslotid in map)) {
              map[timeslotid] = [];
            }
            if(!(orderIds.includes(obj.id))) {
              map[timeslotid].push(obj);
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
            map[obj.timeslotId] = obj;
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
                timeslotid: key
              });
            }
          });
          done(null, refunds);
        }).catch(function(err) {
          done(err);
        })
      },
      function(refunds, done) {
        if(refunds.length) {
          var ors = req.orders.map((order) => {
              return {
                name: order.menu.meal.name,
                quantity: order.quantity,
                totalPrice: order.quantity * order.menu.meal.mealinfo.price,
                restaurant: order.menu.timeslot.restaurant.name
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
            html: emailHTML,
            attachments: [{
              filename: 'nourished_logo.png',
              path: path.resolve('./modules/users/server/images/nourished_logo.png'),
              cid: 'nourishedlogo' //same cid value as in the html img src
            }]
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
          html: emailHTML,
          attachments: [{
            filename: 'nourished_logo.png',
            path: path.resolve('./modules/users/server/images/nourished_logo.png'),
            cid: 'nourishedlogo' //same cid value as in the html img src
          }]
        };
        smtpTransport.sendMail(mailOptions)
          .then(function(){
            done(null, refunds);
          }).catch(function(err) {
            done(err);
          });
      },
      // // Issue the refunds
      // function(refunds, done) {
      //   console.log(refunds);

      //   Promise.all(refunds.map(function(refund) {
      //       stripe.refunds.create({
      //         payment_intent: refund.paymentIntentId,
      //         amount: refund.oldAmount - refund.newAmount
      //       })
      //     })
      //   ).then(function(refundResponses) {
      //     var refs = refundResponses.map(function(e, i) {
      //       return [e, refunds[i]];
      //     });
      //     done(null, refs);
      //   }).catch(function(err) {
      //     done(err);
      //   })
      // },
      // function(refunds, done) {
      //   Promise.all(refunds.map((refund) => {
      //     Stripe.update({refundId : refund[0].id}, {
      //       where: {
      //         paymentIntentId: refund[1].paymentIntentId,
      //       }
      //     })
      //   })).then(function(stripes) {
      //     done(null);
      //   }).catch(function(err) {
      //     done(err);
      //   })
      // },
      // Mark the orders as deleted
      function(refunds, done) {
        Order.update({deleted: true, payStatus: 'REFUNDED'}, {
          where: {
            userId: req.user.id,
            id: orderIds
          }
        }).then(function(orders) {
          if(refunds.length) {
            var ret = req.orders.map((order)=> _.pick(order, retAttributes));
            res.jsonp({orders: ret, message: "Orders markerd as deleted"});
          } else {
            return res.status(402).send({
              message: 'Orders marked as deleted but no associated payment intents'
            });   
          }
          done(null);
        }).catch(function(err) {
          console.log(err);
          done(err);
        });
      }
    ],
    function(err) {
      if(err) {
        console.log(err);
        return res.status(404).send({
          message: 'Broke something'
        });
      }
    });
};


// exports.forgot = function(req, res, next) {
//   async.waterfall([
//     // Send the email
    // function(token, user, done) {
    //   res.render(path.resolve('modules/users/server/templates/password-recovery'), {
    //     name: user.displayName,
    //     emailAddress: config.mailer.email,
    //     url: url + '?passwordToken=' + token
    //   }, function(err, emailHTML) {
    //     done(err, emailHTML, user);
    //   });
    // },
//     // If valid email, send reset email using service
    // function(emailHTML, user, done) {
    //   var mailOptions = {
    //     to: user.email,
    //     from: config.mailer.from,
    //     subject: 'Password Reset',
    //     html: emailHTML,
    //     attachments: [{
    //       filename: 'nourished_logo.png',
    //       path: path.resolve('./modules/users/server/images/nourished_logo.png'),
    //       cid: 'nourishedlogo' //same cid value as in the html img src
    //     }]
    //   };
    //   smtpTransport.sendMail(mailOptions, function(err) {
    //     if (!err) {
    //       res.send({
    //         message: 'An email has been sent to the provided email with further instructions.'
    //       });
    //     } else {
    //       return res.status(400).send({
    //         message: 'Failure sending email'
    //       });
    //     }
    //     done(err);
    //   });
//     }
//   ], function(err) {
//     if (err) {
//       return next(err);
//     }
//   });
// };


var formatDate = function(query) {
  if (query.startDate && query.endDate) return{[Op.gte]: query.startDate, [Op.lte] : query.endDate};
  if (query.startDate) return {[Op.gte] : query.startDate};
  if (query.endDate) return {[Op.lte] : query.endDate};
};

/**
 * List of Orders
 */
exports.userList = function(req, res) {
  var query = {userId: req.user.id};
  if(req.query.menuId) query.menuId = req.query.menuId;
  if(req.query.hospitalId) query.hospitalId = req.query.hospitalId;
  if(req.query.groupId) query.groupId = req.query.groupId;
  if(req.query.startDate || req.query.endDate) query.date = formatDate(req.query);
  // if(req.query.userStatus) query.userStatus = req.query.userStatus;
  // if(req.query.restStatus) query.restStatus = req.query.restStatus;
  // if(req.query.payStatus) query.payStatus = req.query.payStatus;
  // if(req.query.quantity) query.quantity = req.query.quantity;

  Order.findAll({
    where: query,
    attributes: retAttributes,
    include: {
      model: db.menu,
      attributes: menuRetAttributes,
      include: [{
        model: db.meal,
        attributes: mealRetAttributes,        
        include: {
          model: db.mealinfo,
          attributes: mealinfoRetAttributes
        }
      }, {
        model: db.timeslot,
        attributes: timeslotRetAttributes,
        include: [{
          model: db.restaurant,
          attributes: restRetAttributes
        }, {
          model: db.hospital,
          attributes: hospRetAttributes
        }]
      }]
    }
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
 * List of restaurant orders
 */
exports.restList = function(req, res) {
  var orderQuery = {};
  if(req.query.menuId) orderQuery.menuId = req.query.menuId;
  if(req.query.startDate || req.query.endDate) orderQuery.date = formatDate(req.query);
  // if(req.query.userStatus) orderQuery.userStatus = req.query.userStatus;
  // if(req.query.restStatus) orderQuery.restStatus = req.query.restStatus;
  // if(req.query.payStatus) orderQuery.payStatus = req.query.payStatus;

  var menuQuery = {userId: req.user.id};
  if(req.query.mealId) menuQuery.mealId = req.query.mealId;

  Order.findAll({
    where: orderQuery,
    attributes: retAttributes,
    include: {
      model: db.menu,
      where: menuQuery,
      attributes: menuRetAttributes,
      include: [{
        model: db.meal,
        attributes: mealRetAttributes,        
        include: {
          model: db.mealinfo,
          attributes: mealinfoRetAttributes
        }
      }, {
        model: db.timeslot,
        attributes: timeslotRetAttributes,
        include: [{
          model: db.restaurant,
          attributes: restRetAttributes
        }, {
          model: db.hospital,
          attributes: hospRetAttributes
        }]
      }]
    }
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
};

/**
 * List of restaurant orders itemized
 */
exports.restListItemized = function(req, res) {
  var orderQuery = {};
  if(req.query.menuId) orderQuery.menuId = req.query.menuId;
  if(req.query.startDate || req.query.endDate) orderQuery.date = formatDate(req.query);

  var menuQuery = {userId: req.user.id};
  if(req.query.mealId) menuQuery.mealId = req.query.mealId;

  Order.findAll({
    where: orderQuery,
    attributes: retAttributes,
    include: {
      model: db.menu,
      where: menuQuery,
      attributes: menuRetAttributes,
      include: [{
        model: db.meal,
        attributes: mealRetAttributes,        
        include: {
          model: db.mealinfo,
          attributes: mealinfoRetAttributes
        }
      }, {
        model: db.timeslot,
        attributes: timeslotRetAttributes,
        include: [{
          model: db.restaurant,
          attributes: restRetAttributes
        }, {
          model: db.hospital,
          attributes: hospRetAttributes
        }]
      }]
    }
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
};

/**
 * Order middleware
 */
exports.orderByID = function(req, res, next, id) {

  Order.findOne({
    where: {
      id: id
    },
    include: {model: db.menu, include: [{model: db.meal, include: db.mealinfo}, {model: db.timeslot, include: db.restaurant}]}
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