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
    {id: uuid(), type: 'STRIPE_RESPONSE', subtype: 'STRIPE_RESPONSE_MESSAGE', keyword: 'CREATED', messageBody: 'Your Nourished order is pending. If you do not receive a confirmation text shortly, please message 203-962-4261 to help make sure your order gets delivered!'},
    {id: uuid(), type: 'STRIPE_RESPONSE', subtype: 'STRIPE_RESPONSE_MESSAGE', keyword: 'SUCCEEDED', messageBody: 'Thanks for your Nourished order! 🎉 Your completed order will appear in the Orders dashboard. You\'ll receive a text at pick-up time for your order(s), yum! 🍜'},
    {id: uuid(), type: 'STRIPE_RESPONSE', subtype: 'STRIPE_RESPONSE_MESSAGE', keyword: 'FAILED', messageBody: 'Oops! There was an error and your card was declined. Please place your order again and ensure that you get a confirmation text!'},
    {id: uuid(), type: 'STRIPE_RESPONSE', subtype: 'STRIPE_RESPONSE_MESSAGE', keyword: 'CANCELLED', messageBody: 'Your refund for your order is on its way! It is being processed and should appear on account in 3-5 business days. Please check your email for a complete receipt.'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'nourished', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started: https://nourished.uphs.upenn.edu/sign-up/'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'nourish', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started: https://nourished.uphs.upenn.edu/sign-up/'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'sign-up', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started: https://nourished.uphs.upenn.edu/sign-up/'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'signup', messageBody: 'Thanks for your interest in Nourished 🍜! Click here to create your account and get started: https://nourished.uphs.upenn.edu/sign-up/'},
    {id: uuid(), type: 'INCOMING', subtype: 'RESPONSE_MESSAGE', keyword: 'order', urlDest: 'home', token: true, messageBody: 'Time to get Nourished this week 🍜! Place your orders here: '},
    {id: uuid(), type: 'INCOMING', subtype: 'STATIC_FUNCTION', keyword: 'start', urlDest: 'home', token: true, messageBody: 'Welcome back to Nourished 🍜! Check out the menu and order for the week: '},
    {id: uuid(), type: 'INCOMING', subtype: 'STATIC_FUNCTION', keyword: 'DEFAULT', messageBody: 'Sorry, we don’t recognize your request. If you’re trying to sign-up for Nourished, click here: https://nourished.uphs.upenn.edu. If you’re trying to place an order, text "ORDER" at any time to place an order and get Nourished! Or "STOP" to opt-out of text notifications.'},
    {id: uuid(), type: 'OUTGOING', subtype: 'WEEKLY_MENU', token: true, messageBody: 'Don’t forget to check out what\'s to eat on Nourished this week! You can order ahead of time or as you go, but orders close 3 hours before the indicated delivery time. If you\'re not ready to place your order now, text "ORDER" at any time to place an order and get Nourished! Check out the menu and order for the week 🍜: '},
    {id: uuid(), type: 'OUTGOING', subtype: 'DAILY_ORDER', messageBody: 'Your meal from %s has been delivered! You can pick-up your order now at the following location: %s. If you have any issues, please contact us at %s. Please be advised that due to food safety concerns, your meal should be consumed or refrigerated by 3 hours after delivery! Enjoy! 🍴'},
    {id: uuid(), type: 'OUTGOING', subtype: 'SIGNUP_NOTIFY_USER', messageBody: 'You\'re all signed up and ready to get Nourished! Nourished is a quick and easy way to safely order delicious, affordable food from local restaurants. The weekly menu is constantly updated so that you can see a week at a time and you can order anytime by texting \'ORDER\' or visiting https://nourished.uphs.upenn.edu. All meals that you order will be delivered to your work place throughout the week, which you specify on every order. You can order all your meals for the week at once or order as you go throughout the week. Enjoy!'},
    {id: uuid(), type: 'OUTGOING', subtype: 'DAILY_PRENOTIFY', messageBody: 'Your meal from %s will be delivered to the %s at %s! You will be able to pick-up your order at the %s. Enjoy!🍴'},

    // Dinner Default
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT', messageBody: 'Don\'t forget to place your Nourished order today! Featuring meals from %s. Enjoy!🍴'},
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT', messageBody: "Don't feel like cooking tonight? Make sure to order by 3pm so that you get a Nourished meal to eat at work or take home! We are serving your favorites from %s!"},
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT', messageBody: "Nourished dinner delivery is in about 3 hours, which means you can order to eat at work or take home tonight! Make sure to order by 3pm from %s! "},
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT', messageBody: "Don't forget that last call for dinner orders is 3pm! We will be delivering at 5pm so that you can order to eat on shift or to take home with you for you and others! We are serving your favorites from %s."},
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT', messageBody: "Last call for Nourished dinner orders! We are serving your favorites from %s. Order by 3pm!"},
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT', messageBody: "For dinner, we have some of our favorite dishes and delicious dinners to share from %s! Don't forget to place your dinner orders by 3pm!"},
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT', messageBody: "Hungry? We're ready for dinner already. We have favorites from %s. Make sure to order by 3pm to get Nourished!"},
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT', messageBody: "Lookout for dinner! We have some delicious menus from %s for tonight! So make sure to order by 3pm to get Nourished!"},
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT', messageBody: "Nourished dinner is approaching! Serving your favorites from %s. Don't forget to order by 3pm! "},
    // Monday
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT_1', messageBody: "Happy Monday! Nourished has your favorites from %s for dinner today at 5/5:15pm. Make sure to get your order in by 3pm!"},
    // Tuesday
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT_2', messageBody: "Happy Tuesday! Nourished has your favorites from %s for dinner today at 5/5:15pm. Make sure to get your order in by 3pm!"},
    // Wednesday
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT_3', messageBody: "Happy Wednesday! Nourished has your favorites from %s for dinner today at 5/5:15pm. Make sure to get your order in by 3pm!"},
    // Thursday
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT_4', messageBody: "Happy Thursday! Nourished has your favorites from %s for dinner today at 5/5:15pm. Make sure to get your order in by 3pm!"},
    // Friday
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT_5', messageBody: "Happy Friday! Nourished has your favorites from %s for dinner today at 5/5:15pm. Make sure to get your order in by 3pm!"},
    {id: uuid(), type: 'DAILY_NOTIFY_DINNER', subtype: 'DEFAULT_5', messageBody: "Friday, Friday, gotta get fed on Friday! If you need food at work or to take home because it's been a long week, Nourished has you covered with your favorites from %s! Make sure to order by 3pm."},
    // Lunch Default
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT', messageBody: "Last call for lunch is 10am! We have some of our favorites from %s! Don't miss out on delicious lunch options! "},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT', messageBody: "Guess what? You have another hour or so to order Nourished lunches, so get your order in! Last call for lunch is 10am! 🎉 We have some delicious options from %s, so make sure to get your order in!"},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT', messageBody: "Meals from %s are on the menu for lunch today! Make sure to order by 10am!"},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT', messageBody: "Last call for Nourished lunch orders is 10am! We have a bunch of our favorites from %s, so don't miss out! "},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT', messageBody: "Hungry? We're dreaming about lunch already! We have favorites from %s. Make sure to order by 10am to get Nourished!"},
    // Monday
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_1', messageBody: "We're back for lunch and dinner today and can't wait to deliver deliciousness straight to you! Make sure to order by 10am for favorites from %s!"},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_1', messageBody: "Happy Monday! Nourished has your favorites from %s for lunch today at 12/12:15pm. Make sure to get your order in by 10am!"},
    // Tuesday
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_2', messageBody: "Happy Tuesday! Nourished has your favorites from %s for lunch today at 12/12:15pm. Make sure to get your order in by 10am!"},
    // Wednesday
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_3', messageBody: "Happy Wednesday! Nourished has your favorites from %s for lunch today at 12/12:15pm. Make sure to get your order in by 10am!"},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_3', messageBody: "Happy hump day! We think it's a perfect day to get delicious, local delivered for lunch and dinner. We have delicious options from %s. Don't forget to order by 10am!"},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_3', messageBody: "Happy Hump Day! We might be halfway through the week but we're just getting started with the delicious Nourished meals this week. Serving our favorites from %s. Make sure to get your lunch order in by 10am!"},
    // Thursday
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_4', messageBody: "Happy Thursday! Nourished has your favorites from %s for lunch today at 12/12:15pm. Make sure to get your order in by 10am! "},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_4', messageBody: "You know what day it is - it's Treat Yourself Thursday! Make sure that you place your Nourished lunch orders by 10am to not miss out on some of our favorites from %s!"},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_4', messageBody: "It's that time of the week again...Treat Yourself Thursday! Serving lunches from %s that are 100% delicious. Make sure to get your lunch order in by 10am!"},
    // Friday
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_5', messageBody: "Happy Friday! We have some of your favorites from %s so make sure to order by 10am!"},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_5', messageBody: "It's Friday! 🎉 To celebrate our favorite day we're serving your favorites from %s! Make sure to get yours by 10am!"},
    // Saturday
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_6', messageBody: "Happy Saturday! Nourished has your favorites from %s for lunch today at 12/12:15pm. Make sure to get your order in by 10am!"},
    {id: uuid(), type: 'DAILY_NOTIFY_LUNCH', subtype: 'DEFAULT_6', messageBody: "It's the weekend and we have delicious food from %s! Order by 10am to make sure you get Nourished!"}
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
