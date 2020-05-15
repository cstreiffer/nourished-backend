'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user;

const { Parser } = require('json2csv');
const parser = new Parser();
var fs = require('fs');
const {Op} = require('sequelize');
var  nodemailer = require('nodemailer');
var config = require(path.resolve('./config/config'));
var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * List of restaurant orders itemized
 */
var sendUserList = function() {
    User.findAll({where: {
      roles: {
        [Op.contains] : ["user"]
      }
    }})
      .then(function(users) {
        // Flatten that bad boy (extract values)
        var ret = users.map((user) => {
          return {
            id: user.id,
            username: user.username,
            first_name: user.firstName,
            last_name: user.lastName,
            email_address: user.email,
            cell_phone: user.phoneNumber,
            role: user.roles,
            accountCreatedDate: user.createdAt
          }
        });
        console.log("Sending this: "  + ret);

        var data = parser.parse(ret);
        var outFile = path.resolve('private/user-export' + new Date().toISOString() + '.csv');
        fs.writeFile(outFile, data, function(err, data) {
          if(err) {
            console.log(err);
          } else {
            // To Do (send Email);
            var date = new Date().toLocaleString("en-US", {timeZone: "America/New_York"})
            var mailOptions = {
              to: ['ccstreiffer@gmail.com', 'nourished@pennmedicine.upenn.edu'],
              from: config.mailer.from,
              subject: 'Nourished User List',
              attachments: [
                {
                  filename: 'User List '+ ' - ' + date + ' Report.csv',
                  content: fs.createReadStream(outFile)
                }
              ]
            };
            smtpTransport.sendMail(mailOptions)
              .then(function(){
                // Send the response
                console.log({message: "Users successfully sent"});
              }).catch(function(err) {
                console.log(err);
              })
          }
        });
      });
};

sendUserList();
