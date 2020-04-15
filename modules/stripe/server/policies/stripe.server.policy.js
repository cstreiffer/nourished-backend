'use strict';

var
  path = require('path'),
  config = require(path.resolve('./config/config')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Order = db.order,
  Stripe = db.stripe,
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
      resources: '/api/user/stripe',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check if payment attent already associated with groupId
 */ 

 exports.isNewOrder = function(req, res, next) {
  if(req.body.groupId) {
    Stripe.findOne({
      where: {
        groupId: req.body.groupId,
      }
    }).then(function(stripeOrder) {
      if (stripeOrder) {
        return res.status(404).send({
          message: 'Payment intent already exists'
        });
      } else {
        return next();
      }
    }).catch(function(err) {
      return res.status(400).send({message: err});
    });
  } else {
    return res.status(403).json({
      message: 'User is not authorized'
    });
  }
 }

exports.isOrderPaymentAllowed = function(req, res, next) {
  if(req.body.groupId) {
    Order.findAll({
      where: {
        groupId: req.body.groupId,
        userId: req.user.id
      },
      include: {
        model: db.menu,
        include: {
          model: db.meal,
          include: db.mealinfo
        }
      }
    }).then(function(orders) {
      if (!orders) {
        return res.status(404).send({
          message: 'No orders with that identifier has been found'
        });
      } else {
        req.groupId = req.body.groupId;
        req.orders = orders;
        return next();
      }
    }).catch(function(err) {
      return res.status(400).send({message: err});
    });
  } else {
    return res.status(403).json({
      message: 'User is not authorized'
    });
  }
};

/**
 * Check If Restaurant Policy Allows
 */
exports.isAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If stipe is being processed and the current user created it then allow any manipulation
  if (req.stripe && req.user && req.stripe.userId === req.user.id) {
    return next();
  } else {
    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
      if (err) {
        // An authorization error occurred.
        return res.status(500).json({
          message: 'Unexpected authorization error'
        });
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
