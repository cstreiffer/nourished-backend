'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
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
  app: {
    title: defaultEnvConfig.app.title + ' - Test Environment'
  },
  mailer: {
    from: process.env.MAILER_FROM || 'penn.chci.nourished@gmail.com',
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
  stripe: {
    pubKey: process.env.STRIPE_PUBLIC || 'pk_12345',
    // DO NOT COMMIT REAL SECRETS TO THIS FILE
    secretKey: process.env.STRIPE_SECRET || 'sk_12345',
    webhookSecretKey: process.env.STRIPE_WEBHOOK || 'whsec_1234'
  }
};
