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

module.exports = function(sequelize, DataTypes) {
  var Menu = sequelize.define('menu', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isValid: validationWrapper("Date")
      }
    },
  }, {
    associate: function(models) {
      Menu.belongsTo(models.restaurant, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Menu.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Menu;
};

