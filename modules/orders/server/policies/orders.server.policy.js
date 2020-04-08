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
      resources: '/api/orders',
      permissions: []
    }, {
      resources: '/api/orders/:orderId',
      permissions: []
    }, {
      resources: '/api/restaurants/:restaurantId/menus/:menuId/orders/',
      permissions: []
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/menus/:menuId/orders',
      permissions: ['post']
    }, {
      resources: '/api/user/orders',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Menu Policy Allows 
 */

exports.isTimeAllowed = function(req, res, next) {
  if(req.menu) {
    var time = new Date(new Date().getTime() + config.orderTimeCutoff);
    if(time < new Date(req.menu.date)) {
      next();
    } else {
      return res.status(403).json({message: 'Orders can no longer be created/updated'});
    }
  } else {
    return res.status(500).send('Unexpected authorization error');
  }
};

 // USER, REST, MENU, ORDER
 // 1, 0, 0, 0
 // 1, 0, 0, 1
 // 1, 1, 1, 0
 // 1, 1, 1, 1
 

// The USER/MENU/ORDER route (how users interact with )

exports.isUserAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  if (req.user && req.menu && req.order && (req.user.id === req.order.userId) && (req.menu.id === req.order.menuId)) {
    // User owns the order and the order matches the menu
    next();
  } else {
    // Check roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
      if (err) {
        // An authorization error occurred.
        return res.status(500).send('Unexpected authorization error');
      } else {
        if (isAllowed) {
          // Access granted! Invoke next middleware
          return next();
        } else {
          return res.status(403).json({message: 'User is not authorized'});
        }
      }
    });
  }
};

// The USER/RESTAURANT/ORDER route (how users interact with )
exports.isRestaurantAllowed = function(req, res, next) {
  if (req.user && req.restaurant && (req.user.id === req.restaurant.userId)) {
    if (!req.order || (req.order && (req.restaurant.id === req.order.menu.restaurantId))) {
      next();
    } else {
      return res.status(403).json({message: 'User is not authorized'});
    }
  } else {
    return res.status(403).json({message: 'User is not authorized'});
  }
};
