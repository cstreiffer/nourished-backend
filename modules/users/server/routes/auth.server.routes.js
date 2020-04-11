'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
  // User Routes
  var users = require('../controllers/user.server.controller');

  // Setting up the users password api
  app.route('/api/auth/forgot').post(users.forgot); // (Good)
  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
    app.route('/api/auth/forgot/test').post(users.forgotTest); // (Good)
  }
  app.route('/api/auth/reset/:token').get(users.validateResetToken); // (Good)
  app.route('/api/auth/reset/:token').post(users.reset); // (Good)

  // Setting up the users authentication api
  app.route('/api/auth/signup').post(users.signup); // (Good)
  app.route('/api/auth/signin').post(users.signin); // (Good)
  app.route('/api/auth/signout').get(users.signout); // (Good)

};