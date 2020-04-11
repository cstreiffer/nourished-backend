'use strict';

/**
 * Module dependencies.
 */
var 
  path = require('path'),
  config = require(path.resolve('./config/config')),
  fs = require('fs'),
  passport = require('passport'),
  JWTStrategy = require("passport-jwt").Strategy,
  ExtractJWT = require("passport-jwt").ExtractJwt,
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user;

const jwtSecret = fs.readFileSync(path.resolve(config.jwt.privateKey), 'utf8');
// const jwtSecret = "fs.readFileSync(path.resolve(config.jwt.privateKey), 'utf8');";

module.exports = function() {
    // console.log("Atleast checking that we made it this far!!");
    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : jwtSecret,
        algorithms: config.jwt.verifyOptions.algorithm,
        jsonWebTokenOptions : config.jwt.verifyOptions
    },
      function (jwtPayload, cb) {
        return User.findOne({
          where: {
            id: jwtPayload.id
          }
        }).then(user => {
          return cb(null, user);
        })
        .catch(err => {
          return cb(err);
        });
      }
    ));
};