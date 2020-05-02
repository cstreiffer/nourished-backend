'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  ordersPolicy = require('../policies/orders.server.policy'),
  orders = require('../controllers/orders.server.controller');


/** 
 * RULES
 * 1. Only order users are allowed to create new order.
 * 2. Only creators of order are allowed to update/delete order.
 * 3. Provider users should be able to see all orders. 
 * 5. Providers should be able to get individual order. 
**/

module.exports = function(app) {

  // USER ROUTES --------------------------------------------
  // Articles collection routes
  // app.route('/api/user/orders')
  //   .all(passport.authenticate('jwt', {session: false}))
  //   .all(ordersPolicy.isUserAllowed)
    
  app.route('/api/user/orders')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isUserAllowed)
    .get(orders.userList)
    .all(ordersPolicy.isCreateOrderAllowed)
    .all(ordersPolicy.isFormatAllowed)
    .post(orders.create);

  app.route('/api/user/orders/delete')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isUserAllowed)
    .all(ordersPolicy.isUserOrderAllowed)
    .all(ordersPolicy.isUpdateOrderAllowed)
    .put(orders.delete);

  app.route('/api/user/orders/status')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isUserAllowed)
    .put(orders.userStatusUpdate);

  // RESTAURANT ROUTES --------------------------------------
  app.route('/api/rest/orders')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isUserAllowed)
    .get(orders.restList); // User only get orders

  app.route('/api/rest/orders/itemized')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isUserAllowed)
    .get(orders.restListItemized); // User only get orders

  // Single order routes
  app.route('/api/rest/orders/status')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isUserAllowed)
    .put(orders.restStatusUpdate);

  // Finish by binding the order middleware
  app.param('orderId', orders.orderByID);

};