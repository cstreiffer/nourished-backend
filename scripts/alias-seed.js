"use strict";

var
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  { fromString, uuid } = require('uuidv4'),
  async = require('async'),
  crypto = require('crypto'),
  Hospital = db.hospital,
  User = db.user,
  UserAlias = db.useralias;


// The necessary functions
var genUser = function(username, email, phoneNumber, first, last, password) {
  return {
    id: fromString(username),
    username: username,
    email: email.toLowerCase(),
    phoneNumber: phoneNumber.replace(/-|\(|\)| /g, ''),
    firstName: first,
    lastName: last,
    roles: ['alias'],
    password: password
  }
}

var genAliasUser = function(userId, aliasId) {
  return {
    id: fromString(userId+aliasId),
    userId: userId,
    aliasId: aliasId,
    aliasRoles: ['restaurant']
  }
}

var buildUser = async function(creds) {
  var user = User.build(creds);
  user.salt = user.makeSalt();
  user.hashedPassword = user.encryptPassword(creds.password, user.salt);
  user.email = user.email.toLowerCase();
  user.phoneNumber = user.phoneNumber.replace(/-|\(|\)| /g, '');
  try{
    var userSaved = await user.save();
    return userSaved;
  } catch(e) {
    console.log(e)
  }
}

var buildAliasUser = async function(creds) {
  var user = UserAlias.build(creds);
  try{
    var userSaved = await user.save();
    return userSaved;
  } catch(e) {
    console.log(e);
  }
}

var run = async function() {
  // Load in the users to seed
  var users = require(path.resolve('./scripts/alias-users.json'));

  // Iterate through and create the users and instantiate their alias identity
  users.forEach(async function(user) {
    console.log("Building new user...");
    try {
      // Save the new user
      let newUser = genUser(
          user.username,
          user.email,
          user.phoneNumber,
          user.firstName,
          user.lastName,
          user.password
        );
      let savedUser = await buildUser(newUser);
      console.log("User Saved: %j", savedUser);

      // Create the user alias
      let aliasUser = genAliasUser(
          newUser.id,
          user.aliasId
        );
      let savedAliasUser = buildAliasUser(aliasUser);
      console.log("User Alias Saved: %j", savedAliasUser);
    } catch(err) {
      console.log(err);
    }
  });
}

run();
