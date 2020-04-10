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

/**
 * A validation function for phone numbers
 */
var validatePhoneNumber = function(phoneNumber) {
  if(!phoneNumber || !phoneNumber.match(/^[2-9]\d{2}-\d{3}-\d{4}$|^[2-9]\d{9}$/)) {
    throw new Error('Invalid phone number');
  }
}

/**
 * A validation function for phone numbers
 */
var validateEmail = function(email) {
  if(!email || !email.match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)) {
    throw new Error('Invalid email address');
  }
}

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('user', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Username already in use!"
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
          args: true,
          msg: 'Email address already in use!'
      },
      validate: {
        isValid: validateEmail
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
          args: true,
          msg: 'Phone number already in use!'
      },
      validate: {
        isValid: validatePhoneNumber
      }
    },
    firstName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    lastName: {
      type: DataTypes.STRING,
      defaultValue: ''
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
