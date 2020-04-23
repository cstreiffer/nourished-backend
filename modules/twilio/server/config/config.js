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
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'nourished', urlDest: 'home', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started:\n'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'nourish', urlDest: 'home', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started:\n'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'sign-up', urlDest: 'home', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started:\n'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'signup', urlDest: 'home', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started:\n'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'order', urlDest: 'home', token: true, messageBody: 'Time to get Nourished this week 🍜! Place your orders here:\n'},
    {id: uuid(), type: 'INCOMING', subtype: 'STATIC_FUNCTION', keyword: 'start', urlDest: 'home', token: true, messageBody: 'Welcome back to Nourished 🍜! Check out the menu and order for the week: \n'},
    {id: uuid(), type: 'INCOMING', subtype: 'STATIC_FUNCTION', keyword: 'DEFAULT', messageBody: 'Sorry, we don’t recognize your request. If you’re trying to sign-up for Nourished, click here: https://nourished.uphs.upenn.edu. If you’re trying to place an order, text "ORDER" at any time to place an order and get Nourished! Or "STOP" to opt-out of text notifications.'},
    {id: uuid(), type: 'OUTGOING', subtype: 'WEEKLY_MENU', token: true, messageBody: 'Don’t forget to check out what\'s to eat on Nourished this week! You can order ahead of time or as you go, but orders close 3 hours before the indicated delivery time. If you\'re not ready to place your order now, text "ORDER" at any time to place an order and get Nourished! Check out the menu and order for the week 🍜: '},
    {id: uuid(), type: 'OUTGOING', subtype: 'DAILY_ORDER', messageBody: 'Your %s from %s has been delivered! You can pick-up your order now at the %s. Enjoy! 🍴'},
    {id: uuid(), type: 'OUTGOING', subtype: 'SIGNUP_NOTIFY_USER', messageBody: 'You\'re all signed up and ready to get Nourished! Nourished is a quick and easy way to safely order delicious, affordable food from local restaurants. The weekly menu is constantly updated so that you can see a week at a time and you can order anytime by texting \'ORDER\' or visiting https://nourished.uphs.upenn.edu. All meals that you order will be delivered to your work place throughout the week, which you specify on every order. You can order all your meals for the week at once or order as you go throughout the week. Enjoy!'},
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
