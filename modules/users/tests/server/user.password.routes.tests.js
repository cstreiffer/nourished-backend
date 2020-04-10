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
  userCredentials1 = {username: "testuser", email: 'ccstreiffer@gmail.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'};

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

describe('/POST api/auth/signup endpoint', () => {

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

after(function(done) {
  User.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  stop();
  done();
});
