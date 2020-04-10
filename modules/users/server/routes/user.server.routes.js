'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
  // User Routes
  var user = require('../controllers/user.server.controller');

  // Setting up the users profile api
  app.route('/api/user/me')
    .all(passport.authenticate('jwt', {session: false}))
    .get(user.me); // (Good)
 
  app.route('/api/user')
    .all(passport.authenticate('jwt', {session: false}))
    .get(user.getProfile) // (Good)
    .put(user.update); // (Good)
  
  // app.route('/api/user/accounts').delete(user.requiresLogin, user.removeOAuthProvider);
  app.route('/api/user/password')
    .all(passport.authenticate('jwt', {session: false}))
    .post(user.changePassword);

  // Finish by binding the user middleware
  app.param('userId', user.userByID);
};
