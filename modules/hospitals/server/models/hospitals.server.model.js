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
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: '',
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
