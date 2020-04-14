'use strict';

/**
 * Stripe Model
 *
 * TO DO
 * - Add return value(s) received from stripe to schema
 *
 */

var 
  Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  var Stripe = sequelize.define('stripe', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      defaultValue: ''
    }
  }, {
    associate: function(models) {
      Stripe.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Stripe;
};
