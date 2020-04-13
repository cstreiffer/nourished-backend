'use strict';

var
  path = require('path'),
  config = require(path.resolve('./config/config')),
  acl = require('acl'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Order = db.order,
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
    roles: ['restaurant'],
    allows: [{
      resources: '/api/rest/orders',
      permissions: ['get']
    }, {
      resources: '/api/rest/orders/status',
      permissions: ['put']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/user/orders',
      permissions: ['get', 'post', 'put', 'delete']
    }, {
      resources: '/api/user/orders/status',
      permissions: ['put']
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

exports.isCreateOrderAllowed = function(req, res, next) {
  if(req.body.orders) {
    var orderMeals = req.body.orders.map((order) => order.mealId);
    Meal.findAll({
      where: {
        id: orderMeals
      },
      include: db.menu
    }).then((meals) => {
      // console.log(meals);
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

exports.isUpdateOrderAllowed = function(req, res, next) {
  if(req.orders) {
    var validation = req.orders.map((order) => isMealFinalized(order.meal) && isTimeValid(order.meal));
    if(validation.every((v) => v)) {
      return next();
    } else {
      return res.status(400).json({message: "Invalid order"});
    }
  } else {
    return res.status(400).json({message: 'Please include list of orders'});
  }
}

exports.isUserOrderAllowed = function(req, res, next) {
  if(req.body.orders) {
    var orderIds = req.body.orders.map((order) => order.id);
    Order.findAll({
      where: {
        id: orderIds
      },
      include: {model: db.meal, include: db.menu}
    }).then((orders) => {
      if(orders && orders.length === new Set(orderIds).size) {
        var validation = orders.map((order) => order.userId === req.user.id);
        if(validation.every((v) => v)) {
          req.orders = orders;
          return next();
        } else {
          return res.status(400).json({message: "Invalid user order"});
        }
      } else {
        return res.status(400).json({message: "Invalid order IDs"});
      }
    }).catch((err) => {
      console.log(err);
      return res.status(400).json({message: "An error occurred"});
    });
  } else {
    return res.status(400).json({message: 'Please include list of orders'});
  }
}

exports.isFormatAllowed = function(req, res, next) {
  if(req.body.orders) {
    if(req.body.orders.every(order => order.hospitalId && order.mealId && order.quantity)) {
      next();
    } else {
      return res.status(400).json({message: 'Please include hospital id, meal id, and/or quantity in every order'});
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