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
      type: DataTypes.ENUM(['ORDERED', 'NOT_DELIVERED', 'WRONG_DELIVERY', 'COMPLETE', 'ERROR']),
      defaultValue: 'ORDERED'
    },
    restStatus: {
      type: DataTypes.ENUM(['RECEIVED', 'PROCESSING', 'IN_DELIVERY', 'COMPLETE', 'ERROR']),
      defaultValue: 'RECEIVED'
    },
    payStatus: {
      type: DataTypes.ENUM(['PENDING', 'COMPLETE', 'REFUNDED', 'ERROR']),
      defaultValue: 'PENDING'  
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    information: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    associate: function(models) {
      Order.belongsTo(models.menu, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Order.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Order;
};
