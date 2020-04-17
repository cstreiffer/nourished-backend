'use strict';

var
  path = require('path'),
  config = require(path.resolve('./config/config')),
  acl = require('acl'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Restaurant = db.restaurant;

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
    roles: ['restaurant'],
    allows: [ {
      resources: '/api/rest/meals',
      permissions: ['post', 'get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/meals',
      permissions: ['get']
    }, {
      resources: '/api/meals/:mealId',
      permissions: ['get']
    }]
  }]);
};

exports.isRestaurantRequired = function(req, res, next) {
  if(req.body.restaurantId) {
    return next();
  } else {
    return res.status(400).json({
      message: 'Please specify restaurant'
    });
  }
}

/**
 * Check if Meal belongs to User
 */
exports.isValidRestaurant = function(req, res, next) {
  if(req.body.restaurantId) {
    Restaurant.findOne({
      where: {
        id: req.body.restaurantId,
        userId: req.user.id
      }
    }).then((restaurant) => {
      if(restaurant) {
        if(restaurant.restaurantStripeAccountId) {
          req.restaurant = restaurant;
          return next();          
        } else {
          return res.status(400).json({
            message: 'No attached restaurant stripe id'
          });
        }
      } else {
        return res.status(400).json({
          message: 'Restaurant not found'
        });
      }
    }).catch((err) => {
        return res.status(500).json({
          message: 'Unexpected authorization error'
        });
    });
  } else {
    return next();
  }
}

/**
 * Check if Meal is finalized
 */
exports.isFinalized = function(req, res, next) {
  if(req.meal && !req.meal.finalized) {
    return next()
  } else {
    return res.status(400).json({
      message: 'Meal is finalized'
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
  if (req.user && req.meal && (req.user.id === req.meal.userId)) {
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
