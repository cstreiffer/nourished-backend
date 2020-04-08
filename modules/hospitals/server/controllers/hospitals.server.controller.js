'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  uuid = require('uuid/v4'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Hospital = db.hospital;

/**
 * Create a hospital
 */
exports.create = function(req, res) {
  delete req.body.id;
  req.body.id = uuid();

  Hospital.create(req.body).then(function(hospital) {
    if (!hospital) {
      return res.send('/', {
        errors: 'Could not create the hospital'
      });
    } else {
      return res.jsonp({hospital: hospital, message: "Hospital successfully created"});
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Show the current hospital
 */
exports.read = function(req, res) {
  res.jsonp({hospital: req.hospital, message: "Hospital successfully found"});
};

/**
 * Update a hospital
 */
exports.update = function(req, res) {
  var hospital = req.hospital;
  hospital.update({
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    streetAddress: req.body.streetAddress,
    zip: req.body.zip,
    city: req.body.city,
    state: req.body.state,
    dropoffLocation: req.body.dropoffLocation,
    dropoffInfo: req.body.dropoffInfo
  }).then(function(hospital) {
    res.jsonp({hospital: hospital, message: "Hospital successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete an hospital
 */
exports.delete = function(req, res) {
  var hospital = req.hospital;

  // Find the hospital
  Hospital.findOne({
    where: {
      id: hospital.id
    }
  }).then(function(hospital) {
    if (hospital) {

      // Delete the hospital
      hospital.destroy().then(function() {
        return res.jsonp({hospital: hospital, message: "Hospital successfully deleted"});
      }).catch(function(err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      });

    } else {
      return res.status(400).send({
        message: 'Unable to find the hospital'
      });
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * List of Hospitals
 */
exports.list = function(req, res) {
  var query = {};
  if(req.query.city) query.city = req.query.city;
  if(req.query.state) query.state = req.query.state;
  if(req.query.zip) query.zip = req.query.zip;
  if(req.query.name) query.name = req.query.name;
  if(req.query.streetAddress) query.streetAddress = req.query.streetAddress;
  
  Hospital.findAll({
    where: query
  }).then(function(hospitals) {
    if (!hospitals) {
      return res.status(404).send({
        message: 'No hospitals found'
      });
    } else {
      res.jsonp({hospitals: hospitals, message: "Hospitals successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * Hospital middleware
 */
exports.hospitalByID = function(req, res, next, id) {

  // if ((id % 1 === 0) === false) { //check if it's integer
  //   return res.status(404).send({
  //     message: 'Hospital is invalid'
  //   });
  // }

  Hospital.findOne({
    where: {
      id: id
    }
  }).then(function(hospital) {
    if (!hospital) {
      return res.status(404).send({
        message: 'No hospital with that identifier has been found'
      });
    } else {
      req.hospital = hospital;
      next();
    }
  }).catch(function(err) {
    return next(err);
  });

};