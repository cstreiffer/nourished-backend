'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  menusPolicy = require('../policies/menus.server.policy'),
  menus = require('../controllers/menus.server.controller'),
  timeslot = require('../controllers/timeslot.server.controller');

module.exports = function(app) {

  // Restaurant 
  app.route('/api/menus')
    .get(menus.list) // Restaurant/User get (Good)

  app.route('/api/user/timeslots')
    .all(passport.authenticate('jwt', {session: false}))
    .get(timeslot.userList) // Restaurant/User get (Good)

  // Restaurant 
  app.route('/api/rest/menus')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .get(menus.userList) // Restaurant/User get (Good)
    .all(menusPolicy.isValidMeal)
    .all(menusPolicy.isValidTimeSlot)
    .post(menus.create); // Restaurant create (Good)

  // Restaurant 
  app.route('/api/rest/menus/:menuId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .get(menus.read)
    .all(menusPolicy.isFinalized)
    .delete(menus.delete) // Restaurant delete (Good)
    .put(menus.update); // Restaurant update (Good)

  // Finish by binding the menu middleware
  app.param('menuId', menus.menuByID);

};