'use strict';

/**
 * Module dependencies.
 */
var 
  passport = require('passport'),
  adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function(app) {
  // User route registration first. Ref: #713
  //require('./user.server.routes.js')(app);

  // app.route('/api/admin/user', passport.authenticate('jwt', {session: false}))
  //   .get(adminPolicy.isAllowed, admin.list);


  // app.route('/api/admin/user/:userId', passport.authenticate('jwt', {session: false}))
  //   .get(adminPolicy.isAllowed, admin.read)
  //   .put(adminPolicy.isAllowed, admin.update)
  //   .delete(adminPolicy.isAllowed, admin.delete);

  // app.param('userId', admin.userByID);
};