'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  menusPolicy = require('../policies/menus.server.policy'),
  menus = require('../controllers/menus.server.controller');

module.exports = function(app) {

  // Restaurant 
  app.route('/api/restaurants/:restaurantId/menus')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .get(menus.list) // Restaurant/User get (Good)
    .post(menus.create); // Restaurant create (Good)

  // Restaurant 
  app.route('/api/restaurants/:restaurantId/menus/:menuId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .put(menus.update) // Restaurant update (Good)
    .delete(menus.delete) // Restaurant delete (Good)
    .get(menus.read);

  // Finish by binding the menu middleware
  app.param('menuId', menus.menuByID);

};