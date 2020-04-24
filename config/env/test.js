'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  app: {
    title: defaultEnvConfig.app.title + ' - Test Environment'
  },
  port: process.env.PORT || 3001,
  db: {
    name: process.env.DB_NAME || "nourished_test",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    dialect: process.env.DB_DIALECT || "postgres", //mysql, postgres, sqlite3,...
    enableSequelizeLog: process.env.DB_LOG || false,
    ssl: process.env.DB_SSL || false,
    sync: process.env.DB_SYNC || true //Synchronizing any model changes with database
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    database: process.env.REDIS_DATABASE || 0,
    password: process.env.REDIS_PASSWORD || "",
  },
  mailer: {
    errorEmails: ['christopher.streiffer@pennmedicine.upenn.edu', 'ccstreiffer@gmail.com'],
    email: process.env.MAILER_EMAIL || "nourished@pennmedicine.upenn.edu",
    from: process.env.MAILER_FROM || 'Nourished <nourished@pennmedicine.upenn.edu>',
    options: {
      host: process.env.MAILER_HOST || '',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAILER_EMAIL_ID || '',
        pass: process.env.MAILER_PASSWORD || ''
      }
    }
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
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+19893738621'
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@test.com',
    username: process.env.ADMIN_USERNAME || 'admin',
    phoneNumber: process.env.ADMIN_PHONENUMBER || '4444444444',
    password: process.env.ADMIN_PASSWORD || 'password',
  }
};
