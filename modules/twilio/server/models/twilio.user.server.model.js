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
  var TwilioUser = sequelize.define('twiliouser', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      default: "ACTIVE"
    },
  }, {
    associate: function(models) {
      TwilioUser.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return TwilioUser;
};
