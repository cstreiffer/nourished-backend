'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  uuid = require('uuid/v4'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Cart = db.cart,
  Menu = db.menu;

const {Op} = require('sequelize');
/**
 * Create a menu
 */
exports.create = function(req, res) {
  delete req.body.id;
  req.body.id = uuid();
  req.body.userId = req.user.id;
  req.body.date = new Date().toISOString();
  
  if( !req.body.mealId) {
      return res.status(400).send({
        message: "Please include meal id"
      });
  } else {
    Cart.create(req.body).then(function(cart) {
      if (!cart) {
        return res.send('/', {
          errors: 'Could not create the cart'
        });
      } else {
        res.jsonp({cart: cart, message: "Cart item successfully created"});
      }
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  }
};

/**
 * List of Carts
 */
exports.userList = function(req, res) {
  var query = {userId: req.user.id};

  Cart.findAll({
    where: query,
    include: [{model: db.meal, include: {model: db.menu, include: db.restaurant}}]
  }).then(function(carts) {
    if (!carts) {
      return res.status(404).send({
        message: 'No carts found'
      });
    } else {
      res.json({carts: carts, message: "Cart items successfully found"});
    }
  }).catch(function(err) {
    res.jsonp(err);
  });
};

/**
 * Show the current cart
 */
exports.read = function(req, res) {
  res.jsonp({cart: req.cart, message: "Cart item successfully found"});
}; 

/**
 * Wipes user cart
 */
exports.destroy = function(req, res) {
  Cart.destroy({
    where: {
      userId: req.user.id,
    }
  }).then(function() {
    return res.jsonp({message: "Cart successfully deleted"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
}

/**
 * Update a cart
 */
exports.update = function(req, res) {
  delete req.body.id;
  delete req.body.userId;
  var cart = req.cart;

  cart.update({
    quantity: req.body.quantity,
  }).then(function(cart) {
    return res.jsonp({cart: cart, message: "Cart item successfully updated"});
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Delete an restaurant
 */
exports.delete = function(req, res) {
  var cart = req.cart;
  // Delete the restaurant
  cart
    .destroy()
    .then(function() {
      return res.jsonp({cart: cart, message: "Cart item successfully deleted"});
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};


/**
 * Cart middleware
 */
exports.cartByID = function(req, res, next, id) {

  Cart.findOne({
    where: {
      id: id
    },
    include: [{model: db.meal, include: {model: db.menu, include: db.restaurant}}]
  }).then(function(cart) {
    if (!cart) {
      return res.status(404).send({
        message: 'No cart with that identifier has been found'
      });
    } else {
      req.cart = cart;
      next();
    }
  }).catch(function(err) {
    return next(err);
  });

};