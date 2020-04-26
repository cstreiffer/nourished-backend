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
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userStatus: {
      type: DataTypes.ENUM(['ORDERED', 'NOT_DELIVERED', 'WRONG_DELIVERY', 'COMPLETE', 'CANCELLED', 'ERROR']),
      defaultValue: 'ORDERED'
    },
    restStatus: {
      type: DataTypes.ENUM(['RECEIVED', 'PROCESSING', 'IN_DELIVERY', 'COMPLETE', 'CHANGED', 'ERROR']),
      defaultValue: 'RECEIVED'
    },
    payStatus: {
      type: DataTypes.ENUM(['PENDING', 'COMPLETE', 'CANCELLED', 'REFUNDED', 'ERROR']),
      defaultValue: 'PENDING'  
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 5.00
    },
    total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    information: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
  }, {
    associate: function(models) {
      Order.belongsTo(models.restaurant, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Order.belongsTo(models.hospital, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
      Order.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Order;
};
