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
  Menu = db.menu;

const {Op} = require('sequelize');
const retAttributes = ['id', 'date', 'restaurantId'];
const restRetAttributes = ['id', 'name', 'email', 'phoneNumber', 'streetAddress', 'zip', 'city', 'state'];

/**
 * Create a menu
 */
exports.create = function(req, res) {
  delete req.body.id;
  req.body.id = uuid();
  req.body.userId = req.user.id;
  
  if( !req.body.restaurantId) {
      return res.status(400).send({
        message: "Please include restaurant id"
      });
  } else {
    req.body.restaurantId = req.restaurant.id;
    Menu.create(req.body).then(function(menu) {
      if (!menu) {
        return res.send('/', {
          errors: 'Could not create the menu'
        });
      } else {
        var ret = _.pick(menu, retAttributes);
        res.jsonp({menu: ret, message: "Menu successfully created"});
      }
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  }
};

/**
 * Show the current menu
 */
exports.read = function(req, res) {
  var ret = _.pick(req.menu, retAttributes);
  res.jsonp({menu: ret, message: "Menu successfully found"});
};

/**
 * Update a menu
 */
exports.update = function(req, res) {
  delete req.body.id;
  delete req.body.userId;
  delete req.body.restaurantId;
  var menu = req.menu;

  menu.update({
    date: req.body.date
  }).then(function(menu) {
    var ret = _.pick(menu, retAttributes);
    res.jsonp({menu: ret, message: "Menu successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete a menu
 */
exports.delete = function(req, res) {
  var menu = req.menu;

  // Delete the menu
  menu.destroy().then(function() {
    var ret = _.pick(menu, retAttributes);
    return res.jsonp({menu: ret, message: "Menu successfully deleted"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

var formatDate = function(query) {
  if (query.startDate && query.endDate) return{[Op.gte]: query.startDate, [Op.lte] : query.endDate};
  if (query.startDate) return {[Op.gte] : query.startDate};
  if (query.endDate) return {[Op.lte] : query.endDate};
};

/**
 * List of restaurant menus
 */
exports.list = function(req, res) {
  var query = {};
  if(req.query.restaurantId) query.restaurantId = req.query.restaurantId;
  if(req.query.startDate || req.query.endDate) query.date = formatDate(req.query);

  Menu.findAll({
    where: query,
    attributes: retAttributes,
    include: [{
      model: db.restaurant,
      attributes: restRetAttributes
    }]
  }).then(function(menus) {
    if (!menus) {
      return res.status(404).send({
        message: 'No menus found for restaurant'
      });
    } else {
      res.jsonp({menus: menus, message: "Menus successfully found"});
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
  if(req.query.restaurantId) query.restaurantId = req.query.restaurantId;
  if(req.query.startDate || req.query.endDate) query.date = formatDate(req.query);

  Menu.findAll({
    where: query,
    attributes: retAttributes,
    // include: [db.restaurant]
  }).then(function(menus) {
    if (!menus) {
      return res.status(404).send({
        message: 'No menus found for restaurant'
      });
    } else {
      res.jsonp({menus: menus, message: "Menus successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * Menu middleware
 */
exports.menuByID = function(req, res, next, id) {

  Menu.findOne({
    where: {
      id: id
    }, 
    include: [db.restaurant]
  }).then(function(menu) {
    if (!menu) {
      return res.status(404).send({
        message: 'No menu with that identifier has been found'
      });
    } else {
      req.menu = menu;
      return next();
    }
  }).catch(function(err) {
    return next(err);
  });

};