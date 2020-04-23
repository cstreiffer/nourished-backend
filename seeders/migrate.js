
process.env.NODE_ENV = 'test';

var 
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect'));