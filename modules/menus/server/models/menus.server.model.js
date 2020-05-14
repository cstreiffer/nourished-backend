'use strict';

/**
 * Menu Model
 */

var 
  path = require('path'),
  config = require(path.resolve('./config/config.js')),
  Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  var Menu = sequelize.define('menu', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    finalized: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    visible: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 5.00
    },
    mealName: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    mealDescription: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    dietaryRestrictions: {
      type: DataTypes.JSONB,
      defaultValue: [],
      isArray: true
    },
    allergens: {
      type: DataTypes.JSONB,
      defaultValue: [],
      isArray: true
    },
    imageURL: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
  }, {
    associate: function(models) {
      Menu.belongsTo(models.mealinfo, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Menu.belongsTo(models.timeslot, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Menu.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Menu;
};

