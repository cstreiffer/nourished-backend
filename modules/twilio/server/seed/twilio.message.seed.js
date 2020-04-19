'use strict';

var 
  _ = require('lodash'),
  uuid = require('uuid/v4'),
  path = require('path'),
  express = require(path.resolve('./config/lib/express')),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  app = express.init(sequelize),
  async = require('async'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  TwilioMessage = db.twiliomessage;

// Let's set up the data we need to pass to the login method
var 
  twilioMessages = [
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'SIGNUP', urlDest: 'signup', messageBody: 'Welcome to Nourished! Please signup at the following link: '},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'ORDER', urlDest: 'menu', token: true, messageBody: 'Welcome to Nourished! Please signup at the following link: '},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'MENU', urlDest: 'menu', messageBody: 'Welcome to Nourished! Please signup at the following link: '},
    {id: uuid(), type: 'INCOMING', subtype: 'STATIC_FUNCTION', keyword: 'START', messageBody: 'Welcome to Nourished notifications! Text STOP to unsubscribe, ORDER for menu, etc.'},
    {id: uuid(), type: 'INCOMING', subtype: 'STATIC_FUNCTION', keyword: 'STOP', messageBody: 'Thank you for using Nourished notifications! Text START to resubscribe to notifications'},
    {id: uuid(), type: 'INCOMING', subtype: 'STATIC_FUNCTION', keyword: 'DEFAULT', messageBody: 'Invalid keyword. Please respond with one of [SIGNUP, ORDER, MENU, START, STOP]. Or contact Nourished for more info!'},
    {id: uuid(), type: 'OUTGOING', subtype: 'WEEKLY_MENU', urlDest: 'menu', token: true, messageBody: 'Please find the menu for the upcoming week: '},
    {id: uuid(), type: 'OUTGOING', subtype: 'DAILY_ORDER', messageBody: 'Please find the menu for the upcoming week: '},
  ];

async.waterfall([
  function(done) {
    TwilioMessage.destroy({where: {}})
        .then(() => {
          TwilioMessage.bulkCreate(twilioMessages, {validate: true})
            .then((messages) => {
              done();
            })
        });
  },
function(done) {
  process.exit(0);
}
]);
