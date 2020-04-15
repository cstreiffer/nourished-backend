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
    }
  }, {
    associate: function(models) {
      Menu.belongsTo(models.meal, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Menu.belongsTo(models.timeslot, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Menu.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Menu;
};

