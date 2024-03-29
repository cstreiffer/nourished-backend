'use strict';

module.exports = {
  app: {
    title: 'Nourished backend',
    description: 'Full-Stack Javascript with SequelizeJS, ExpressJS, AngularJS, and Node.js',
    keywords: 'sequelizejs, expressjs, angularjs, nodejs, postgresql, mysql, sqlite3, passport, redis, socket.io',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || '',
    reCaptchaSecret: process.env.RECAPTCHA_SECRET || '',
    webURL: 'http://localhost:3000',
    devURL: 'http://localhost:3000'
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 24 * (60 * 60 * 1000),
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: Boolean(process.env.ssl) || true
  },
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: 'SEANJS',
  // sessionKey is set to the generic sessionId key used by PHP applications
  // for obsecurity reasons
  sessionKey: 'sessionId',
  sessionCollection: 'sessions',
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
  shared: {
    owasp: {
      allowPassphrases: true,
      maxLength: 128,
      minLength: 10,
      minPhraseLength: 20,
      minOptionalTestsToPass: 4
    }
  },
  jwt : {
    signOptions : {
      expiresIn:  7 * 60 * 60 * 24,
      algorithm: "RS256"
    },
    verifyOptions : {
      expiresIn:  7 * 60 * 60 * 24,
      algorithm: ["RS256"]
    },
    privateKey : 'config/jwttokens/jwt_rsa',
    publicKey : 'config/jwttokens/jwt_rsa.pub'
  },
  timeSlots : ['13:00:00', '18:30:00'],
  orderTimeCutoff: 2 * 60 * 60 * 1000,
  uploads: {
    profileUpload: {
      dest: 'public/uploads/users/meals/', // Profile upload destination path
      limits: {
        fileSize: 1 * 1024 * 1024 // Max file size in bytes (1 MB)
      }
    }
  },
  cors: {
    whitelist: [
      'https://nourished-dev.uphs.upenn.edu', 'https://nourished.uphs.upenn.edu',
      'http://nourished-dev.uphs.upenn.edu', 'http://nourished.uphs.upenn.edu'
    ]
  },
  cron: {
    twilio: {
      weeklyUpdate: '0 13 * * 0',
      dailyUpdate: '*/15 7-22 * * *',
      dailyPrenotify: '*/15 7-22 * * *',
      dailyNotifyLunch: '30 7 * * 1-6',
      dailyNotifyDinner: '30 12 * * 1-5',
      timezone: 'America/New_York'
    },
    restaurant: {
      dailyUpdate: "*/15 8,9,16,17 * * *",
      timezone: "America/New_York",
    },
    order: {
      PPMCLunchUpdate: "15 9 * * 1-6",
      timezone: "America/New_York",
    }
  },
  twilio: {
    tokenExpiry : 3600000*3
  },
  user : {
    tokenExpiry: 3600000
  }
};
