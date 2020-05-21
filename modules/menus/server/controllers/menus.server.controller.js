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
  Menu = db.menu,
  TimeSlot = db.timeslot;

const {Op} = require('sequelize');
const retAttributes = ['id', 'timeslotId', 'price', 'visible', 'finalized', 'mealName', 'allergens', 'dietaryRestrictions', 'mealDescription', 'imageURL', 'mealinfoId'];
const restRetAttributes = ['id', 'name', 'description', 'email', 'phoneNumber', 'streetAddress', 'zip', 'city', 'state'];
const mealinfoRetAttributes = ['id', 'type', 'price'];
const timeslotRetAttributes = ['id', 'date', 'restaurantId', 'hospitalId'];
const hospRetAttributes = ['id', 'name', 'phoneNumber', 'email'];
/**
 * Create a menu
 */
exports.create = function(req, res) {

  var mealLookup = req.meals.reduce(function(acc, cur) {
    acc[cur.id] = cur;
    return acc;
  }, {});

  var timeslotLookup = req.timeslots.reduce(function(acc, cur) {
    acc[cur.id] = cur;
    return acc;
  }, {});


  let newMenus = [];
  req.body.menus.forEach(menu => {
    // Create the menu
    var meal = mealLookup[menu.mealId];
    var timeslot = timeslotLookup[menu.timeslotId];

    newMenus.push({
      id: uuid(),
      userId: req.user.id,
      mealName: meal.name,
      mealDescription : meal.description,
      allergens : meal.allergens,
      dietaryRestrictions : meal.dietaryRestrictions,
      price : meal.price || meal.mealinfo.price,
      timeslotId: timeslot.id,
      finalized: req.body.finalized,
    });
  });

  Menu.destroy({
    where: {
      timeslotId: req.body.menus.map(menu => menu.timeslotId)
    }
  })
  .then(function() {
        // Create the menu
    Menu.bulkCreate(newMenus, {validate: true, returning: true}).then(function(menus) {
      if (!menus) {
        return res.status(404).send({
          message: "Could not create the menu items"
        });
      } else {
        var ret = menus.map(menu => {
          var timeslot = timeslotLookup[menu.timeslotId];
          var ret = _.pick(menu, retAttributes);
          ret.timeslot = _.pick(timeslot, timeslotRetAttributes);
          return ret;
          // return {
          //   menu: _.pick(menu, retAttributes),
          //   timeslot: _.pick(timeslot, timeslotRetAttributes),
          // }
        });
        res.jsonp({menus: ret, message: "Menu items successfully created"});
      }
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  })
  .catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
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
  delete req.body.mealinfoId;
  delete req.body.timeslotId;

  var menu = req.menu;

  menu.update(req.body).then(function(menu) {
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
 * Check cutoff time of menu
 */
var isTimeValid = function(date) {
  var time = new Date(new Date().getTime() + config.orderTimeCutoff);
  return time >= new Date(date);
};

/**
 * List of restaurant menus
 */
exports.list = function(req, res) {
  var query = {finalized: true, visible: true};
  // if(req.query.restaurantId) query.restaurantId = req.query.restaurantId;
  // if(req.query.startDate || req.query.endDate) query.date = formatDate(req.query);
  var timeslotQuery = {date: {
    [Op.gte]: Date.now()
  }};

  Menu.findAll({
    where: query,
    attributes: retAttributes,
    include: [{
      model: db.mealinfo,
      attributes: mealinfoRetAttributes
    }, {
      model: db.timeslot,
      where: timeslotQuery,
      attributes: timeslotRetAttributes,
      include: [{
        model: db.restaurant,
        attributes: restRetAttributes
      },
      {
        model: db.hospital,
        attributes: hospRetAttributes,
      }]
    }]
  }).then(function(menus) {
    if (!menus) {
      return res.status(404).send({
        message: 'No menus found for restaurant'
      });
    } else {

      // Map the menus
      var menusRet = menus.map((menu) => {
        var ret = menu.toJSON();
        ret.expired = isTimeValid(menu.timeslot.date);
        return ret;
      });

      res.jsonp({menus: menusRet, message: "Menus successfully found"});
    }
  }).catch(function(err) {
    console.log(err);
    res.jsonp(err);
  });
};

/**
 * List of restaurant menus
 */
exports.userList = function(req, res) {
  var query = {userId: req.user.id};
  var timeslotQuery = {};

  // if(req.query.startDate || req.query.endDate) timeslotQuery.date = formatDate(req.query);
  // if(req.query.restaurantId) timeslotQuery.restaurantId = req.query.restaurantId;

  Menu.findAll({
    where: query,
    attributes: retAttributes,
    include: [{
      model: db.mealinfo,
      attributes: mealinfoRetAttributes
    }, {
      model: db.timeslot,
      where: timeslotQuery,
      attributes: timeslotRetAttributes,
      include: [{
        model: db.restaurant,
        attributes: restRetAttributes
      },
      {
        model: db.hospital,
        attributes: hospRetAttributes,
      }]
    }]
  }).then(function(menus) {
    if (!menus) {
      return res.status(404).send({
        message: 'No menus found for restaurant'
      });
    } else {

      // Map the menus
      var menusRet = menus.map((menu) => {
        var ret = menu.toJSON();
        ret.expired = isTimeValid(menu.timeslot.date);
        return ret;
      });
      
      res.jsonp({menus: menusRet, message: "Menus successfully found"});
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
    include: db.mealinfo
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
