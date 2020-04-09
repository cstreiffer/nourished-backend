'use strict';

var
  path = require('path'),
  config = require(path.resolve('./config/config')),
  acl = require('acl'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Meal = db.meal;

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
      resources: '/api/user/orders',
      permissions: ['get', 'post']
    }]
  }]);
};

/**
 * Check If Menu Policy Allows 
 */

var isTimeValid = function(meal) {
  var time = new Date(new Date().getTime() + config.orderTimeCutoff);
  return time < new Date(meal.menu.date);
};

var isMealFinalized = function(meal) {
  return meal.finalized;
};

/**
 * Check If All Orders are Good
 */

exports.isOrderAllowed = function(req, res, next) {
  if(req.body.orders) {
    var orderMeals = req.body.orders.map((order) => order.mealId);
    Meal.findAll({
      where: {
        id: orderMeals
      },
      include: db.menu
    }).then(meals => {
      if(meals && meals.length === new Set(orderMeals).size) {
        var validation = meals.map((meal) => isMealFinalized(meal) && isTimeValid(meal));
        if(validation.every((v) => v)) {
          return next();
        } else {
          return res.status(400).json({message: "Invalid order"});
        }
      } else {
        return res.status(400).json({message: "Invalid meal IDs"});
      }
    }).catch((err) => {
      console.log(err);
      return res.status(400).json({message: "An error occurred"});
    });
  } else {
    return res.status(400).json({message: 'Please include list of orders'});
  }
};

exports.isFormattedCorrectly = function(req, res, next) {
  if(req.body.orders) {
    if(req.body.orders.every(order => order.hospitalId && order.mealId)) {
      next();
    } else {
      return res.status(400).json({message: 'Please include hospital and meal ids in every order'});
    }
  } else {
    return res.status(400).json({message: 'Please include list of orders'});
  }
};

// The USER/MENU/ORDER route (how users interact with )

exports.isUserAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];
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
};

exports.isRestAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];
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
};