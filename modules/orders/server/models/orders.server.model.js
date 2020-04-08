'use strict';

/**
 * Order Model
 */

var 
  Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  var Order = sequelize.define('order', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    userStatus: {
      type: DataTypes.ENUM(['ORDERED', 'RECEIVED', 'NOT_DELIVERED', 'WRONG_DELIVERY']),
      defaultValue: 'ORDERED'
    },
    restStatus: {
      type: DataTypes.ENUM(['RECEIVED', 'BEING_MADE', 'IN_DELIVERY', 'DELIVERED']),
      defaultValue: 'RECEIVED'
    },
    quantity: {
      type: DataTypes.STRING,
      defaultValue: 1
    },
    information: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    associate: function(models) {
      Order.belongsTo(models.hospital, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Order.belongsTo(models.menu, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Order.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Order;
};
