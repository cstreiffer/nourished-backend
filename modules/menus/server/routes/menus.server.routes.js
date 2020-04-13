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
  app.route('/api/menus')
    .get(menus.list) // Restaurant/User get (Good)

  // Restaurant 
  app.route('/api/rest/menus')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .get(menus.userList) // Restaurant/User get (Good)
    .all(menusPolicy.isValidRestaurant)
    .post(menus.create); // Restaurant create (Good)

  // Restaurant 
  app.route('/api/rest/menus/:menuId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .delete(menus.delete) // Restaurant delete (Good)
    .get(menus.read)
    .all(menusPolicy.isValidRestaurant)
    .put(menus.update); // Restaurant update (Good)

  // Finish by binding the menu middleware
  app.param('menuId', menus.menuByID);

};