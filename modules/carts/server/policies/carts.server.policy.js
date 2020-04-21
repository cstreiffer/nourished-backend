'use strict';

var
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
    roles: ['user'],
    allows: [{
      resources: '/api/user/carts',
      permissions: ['get', 'post', 'delete']
    }, {
      resources: '/api/user/carts/:cartId',
      permissions: []
    }, {
      resources: '/api/user/carts/increment',
      permissions: ['post']
    }, {
      resources: '/api/user/carts/decrement',
      permissions: ['post']
    }]
  }]);
};

// The USER/MENU/ORDER route (how users interact with )

exports.isAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  if (req.user && req.cart && (req.user.id === req.cart.userId)){
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