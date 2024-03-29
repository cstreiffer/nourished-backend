'use strict';

/**
 * Module dependencies.
 */
var
  _ = require('lodash'), 
  path = require('path'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  nodemailer = require('nodemailer'),
  fs = require('fs'),
  jwt = require('jsonwebtoken'),
  async = require('async'),
  crypto = require('crypto'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user,
  owasp = require('owasp-password-strength-test');

owasp.config(config.shared.owasp);
const {Op} = require('sequelize');

const jwtSecret = fs.readFileSync(path.resolve(config.jwt.privateKey), 'utf8');
const retAttributes = ['id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber', 'roles'];
var smtpTransport = nodemailer.createTransport(config.mailer.options);
var url = config.app.webURL;

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function(req, res, next) {
  async.waterfall([
    // Generate random token
    function(done) {
      crypto.randomBytes(20, function(err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by email
    function(token, done) {
      if (req.body.email) {
        User.findOne({
          where: {
            email: req.body.email.toLowerCase()
          }
        }).then(function(user) {
          if (!user) {
            return res.status(400).send({
              message: 'No account with that email has been found'
            });
          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            user.save().then(function(saved) {
              return done(null, token, saved);
            }).catch(function(error) {
              return res.status(400).send({
                message: 'Error occured'
              });
            });
          }
        }).catch(function(err) {
          return res.status(400).send({
            message: 'Email field must not be blank'
          });
        });
      } else {
        return res.status(400).send({
          message: 'Email field must not be blank'
        });
      }
    },
    function(token, user, done) {
      res.render(path.resolve('modules/users/server/templates/password-recovery'), {
        name: user.displayName,
        emailAddress: config.mailer.email,
        url: url + '?passwordToken=' + token
      }, function(err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function(emailHTML, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: 'Password Reset',
        html: emailHTML,
        attachments: [{
          filename: 'nourished_logo.png',
          path: path.resolve('./modules/users/server/images/nourished_logo.png'),
          cid: 'nourishedlogo' //same cid value as in the html img src
        }]
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if (!err) {
          res.send({
            message: 'An email has been sent to the provided email with further instructions.'
          });
        } else {
          return res.status(400).send({
            message: 'Failure sending email'
          });
        }
        done(err);
      });
    }
  ], function(err) {
    if (err) {
      return next(err);
    }
  });
};

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgotTest = function(req, res, next) {
  async.waterfall([
    // Generate random token
    function(done) {
      crypto.randomBytes(20, function(err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by email
    function(token, done) {
      if (req.body.email) {
        User.findOne({
          where: {
            email: req.body.email.toLowerCase()
          }
        }).then(function(user) {
          if (!user) {
            return res.status(400).send({
              message: 'No account with that email has been found'
            });
          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + config.user.tokenExpiry; // 1 hour

            user.save().then(function(saved) {
              return res.json({user: saved, message: "Token generated"});
            }).catch(function(error) {
              return res.status(400).send({
                message: 'Error occured'
              });
            });
          }
        }).catch(function(err) {
          return res.status(400).send({
            message: 'Email field must not be blank'
          });
        });
      } else {
        return res.status(400).send({
          message: 'Email field must not be blank'
        });
      }
    }
  ]);
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function(req, res) {
  User.findOne({
    where: {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: {
        [Op.gt]: Date.now()
      }
    }
  }).then(function(user) {
    if (!user) {
      return res.status(400).send({
        message: 'Password reset token is invalid or has expired.'
      });
    }
    res.json({message: "Valid reset token"});
  });
};
/**
 * Reset password POST from email token
 */
exports.reset = function(req, res, next) {
  // Init Variables
  var passwordDetails = req.body;
  var message = null;

  async.waterfall([

      function(done) {
        User.findOne({
          where: {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
              [Op.gt]: Date.now()
            }
          }
        }).then(function(user) {
          if (user) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              var result = owasp.test(passwordDetails.newPassword);
              if (!result.errors.length) { 
                user.salt = user.makeSalt();
                user.hashedPassword = user.encryptPassword(passwordDetails.newPassword, user.salt);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save().then(function(saved) {
                  if (!saved) {
                    return res.status(400).send({
                      message: 'Unable to save the reset the password'
                    });
                  } else {
                    done(null, user);
                    // req.login(user, function(err) {
                    //   if (err) {
                    //     res.status(400).send(err);
                    //   } else {
                    //     // Remove sensitive data before return authenticated user
                    //     user.hashedPassword = undefined;
                    //     user.salt = undefined;
                    //     done(err, user);
                    //   }
                    // });
                  }
                }).catch(function(err) {
                  res.status(400).send(err);
                });
              } else {
                return res.status(400).send({
                  message: 'Password not strong enough'
                });                
              }
            } else {
              return res.status(400).send({
                message: 'Passwords do not match'
              });
            }
          } else {
            return res.status(400).send({
              message: 'Password reset token is invalid or has expired.'
            });
          }
        });
      },
      function(user, done) {
        res.render(path.resolve('modules/users/server/templates/password-reset-confirm'), {
          appName: config.app.title,
          emailAddress: config.mailer.email
        }, function(err, emailHTML) {
          done(err, emailHTML, user);
        });
      },
      // If valid email, send reset email using service
      function(emailHTML, user, done) {
        var mailOptions = {
          to: user.email,
          from: config.mailer.from,
          subject: 'Your password has been changed',
          html: emailHTML,
          attachments: [{
            filename: 'nourished_logo.png',
            path: path.resolve('./modules/users/server/images/nourished_logo.png'),
            cid: 'nourishedlogo' //same cid value as in the html img src
          }]
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          if (!err) {
            var ret = _.pick(user || {}, retAttributes)
            var token = jwt.sign(user.toJSON(), jwtSecret, config.jwt.signOptions);
            res.jsonp({user: ret, token: token, message: "Password successfully reset"});
            done(null);
          } else {
            return res.status(400).send({
              message: 'Failure sending email'
            });
            done(err);
          }
        });
      }
    ],
    function(err) {
      if (err) {
        return next(err);
      }
    });
};

/**
 * Change Password
 */
exports.changePassword = function(req, res, next) {
  // Init Variables
  var passwordDetails = req.body;
  var message = null;

  if (req.user) {
    if (passwordDetails.newPassword) {
      User.findOne({where: {id: req.user.id}}).then(function(user) {
        if (user) {
          if (user.authenticate(passwordDetails.currentPassword)) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              user.password = passwordDetails.newPassword;

              var result = owasp.test(passwordDetails.newPassword);
              if (!result.errors.length) { 
                user.salt = user.makeSalt();
                user.hashedPassword = user.encryptPassword(passwordDetails.newPassword, user.salt);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save().then(function(user) {
                  if (!user) {
                    return res.status(400).send({
                      message: "Password not updated"
                    });
                  } else {
                      var ret = _.pick(user || {}, retAttributes)
                      var token = jwt.sign(user.toJSON(), jwtSecret, config.jwt.signOptions);
                      res.jsonp({user: ret, token: token, message: "Password changed successfully"});
                    // req.login(user, function(err) {
                    //   if (err) {
                    //     res.status(400).send(err);
                    //   } else {

                    //   }
                    // });
                  }
                }).catch(function(err) {
                  res.status(400).send({
                    message: err
                  });   
                });
              } else {
                return res.status(400).send({
                  message: 'Password not strong enough'
                });   
              }
            } else {
              res.status(400).send({
                message: 'Passwords do not match'
              });
            }
          } else {
            res.status(400).send({
              message: 'Current password is incorrect'
            });
          }
        } else {
          res.status(400).send({
            message: 'User is not found'
          });
        }
      }).catch(function(err) {
          res.status(400).send({
            message: err
          });
      });
    } else {
      res.status(400).send({
        message: 'Please provide a new password'
      });
    }
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};