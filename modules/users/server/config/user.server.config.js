'use strict';

/**
 * Module dependencies.
 */
var
  path = require('path'),
  passport = require('passport'),
  uuid = require('uuid/v4'),
  config = require(path.resolve('./config/config')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user;

/**
 * Module init function.
 */
module.exports = function(app, db) {

  // Serialize sessions
  passport.serializeUser(function(user, done) {
    // var userData = {
    //   id: user.id,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   email: user.email,
    //   phoneNumber: user.phoneNumber
    // };
    done(null, user);
  });

  // Deserialize sessions
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  // Initialize strategies
  config.utils.getGlobbedPaths(path.join(__dirname, './strategies/**/*.js')).forEach(function(strategy) {
    require(path.resolve(strategy))(config);
  });

  // Add passport's middleware
  app.use(passport.initialize());
  // app.use(passport.session());

  // Seed the user

  if(config.admin) {
      var user = User.build({
        id: uuid(),
        username: config.admin.username,
        roles: ['admin', 'user', 'restaurant']
      });
      user.salt = user.makeSalt();
      user.hashedPassword = user.encryptPassword(config.admin.password, user.salt);
      user.email = config.admin.email.toLowerCase();
      user.phoneNumber = config.admin.phoneNumber.replace(/-|\(|\)| /g, '');
      return user.save()
        .then((user) => console.log("Seeded admin user"))
        .catch((err) => console.log("User exists: " + err));
  }
};