'use strict';

var 
  _ = require('lodash'),
  uuid = require('uuid/v4'),
  expect = require('chai').expect,
  path = require('path'),
  app = require(path.resolve('./test.js')),
  stop = require(path.resolve('./test.js')).stop,
  request = require('supertest'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user,
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  should = chai.should();

chai.use(chaiHttp);

var 
  userJWT = '',
  restaurantJWT = '';

// Let's set up the data we need to pass to the login method
var 
  userCredentials = {email: 'testUser@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'};

describe('/POST api/auth/signup endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    User.destroy({where: {}})
      .then(function(){done();});
  });

  it('User should be able to signup', (done) => {
    chai.request(app)
      .post('/api/auth/signup')
      .send(userCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('User successfully created');
        res.body.should.have.property('token');
        res.body.user.should.have.property('firstName');
        res.body.user.should.have.property('lastName');
        res.body.user.should.have.property('phoneNumber');
        res.body.user.should.have.property('email');
        done();
      });
  });

  it('User should not be able to signup if username exists', (done) => {
    User.create({...userCredentials, id: uuid()}).then((user) => {
      chai.request(app)
        .post('/api/auth/signup')
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('SequelizeUniqueConstraintError: Email address already in use!');
          done();
        });
      }); 
    });
});

describe('/POST api/auth/signin endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    User.destroy({where: {}})
      .then(function(){done();});
  });

  it('User should be able to signup', (done) => {
    var user = User.build(userCredentials);
    user.id = uuid();
    user.salt = user.makeSalt();
    user.hashedPassword = user.encryptPassword(userCredentials.password, user.salt);

    user.save().then((user) => {
      chai.request(app)
        .post('/api/auth/signin')
        .send({password: userCredentials.password, email: userCredentials.email})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('User successfully logged-in');
          res.body.should.have.property('token');
          res.body.user.should.have.property('firstName');
          res.body.user.should.have.property('lastName');
          res.body.user.should.have.property('phoneNumber');
          res.body.user.should.have.property('email');
          done();
        });
      });
  });
});

after(function(done) {
  User.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  stop();
  done();
});
