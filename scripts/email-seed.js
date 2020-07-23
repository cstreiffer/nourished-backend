"use strict";

var
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  { fromString, uuid } = require('uuidv4'),
  async = require('async'),
  RestaurantEmail = db.restaurantemail;

var genRestEmail = function(email, restId) {
  return {
    id: uuid(),
    email: email,
    restaurantId: restId
  }
}

var buildRestEmail = async function(creds) {
  var restemail = RestaurantEmail.build(creds);
  try{
    var emailSaved = await restemail.save();
    return emailSaved;
  } catch(e) {
    console.log(e);
  }
}

var run = async function() {
  // Load in the users to seed
  var users = require(path.resolve('./scripts/email-users.json'));

  // Iterate through and create the users and instantiate their alias identity
  users.forEach(async function(user) {
    console.log("Building new user...");
    try {

      // Create the user alias
      let emailUser = genRestEmail(
          user.email,
          user.restaurantId
        );
      buildRestEmail(emailUser);
      console.log("User Alias Saved: %j", emailUser);
    } catch(err) {
      console.log(err);
    }
  });
}

run();
