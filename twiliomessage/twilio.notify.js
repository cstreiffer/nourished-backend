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


// var MESSAGE_BODY = 'Hi, Nourished here with your weekly menu of delicious, local meals! Place your orders here: https://forms.gle/V9snRoQNuYbu8KCAA. Our improved platform will arrive later this week - we promise! We’re grapeful for your patience as we get it ready for you! 🍇🙂';
// var MESSAGE_BODY = 'Don\'t forget that Nourished will be at Preby today with lunch from Baology at 12pm and dinner from On Poin Bistro at 8pm! Place your orders here: https://forms.gle/V9snRoQNuYbu8KCAA';
var MESSAGE_BODY = 'Don\'t forget that Nourished will be at Presby today with lunch from Baology at 12pm and dinner from On Poin Bistro at 8pm! Place your orders for lunch by 10:30am and dinner by 6pm here:\nhttps://forms.gle/V9snRoQNuYbu8KCAA'

var sendMessage = function(user, textBody) {
  var to = '+' + user.cell_phone;
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
  {cell_phone: '15046137325'},
]

// Load in the users
async.waterfall([
  // Construct the users
  function(done) {
    // done(null, USERS);
    csvtojsonV2()
      .fromFile('twiliomessage/users.csv')
      .then(function(users) {
        users = users.concat(USERS);
        done(null, users);
        // console.log(users);
      }).catch(function(err) {
        console.log(err);
        done(err);
      });
  },
  function(users, done) {
    // console.log(users[users.length-1]);
    done(null);
      Promise.all(users.map((user) => sendMessage(user, MESSAGE_BODY).catch(e => console.log(e, JSON.stringify(user)))))
        .then(function(messageIds) {
          done(null);
        }).catch(function(err) {
          done(err);
        });
  }
  ], 
  function(err){
    if(err) {
      // console.log(err);
    }
  }
);