'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  async = require('async'),
  config = require(path.resolve('./config/config')),
  MessagingResponse = require('twilio').twiml.MessagingResponse,
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  TwilioUser = db.twiliouser,
  TwilioMessage = db.twiliomessage,
  User = db.user,
  crypto = require('crypto');

// Define return
// id | status | userId 
const retAttributes = ['id', 'status'];

/**
 * Create a twilio user
 */
exports.create = function(req, res) {
  delete req.body.id;
  req.body.id = uuid();

  req.body.userId = req.user.id;

  TwilioUser.create(req.body).then(function(twiliouser) {
    if (!twiliouser) {
      return res.status(400).send({
        message: "Could not create the twilio user"
      });
    } else {
      var ret = _.pick(twiliouser, retAttributes);
      return res.jsonp({twiliouser: twiliouser, message: "Restaurant successfully created"});
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Show the current twilio
 */
exports.read = function(req, res) {
  var ret = _.pick(req.twiliouser, retAttributes);
  res.json({twilio: twilio, message: "TwilioUser entries successfully found"});
};

/**
 * List of TwilioUsers
 */
exports.userList = function(req, res) {
  var query = {userId: req.user.id};
  TwilioUser.findOne({
    where: query,
    attributes: retAttributes
  }).then(function(twiliouser) {
    if (!twiliouser) {
      return res.status(404).send({
        message: 'No twilio entries found'
      });
    } else {
      res.json({twiliouser: twiliouser, message: "TwilioUser entries successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * Update a twilio user
 */
exports.update = function(req, res) {
  delete req.body.id;
  delete req.body.userId;
  var twiliouser = req.twiliouser;

  twiliouser.update({
    statuss: req.body.name,
  }).then(function(twiliouser) {
    var ret = _.pick(twiliouser, retAttributes);
    return res.jsonp({twiliouser: twiliouser, message: "TwilioUser successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * TwilioUser middleware
 */
exports.twilioByID = function(req, res, next, id) {

  TwilioUser.findOne({
    where: {
      id: id
    }
  }).then(function(twiliouser) {
    if (!twiliouser) {
      return res.status(404).send({
        message: 'No twilio with that identifier has been found'
      });
    } else {
      req.twiliouser = twiliouser;
      return next();
    }
  }).catch(function(err) {
    return next(err);
  });
};

/**
 * Update a twilio user
 */
exports.webhook = function(req, res) {
  const twiml = new MessagingResponse();
  TwilioMessage.findAll({where: {type: 'INCOMING'}})
    .then(function(twiliomessages) {
      // Load the response options
      var tms = twiliomessages.reduce(function(map, obj) {
          map[obj.keyword] = obj;
          return map;
      }, {});
      if(req.body.Body in tms) {
        var tm = tms[req.body.Body];
        // Build the URL
        if(tm.urlDest) {
          var url = config.app.webURL + tm.urlDest;
          User.findOne({
            where: {
              phoneNumber: req.body.From.substring(2)
            }
          }).then(function(user) {
            if(tm.token) {
              user.resetPasswordToken = crypto.randomBytes(20).toString('hex');;
              user.resetPasswordExpires = Date.now() + 3600000*3; // 3 hours
              user.save()
                .then(function(user) {
                  var url = config.app.webURL + '?token=' + user.resetPasswordToken;
                  twiml.message(tm.messageBody + url);
                  res.writeHead(200, {'Content-Type': 'text/xml'});
                  res.end(twiml.toString());   
                }).catch(function(err) {
                  res.status(400).send({message: "ERROR"});
                });

            } else {
              twiml.message(tm.messageBody + url);
              res.writeHead(200, {'Content-Type': 'text/xml'});
              res.end(twiml.toString());   
            }
          }).catch(function(err) {
            res.status(400).send({message: "ERROR: " + err});
          });
        } else {
          twiml.message(tm.messageBody);
          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(twiml.toString());   
        }
    } else {
      twiml.message(tms['DEFAULT'].messageBody);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  }).catch(function(err) {
    res.status(400).send({message: "ERROR: " + err});
  });
};
