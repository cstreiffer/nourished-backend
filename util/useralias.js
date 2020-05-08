'use strict';

var
  _ = require('lodash'),
  path = require('path'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  UserAlias = db.useralias;

module.exports.findAlias = function(req, res, next) {
  var user = req.user.toJSON();
  if(user.roles.includes('alias')) {
    UserAlias.findOne({
      where:{
        userId: user.id
      }
    }).then(function(useralias) {
      if(!useralias) {
        return res.status(400).send({message: "No user alias exists"});
      } else {
        user.originalId = req.user.id;
        user.originalRoles = req.user.roles;
        user.id = useralias.aliasId;
        user.roles = _.concat(req.user.roles, useralias.aliasRoles);;
        req.user = user;
        return next();
      }
    }).catch(function(err) {
      console.log(err);
      return res.status(400).send({message: err});
      // console.log(err);
    })
  } else {
    return next()
  }
}