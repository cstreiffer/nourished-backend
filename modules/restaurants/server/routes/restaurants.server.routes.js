'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  restaurantsPolicy = require('../policies/restaurants.server.policy'),
  restaurants = require('../controllers/restaurants.server.controller');


/** 
 * RULES
 * 1. Only restaurant users are allowed to create new restaurants.
 * 2. Only creators of restaurant are allowed to update/delete restaurant.
 * 3. Many-to-many relationship allowed between users and restaurants?
 * 4. Provider users should be able to see all restaurants. 
 * 5. Providers should be able to get individual restaurant. 
**/


module.exports = function(app) {

  // Articles collection routes
  app.route('/api/restaurants')
    .all(passport.authenticate('jwt', {session: false}))
    .all(restaurantsPolicy.isAllowed)
    .get(restaurants.list) // Good
    .post(restaurants.create); // Good

  // Single restaurant routes
  app.route('/api/restaurants/:restaurantId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(restaurantsPolicy.isAllowed)
    .get(restaurants.read) // Good
    .put(restaurants.update) // Good
    .delete(restaurants.delete); // Good

  // User 
  app.route('/api/user/restaurants')
    .all(passport.authenticate('jwt', {session: false}))
    .all(restaurantsPolicy.isAllowed)
    .get(restaurants.userRestaurantList); // Good

  // Finish by binding the restaurant middleware
  app.param('restaurantId', restaurants.restaurantByID);

};