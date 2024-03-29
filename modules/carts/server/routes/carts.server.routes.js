'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  cartsPolicy = require('../policies/carts.server.policy'),
  carts = require('../controllers/carts.server.controller');

module.exports = function(app) {

  // Restaurant 
  app.route('/api/user/carts')
    .all(passport.authenticate('jwt', {session: false}))
    .all(cartsPolicy.isAllowed)
    .get(carts.userList) // Restaurant/User get (Good)
    .delete(carts.destroy) // Testing
    .all(cartsPolicy.isCartUpdateAllowed)
    .post(carts.create); // Restaurant create (Good)

  // Restaurant 
  app.route('/api/user/carts/increment')
    .all(passport.authenticate('jwt', {session: false}))
    .all(cartsPolicy.isAllowed)
    .all(cartsPolicy.isCartUpdateAllowed)
    .post(carts.increment);

   app.route('/api/user/carts/decrement')
    .all(passport.authenticate('jwt', {session: false}))
    .all(cartsPolicy.isAllowed)
    .post(carts.decrement);  

  // Restaurant 
  app.route('/api/user/carts/:cartId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(cartsPolicy.isAllowed)
    .delete(carts.delete) // Restaurant delete (Good)
    .get(carts.read)
    .put(carts.update); // Restaurant update (Good)

  // Finish by binding the cart middleware
  app.param('cartId', carts.cartByID);

};