'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  app: {
    title: defaultEnvConfig.app.title + " - Development Environment",
    webURL: "https://nourished-dev.uphs.upenn.edu/",
    restURL: "https://nourished-dev.uphs.upenn.edu/api/",
  },
  secure: {
    ssl: Boolean(process.env.ssl) || false,
    privateKey: "./config/sslcerts/key.pem",
    certificate: "./config/sslcerts/cert.pem",
  },
  db: {
    name: process.env.DB_NAME || "nourished_dev",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    dialect: process.env.DB_DIALECT || "postgres", //mysql, postgres, sqlite3,...
    enableSequelizeLog: process.env.DB_LOG || false,
    ssl: process.env.DB_SSL || false,
    sync: process.env.DB_SYNC || true, //Synchronizing any model changes with database
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: "dev",
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      //stream: 'access.log'
    },
  },
  mailer: {
    errorEmails: [
      "jpatel@syncro-tech.com",
      "jpatel@syncro-tech.com",
      "jpatel@syncro-tech.com",
    ],
    email: process.env.MAILER_EMAIL || "jpatel@syncro-tech.com",
    from:
      process.env.MAILER_FROM || "Nourished <nourished@pennmedicine.upenn.edu>",
    options: {
      host: process.env.MAILER_HOST || "",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAILER_EMAIL_ID || "",
        pass: process.env.MAILER_PASSWORD || "",
      },
    },
  },
  cron: {
    restaurant: {     
      dailyUpdate: "*/30 9,15 * * *",
      timezone: "America/New_York",
    },
  },
  livereload: true,
  stripe: {
    // fill this in from https://dashboard.stripe.com/test/apikeys
    pubKey: process.env.STRIPE_PUBLISHABLE_KEY,
    // DO NOT COMMIT REAL SECRETS TO THIS FILE
    secretKey: process.env.STRIPE_SECRET_KEY,
    // fill this in by configuring the webhook url https://devserver.example.com/api/stripe/webhook
    // at https://dashboard.stripe.com/test/webhooks
    webhookSecretKey: process.env.STRIPE_WEBHOOK_SECRET,
  },
  twilio: {
    accountId: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    username: process.env.ADMIN_USERNAME,
    phoneNumber: process.env.ADMIN_PHONENUMBER,
    password: process.env.ADMIN_PASSWORD,
  },
};
