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
  var TwilioMessage = sequelize.define('twiliomessage', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'INCOMING',
    },
    subtype: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    urlDest: {
      type: DataTypes.JSON,
      defaultValue: '',
    },
    token : {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    keyword: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    messageBody: {
      type: DataTypes.TEXT,
      defaultValue: ''
    }
  });

  return TwilioMessage;
};
