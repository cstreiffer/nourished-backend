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
  var groupId = uuid();
  var date = new Date().toISOString();

  // For each, set same date, set same groupId, set individual id, set userId
  var orders = req.body.orders.map((order) => {
    order.groupId = groupId;
    order.userId = req.user.id;
    order.date= date;
    order.id = uuid();
    return order;
  });
  
  Order.bulkCreate(orders, {validate: true, returning: true}).then(function(orders) {
    if (!orders) {
      return res.send('/', {
        errors: 'Could not create the order'
      });
    } else {
      return res.jsonp({orders: orders, message: "Orders successfully created"});
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * List of Orders
 */
exports.userList = function(req, res) {
  var query = {userId: req.user.id};
  if(req.query.userStatus) query.userStatus = req.query.userStatus;
  if(req.query.restStatus) query.restStatus = req.query.restStatus;
  if(req.query.quantity) query.quantity = req.query.quantity;
  if(req.query.hospitalId) query.hospitalId = req.query.hospitalId;
  if(req.query.groupId) query.groupId = req.query.groupId;
  if(req.query.startDate || req.query.endDate) query.date = formatDate(req.query);

  Order.findAll({
    where: query,
    include: [{model: db.meal, include: {model: db.menu, include: db.restaurant}}, {model: db.hospital}]
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

// /**
//  * Show the current order
//  */
// exports.read = function(req, res) {
//   res.jsonp({order: req.order, message: "Order successfully found"});
// };

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
exports.restStatusUpdate = function(req, res) {
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
 * User status an order
 */
exports.userStatusUpdate = function(req, res) {
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
 * List of restaurant orders
 */
exports.restList = function(req, res) {
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
        include: [{model: db.meal, include: {model: db.menu, include: db.restaurant}}, {model: db.hospital}]
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

  Order.findOne({
    where: {
      id: id
    },
    include: [{model: db.meal, include: {model: db.menu, include: db.restaurant}}, {model: db.hospital}]
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