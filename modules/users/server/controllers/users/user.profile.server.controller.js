'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  fs = require('fs'),
  jwt = require('jsonwebtoken'),
  async = require('async'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user;

const {Op} = require('sequelize');
const jwtSecret = fs.readFileSync(path.resolve(config.jwt.privateKey), 'utf8');
const retAttributes = ['id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber', 'roles'];

exports.update = function(req, res, next) {
  var userInfo = req.body;
  var username = userInfo.username ? userInfo.username : null;
  var email = userInfo.email ? userInfo.email.toLowerCase() : null;
  var phoneNumber = userInfo.phoneNumber ? userInfo.phoneNumber.replace(/-|\(|\)| /g, '') : null;

  delete req.body.roles;
  if (userInfo) {

    async.waterfall([
      function(done) {
        if (username && username !== req.user.username) {
          User.findOne({
            where: {
              username: username,
              id: {
                [Op.ne]: req.user.id
              }
            }
          }).then(function(user) {
            if (user && user.username === username) {
              return res.status(400).send({
                message: 'Username already exists'
              });
            }
            done(null);
          }).catch(function(err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });
        } else {
          done(null);
        }
      },
      function(done) {
        if (email && email !== req.user.email.toLowerCase()) {
          User.findOne({
            where: {
              email: {
                [Op.iLike]: email
              },
              id: {
                [Op.ne]: req.user.id
              }
            }
          }).then(function(user) {
            if (user && user.email.toLowerCase() === email) {
              return res.status(400).send({
                message: 'Email already exists'
              });
            }
            done(null);
          }).catch(function(err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });
        } else {
          done(null);
        }
      },
      function(done) {
        if (phoneNumber && phoneNumber !== req.user.phoneNumber.replace(/-|\(|\)| /g, '')) {
          User.findOne({
            where: {
              phoneNumber: phoneNumber,
              id: {
                [Op.ne]: req.user.id
              }
            }
          }).then(function(user) {
            if (user && user.phoneNumber.replace(/-|\(|\)| /g, '') === phoneNumber) {
              return res.status(400).send({
                message: 'Phone number already exists'
              });
            }
            done(null);
          }).catch(function(err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });
        } else {
          done(null);
        }
      },
      function(done) {
        User.findOne({
          where: {
            id: req.user.id
          }
        }).then(function(user) {

          if (userInfo.firstName) user.firstName = userInfo.firstName;
          if (userInfo.lastName) user.lastName = userInfo.lastName;
          if (phoneNumber) user.phoneNumber = phoneNumber
          if (email) user.email = email;
          if (username) user.username = username;
          // if (userInfo.hospitalId) user.hospitalId = userInfo.hospitalId;
          user.updatedAt = Date.now();

          user.save().then(function(user) {
            if (!user) {
              return res.status(400).send({
                message: 'Unable to update'
              });
            } else {
              var token = jwt.sign(user.toJSON(), jwtSecret, config.jwt.signOptions);
              var ret = _.pick(user || {}, retAttributes)
              res.json({user: ret, token: token, message: "User successfully updated"});
            }
          }).catch(function(err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          });
        });
        done(null);
      }
    ],
    function(err) {
      if(err) {
        res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
    });
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

exports.list = function(req, res) {
  User.findAll({
    where: {}
  }).then(function(users) {
    res.json({users: users, message: "Users successfully found"});
  }).catch(function(err) {
    res.status(400).send(err);
  });
};

exports.getProfile = function(req, res) {
  User.findOne({
    attributes: retAttributes,
    where: {
      id: req.user.id
    }
  }).then(function(user) {
    if(!user) {
      return res.status(404).send({
        message: 'Could not find the user'
      });
    } else {
      if user.roles.includes('alias') {
        user.roles = ret.roles.filter(r => r !== 'alias');
      }
      res.json({user: user, message: "User successfully found"});
    }
  }).catch(function(err) {
    res.status(400).send(err);
  });
};


/**
 * Send User
 */
exports.me = function(req, res) {
  var ret = _.pick(req.user || {}, retAttributes)
  if ret.roles.includes('alias') {
    ret.roles = ret.roles.filter(r => r !== 'alias');
  }
  res.json({user: ret});
};
