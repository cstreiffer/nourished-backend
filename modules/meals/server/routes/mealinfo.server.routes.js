'use strict';

/**
 * Module dependencies.
 */

var 
  mealinfo = require('../controllers/mealinfo.server.controller');

module.exports = function(app) {

  // ROUTES ---------------------------------------
  app.route('/api/mealinfo')
    .get(mealinfo.list); // (Good)

};