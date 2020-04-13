'use strict';

/**
 * Module dependencies.
 */
var 
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  MealInfo = db.mealinfo;

const {Op} = require('sequelize');

// Define return
const retAttributes = ['id', 'type', 'price', 'time', 'notes', 'other'];

/**
 * List of restaurant meals
 */
exports.list = function(req, res) {
  MealInfo.findAll({where:{}, attributes: retAttributes})
    .then(function(mealinfo) {
    if (!mealinfo) {
      return res.status(404).send({
        message: 'No meal information found'
      });
    } else {
      res.jsonp({mealinfo: mealinfo, message: "Meal information successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

