'use strict';

var 
  _ = require('lodash'),
  uuid = require('uuid/v4'),
  path = require('path'),
  fs = require('fs'),
  jwt = require('jsonwebtoken'),
  express = require(path.resolve('./config/lib/express')),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  config = require(path.resolve('./config/config')),
  twilio = require(path.resolve('./config/lib/twilio')),
  app = express.init(sequelize),
  config = require(path.resolve('./config/config')),
  async = require('async'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user,
  TwilioMessage = db.twiliomessage,
  cron = require('node-cron'),
  TinyUrl = require('tinyurl');

const {Op} = require('sequelize');
const jwtSecret = fs.readFileSync(path.resolve(config.jwt.privateKey), 'utf8');

var sendMessage = function(tm, user, url) {
  console.log(user[1]);
  var to = '+1' + user[0].phoneNumber;
  var from = config.twilio.phoneNumber;
  return twilio.messages
    .create({
       body: tm.messageBody + user[1],
       from: from,
       to: to
     });
}

var generateURL = function(user) {
  // Generate the JWT/MagicLink for the user
  var url = config.app.webURL + '?sign_in=' + jwt.sign(user.toJSON(), jwtSecret, config.jwt.signOptions);
  console.log(url);
  return TinyUrl.shorten(url);
}

cron.schedule(config.cronConfigs.twilioWeeklyUpdate, () => {
  cronTask();
});


var cronTask = function() {
  async.waterfall([
    function(done) {
      User.findAll({
        where: {
          phoneNumber: {
            [Op.ne]: ''
          },
          roles: {
            [Op.contains] : ["user"]
          }
        }
      }).then(function(users) {
        done(null, users);
      }).catch(function(err) {
        done(err);
      });
    },
    function(users, done) {
      Promise.all(users.map((user) => generateURL(user)))
        .then(function(urls) {
          done(null, users, urls)
        }).catch(function(err) {
          done(err);
        })
    },
    function(users, urls, done) {
      var retMod = users.map(function(e, i) {
        return [e, urls[i]];
      });
      done(null, retMod)
    },
    function(users, done) {
      TwilioMessage.findOne({
        where: {
          subtype: 'WEEKLY_MENU',
        }
      }).then(function(tm) {
        done(null, users, tm);
      }).catch(function(err) {
        done(err);
      });
    },
    function(users, tm, done) {
      Promise.all(users.map((user) => sendMessage(tm, user)))
        .then(function(messageIds) {
          done(null);
        }).catch(function(err) {
          done(err);
        });
    }], 
    function(err){
      if(err) {
        console.log(err);
      }
    }
  );
}
