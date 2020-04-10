'use strict';

/**
 * Hospital Model
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

/**
 * A validation function for phone numbers
 */
var validatePhoneNumber = function(phoneNumber) {
  if(phoneNumber && !phoneNumber.match(/^[2-9]\d{2}-\d{3}-\d{4}$|^[2-9]\d{9}$/)) {
    throw new Error('Invalid phone number');
  }
}

/**
 * A validation function for phone numbers
 */
var validateEmail = function(email) {
  console.log("Validating the email");
  if(email && !email.match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)) {
    throw new Error('Invalid email address');
  }
}

module.exports = function(sequelize, DataTypes) {
  var Hospital = sequelize.define('hospital', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validationWrapper("Hospital Name")
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validatePhoneNumber
      }
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
      defaultValue: '',
      validate: {
        isValid: validationWrapper("Street Address")
      }
    },
    zip: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validationWrapper("Zip Code")
      }
    },
    city: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validationWrapper("City")
      }
    },
    state: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validationWrapper("State")
      }
    },
    dropoffLocation: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validationWrapper("Dropoff Location")
      }
    },
    dropoffInfo: {
      type: DataTypes.STRING,
      defaultValue: ''
    }
  });

  return Hospital;
};
