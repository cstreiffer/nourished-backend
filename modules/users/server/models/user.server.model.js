'use strict';

/**
 * User Model
 */

var crypto = require('crypto'),
  Sequelize = require('sequelize'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  owasp = require('owasp-password-strength-test');

owasp.config(config.shared.owasp);

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
 * A Validation function for local strategy password 
 */
var validateLocalStrategyPassword = function(password) {
  var result = owasp.test(password);
  if (result.errors.length) {
    throw new Error('Password not strong enough');
  }
  if ((password && password.length > 6) === false) {
    throw new Error('One field is missing');
  }
};

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('user', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validationWrapper("First Name")
      }
    },
    lastName: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    phoneNumber: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validationWrapper("Phone Number")
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: {
          args: true,
          msg: 'Email address already in use!'
      },
      validate: {
        isEmail: {
            msg: 'Please fill a valid email address'
        }
      }
    },
    roles: {
      type: DataTypes.JSON,
      defaultValue: ["user"],
      isArray: true
    },
    hashedPassword: {
      type: DataTypes.STRING,
      default: '',
      validate: {
        isValid: validationWrapper("Password")
      }
    },
    salt: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.BIGINT
  });
  // }, {
  //   associate: function(models) {
  //     User.hasMany(models.restaurant);
  //     User.hasMany(models.order);
  //   }
  // });

  User.prototype.makeSalt = function() {
    return crypto.randomBytes(16).toString('base64');
  };

  User.prototype.authenticate = function(plainText) {
    return this.encryptPassword(plainText, this.salt) === this.hashedPassword;
  };

  User.prototype.encryptPassword = function(password, salt) {
    if (salt && password) {
      return crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
    } else {
      return password;
    }
  };
  
  return User;
};
