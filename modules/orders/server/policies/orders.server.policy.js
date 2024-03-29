'use strict';

var
  path = require('path'),
  config = require(path.resolve('./config/config')),
  acl = require('acl'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Order = db.order,
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
    roles: ['restaurant'],
    allows: [{
      resources: '/api/rest/orders',
      permissions: ['get']
    }, {
      resources: '/api/rest/orders/itemized',
      permissions: ['get']
    },{
      resources: '/api/rest/orders/status',
      permissions: ['put']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/user/orders',
      permissions: ['get', 'post', 'put']
    }, {
      resources: '/api/user/orders/delete',
      permissions: ['put']
    }, {
      resources: '/api/user/orders/status',
      permissions: ['put']
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
exports.isCreateOrderAllowed = function(req, res, next) {
  if(req.body.orders) {
    var menuIds = req.body.orders.map((order) => order.menuId);
    Menu.findAll({
      where: {
        id: menuIds
      },
      include: [db.timeslot, db.mealinfo]
    }).then((menus) => {
      var validMenuIds = new Set(menus.map(menu => menu.id));
      // console.log(menuIds, validMenuIds);
      if(menuIds.every(id => validMenuIds.has(id))) {
        var validation = menus.map((menu) => isMenuFinalized(menu) && isTimeValid(menu.timeslot.date) && isMenuVisible(menu));
        if(validation.every((v) => v)) {
          req.menus = menus;
          return next();
        } else {
          // console.log(req.body);
          return res.status(400).json({message: "Invalid order"});
        }
      } else {
        // console.log(req.body);
        // menus.forEach(menu => console.log(menu.toJSON()));
        return res.status(400).json({message: "Invalid menu IDs"});
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
    var validation = req.orders.map((order) => isTimeValid(order.deliveryDate));
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
  if(req.body.orders && req.body.groupId) {
    var orderIds = req.body.orders.map((order) => order.id);
    Order.findAll({
      where: {
        id: orderIds,
        userId: req.user.id,
        groupId: req.body.groupId,
        deleted: false
      },
      include: db.restaurant
    }).then((orders) => {
      var validOrderIds = new Set(orders.map(order => order.id));
      if(orderIds.every(id => validOrderIds.has(id))) {
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
    if(req.body.orders.every(order => order.menuId && order.quantity)) {
      next();
    } else {
      return res.status(400).json({message: 'Please include hospital id, menu id, and/or quantity in every order'});
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