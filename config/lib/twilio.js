'use strict';

var
  path = require('path'),
  config = require(path.resolve('./config/config'));

const twilio = require('twilio')(config.twilio.accountId, config.twilio.authToken);

module.exports = twilio;