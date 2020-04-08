'use strict';

/**
 * Menu Model
 */

var 
  path = require('path'),
  config = require(path.resolve('./config/config.js')),
  Sequelize = require('sequelize');

/**
 * A Validation function for local strategy properties
 */
var validationWrapper = function(name) {
  var validateLocalStrategyProperty = function(property) {
    var msg = 'Field cannot be blank: ' + name;
    if (property.length === 0) {
      throw new Error(msg);
    }
  };
  return validateLocalStrategyProperty;
};

/**
 * A Validation function for local strategy properties
 */
var validateDateValidity = function(property) {
  var d = new Date(property);
  var h = `${d.getHours()}`.padEnd(2,0);
  var m = `${d.getMinutes()}`.padEnd(2,0);
  var s = `${d.getSeconds()}`.padEnd(2,0);
  var t = `${h}:${m}:${s}`;
  if (!config.timeSlots.includes(t)) {
    throw new Error("Times limited to the following: " + config.timeSlots.toString());
  }
};

module.exports = function(sequelize, DataTypes) {
  var Menu = sequelize.define('menu', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    description: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    date: {
      type: DataTypes.DATE,
      validate: {
        isValid: validateDateValidity
      }
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validationWrapper("Meal Category")
      }
    },
    menuImageURL: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    minQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    maxQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 25
    },
    visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    associate: function(models) {
      Menu.belongsTo(models.restaurant, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Menu;
};

