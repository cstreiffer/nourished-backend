'use strict';

/**
 * Module dependencies.
 */
var 
  _ = require('lodash'),
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  Hospital = db.hospital;

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
    Hospital.findAll({where: {}
    })
      .then(function(hospitals) {
        // Flatten that bad boy (extract values)
        var ret = hospitals.map((hospital) => {
          return {
            id: hospital.id,
            hospName: hospital.name,
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
              to: ['ccstreiffer@gmail.com'],
              from: config.mailer.from,
              subject: 'Nourished Hospital List',
              attachments: [
                {
                  filename: 'Hospital List '+ ' - ' + date + ' Report.csv',
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
