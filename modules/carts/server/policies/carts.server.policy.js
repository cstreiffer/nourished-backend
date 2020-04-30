'use strict';

var
  acl = require('acl'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Menu = db.menu;

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

/**
 * Check If Menu Policy Allows 
 */

var isTimeValid = function(date) {
  var time = new Date(new Date().getTime() + config.orderTimeCutoff);
  return time < new Date(date);
};

var isMenuVisible = function(menu) {
  return menu.visible;
};

var isMenuFinalized = function(menu) {
  return menu.finalized;
};

/**
 * Check If All Orders are Good
 */
exports.isCartUpdateAllowed = function(req, res, next) {
  if(req.body.menuId) {
    Menu.findOne({
      where: {
        id: req.body.menuId
      },
      include: [db.timeslot, db.mealinfo]
    }).then((menu) => {
      // console.log(meals);
      if(menu && isMenuFinalized(menu) && isTimeValid(menu.timeslot.date) && isMenuVisible(menu)) {
        req.menu = menu;
        return next();
      } else {
        return res.status(400).json({message: "Invalid menu IDs"});
      }
    }).catch((err) => {
      console.log(err);
      return res.status(400).json({message: "An error occurred"});
    });
  } else {
    return res.status(400).json({message: 'Please include menuId'});
  }
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