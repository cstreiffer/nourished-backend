'use strict';

var 
  _ = require('lodash'),
  uuid = require('uuid/v4'),
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
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
    {id: uuid(), type: 'INCOMING', subtype: 'STATIC_FUNCTION', keyword: 'DEFAULT', messageBody: 'Invalid keyword. Please respond with one of [SIGNUP, ORDER, MENU, START, STOP]. Or contact Nourished for more info!'},
    {id: uuid(), type: 'OUTGOING', subtype: 'WEEKLY_MENU', urlDest: 'menu', token: true, messageBody: 'Please find the menu for the upcoming week: '},
    {id: uuid(), type: 'OUTGOING', subtype: 'DAILY_ORDER', messageBody: 'Please find the menu for the upcoming week: '},
    {id: uuid(), type: 'OUTGOING', subtype: 'SIGNUP_NOTIFY_DEFAULT', messageBody: 'You\'re all signed up and ready to get Nourished! Nourished is a quick and easy way to safely order delicious, affordable food from local restaurants. The weekly menu is constantly updated so that you can see a week at a time and you can order anytime by texting \'ORDER\' or visiting https://nourished.uphs.upenn.edu. All meals that you order will be delivered to your work place throughout the week, which you specify on every order. You can order all your meals for the week at once or order as you go throughout the week. Enjoy!'},
    {id: uuid(), type: 'OUTGOING', subtype: 'SIGNUP_NOTIFY_USER', messageBody: 'You\'re all signed up and ready to get Nourished! Nourished is a quick and easy way to safely order delicious, affordable food from local restaurants. The weekly menu is constantly updated so that you can see a week at a time and you can order anytime by texting \'ORDER\' or visiting https://nourished.uphs.upenn.edu. All meals that you order will be delivered to your work place throughout the week, which you specify on every order. You can order all your meals for the week at once or order as you go throughout the week. Enjoy!'},
    {id: uuid(), type: 'OUTGOING', subtype: 'SIGNUP_NOTIFY_REST', messageBody: 'You\'re all signed up and ready to user Nourished! Nourished is a quick and easy way to safely order delicious, affordable food from local restaurants. The weekly menu is constantly updated so that you can see a week at a time and you can order anytime by texting \'ORDER\' or visiting https://nourished.uphs.upenn.edu. All meals that you order will be delivered to your work place throughout the week, which you specify on every order. You can order all your meals for the week at once or order as you go throughout the week. Enjoy!'},
  ];

module.exports = function(app, db){

  if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  TwilioMessage.destroy({where: {}})
      .then(() => {
        TwilioMessage.bulkCreate(twilioMessages, {validate: true})
          .then((messages) => {
            console.log("Seeded twilio message responses");
          }).catch((err) => {
            console.log(err);
            console.log("Error seeding twilio message responses");
          });
      });
  }
};
