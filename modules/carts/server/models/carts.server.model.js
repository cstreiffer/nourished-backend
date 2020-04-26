'use strict';

/**
 * Cart Model
 */

var 
  Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  var Cart = sequelize.define('cart', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    associate: function(models) {
      Cart.belongsTo(models.menu, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
      Cart.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Cart;
};
