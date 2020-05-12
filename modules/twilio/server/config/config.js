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
    // {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'DEFAULT', messageBody: 'Time to get Nourished 🍜! Click here to see the menu and place an order for Monday 4/27 - Tuesday 4/28:\n https://forms.gle/V9snRoQNuYbu8KCAA'},
    {id: uuid(), type: 'STRIPE_RESPONSE', subtype: 'STRIPE_RESPONSE_MESSAGE', keyword: 'CREATED', messageBody: 'Thanks for your Nourished order! 🎉 Your completed order will appear in the Orders dashboard unless there\'s an issue processing your payment. You\'ll receive a text at pick-up time for your order(s), yum! 🍜'},
    {id: uuid(), type: 'STRIPE_RESPONSE', subtype: 'STRIPE_RESPONSE_MESSAGE', keyword: 'FAILED', messageBody: 'Oops, there was an error with your credit card payment on your most recent order. If you\'d still like to receive this order, please try to place the order again.'},
    {id: uuid(), type: 'STRIPE_RESPONSE', subtype: 'STRIPE_RESPONSE_MESSAGE', keyword: 'CANCELLED', messageBody: 'Your refund for your order is on its way! It is being processed and should appear on account in 3-5 business days. Please check your email for a complete receipt.'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'nourished', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started: https://nourished.uphs.upenn.edu/sign-up/'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'nourish', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started: https://nourished.uphs.upenn.edu/sign-up/'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'sign-up', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started: https://nourished.uphs.upenn.edu/sign-up/'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'signup', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started: https://nourished.uphs.upenn.edu/sign-up/'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'order', urlDest: 'home', token: true, messageBody: 'Time to get Nourished this week 🍜! Place your orders here: '},
    {id: uuid(), type: 'INCOMING', subtype: 'STATIC_FUNCTION', keyword: 'start', urlDest: 'home', token: true, messageBody: 'Welcome back to Nourished 🍜! Check out the menu and order for the week: '},
    {id: uuid(), type: 'INCOMING', subtype: 'STATIC_FUNCTION', keyword: 'DEFAULT', messageBody: 'Sorry, we don’t recognize your request. If you’re trying to sign-up for Nourished, click here: https://nourished.uphs.upenn.edu. If you’re trying to place an order, text "ORDER" at any time to place an order and get Nourished! Or "STOP" to opt-out of text notifications.'},
    {id: uuid(), type: 'OUTGOING', subtype: 'WEEKLY_MENU', token: true, messageBody: 'Don’t forget to check out what\'s to eat on Nourished this week! You can order ahead of time or as you go, but orders close 3 hours before the indicated delivery time. If you\'re not ready to place your order now, text "ORDER" at any time to place an order and get Nourished! Check out the menu and order for the week 🍜: '},
    {id: uuid(), type: 'OUTGOING', subtype: 'DAILY_ORDER', messageBody: 'Your meal from %s has been delivered! You can pick-up your order now at the %s. Enjoy! 🍴'},
    {id: uuid(), type: 'OUTGOING', subtype: 'SIGNUP_NOTIFY_USER', messageBody: 'You\'re all signed up and ready to get Nourished! Nourished is a quick and easy way to safely order delicious, affordable food from local restaurants. The weekly menu is constantly updated so that you can see a week at a time and you can order anytime by texting \'ORDER\' or visiting https://nourished.uphs.upenn.edu. All meals that you order will be delivered to your work place throughout the week, which you specify on every order. You can order all your meals for the week at once or order as you go throughout the week. Enjoy!'},
    {id: uuid(), type: 'OUTGOING', subtype: 'DAILY_PRENOTIFY', messageBody: 'Your meal from %s will be delivered to the %s at %s! You will be able to pick-up your order at the %s. Enjoy!🍴'},
  ];

module.exports = function(app, db){

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
};
