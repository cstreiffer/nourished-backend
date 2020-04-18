'use strict';

/**
 * Module dependencies.
 */
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var app = require('./config/lib/app');
var server = app.start();