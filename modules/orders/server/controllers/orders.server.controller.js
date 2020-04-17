'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  uuid = require('uuid/v4'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Order = db.order,
  Cart = db.cart,
  Menu = db.menu;

const {Op} = require('sequelize');

//  id | date | userStatus | restStatus | payStatus | quantity | information | groupId | deleted | createdAt | updatedAt | hospitalId | mealId | userId 
const retAttributes = ['id', 'date', 'userStatus', 'restStatus', 'payStatus', 'quantity', 'information', 'groupId', 'menuId'];
const menuRetAttributes = ['id', 'timeslotId', 'mealId'];
const mealRetAttributes = ['id', 'name', 'description', 'allergens', 'dietaryRestrictions', 'mealinfoId'];
const mealinfoRetAttributes = ['id', 'type', 'price'];
const timeslotRetAttributes = ['id', 'date', 'restaurantId', 'hospitalId'];
const restRetAttributes = ['id', 'name', 'description', 'phoneNumber', 'email'];
const hospRetAttributes = [ 'id' , 'name', 'phoneNumber', 'email', 'streetAddress', 'zip', 'city', 'state', 'dropoffLocation', 'dropoffInfo'];

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
    ret.menuId = order.menuId;
    ret.hospitalId = order.hospitalId || req.user.hospitalId;
    return ret;
  });

  console.log("Made it here?" + orders);

  Order.bulkCreate(orders, {validate: true}).then(function() {
    if (!orders) {
      return res.send('/', {
        errors: 'Could not create the order'
      });
    } else {
      var menuIds = orders.map(order => order.menuId);
      var ret = orders.map((order)=> _.pick(order, retAttributes));
      Cart.destroy({
        where: {
          userId: req.user.id
        }
      }).then(function() {
        return res.jsonp({orders: ret, groupId: groupId, message: "Orders successfully created"});
      }).catch(function(err) {
        return res.jsonp({orders: ret, groupId: groupId, message: "Orders successfully created. Error deleting cart."});
      });
    };
  }).catch(function(err) {
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
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
  var groupId = '';
  var orders = req.orders.map((order) => {
    var order = order.toJSON();
    var ord = updateOrders[order.id];
    order.information = ord.information ? ord.information : order.information;
    order.quantity = ord.quantity ? ord.quantity : order.quantity;
    order.hospitalId = ord.hospitalId ? ord.hospitalId : order.hospitalId;
    groupId = order.groupId;
    return order;
  });

  // TO DO -- SEND OUT EMAIL!!!

  Order.bulkCreate(orders, {updateOnDuplicate : ["information", "quantity", "hospitalId"]}).then(function() {
    var ret = orders.map((order)=> _.pick(order, retAttributes));
    res.jsonp({orders: ret, groupId: groupId, message: "Orders successfully updated"});
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
  if((req.body.orderIds || req.body.menuIds) && req.body.userStatus) {
    var query = {userId: req.user.id}
    if(req.body.orderIds) query.id = req.body.orderIds;
    // if(req.body.groupId) query.groupId = req.body.groupId;
    if(req.body.menuIds) query.menuId = req.body.menuIds;

    Order.update({userStatus: req.body.userStatus}, {
      where: query
    }).then(function(orders) {
      var ret = orders.map((order)=> _.pick(order, retAttributes));
      res.jsonp({orders: orders, message: "Orders successfully updated"});
    })
  } else {
     return res.status(400).send({
      message: "Please include orderids/menuids/userstatus"
    });  
  }
};

/**
 * User status an order
 */
exports.restStatusUpdate = function(req, res) {
  if((req.body.orderIds || req.body.menuIds) && req.body.restStatus) {
    var orderQuery = {};
    if(req.body.orderIds) orderQuery.id = req.body.orderIds;
    if(req.body.menuIds) orderQuery.menuId = req.body.menuIds;

    var menuQuery = {userId: req.user.id};
    // if(req.body.mealIds) menuQuery.mealId = req.body.mealIds;

    Order.findAll({
      where: orderQuery,
      attributes: retAttributes,
      include: {
        model: db.menu,
        where: menuQuery
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
          var ret = orders.map((order)=> _.pick(order, retAttributes));
          return res.jsonp({orders: ret, message: "Orders successfully updated"});
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
      message: "Please include orderids/menuids/reststatus"
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
    var ret = req.orders.map((order)=> _.pick(order, retAttributes));
    return res.jsonp({orders: ret, message: "Orders markerd as deleted"});
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
exports.userList = function(req, res) {
  var query = {userId: req.user.id};
  if(req.query.menuId) query.menuId = req.query.menuId;
  if(req.query.hospitalId) query.hospitalId = req.query.hospitalId;
  if(req.query.groupId) query.groupId = req.query.groupId;
  if(req.query.startDate || req.query.endDate) query.date = formatDate(req.query);
  // if(req.query.userStatus) query.userStatus = req.query.userStatus;
  // if(req.query.restStatus) query.restStatus = req.query.restStatus;
  // if(req.query.payStatus) query.payStatus = req.query.payStatus;
  // if(req.query.quantity) query.quantity = req.query.quantity;

  Order.findAll({
    where: query,
    attributes: retAttributes,
    include: {
      model: db.menu,
      attributes: menuRetAttributes,
      include: [{
        model: db.meal,
        attributes: mealRetAttributes,        
        include: {
          model: db.mealinfo,
          attributes: mealinfoRetAttributes
        }
      }, {
        model: db.timeslot,
        attributes: timeslotRetAttributes,
        include: [{
          model: db.restaurant,
          attributes: restRetAttributes
        }, {
          model: db.hospital,
          attributes: hospRetAttributes
        }]
      }]
    }
  }).then(function(orders) {
    if (!orders) {
      return res.status(404).send({
        message: 'No orders found'
      });
    } else {
      res.json({orders: orders, message: "Orders successfully found"});
    }
  }).catch(function(err) {
    console.log(err);
    res.jsonp(err);
  });
};

/**
 * List of restaurant orders
 */
exports.restList = function(req, res) {
  var orderQuery = {};
  if(req.query.menuId) orderQuery.menuId = req.query.menuId;
  if(req.query.startDate || req.query.endDate) orderQuery.date = formatDate(req.query);
  // if(req.query.userStatus) orderQuery.userStatus = req.query.userStatus;
  // if(req.query.restStatus) orderQuery.restStatus = req.query.restStatus;
  // if(req.query.payStatus) orderQuery.payStatus = req.query.payStatus;

  var menuQuery = {userId: req.user.id};
  if(req.query.mealId) menuQuery.mealId = req.query.mealId;

  Order.findAll({
    where: orderQuery,
    attributes: retAttributes,
    include: {
      model: db.menu,
      where: menuQuery,
      attributes: menuRetAttributes,
      include: [{
        model: db.meal,
        attributes: mealRetAttributes,        
        include: {
          model: db.mealinfo,
          attributes: mealinfoRetAttributes
        }
      }, {
        model: db.timeslot,
        attributes: timeslotRetAttributes,
        include: [{
          model: db.restaurant,
          attributes: restRetAttributes
        }, {
          model: db.hospital,
          attributes: hospRetAttributes
        }]
      }]
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
    console.log(err);
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
    include: {model: db.menu, include: [{model: db.meal, include: db.mealinfo}, {model: db.timeslot, include: db.restaurant}]}
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