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
  userCredentials1 = {id: uuid(), username: "testuser", email: 'ccstreiffer@gmail.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'};

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

describe('/POST api/auth/forgot endpoint', () => {

  it('User should NOT be able to get reset password if invalid email', (done) => {
    chai.request(app)
      .post('/api/auth/forgot')
      .send({email: "wrongemail@wrong.com"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('No account with that email has been found');
        done();
      });
  })

  it('User should be able to get reset password', (done) => {
    chai.request(app)
      .post('/api/auth/forgot')
      .send({email: userCredentials1.email})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('An email has been sent to the provided email with further instructions.');
        done();
      });
  }).timeout(5000);
});

var resetToken = '';

describe('/GET api/auth/forgot/test endpoint', () => {

  it('User should be able to get reset password token', (done) => {
    chai.request(app)
      .post('/api/auth/forgot/test')
      .send({email: userCredentials1.email})
      .end((err, res) => {
        resetToken = res.body.user.resetPasswordToken;
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Token generated');
        done();
      });
  });

  it('User should be able to verify reset password token', (done) => {
    chai.request(app)
      .get('/api/auth/reset/' + resetToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Valid reset token');
        done();
      });
  });

  it('User should NOT be able to updated password with missing verify password', (done) => {
    chai.request(app)
      .post('/api/auth/reset/' + resetToken)
      .send({newPassword: "h4dm322i8!!ssfSt"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Passwords do not match');
        done();
      });
  });

  it('User should NOT be able to updated password with invalid verify password', (done) => {
    chai.request(app)
      .post('/api/auth/reset/' + resetToken)
      .send({newPassword: "h4dm322i8!!ssfSt", verifyPassword: "jssjsjsjsjs"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Passwords do not match');
        done();
      });
  });

  it('User should NOT be able to updated password with invalid password reset token', (done) => {
    chai.request(app)
      .post('/api/auth/reset/' + "invalid")
      .send({newPassword: "h4dm322i8!!ssfSt", verifyPassword: "h4dm322i8!!ssfSt"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Password reset token is invalid or has expired.');
        done();
      });
  });

  it('User should NOT be able to updated password with weak password', (done) => {
    chai.request(app)
      .post('/api/auth/reset/' + resetToken)
      .send({newPassword: "password", verifyPassword: "password"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Password not strong enough');
        done();
      });
  });

  it('User should be able to verify reset password token', (done) => {
    chai.request(app)
      .post('/api/auth/reset/' + resetToken)
      .send({newPassword: "h4dm322i8!!ssfSt", verifyPassword: "h4dm322i8!!ssfSt"})
      .end((err, res) => {

        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Password successfully reset');
        done();
      });
  }).timeout(5000);

});

after(function(done) {
  User.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  stop();
  done();
});
