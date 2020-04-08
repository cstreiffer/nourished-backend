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

  // Articles collection routes
  app.route('/api/orders')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isUserAllowed)
    .all(ordersPolicy.isTimeAllowed)
    .post(orders.create);

  // Single order routes
  app.route('/api/orders/:orderId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isUserAllowed)
    .get(orders.read) // User
    .all(ordersPolicy.isTimeAllowed)
    .put(orders.update) // User 
    .delete(orders.delete); // User delete

  // User orders 
  app.route('/api/user/orders')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isUserAllowed)
    .get(orders.userOrderList); // User only get orders

  // // Restaurant Orders
  // app.route('/api/restaurants/:restaurantId/orders/')
  //   .all(ordersPolicy.isAllowed)
  //   .get(orders.restaurantOrderList); // Restaurant/admin only

  // Restaurant Menu Orders
  app.route('/api/restaurants/:restaurantId/orders/')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isRestaurantAllowed)
    .get(orders.restaurantOrderList); // Restaurant/admin

  // Restaurant Menu Orders
  app.route('/api/restaurants/:restaurantId/orders/:orderId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(ordersPolicy.isRestaurantAllowed)
    .put(orders.restaurantUpdate); // Restaurant update of order

  // Finish by binding the order middleware
  app.param('orderId', orders.orderByID);

};