'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  restAlias = require(path.resolve('./util/useralias')),
  menusPolicy = require('../policies/menus.server.policy'),
  menus = require('../controllers/menus.server.controller'),
  timeslot = require('../controllers/timeslot.server.controller');

module.exports = function(app) {

  // ADMiN

  app.route('/api/timeslots')
    .get(timeslot.list) // Restaurant/User get (Good)

  app.route('/api/timeslots/index')
    .get(timeslot.listIndex) // Restaurant/User get (Good)
    
  app.route('/api/timeslots')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .post(timeslot.create) // Restaurant/User get (Good)

  app.route('/api/timeslots/:timeslotId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(menusPolicy.isAllowed)
    .delete(timeslot.delete) // Restaurant/User get (Good)

  // Finish by binding the menu middleware
  app.param('timeslotId', timeslot.timeslotById);


  // Restaurant 
  app.route('/api/menus')
    .get(menus.list) // Restaurant/User get (Good)

  app.route('/api/rest/timeslots')
    .all(passport.authenticate('jwt', {session: false}))
    .all(restAlias.findAlias)
    .get(timeslot.userList) // Restaurant/User get (Good)

  // Restaurant 
  app.route('/api/rest/menus')
    .all(passport.authenticate('jwt', {session: false}))
    .all(restAlias.findAlias)
    .all(menusPolicy.isAllowed)
    .get(menus.userList) // Restaurant/User get (Good)
    .all(menusPolicy.isValidMeal)
    .all(menusPolicy.isValidTimeSlot)
    .post(menus.create); // Restaurant create (Good)

  // Restaurant 
  app.route('/api/rest/menus/:menuId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(restAlias.findAlias)
    .all(menusPolicy.isAllowed)
    .get(menus.read)
    .put(menus.update) // Restaurant update (Good)
    // .all(menusPolicy.isFinalized)
    .delete(menus.delete) // Restaurant delete (Good)
    

  // Finish by binding the menu middleware
  app.param('menuId', menus.menuByID);

};