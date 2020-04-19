'use strict';

/**
 * Module dependencies.
 */
var app;

process.env.NODE_ENV = 'test';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var 
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  express = require(path.resolve('./config/lib/express'));



var app = express.init(sequelize).listen(3000, () => {
    console.log(`Server started on port 3000`);
});

function stop() {
  	app.close();
}

module.exports = app;
module.exports.stop = stop;

// app.init(function() {
//   console.log('Initialized test automation');
// });

// module.exports = app;