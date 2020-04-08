'use strict';

/**
 * Module dependencies.
 */
var app;

process.env.NODE_ENV = 'test';

var 
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  express = require(path.resolve('./config/lib/express'));

var app = express.init(sequelize);

app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});

module.exports = app;

// app.init(function() {
//   console.log('Initialized test automation');
// });

module.exports = app;