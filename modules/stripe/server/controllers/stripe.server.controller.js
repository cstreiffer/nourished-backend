'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend stripe's controller
 */
module.exports = _.extend(
  require('./stripe.checkout.server.controller'),
  require('./stripe.model.server.controller')
);