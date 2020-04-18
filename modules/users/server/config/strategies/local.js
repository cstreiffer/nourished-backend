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

const {Op} = require('sequelize');

module.exports = function() {

  // Use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'id',    
      passwordField: 'password'
    },
    function(username, password, done) {
      var condition = { 
          [Op.or]: [ 
            {username: {[Op.eq]: username}},
            {email: {[Op.like]: username.toLowerCase()}},
            {phoneNumber: {[Op.eq]: username.replace(/-|\(|\)| /g, '')}}
          ]
        };
      User.findOne({
        where: condition
      }).then(function(user) {
        if (!user || !user.authenticate(password)) {
          return done('Invalid username or password', null, null);
        } else {
          return done(null, user, null);
        }
      }).catch(function(err) {
        return done(err, null, null);
      });
    }
  ));
};