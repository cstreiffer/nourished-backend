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
  userJWT1 = '',
  userId1 = '';

// Let's set up the data we need to pass to the login method
var 
  userCredentials1 = {id: uuid(), username: "testuser", email: 'ccstreiffer@gmail.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"(504) 613-7325", fullName: 'Chris Streiffer', account_type: 'user'},
  userCredentials2 = {id: uuid(), username: "testuser1", email: 'ccstreiffer1@gmail.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"(504) 613-7326", fullName: 'Chris Streiffer', account_type: 'user'};


before(function(done) {
User.destroy({where: {}})
	.then(function(){done()})
});

before((done) => {  
  request(app)
	  .post('/api/auth/signup')
	  .send(userCredentials1)
	  .then((res) => {
	  	userId1 = res.body.user.id;
	    userJWT1 = "bearer " + res.body.token;
	    done();
	  });
});

before((done) => {  
  request(app)
    .post('/api/auth/signup')
    .send(userCredentials2)
    .then((res) => {
      done();
    });
});

describe('/GET /api/user/me and /api/user', () => {

  it('User should be able to get their profile', (done) => {
    chai.request(app)
      .get('/api/user/me')
      .set('Authorization', userJWT1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.user.should.have.property('username');
        res.body.user.should.have.property('email');
        res.body.user.should.have.property('phoneNumber');
        res.body.user.should.have.property('firstName');
        res.body.user.should.have.property('lastName');
        res.body.user.should.not.have.property('hashedPassword');
        res.body.user.should.not.have.property('salt');
        res.body.user.should.not.have.property('resetPasswordToken');
        res.body.user.should.not.have.property('resetPasswordExpires');
        done();
      });
  });

  it('User should be able to get their profile', (done) => {
    chai.request(app)
      .get('/api/user')
      .set('Authorization', userJWT1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql("User successfully found")
        res.body.user.should.have.property('username');
        res.body.user.should.have.property('email');
        res.body.user.should.have.property('phoneNumber');
        res.body.user.should.have.property('firstName');
        res.body.user.should.have.property('lastName');
        res.body.user.should.not.have.property('hashedPassword');
        res.body.user.should.not.have.property('salt');
        res.body.user.should.not.have.property('resetPasswordToken');
        res.body.user.should.not.have.property('resetPasswordExpires');
        done();
      });
  });
});

describe('/PUT /api/user', () => {

  it('User should be able to update username, email, and phoneNumber', (done) => {
    chai.request(app)
      .put('/api/user')
      .set('Authorization', userJWT1)
      .send({email: "ccstreiffer11@gmail.com", username: "ccstreiffer", phoneNumber: "427-617-4800"})
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.user.should.have.property('username').eql("ccstreiffer");
        res.body.user.should.have.property('email').eql("ccstreiffer11@gmail.com");
        res.body.user.should.have.property('phoneNumber').eql("4276174800");
        res.body.user.should.have.property('firstName');
        res.body.user.should.have.property('lastName');
        res.body.user.should.not.have.property('hashedPassword');
        res.body.user.should.not.have.property('salt');
        res.body.user.should.not.have.property('resetPasswordToken');
        res.body.user.should.not.have.property('resetPasswordExpires');
        done();
      });
  });

  it('User should NOT be able to update email if ALREADY exists', (done) => {
    chai.request(app)
      .put('/api/user')
      .set('Authorization', userJWT1)
      .send({email: "ccstreiffer1@gmail.com"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql("Email already exists")
        done();
      });
  });

  it('User should NOT be able to update phoneNumber if ALREADY exists', (done) => {
    chai.request(app)
      .put('/api/user')
      .set('Authorization', userJWT1)
      .send({phoneNumber: "(504)-613-7326"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql("Phone number already exists")
        done();
      });
  });

  it('User should NOT be able to update username if ALREADY exists', (done) => {
    chai.request(app)
      .put('/api/user')
      .set('Authorization', userJWT1)
      .send({username: "testuser1"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql("Username already exists")
        done();
      });
  });
});

describe('/POST /api/user/password', () => {

  it('User should NOT be able to change their password if no new password', (done) => {
    chai.request(app)
      .post('/api/user/password')
      .set('Authorization', userJWT1)
      .send({currentPassword: "h4dm322i8!!ssfSS", verifyPassword: "h4dm322i8!!ssfSt"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql("Please provide a new password")
        done();
      });
  });

  it('User should NOT be able to change their password if no massing passwords', (done) => {
    chai.request(app)
      .post('/api/user/password')
      .set('Authorization', userJWT1)
      .send({currentPassword: "h4dm322i8!!ssfSS", newPassword: "h4dm322i8!!ssfSt", verifyPassword: "h4dm322i"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql("Passwords do not match")
        done();
      });
  });

  it('User should NOT be able to change their password if incorrect current password', (done) => {
    chai.request(app)
      .post('/api/user/password')
      .set('Authorization', userJWT1)
      .send({currentPassword: "h4dm322i8!", newPassword: "h4dm322i8!!ssfSt", verifyPassword: "h4dm322i8!!ssfSt"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql("Current password is incorrect")
        done();
      });
  });

  it('User should be able to change their password', (done) => {
    chai.request(app)
      .post('/api/user/password')
      .set('Authorization', userJWT1)
      .send({currentPassword: "h4dm322i8!!ssfSS", newPassword: "h4dm322i8!!ssfSt", verifyPassword: "h4dm322i8!!ssfSt"})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql("Password changed successfully")
        done();
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
