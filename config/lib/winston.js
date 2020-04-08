"use strict";

/**
 * Created by Junaid Anwar on 5/28/15.
 */
var winston = require('winston');
let logger = winston.createLogger({
  transports: [
    new (winston.transports.Console)({
		level: 'verbose',
		prettyPrint: true,
		colorize: true,
		silent: false,
		timestamp: false
	}),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;