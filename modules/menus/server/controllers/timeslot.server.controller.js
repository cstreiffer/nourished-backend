'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  config = require(path.resolve('./config/config')),
  fs = require('fs'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  TimeSlot = db.timeslot;

const retAttributes = ['id', 'date', 'restaurantId'];
const restRetAttributes = ['id', 'name', 'email', 'phoneNumber', 'streetAddress', 'zip', 'city', 'state'];

/**
 * List of restaurant menus
 */
exports.userList = function(req, res) {
  var query = {userId: req.user.id};

  TimeSlot.findAll({
    where: query,
    attributes: retAttributes,
    include: {
      model: db.restaurant,
      attributes: restRetAttributes
    }
  }).then(function(timeslots) {
    if (!timeslots) {
      return res.status(404).send({
        message: 'No timeslots found for user'
      });
    } else {
      res.jsonp({timeslots: timeslots, message: "Timeslots successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};