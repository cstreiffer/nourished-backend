'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  menusPolicy = require('../policies/menus.server.policy'),
  menus = require('../controllers/menus.server.controller');


/** 
 * RULES
 * 1. Only menu users are allowed to create new menu.
 * 2. Only creators of menu are allowed to update/delete menu.
 * 3. Provider users should be able to see all menus. 
 * 5. Providers should be able to get individual menu. 
**/

module.exports = function(app) {

  // Articles collection routes
  app.route('/api/menus')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .get(menus.list); // (Good)

  // Single menu routes
  app.route('/api/menus/:menuId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .get(menus.read); // (Good)
    // .put(menus.update); // Admin update
    // .delete(menus.delete); // Admin delete

  // Restaurant 
  app.route('/api/restaurants/:restaurantId/menus')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .get(menus.restaurantMenuList) // Restaurant/User get (Good)
    .post(menus.create); // Restaurant create (Good)

  // Restaurant 
  app.route('/api/restaurants/:restaurantId/menus/:menuId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .put(menus.update) // Restaurant update (Good)
    .delete(menus.delete); // Restaurant delete (Good)

  // Restaurant profile picture update
  app.route('/api/restaurants/:restaurantId/menus/:menuId/picture')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .post(menus.changeMenuPicture); // Restaurant update (Untested)

  // Finish by binding the menu middleware
  app.param('menuId', menus.menuByID);

};