'use strict';

var
  path = require('path'),
  config = require(path.resolve('./config/config')),
  acl = require('acl'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Restaurant = db.restaurant,
  Meal = db.meal,
  TimeSlot = db.timeslot;

/**
 * Module dependencies.
 */

// Using the redis backend
/*
var redisInstance = require('redis').createClient(config.redis.port, config.redis.host, {
  no_ready_check: true
});

//Use redis database 1
redisInstance.select(1);

if (config.redis.password) {
  redisInstance.auth(config.redis.password);
}

acl = new acl(new acl.redisBackend(redisInstance, 'acl'));
*/

// Using the memory backend
acl = new acl(new acl.memoryBackend());


/**
 * Invoke Articles Permissions
 */
exports.invokeRolesPolicies = function() {
  acl.allow([
  {
    roles: ['admin'],
    allows: [{
      resources: '/api/timeslots',
      permissions: ['post']
    }]
  },
  {
    roles: ['admin'],
    allows: [{
      resources: '/api/timeslots/:timeslotId',
      permissions: ['delete']
    }]
  },
  {
    roles: ['restaurant'],
    allows: [{
      resources: '/api/rest/menus',
      permissions: ['post', 'get']
    }, {
      resources: '/api/rest/menus/:menuId',
      permissions: []
    }]
  }
  ]);
};

/**
 * Check if Restaurant belongs to User
 */
exports.isValidMeal = function(req, res, next) {
  var mealIds = req.body.menus.map((menu) => menu.mealId);
  if(mealIds.length) {
    Meal.findAll({
      where: {
        id: mealIds,
        userId: req.user.id
      }
    }).then((meals) => {
      var validMealIds = new Set(meals.map(meal => meal.id));
      if(mealIds.every(id => validMealIds.has(id))) {
        req.meals = meals;
        return next();
      } else {
        return res.status(400).json({
          message: 'Meal not found'
        });
      }
    }).catch((err) => {
      console.log(err);
        return res.status(403).json({
          message: 'Unexpected authorization error'
        });
    });
  } else {
    return res.status(400).json({
      message: 'Please specify meal'
    });
  }
}

/**
 * Check if Restaurant belongs to User
 */
exports.isValidTimeSlot = function(req, res, next) {
  var timeslotIds = req.body.menus.map((menu) => menu.timeslotId);
  if(timeslotIds.length) {
    TimeSlot.findAll({
      where: {
        id: timeslotIds,
        userId: req.user.id
      }
    }).then((timeslots) => {
      var validTimeslotIds = new Set(timeslots.map(timeslot => timeslot.id));
      if(timeslotIds.every(id => validTimeslotIds.has(id))) {
        req.timeslots = timeslots;
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }).catch((err) => {
        return res.status(403).json({
          message: 'User is not authorized'
        });
    });
  } else {
    return res.status(403).json({
      message: 'User is not authorized'
    });
  }
}

/**
 * Check if Restaurant belongs to User
 */
exports.isFinalized = function(req, res, next) {
  if(req.menu && !req.menu.finalized) {
    return next()
  } else {
    return res.status(403).json({
      message: 'User is not authorized'
    });
  }
}

/**
 * Check If Meal Policy Allows 
 */
exports.isAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If meal is being processed and the current user created it then allow any manipulation
  // Need to make sure user owns the restaurant and restaurant owns the meal
  if (req.user && req.menu && (req.user.id === req.menu.userId)) {
      return next();
  } else {
    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
      if (err) {
        // An authorization error occurred.
        return res.status(500).send('Unexpected authorization error');
      } else {
        if (isAllowed) {
          // Access granted! Invoke next middleware
          return next();
        } else {
          return res.status(403).json({
            message: 'User is not authorized'
          });
        }
      }
    });
  }
};
