'use strict';

/**
 * RestaurantEmail Model
 */

var 
  Sequelize = require('sequelize');

/**
 * A validation function for phone numbers
 */
var validateEmail = function(email) {
  if(email && !email.match(/^([a-zA-Z0-9_+\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)) {
    throw new Error('Invalid email address');
  }
}

module.exports = function(sequelize, DataTypes) {
  var RestaurantEmail = sequelize.define('restaurantemail', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validateEmail
      }
    },
    notify: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    associate: function(models) {
      RestaurantEmail.belongsTo(models.restaurant, { foreignKey: { allowNull: true }, onDelete: 'CASCADE' });
    }
  });

  return RestaurantEmail;
};
