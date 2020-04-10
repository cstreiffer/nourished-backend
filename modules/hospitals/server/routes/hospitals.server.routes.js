'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  hospitalsPolicy = require('../policies/hospitals.server.policy'),
  hospitals = require('../controllers/hospitals.server.controller');

/** 
 * RULES
 * 1. Only admin users are allowed to create new hopsital.
 * 2. Only admins are allowed to update/delete menu.
 * 3. Provider/Restaurant users should be able to see all menus. 
 * 4. Provider/Restaurant users should be able to get individual menu. 
**/


module.exports = function(app) {

  // Articles collection routes
  app.route('/api/hospitals')
    // .all(passport.authenticate('jwt', {session: false}))
    // .all(hospitalsPolicy.isAllowed)
    .get(hospitals.list);
    // .post(hospitals.create);

  // Single hospital routes
  app.route('/api/hospitals/:hospitalId')
    // .all(passport.authenticate('jwt', {session: false}))
    // .all(hospitalsPolicy.isAllowed)
    .get(hospitals.read);
    // .put(hospitals.update)
    // .delete(hospitals.delete);

  // Finish by binding the hospital middleware
  app.param('hospitalId', hospitals.hospitalByID);

};