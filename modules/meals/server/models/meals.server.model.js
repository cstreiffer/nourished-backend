'use strict';

/**
 * Meal Model
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
  var Meal = sequelize.define('meal', {
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
    category: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    imageURL: {
      type: DataTypes.STRING,
      defaultValue: ''
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
    },
    finalized: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    associate: function(models) {
      Meal.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Meal.belongsTo(models.menu, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Meal.belongsTo(models.mealinfo, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Meal;
};

