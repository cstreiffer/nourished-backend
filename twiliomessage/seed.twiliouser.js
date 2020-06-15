"use strict";

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var 
  path = require('path'),
  uuid = require('uuid/v4'),
  config = require(path.resolve('./config/config')),
  twilio = require(path.resolve('./config/lib/twilio')),
  async = require('async'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user,
  TwilioUser = db.twiliouser;


var seedUsers = async function() {

  let userBlockedList = new Set(require('./user_blocked_list.json').map(user => user.id))
  let users = await User.findAll({})

  var userPrefs = users.map(user => {
    if (userBlockedList.has(user.id)) {
      return {
        id: uuid(),
        userId: user.id,
        settings: ['NONE'],
        status: 'DISABLED'
      }
    } else {
      return {
        id: uuid(),
        userId: user.id,
        settings: ['ALL'],
        status: 'ACTIVE'
      }
    }
  })

  let result = await TwilioUser.bulkCreate(userPrefs)

  console.log(result)

}

seedUsers()