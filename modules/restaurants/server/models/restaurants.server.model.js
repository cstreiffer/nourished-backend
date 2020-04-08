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

module.exports = function(sequelize, DataTypes) {
  var Restaurant = sequelize.define('restaurant', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validationWrapper("Name")
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validationWrapper("Phone Number")
      },
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isEmail: {
            msg: validationWrapper("Email Address")
        }
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
    }
  }, {
    associate: function(models) {
      Restaurant.belongsTo(models.user, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  return Restaurant;
};
