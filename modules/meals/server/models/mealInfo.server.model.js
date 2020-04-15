'use strict';

/**
 * Meal Model
 */

var 
  path = require('path'),
  config = require(path.resolve('./config/config.js')),
  Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  var MealInfo = sequelize.define('mealinfo', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    price: {
      type: DataTypes.DECIMAL,
      defaultValue: 5.00
    },
    time: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    notes: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    other: {
      type: DataTypes.STRING,
      defaultValue: ''
    }
  });
  return MealInfo;
};

