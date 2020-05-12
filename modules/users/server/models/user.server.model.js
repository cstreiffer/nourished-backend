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

var pr = /^[2-9]\d{2}-\d{3}-\d{4}$|^[2-9]\d{9}|\([2-9]\d{2}\)-\d{3}-\d{4}|\([2-9]\d{2}\) \d{3}-\d{4}$/;
var er = /^([a-zA-Z0-9_+\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

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
  if (!result.errors.length) {
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
  if(!phoneNumber || !phoneNumber.match(pr)) {
    throw new Error('Invalid phone number');
  }
}

/**
 * A validation function for phone numbers
 */
var validateEmail = function(email) {
  if(!email || !email.match(er)) {
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
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isValid: validateEmail
      },
      allowNull: false,
      unique: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        isValid: validatePhoneNumber
      },
      allowNull: false,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    lastName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    roles: {
      type: DataTypes.JSONB,
      defaultValue: ["user"],
      isArray: true
    },
    hashedPassword: DataTypes.STRING,
    salt: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.BIGINT,
    magicLinkToken: DataTypes.STRING,
    magicLinkExpires: DataTypes.BIGINT
  }, {
    associate: function(models) {
      User.hasOne(models.useralias);
      // User.belongsTo(models.hospital, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
    }
  });

  User.prototype.makeSalt = function() {
    return crypto.randomBytes(16).toString('base64');
  };

  User.prototype.authenticate = function(plainText) {
    return this.encryptPassword(plainText, this.salt) === this.hashedPassword;
  };

  User.prototype.encryptPassword = function(password, salt) {
    return crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
  };
  
  return User;
};
