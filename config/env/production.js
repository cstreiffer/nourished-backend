'use strict';

module.exports = {
  app: {
    title: 'Nourished Production Environment',
    webURL: 'https://nourished.uphs.upenn.edu/',
    restURL: 'https://nourished.uphs.upenn.edu/api/'
  },
  secure: {
    ssl: Boolean(process.env.ssl) || false,
    privateKey: './config/sslcerts/key.pem',
    certificate: './config/sslcerts/cert.pem'
  },
  port: process.env.PORT || 8443,
  db: {
    name: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_DIALECT || "postgres", //mysql, postgres, sqlite3,...
    enableSequelizeLog: process.env.DB_LOG || false,
    ssl: process.env.DB_SSL || false,
    sync: process.env.DB_SYNC || false //Synchronizing any model changes with database
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      stream: 'access.log'
    }
  },
  mailer: {
    errorEmails: ['christopher.streiffer@pennmedicine.upenn.edu', 'nourished@pennmedicine.upenn.edu'],
    email: process.env.MAILER_EMAIL || "nourished@pennmedicine.upenn.edu",
    from: process.env.MAILER_FROM || 'Nourished <nourished@pennmedicine.upenn.edu>',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER,
      auth: {
        user: process.env.MAILER_EMAIL_ID,
        pass: process.env.MAILER_PASSWORD
      }
    }
  },
  cron: {
    twilo: {
      weeklyUpdate: '0 13 * * SUN',
      dailyUpdate: '*/30 9,10,11,15,16,17 * * *',
      timezone: 'America/New_York'
    },
    restaurant: {     
      dailyUpdate: "*/30 9,15 * * *",
      timezone: "America/New_York",
    },
  },
  stripe: {
    pubKey: process.env.STRIPE_PUBLISHABLE_KEY,
    // DO NOT COMMIT REAL SECRETS TO THIS FILE
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecretKey: process.env.STRIPE_WEBHOOK_SECRET
  },
  twilio: {
    accountId: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  }
};
