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


var MESSAGE_BODY = "TEST"; // TO DO: Fill this in before sending

var sendMessage = async function(user, textBody) {
  console.log(user.username, textBody);
  var to = '+1' + user.cell_phone;
  var from = config.twilio.phoneNumber;
  var message = textBody;

  let ret = await twilio.messages
    .create({
       body: message,
       from: from,
       to: to
     })
  return ret;
}

var USERS = [
  {cell_phone: '5046137325'},
]

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
  msleep(n);
}

const run = async function(){

  let users = await csvtojsonV2()
      .fromFile(path.resolve('twiliomessage/users_new.csv'));

  users = users.concat(USERS);
  var i = 0;
    for (const user of users) {
      let msg;
      try {
        msg = await sendMessage(user, MESSAGE_BODY);
      } catch (err) {
        console.log("Error sending to user: " + user);
      }
      sleep(300);
    }
}

run();