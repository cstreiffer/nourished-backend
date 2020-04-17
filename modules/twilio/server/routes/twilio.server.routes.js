'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  passport = require('passport'),
  express = require('express'),
  twilioPolicy = require('../policies/twilio.server.policy'),
  twilio = require('../controllers/twilio.server.controller');

module.exports = function(app) {

  // TWILIO MODEL ROUTES -------------------------------------
  app.route('/api/all/twilio')
    .all(passport.authenticate('jwt', {session: false}))
    .all(twilioPolicy.isAllowed)
    .get(twilio.userList)// Good
    .post(twilio.create); // Good

  // Single twilio routes
  app.route('/api/all/twilio/:twilioId')
    .all(passport.authenticate('jwt', {session: false}))
    .all(twilioPolicy.isAllowed)
    .get(twilio.read) // Good
    .put(twilio.update); // Good

  app.param('twilioId', twilio.twilioByID);

  // TWILIO WEBHOOK ROUTES ---------------------------------- 

  app.route('/api/twilio/webhook')
    .post(twilio.webhook); // Goods  

};