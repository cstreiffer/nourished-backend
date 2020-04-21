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
  if(req.body.mealId) {
    Meal.findOne({
      where: {
        id: req.body.mealId,
        userId: req.user.id
      }
    }).then((meal) => {
      if(meal) {
        if(meal.finalized) {
          req.meal = meal;
          return next();
        } else {
          return res.status(400).json({
            message: 'Meal not finalized'
          });
        }
      } else {
        return res.status(400).json({
          message: 'Meal not found'
        });
      }
    }).catch((err) => {
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
  if(req.body.timeslotId) {
    TimeSlot.findOne({
      where: {
        id: req.body.timeslotId,
        userId: req.user.id
      }
    }).then((timeslot) => {
      if(timeslot) {
        req.timeslot = timeslot;
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
