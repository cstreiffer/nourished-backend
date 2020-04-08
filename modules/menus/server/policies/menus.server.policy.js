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
      resources: '/api/menus',
      permissions: []
    }, {
      resources: '/api/menus/:menuId',
      permissions: []
    }, {
      resources: '/api/restaurants/:restaurantId/menus',
      permissions: []
    }, {
      resources: '/api/restaurants/:restaurantId/menus/:menuId',
      permissions: []
    }]
  }, {
    roles: ['restaurant'],
    allows: [{
      resources: '/api/menus',
      permissions: ['get']
    }, {
      resources: '/api/menus/:menuId',
      permissions: ['get']
    }, {
      resources: '/api/restaurants/:restaurantId/menus',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/menus',
      permissions: ['get']
    }, {
      resources: '/api/menus/:menuId',
      permissions: ['get']
    }, {
      resources: '/api/restaurants/:restaurantId/menus',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Menu Policy Allows 
 */
exports.isAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If menu is being processed and the current user created it then allow any manipulation
  // Need to make sure user owns the restaurant and restaurant owns the menu
  if (req.user && req.restaurant && (req.user.id === req.restaurant.userId)) {
    if (!req.menu || (req.menu && (req.menu.restaurantId === req.restaurant.id))) {
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
