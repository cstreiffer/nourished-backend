"use strict";

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var
  path = require('path'),
  config = require(path.resolve('./config/config')),
  sequelize = require(path.resolve('./config/lib/sequelize-connect'));

// Schedule the cron jobs
config.files.server.cron.forEach(function(configPath) {
	console.log("Scheduling the following cron tasks: " + configPath);
    require(path.resolve(configPath))();
});