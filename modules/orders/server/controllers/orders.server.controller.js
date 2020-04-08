'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  uuid = require('uuid/v4'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Order = db.order,
  Menu = db.menu;

const {Op} = require('sequelize');
/**
 * Create a order
 */
exports.create = function(req, res) {
  delete req.body.id;
  delete req.body.menuId;

  req.body.id = uuid();
  req.body.userId = req.user.id;
  req.body.menuId = req.menu.id;

  if( !req.body.hospitalId || !req.body.userId || !req.body.menuId ) {
      return res.status(400).send({
        message: "Please format request properly with menu, hospital, and user."
      });
  } else {
    Order.create(req.body).then(function(order) {
      if (!order) {
        return res.send('/', {
          errors: 'Could not create the order'
        });
      } else {
        return res.jsonp({order: order, message: "Order successfully created"});
      }
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  }
};

/**
 * Show the current order
 */
exports.read = function(req, res) {
  res.jsonp({order: req.order, message: "Order successfully found"});
};

/**
 * Update an order
 */
exports.update = function(req, res) {
  var order = req.order;

  order.update({
    quantity: req.body.quantity,
    information: req.body.information,
    locationId: req.body.locationId,
    userStatus: req.body.userStatus
  }).then(function(menu) {
    res.jsonp({order: order, message: "Order successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Update an order
 */
exports.restaurantUpdate = function(req, res) {
  var order = req.order;

  order.update({
    restStatus: req.body.restStatus,
  }).then(function(menu) {
    res.jsonp({order: order, message: "Order successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete an order
 */
exports.delete = function(req, res) {
  var order = req.order;

  // Delete the order
  order.destroy().then(function() {
    return res.jsonp({order: order, message: "Order successfully deleted"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

var formatDate = function(query) {
  if (query.startDate && query.endDate) return{[Op.gte]: query.startDate, [Op.lte] : query.endDate};
  if (query.startDate) return {[Op.gte] : query.startDate};
  if (query.endDate) return {[Op.lte] : query.endDate};
};

/**
 * List of Orders
 */
exports.list = function(req, res) {
  var query = {restaurantId: req.restaurant.id};
  if(req.query.userStatus) query.userStatus = req.query.userStatus;
  if(req.query.restStatus) query.restStatus = req.query.restStatus;
  if(req.query.quantity) query.quantity = req.query.quantity;
  if(req.query.locationId) query.locationId = req.query.locationId;
  if(req.query.startDate || req.query.endDate) query.date = formatDate(req.query);

  Order.findAll({
    include: [db.menu, {model: db.location, include: [db.hospital]}]
  }).then(function(orders) {
    if (!orders) {
      return res.status(404).send({
        message: 'No orders found'
      });
    } else {
      res.json({orders: orders, message: "Orders successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * List of Orders
 */
exports.userOrderList = function(req, res) {
  var query = {userId: req.user.id};
  if(req.query.userStatus) query.userStatus = req.query.userStatus;
  if(req.query.restStatus) query.restStatus = req.query.restStatus;
  if(req.query.quantity) query.quantity = req.query.quantity;
  if(req.query.locationId) query.locationId = req.query.locationId;
  if(req.query.restaurantId) query.restaurantId = req.query.restaurantId;
  if(req.query.startDate || req.query.endDate) query.date = formatDate(req.query);

  Order.findAll({
    where: query,
    include: [db.menu, {model: db.location, include: [db.hospital]}]
  }).then(function(orders) {
    if (!orders) {
      return res.status(404).send({
        message: 'No orders found'
      });
    } else {
      res.json({orders: orders, message: "Orders successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * List of restaurant orders
 */
exports.restaurantOrderList = function(req, res) {
  var q1 = {restaurantId: req.restaurant.id};
  if(req.query.menuId) q1.menuId = req.query.menuId;

  var q2 = {};
  if(req.query.userStatus) q2.userStatus = req.query.userStatus;
  if(req.query.restStatus) q2.restStatus = req.query.restStatus;
  if(req.query.quantity) q2.quantity = req.query.quantity;
  if(req.query.locationId) q2.locationId = req.query.locationId;
  if(req.query.startDate || req.query.endDate) q2.date = formatDate(req.query);

  Menu.findAll({
    where: q1
  }).then(function(menus) {
    if (!menus) {
      return res.status(404).send({
        message: 'No menus associated with restaurant'
      });
    } else {
      // Find all of the menu ids;
      q2.menuId = menus.map((v) => v.id);
      Order.findAll({
        where: q2,
        include: [db.menu, {model: db.location, include: [db.hospital]}]
      }).then(function(orders) {
        if (!orders) {
          return res.status(404).send({
            message: 'No orders found for restaurant'
          });
        } else {
          res.json({orders: orders, message: "Orders successfully found"});
        }
      }).catch(function(err) {
        res.jsonp(err);
      });
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * Order middleware
 */
exports.orderByID = function(req, res, next, id) {

  // if ((id % 1 === 0) === false) { //check if it's integer
  //   return res.status(404).send({
  //     message: 'Order is invalid'
  //   });
  // }

  Order.findOne({
    where: {
      id: id
    },
    include: [{model: db.menu, include: [db.restaurant]}, {model: db.location, include: [db.hospital]}]
  }).then(function(order) {
    if (!order) {
      return res.status(404).send({
        message: 'No order with that identifier has been found'
      });
    } else {
      req.order = order;
      next();
    }
  }).catch(function(err) {
    return next(err);
  });

};