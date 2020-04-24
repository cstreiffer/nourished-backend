'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  async = require('async'),
  uuid = require('uuid/v4'),
  config = require(path.resolve('./config/config')),
  fs = require('fs'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Restaurant = db.restaurant,
  Hospital = db.hospital,
  TimeSlot = db.timeslot;

const retAttributes = ['id', 'date', 'restaurantId', 'hospitalId'];
const restRetAttributes = ['id', 'name', 'email', 'phoneNumber', 'streetAddress', 'zip', 'city', 'state'];
const hospRetAttributes = ['name', 'phoneNumber', 'email'];


/**
 * Create a timeslot given Restaurant Name, Hospital Name, Date
 */
exports.create = function(req, res) {
  async.waterfall([
      function(done) {
        Restaurant.findOne({
          where: {
            name: req.body.restaurantName
          }
        }).then(function(restaurant) {
          done(null, restaurant);
        }).catch(function(err) {
          done(err);
        });
      },
      function(restaurant, done) {
        Hospital.findOne({
          where: {
            name: req.body.hospitalName
          }
        }).then(function(hospital) {
          done(null, restaurant, hospital);
        }).catch(function(err) {
          console.log(err);
          done(err);
        })
      },
      function(restaurant, hospital, done) {
        if(restaurant && hospital) {
          console.log(restaurant.toJSON(), hospital.toJSON());
          // Check to see if it exists
          TimeSlot.findOne({
            where: {
              userId: restaurant.userId,
              hospitalId: hospital.id,
              date: req.body.date,
              restaurantId: restaurant.id  
            }
          }).then(function(timeslot) {
            if(!timeslot) {
              TimeSlot.create({
                userId: restaurant.userId,
                hospitalId: hospital.id,
                date: req.body.date,
                restaurantId: restaurant.id,
                id: uuid()
              }).then(function(timeslot) {
                res.status(200).send({timeslot: timeslot, message: "Created the timeslot"});
              }).catch(function(err) {
                done(err);
              })
            } else {
              res.status(400).send({message: "Timeslot already exists"});
            }
          }).catch(function(err) {
            done(err);
          })
        } else {
          res.status(400).send({message: "Could not create the timeslot. Could not find hospital/restaurant"});
        }
      }
    ],
    function(err) {
      if(err) {
        console.log(err);
        res.status(400).send({message: "Could not create the timeslot: " + errorHandler.getErrorMessage(err)});
      }
  });
}

exports.delete = function(req, res) {
  var timeslot = req.timeslot;
  timeslot.destroy()
    .then(function(timeslot) {
      res.status(200).send({timeslot: timeslot, message: "Deleted the timeslot"});
    }).catch(function(err) {
      res.status(400).send({message: "Timeslot not deleted"});
    })
}

/**
 * List of restaurant menus
 */
exports.list = function(req, res) {
  TimeSlot.findAll({
    attributes: retAttributes,
    include: [{
      model: db.restaurant,
      attributes: restRetAttributes
    },
    {
      model: db.hospital,
      attributes: hospRetAttributes
    }]
  }).then(function(timeslots) {
    if (!timeslots) {
      return res.status(404).send({
        message: 'No timeslots found'
      });
    } else {
      res.jsonp({timeslots: timeslots, message: "Timeslots successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};


var removeDups = function(vals) {
  let unique = {};
  vals.forEach(function(i) {
    if(!unique[i.date]) {
      unique[i.date] = i;
    }
  });
  return Object.keys(unique).map((key) => unique[key]);
}

/**
 * List of restaurant menus
 */
exports.listIndex = function(req, res) {
  TimeSlot.findAll({
    attributes: ['id', 'date']
  }).then(function(timeslots) {
    if (!timeslots) {
      return res.status(404).send({
        message: 'No timeslots found'
      });
    } else {
      res.jsonp({timeslots: removeDups(timeslots), message: "Timeslots successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};


/**
 * List of restaurant menus
 */
exports.userList = function(req, res) {
  var query = {userId: req.user.id};

  TimeSlot.findAll({
    where: query,
    attributes: retAttributes,
    include: [{
      model: db.restaurant,
      attributes: restRetAttributes
    },
    {
      model: db.hospital,
      attributes: hospRetAttributes
    }]
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

/**
 * Menu middleware
 */
exports.timeslotById = function(req, res, next, id) {
  console.log(id);

  TimeSlot.findOne({
    where: {
      id: id
    },
  }).then(function(timeslot) {
    if (!timeslot) {
      return res.status(404).send({
        message: 'No timeslot with that identifier has been found'
      });
    } else {
      req.timeslot = timeslot;
      return next();
    }
  }).catch(function(err) {
    return next(err);
  });
};