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
  user1 = {id: uuid(), username: "testuser", email: 'testuser@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"5046137325", fullName: 'Chris Streiffer', account_type: 'user'},
  rest1 = {id: uuid(), username: "testuser1", email: 'testuser1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"5056137325", fullName: 'Chris Streiffer', account_type: 'restaurant'};

describe('User main CRUD tests', function() {
before(function(done) {
  User.destroy({where: {}})
  .then(function(){done()})
});

describe('/POST api/auth/signup endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    User.destroy({where: {}})
      .then(function(){done();});
  });

  it('User should be able to signup', (done) => {
    chai.request(app)
      .post('/api/auth/signup')
      .send(user1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('User successfully created');
        res.body.should.have.property('token');
        res.body.user.should.have.property('firstName');
        res.body.user.should.have.property('lastName');
        res.body.user.should.have.property('phoneNumber');
        res.body.user.should.have.property('email');
        res.body.user.should.have.property('roles');
        res.body.user.roles[0].should.eql('user');
        res.body.user.should.not.have.property('hashedPassword');
        res.body.user.should.not.have.property('salt');
        res.body.user.should.not.have.property('resetPasswordExpires');
        res.body.user.should.not.have.property('resetPasswordToken');
        done();
      });
  });

  it('User should be able to signup', (done) => {
    chai.request(app)
      .post('/api/auth/signup')
      .send(rest1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('User successfully created');
        res.body.should.have.property('token');
        res.body.user.should.have.property('firstName');
        res.body.user.should.have.property('lastName');
        res.body.user.should.have.property('phoneNumber');
        res.body.user.should.have.property('email');
        res.body.user.should.have.property('roles');
        res.body.user.roles[0].should.eql('restaurant');
        res.body.user.should.not.have.property('hashedPassword');
        res.body.user.should.not.have.property('salt');
        res.body.user.should.not.have.property('resetPasswordExpires');
        res.body.user.should.not.have.property('resetPasswordToken');
        done();
      });
  });

  it('User should not be able to signup if email/phoneNumber exists', (done) => {
    User.create(user1).then((user) => {
      chai.request(app)
        .post('/api/auth/signup')
        .send(user1)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('SequelizeUniqueConstraintError: username must be unique');
          done();
        });
      }); 
    });
});

describe('/POST api/auth/signin endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    User.destroy({where: {}})
      .then(function(){
        var user = User.build(user1);
        user.id = uuid();
        user.salt = user.makeSalt();
        user.hashedPassword = user.encryptPassword(user1.password, user.salt);
        user.save()
          .then((user))
          .then(function() {done();});
    });
  });

  it('User should be able to signin - email', (done) => {
    chai.request(app)
      .post('/api/auth/signin')
      .send({id: user1.email, password: user1.password})
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

  it('User should be able to signin - phoneNumber', (done) => {
    chai.request(app)
      .post('/api/auth/signin')
      .send({id: user1.phoneNumber, password: user1.password})
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

  it('User should be able to signin - username', (done) => {
    chai.request(app)
      .post('/api/auth/signin')
      .send({id: user1.username, password: user1.password})
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

  it('User signing should fail', (done) => {
    chai.request(app)
      .post('/api/auth/signin')
      .send({id: user1.username, password: "wrong password"})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Invalid username or password');
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
});
