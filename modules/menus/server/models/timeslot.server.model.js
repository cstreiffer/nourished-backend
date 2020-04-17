'use strict';

/**
 * TimeSlot Model
 */

var 
  path = require('path'),
  config = require(path.resolve('./config/config.js')),
  Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  var TimeSlot = sequelize.define('timeslot', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
  }, {
    associate: function(models) {
      TimeSlot.belongsTo(models.restaurant, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      TimeSlot.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      TimeSlot.belongsTo(models.hospital, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return TimeSlot;
};

