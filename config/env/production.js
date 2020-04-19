'use strict';

module.exports = {
  app: {
    title: defaultEnvConfig.app.title + ' - Production Environment',
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
    name: process.env.DB_NAME || "nourished_dev",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    dialect: process.env.DB_DIALECT || "postgres", //mysql, postgres, sqlite3,...
    enableSequelizeLog: process.env.DB_LOG || false,
    ssl: process.env.DB_SSL || false,
    sync: process.env.DB_SYNC || false //Synchronizing any model changes with database
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    database: parseInt(process.env.REDIS_DATABASE) || 0,
    password: process.env.REDIS_PASSWORD || "",
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
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
  stripe: {
    pubKey: process.env.STRIPE_PUBLIC || 'pk_12345',
    // DO NOT COMMIT REAL SECRETS TO THIS FILE
    secretKey: process.env.STRIPE_SECRET || 'sk_12345',
    webhookSecretKey: process.env.STRIPE_WEBHOOK || 'whsec_1234'
  },
  twilio: {
    secretKey: process.env.TWILIO_ACCOUNT_SID || 'sk_12345',
    webhookSecretKey: process.env.TWILIO_AUTH_TOKEN || 'whsec_1234'
  }
};
