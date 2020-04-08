'use strict';

/**
 * Module dependencies.
 */
var
  path = require('path'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user;

module.exports = function() {

  // Use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'email',    
      passwordField: 'password'
    },
    function(username, password, done) {
      User.findOne({
        where: {
          email: username
        }
      }).then(function(user) {
        if (!user) {
          return done('Invalid username or password', null, null);
        }
        if (!user || !user.authenticate(password)) {
          return done('Invalid username or password', null, null);
        }
        return done(null, user, null);
      }).catch(function(err) {
        return done(err, null, null);
      });
    }
  ));
};