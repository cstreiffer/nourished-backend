'use strict';

/**
 * Restaurant Model
 */

var 
  Sequelize = require('sequelize');

/**
 * A Validation function for local strategy properties
 */
var validationWrapper = function(name) {
  var validateLocalStrategyProperty = function(property) {
    var msg = 'Field cannot be blank: ' + name;
    if (property.length === 0) {
      throw new Error(msg);
    }
  };
  return validateLocalStrategyProperty;
};

var validatePhoneNumber = function(phoneNumber) {
  if(!phoneNumber || !phoneNumber.match(/^[2-9]\d{2}-\d{3}-\d{4}$|^[2-9]\d{9}$/)) {
    throw new Error('Invalid phone number');
  }
}

/**
 * A validation function for phone numbers
 */
var validateEmail = function(email) {
  if(email && !email.match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)) {
    throw new Error('Invalid email address');
  }
}


module.exports = function(sequelize, DataTypes) {
  var Restaurant = sequelize.define('restaurant', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isValid: validationWrapper("Name")
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isValid: validatePhoneNumber
      }
    },
    description: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validateEmail
      }
    },
    streetAddress: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    zip: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    city: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    state: {
      type: DataTypes.STRING,
      defaultValue: ''
    }
  }, {
    associate: function(models) {
      Restaurant.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Restaurant;
};
