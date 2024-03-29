'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  async = require('async'),
  twilio = require(path.resolve('./config/lib/twilio')),
  config = require(path.resolve('./config/config')),
  fs = require('fs'),
  jwt = require('jsonwebtoken'),
  request = require('request'),
  async = require('async'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  passport = require('passport'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user,
  TwilioMessage = db.twiliomessage,
  TwilioUser = db.twiliouser,
  owasp = require('owasp-password-strength-test');

owasp.config(config.shared.owasp);

const jwtSecret = fs.readFileSync(path.resolve(config.jwt.privateKey), 'utf8');
const retAttributes = ['id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber', 'roles'];
const {Op} = require('sequelize');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

// Send a text message to the user
var sendMessage = function(tm, user) {
  var url = config.app.webURL;
  var to = '+1' + user.phoneNumber;
  var from = config.twilio.phoneNumber;
  return twilio.messages
    .create({
       body: tm.messageBody,
       from: from,
       to: to
     });
};

/**
 * Signup
 */
exports.signup = function(req, res) {
  // Check request is properly formatted
  if ((req.body.email) && req.body.phoneNumber) {
    // Format the model
    delete req.body.roles;
    delete req.body.id;
    if (!req.body.username) req.body.username = req.body.email;
    
    var result = owasp.test(req.body.password);
    if (!result.errors.length) {
      // Let's build the user!
      req.body.id = uuid();
      req.body.email = req.body.email.toLowerCase();
      req.body.phoneNumber = req.body.phoneNumber.replace(/-|\(|\)| /g, '');
     
      // Build the user
      var user = User.build(req.body);
      user.salt = user.makeSalt();
      user.hashedPassword = user.encryptPassword(req.body.password, user.salt);

      // Set the roles
      if (req.body.account_type === "provider") user.roles = ["user"];
      else if (req.body.account_type === "restaurant") user.roles = ["restaurant"];
      else if (req.body.account_type === "restaurant_subaccount") user.roles = ["restaurant", "alias"];
      else user.roles = ["user"];

      // Let's save the model!
      async.waterfall(
        [
          function(done) {
            user.save()
              .then(function(user) {
                user.password = undefined;
                user.salt = undefined;
                done(null, user);
              })
              .catch(function(err) {
                done(err);
              });
          },
          function(users, done) {
            TwilioUser.create({
              id: uuid(),
              userId: user.id,
              status: 'ACTIVE'
            })
            .then(function(tu) {
              done(null, user)
            })
            .catch(function(err) {
              console.log(err)
              done(null, user)
            })
          },
          // Send the user a text
          function(user, done) {
            var queryText = 'SIGNUP_NOTIFY_USER';
            if (user.roles.includes('user')) queryText = 'SIGNUP_NOTIFY_USER'
            else if (user.roles.includes('restaurant')) queryText = 'SIGNUP_NOTIFY_REST';
            if(process.env.NODE_ENV !== 'test' && user.roles.includes('user')) {
              TwilioMessage.findOne({
                where: {
                  subtype: queryText,
                }
              })
              .then(function(tm) {
                // Send the message to the user
                sendMessage(tm, user)
                  .then(function() {
                    done(null, user);
                  })
                  .catch(function(err) {
                    // res.json({user: ret, token: token, message: "User successfully created"});
                    console.log(err);
                    done(null, user);
                  });
              })
              .catch(function(err) {
                done(null, user);
              });
            } else {
              done(null, user);
            }
          },
          function(user, done) {
            var ret = _.pick(user || {}, retAttributes)
            var token = jwt.sign(user.toJSON(), jwtSecret, config.jwt.signOptions);
            res.json({user: ret, token: token, message: "User successfully created"});
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
      res.status(400).send({
        message: "Password not strong enough"
      });        
    }
  } else {
    res.status(400).send({
      message: "Please include email and phone number"
    });   
  }
};

/**
 * Magic Link authentication
 */
exports.validateLoginToken = function(req, res) {
  User.findOne({
    where: {
      magicLinkToken: req.params.token,
      magicLinkExpires: {
        [Op.gt]: Date.now()
      }
    }
  }).then(function(user) {
    if (!user) {
      return res.status(400).send({
        message: 'Password reset token is invalid or has expired.'
      });
    }
    var ret = _.pick(user || {}, retAttributes)
    var token = jwt.sign(user.toJSON(), jwtSecret, config.jwt.signOptions);
    res.json({user: ret, token: token, message: "User successfully logged-in"});
  });
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
  passport.authenticate('local', {session: false}, function(err, user, info) {
    if (err || !user) {
      res.status(400).send({
        message: err
      });
    } else {
      // Remove sensitive data before login
      user.hashedPassword = undefined;
      user.salt = undefined;
      var ret = _.pick(user || {}, retAttributes);
      if (ret.roles.includes('alias')) {
        ret.roles = ret.roles.filter(r => r !== 'alias');
      }
      var token = jwt.sign(user.toJSON(), jwtSecret, config.jwt.signOptions);
      res.json({user: ret, token: token, message: "User successfully logged-in"});
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
  // req.logout();
  res.redirect('/');
};

// // NOT USING FROM HERE ON DOWNWARD --------------------------------------------
// /**
//  * OAuth provider call
//  */
// exports.oauthCall = function(strategy, scope) {
//   return function(req, res, next) {
//     // Set redirection path on session.
//     // Do not redirect to a signin or signup page
//     if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
//       req.session.redirect_to = req.query.redirect_to;
//     }
//     // Authenticate
//     passport.authenticate(strategy, scope)(req, res, next);
//   };
// };

// /**
//  * OAuth callback
//  */
// exports.oauthCallback = function(strategy) {
//   return function(req, res, next) {
//     // Pop redirect URL from session
//     var sessionRedirectURL = req.session.redirect_to;
//     delete req.session.redirect_to;

//     passport.authenticate(strategy, function(err, user, redirectURL) {
//       if (err) {
//         return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
//       }
//       if (!user) {
//         return res.redirect('/authentication/signin');
//       }
//       req.login(user, function(err) {
//         if (err) {
//           return res.redirect('/authentication/signin');
//         }

//         return res.redirect(redirectURL || sessionRedirectURL || '/');
//       });
//     })(req, res, next);
//   };
// };



// /**
//  * Helper function to save or update a OAuth user profile
//  */
// exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
//   if (!req.user) {

//     //check if the email exists, add the provider data to it and login
//     User.find({
//       where: {
//         email: providerUserProfile.email
//       }
//     }).then(function(user) {

//       if (user) {

//         // Add the provider data to the additional provider data field
//         if (!user.additionalProvidersData) {
//           user.additionalProvidersData = {};
//         }

//         user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

//         // Notify sequelize for update
//         user.set('additionalProvidersData', user.additionalProvidersData);

//         // And save the user
//         user.save().then(function() {
//           req.login(user, function(err) {
//             if (err)
//               return done(new Error(err), user);
//             return done(false, user);
//           });
//         }).catch(function(err) {
//           return done(new Error(err));
//         });

//       } else {

//         // Define a search query fields
//         var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;

//         // Define main provider search query
//         var mainProviderSearchQuery = {};
//         mainProviderSearchQuery.provider = providerUserProfile.provider;
//         mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

//         // Define additional provider search query
//         var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

//         var additionalProviderSearchQuery = {};
//         additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

//         User.find({
//           where: {
//             $or: [mainProviderSearchQuery, additionalProviderSearchQuery],
//           }
//         }).then(function(user) {
//           //The user already have the providerIdentifierField
//           if (user) {

//             //Update their info
//             async.series([
//                 function(callback) {
//                   if (providerUserProfile.profileImageURL) {
//                     //Get the image from url and download it as temp image
//                     var tmpImage = Date.now();
//                     request
//                       .get(providerUserProfile.profileImageURL)
//                       .on('response', function(response) {

//                         if (response.statusCode === 200) {
//                           //Get the image ext
//                           var content_type = response.headers['content-type'];
//                           var imgExt = content_type.split("/")[1];

//                           var imageName = Date.now() + '.' + imgExt;
//                           callback(null, tmpImage, imageName);
//                         }

//                       })
//                       .on('error', function(err) {
//                         console.log('Unable to download user image', err);
//                       })
//                       .pipe(fs.createWriteStream('./public/uploads/users/profile/' + tmpImage));
//                   } else {
//                     callback(null, null);
//                   }
//                 }

//               ],
//               function(err, results) {

//                 if (results) {
//                   //Rename the temp image
//                   fs.renameSync('./public/uploads/users/profile/' + results[0][0], './public/uploads/users/profile/' + results[0][1], function(err) {
//                     if (err) return done(false, err);
//                   });

//                   //Remove the old image
//                   if (user.profileImageURL) {
//                     try {
//                       var stats = fs.lstatSync('./public/uploads/users/profile/' + user.profileImageURL);
//                       if (stats.isFile()) {
//                         fs.unlinkSync('./public/uploads/users/profile/' + user.profileImageURL);
//                       }
//                     } catch (e) {
//                       console.log('Unable to delete the old image', e);
//                     }
//                   }

//                   user.profileImageURL = results[0][1];
//                 }

//                 user.firstName = providerUserProfile.firstName;
//                 user.lastName = providerUserProfile.lastName;
//                 user.displayName = providerUserProfile.displayName;

//                 user.provider = providerUserProfile.provider;
//                 user.providerData = providerUserProfile.providerData;

//                 user.save().then(function() {
//                   //Login the user
//                   req.login(user, function(err) {
//                     if (err)
//                       return done(new Error(err), user);
//                     return done(false, user);
//                   });

//                 }).catch(function(err) {
//                   return done(false, err);
//                 });

//               });

//           } else {
//             //New user
//             var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

//             User.findUniqueUsername(possibleUsername, null, function(availableUsername) {

//               var newUser = {};

//               async.series([
//                   function(callback) {
//                     if (providerUserProfile.profileImageURL) {
//                       //Get the image from url and download it as temp image
//                       var tmpImage = Date.now();
//                       request
//                         .get(providerUserProfile.profileImageURL)
//                         .on('response', function(response) {

//                           if (response.statusCode === 200) {
//                             //Get the image ext
//                             var content_type = response.headers['content-type'];
//                             var imgExt = content_type.split("/")[1];

//                             var imageName = Date.now() + '.' + imgExt;
//                             callback(null, tmpImage, imageName);
//                           }

//                         })
//                         .on('error', function(err) {
//                           console.log('Unable to download user image', err);
//                         })
//                         .pipe(fs.createWriteStream('./public/uploads/users/profile/' + tmpImage));
//                     } else {
//                       callback(null, null);
//                     }
//                   }

//                 ],
//                 function(err, results) {

//                   if (results) {
//                     //Rename the tmp image
//                     fs.renameSync('./public/uploads/users/profile/' + results[0][0], './public/uploads/users/profile/' + results[0][1], function(err) {
//                       if (err) return done(false, err);
//                     });

//                     newUser.profileImageURL = results[0][1];
//                   }

//                   newUser.firstName = providerUserProfile.firstName;
//                   newUser.lastName = providerUserProfile.lastName;
//                   newUser.username = availableUsername;
//                   newUser.displayName = providerUserProfile.displayName;
//                   newUser.email = providerUserProfile.email;
//                   newUser.provider = providerUserProfile.provider;
//                   newUser.providerData = providerUserProfile.providerData;

//                   //Create the user
//                   User.create(newUser).then(function(user) {
//                     if (!user) {
//                       return done(false, user);
//                     } else {
//                       //Login the user
//                       req.login(user, function(err) {
//                         if (err)
//                           return done(new Error(err), user);
//                         return done(false, user);
//                       });
//                     }
//                   }).catch(function(err) {
//                     return done(false, err);
//                   });

//                 });

//             });

//           }
//         }).catch(function(err) {
//           return done(false, err);
//         });

//       }

//     });
//   } else {
//     // User is already logged in, join the provider data to the existing user
//     var user = req.user;

//     // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
//     if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
//       // Add the provider data to the additional provider data field
//       if (!user.additionalProvidersData) {
//         user.additionalProvidersData = {};
//       }

//       user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

//       // Notify sequelize for update
//       user.set('additionalProvidersData', user.additionalProvidersData);

//       // And save the user
//       user.save().then(function(saved) {
//         return done((!saved) ? true : false, user, '/settings/accounts');
//       }).catch(function(error) {
//         return done(new Error(error), user);
//       });

//     } else {
//       return done(new Error('User is already connected using this provider'), user);
//     }
//   }
// };

// /**
//  * Remove OAuth provider
//  */
// exports.removeOAuthProvider = function(req, res, next) {
//   var user = req.user;
//   var provider = req.query.provider;

//   if (!user) {
//     return res.status(401).json({
//       message: 'User is not authenticated'
//     });
//   } else if (!provider) {
//     return res.status(400).send();
//   }

//   // Delete the additional provider
//   if (user.additionalProvidersData[provider]) {
//     delete user.additionalProvidersData[provider];

//     // Notify sequelize for update
//     user.set('additionalProvidersData', user.additionalProvidersData);
//   }

//   user.save().then(function(user) {
//     req.login(user, function(err) {
//       if (err) {
//         return res.status(400).send({
//           message: errorHandler.getErrorMessage(err)
//         });
//       } else {
//         return res.json(user);
//       }
//     });
//   }).catch(function(err) {
//     return res.status(400).send({
//       message: errorHandler.getErrorMessage(err)
//     });
//   });
// };

// var getFileExt = function(fileName) {
//   var fileExt = fileName.split(".");
//   if (fileExt.length === 1 || (fileExt[0] === "" && fileExt.length === 2)) {
//     return "";
//   }
//   return fileExt.pop();
// };
