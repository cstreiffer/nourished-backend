'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  mealsPolicy = require('../policies/meals.server.policy'),
  meals = require('../controllers/meals.server.controller');


/** 
 * RULES
 * 1. Only meal users are allowed to create new meal.
 * 2. Only creators of meal are allowed to update/delete meal.
 * 3. Provider users should be able to see all meals. 
 * 5. Providers should be able to get individual meal. 
**/

module.exports = function(app) {

  // Articles collection routes
  app.route('/api/meals')
    .all(passport.authenticate('jwt', {session: false}))
    .all(mealsPolicy.isAllowed)
    .get(meals.list); // (Good)

  // Single meal routes
  app.route('/api/meals/:mealId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(mealsPolicy.isAllowed)
    .get(meals.read); // (Good)
    // .put(meals.update); // Admin update
    // .delete(meals.delete); // Admin delete

  // Restaurant 
  app.route('/api/restaurants/:restaurantId/meals')
    .all(passport.authenticate('jwt', {session: false}))
    .all(mealsPolicy.isAllowed)
    .get(meals.restaurantMealList) // Restaurant/User get (Good)
    .post(meals.create); // Restaurant create (Good)

  // Restaurant 
  app.route('/api/restaurants/:restaurantId/meals/:mealId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(mealsPolicy.isAllowed)
    .put(meals.update) // Restaurant update (Good)
    .delete(meals.delete); // Restaurant delete (Good)

  // Restaurant profile picture update
  app.route('/api/restaurants/:restaurantId/meals/:mealId/picture')
    .all(passport.authenticate('jwt', {session: false}))
    .all(mealsPolicy.isAllowed)
    .post(meals.changeMealPicture); // Restaurant update (Untested)

  // Finish by binding the meal middleware
  app.param('mealId', meals.mealByID);

};