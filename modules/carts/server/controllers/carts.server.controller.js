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
  Cart = db.cart,
  Menu = db.menu;

const {Op} = require('sequelize');
const retAttributes = ['id', 'date', 'quantity', 'menuId'];
const menuRetAttributes = ['id', 'timeslotId', 'mealId'];
const mealRetAttributes = ['id', 'name', 'description', 'allergens', 'dietaryRestrictions', 'mealinfoId'];
const mealinfoRetAttributes = ['id', 'type', 'price'];
const timeslotRetAttributes = ['id', 'date', 'restaurantId'];
const restRetAttributes = ['id', 'name', 'phoneNumber', 'email'];

/**
 * Increment item by one
 */
exports.increment = function(req, res) {
  if(!req.body.menuId) {
    return res.status(400).send({
      message: "Please include menu id"
    });
  } else {
    Cart.findOne({
      where: {
        userId: req.user.id,
        menuId: req.body.menuId
      }
    }).then(function(cartItem) {
      if(cartItem) {
        cartItem.quantity = cartItem.quantity + 1;
        cartItem.save()
          .then(function(cart) {
            var ret = _.pick(cart, retAttributes);
            res.status(200).json({cart: ret, message: "Cart item successfully updated"});
          }).catch(function(err) {
            console.log(err);
            res.status(400).send({message: "Error updating the cart"});
          })
      } else {
        Cart.create({
          id: uuid(),
          userId: req.user.id,
          menuId: req.body.menuId,
          quantity: 1
        })
        .then(function(cart) {
          var ret = _.pick(cart, retAttributes);
          res.status(200).json({cart: ret, message: "Cart item successfully updated"});
        })
        .catch(function(err) {
          console.log(err);
          res.status(400).send({message: "Error updating the cart"});
        });
      }
    }).catch(function(err) {
      console.log(err);
      res.status(400).send({message: "Error updating the cart"});
    });
  }
}

/**
 * Increment item by one
 */
exports.decrement = function(req, res) {
  if(!req.body.menuId) {
    return res.status(400).send({
      message: "Please include menu id"
    });
  } else {
    Cart.findOne({
      where: {
        userId: req.user.id,
        menuId: req.body.menuId
      }
    }).then(function(cartItem) {
      if(cartItem) {
        cartItem.quantity = cartItem.quantity - 1;
        if(cartItem.quantity === 0) {
          cartItem.destroy()
            .then(function(cart) {
              var ret = _.pick(cart, retAttributes);
              res.status(200).json({cart: ret, message: "Cart item deleted"});
            })
            .catch(function(err) {
              res.status(400).send({message: "Error updating the cart"});
            });
        } else {
          cartItem.save()
            .then(function(cart) {
              var ret = _.pick(cart, retAttributes);
              res.status(200).json({cart: ret, message: "Cart item successfully updated"});
            }).catch(function(err) {
              console.log(err);
              res.status(400).send({message: "Error updating the cart"});
            });
        }
      } else {
        res.status(400).send({message: "No cart item associated with menu"});
      }
    }).catch(function(err) {
      console.log(err);
      res.status(400).send({message: "Error updating the cart"});
    });
  }
}

/**
 * Create a menu
 */
exports.create = function(req, res) {
  delete req.body.id;
  req.body.id = uuid();
  req.body.userId = req.user.id;
  req.body.date = new Date().toISOString();
  
  if( !req.body.menuId) {
      return res.status(400).send({
        message: "Please include menu id"
      });
  } else {
    Cart.create(req.body).then(function(cart) {
      if (!cart) {
        return res.status(404).send({
          message: "Could not create the cart item"
        });
      } else {
        var ret = _.pick(cart, retAttributes);
        res.jsonp({cart: ret, message: "Cart item successfully created"});
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
        include: {
          model: db.restaurant,
          attributes: restRetAttributes
        }
      }]
    }
  }).then(function(carts) {
    if (!carts) {
      return res.status(404).send({
        message: 'No carts found'
      });
    } else {
      res.json({carts: carts, message: "Cart items successfully found"});
    }
  }).catch(function(err) {
    console.log(err);
    res.jsonp(err);
  });
};

/**
 * Show the current cart
 */
exports.read = function(req, res) {
  var ret = _.pick(req.cart, retAttributes);
  res.jsonp({cart: ret, message: "Cart item successfully found"});
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
    var ret = _.pick(cart, retAttributes);
    return res.jsonp({cart: ret, message: "Cart item successfully updated"});
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
      var ret = _.pick(cart, retAttributes);
      return res.jsonp({cart: ret, message: "Cart item successfully deleted"});
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
    include: {
      model: db.menu,
      include: [{
        model: db.meal,
        include: {
          model: db.mealinfo
        }
      }, {
        model: db.timeslot,
        include: {
          model: db.restaurant
        }
      }]
    }
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