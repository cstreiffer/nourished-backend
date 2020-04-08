'use strict';

var
  path = require('path'),
  config = require(path.resolve('./config/config')),
  acl = require('acl');

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
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/meals',
      permissions: []
    }, {
      resources: '/api/meals/:mealId',
      permissions: []
    }, {
      resources: '/api/restaurants/:restaurantId/meals',
      permissions: []
    }, {
      resources: '/api/restaurants/:restaurantId/meals/:mealId',
      permissions: []
    }]
  }, {
    roles: ['restaurant'],
    allows: [{
      resources: '/api/meals',
      permissions: ['get']
    }, {
      resources: '/api/meals/:mealId',
      permissions: ['get']
    }, {
      resources: '/api/restaurants/:restaurantId/meals',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/meals',
      permissions: ['get']
    }, {
      resources: '/api/meals/:mealId',
      permissions: ['get']
    }, {
      resources: '/api/restaurants/:restaurantId/meals',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Meal Policy Allows 
 */
exports.isAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If meal is being processed and the current user created it then allow any manipulation
  // Need to make sure user owns the restaurant and restaurant owns the meal
  if (req.user && req.restaurant && (req.user.id === req.restaurant.userId)) {
    if (!req.meal || (req.meal && (req.meal.restaurantId === req.restaurant.id))) {
      return next();
    }
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
