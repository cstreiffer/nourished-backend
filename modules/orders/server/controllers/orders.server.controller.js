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
    var ret = {};
    ret.groupId = groupId;
    ret.userId = req.user.id;
    ret.date= date;
    ret.id = uuid();
    ret.information = order.information;
    ret.quantity = order.quantity;
    return ret;
  });

  Order.bulkCreate(orders, {validate: true}).then(function() {
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
  if(req.query.payStatus) query.payStatus = req.query.payStatus;
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
  // For each, set same date, set same groupId, set individual id, set userId
  var updateOrders = {};
  req.body.orders.map((order)=> updateOrders[order.id] = order);

  var orders = req.orders.map((order) => {
    var order = order.toJSON();
    var ord = updateOrders[order.id];
    order.information = ord.information ? ord.information : order.information;
    order.quantity = ord.quantity ? ord.quantity : order.quantity;
    order.hospitalId = ord.hospitalId ? ord.hospitalId : order.hospitalId;
    return order;
  });

  // console.log("Here are the orders", orders);

  Order.bulkCreate(orders, {updateOnDuplicate : ["information", "quantity", "hospitalId", "userStatus"]}).then(function() {
    res.jsonp({orders: orders, message: "Orders successfully updated"});
  }).catch(function(err) {
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Update an order
 */
exports.userStatusUpdate = function(req, res) {
  // Check to make sure either group or order ids specified
  if((req.body.orderIds || req.body.groupId || req.body.mealId) && req.body.userStatus) {
    var query = {userId: req.user.id}
    if(req.body.orderIds) query.id = req.body.orderIds;
    if(req.body.groupId) query.groupId = req.body.groupId;
    if(req.body.mealId) query.mealId = req.body.mealId;
    Order.update({userStatus: req.body.userStatus}, {
      where: query
    }).then(function(orders) {
      res.jsonp({orders: orders, message: "Orders successfully updated"});
    })
  } else {
     return res.status(400).send({
      message: "Please include orderid/groupid/mealid/userstatus"
    });  
  }
};

/**
 * User status an order
 */
exports.restStatusUpdate = function(req, res) {
  if((req.body.orderIds || req.body.menuId || req.body.mealIds) && req.body.restStatus) {
    var orderQuery = {};
    if(req.body.orderIds) orderQuery.id = req.body.orderIds;
    if(req.body.mealIds) orderQuery.mealId = req.body.mealIds;
    // if(req.query.userStatus) orderQuery.userStatus = req.query.userStatus;
    // if(req.query.restStatus) orderQuery.restStatus = req.query.restStatus;
    // if(req.query.payStatus) orderQuery.payStatus = req.query.payStatus;

    var mealQuery = {userId: req.user.id};
    if(req.body.menuId) mealQuery.menuId = req.body.menuId;

    var menuQuery = {};
    // if(req.query.startDate || req.query.endDate) menuQuery.date = formatDate(req.query);

    Order.findAll({
      where: orderQuery,
      include: {
        model: db.meal, 
        where: mealQuery, 
        include: {
          model: db.menu, 
          where: menuQuery
        }
      }
    }).then(function(orders) {
      if (!orders) {
        return res.status(404).send({
          message: 'No orders found'
        });
      } else {
        var orderIds = orders.map((order) => order.id);
        Order.update({restStatus: req.body.restStatus}, {
          where: {
            id: orderIds
          }
        }).then(function() {
          return res.jsonp({orders: orders, message: "Orders successfully updated"});
        }).catch(function(err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        });
      }
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  } else {
     return res.status(400).send({
      message: "Please include orderids/menuid/mealids/reststatus"
    });   
  }
};

/**
 * Delete an order
 */
exports.delete = function(req, res) {
  var orderIds = req.orders.map((order) => order.id);

  Order.update({deleted: true}, {
    where: {
      userId: req.user.id,
      id: orderIds
    }
  }).then(function(orders) {
    return res.jsonp({orders: req.orders, message: "Orders markerd as deleted"});
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
  var orderQuery = {};
  if(req.query.mealId) orderQuery.mealId = req.query.mealId;
  if(req.query.userStatus) orderQuery.userStatus = req.query.userStatus;
  if(req.query.restStatus) orderQuery.restStatus = req.query.restStatus;
  if(req.query.payStatus) orderQuery.payStatus = req.query.payStatus;

  var mealQuery = {userId: req.user.id};
  if(req.query.menuId) mealQuery.menuId = req.query.menuId;

  var menuQuery = {};
  if(req.query.startDate || req.query.endDate) menuQuery.date = formatDate(req.query);

  Order.findAll({
    where: orderQuery,
    include: {
      model: db.meal, 
      where: mealQuery, 
      include: {
        model: db.menu, 
        where: menuQuery
      }
    }
  }).then(function(orders) {
    if (!orders) {
      return res.status(404).send({
        message: 'No orders found'
      });
    } else {
      res.jsonp({orders: orders, message: "Orders successfully found"});
    }
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
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