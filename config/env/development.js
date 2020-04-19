'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment',
    webURL: 'https://nourished-dev.uphs.upenn.edu/',
    restURL: 'https://nourished-dev.uphs.upenn.edu/api/'
  },
  secure: {
    ssl: Boolean(process.env.ssl) || false,
    privateKey: './config/sslcerts/key.pem',
    certificate: './config/sslcerts/cert.pem'
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
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    database: process.env.REDIS_DATABASE || 0,
    password: process.env.REDIS_PASSWORD || "",
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      //stream: 'access.log'
    }
  },
  mailer: {
    from: process.env.MAILER_FROM || 'Nourished',
    options: {
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'penn.chci.nourished@gmail.com',
        pass: process.env.MAILER_PASSWORD || ''
      }
    }
  },
  livereload: true,
  stripe: {
    // fill this in from https://dashboard.stripe.com/test/apikeys
    pubKey: process.env.STRIPE_PUBLIC || 'pk_12345',
    // DO NOT COMMIT REAL SECRETS TO THIS FILE
    secretKey: process.env.STRIPE_SECRET || 'sk_12345',
    // fill this in by configuring the webhook url https://devserver.example.com/api/stripe/webhook
    // at https://dashboard.stripe.com/test/webhooks
    webhookSecretKey: process.env.STRIPE_WEBHOOK || 'whsec_1234'
  },
  twilio: {
    secretKey: process.env.TWILIO_ACCOUNT_SID || 'sk_12345',
    webhookSecretKey: process.env.TWILIO_AUTH_TOKEN || 'whsec_1234',
    phoneNumber: '+19893738621'
  }
};
