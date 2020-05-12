"use strict";

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var 
  path = require('path'),
  config = require(path.resolve('./config/config')),
  twilio = require(path.resolve('./config/lib/twilio')),
  async = require('async'),
  csvtojsonV2=require("csvtojson/v2");


var MESSAGE_BODY = "Daydreaming about lunch already? We are! Last call for Nourished orders is 9am! https://nourished.uphs.upenn.edu/my-menu/"; // TO DO: Fill this in before sending

var sendMessage = function(user, textBody) {
  var to = '+1' + user.cell_phone;
  var from = config.twilio.phoneNumber;
  var message = textBody;

  return twilio.messages
    .create({
       body: message,
       from: from,
       to: to
     });
}

var USERS = [
  {cell_phone: '5046137325'},
]

// Load in the users
async.waterfall([
  // Construct the users
  function(done) {
    // done(null, USERS);
    csvtojsonV2()
      .fromFile(path.resolve('twiliomessage/users_new_2.csv'))
      .then(function(users) {
        users = users.concat(USERS);
        // console.log(users);
        done(null, users);
        // console.log(users);
      }).catch(function(err) {
        console.log(err);
        done(err);
      });
  },
  function(users, done) {
    // console.log(users[users.length-1]);
    // done(null);
      Promise.all(users.map((user) => sendMessage(user, MESSAGE_BODY).catch(e => console.log(e, JSON.stringify(user)))))
        .then(function(messageIds) {
          done(null);
        }).catch(function(err) {
          done(err);
        });
      // done(null);
  }
  ], 
  function(err){
    if(err) {
      console.log(err);
    }
  }
);