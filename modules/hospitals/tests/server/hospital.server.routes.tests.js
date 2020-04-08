'use strict';

var 
  _ = require('lodash'),
  uuid = require('uuid/v4'),
  expect = require('chai').expect,
  path = require('path'),
  app = require(path.resolve('./test.js')),
  request = require('supertest'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user,
  Hospital = db.hospital,
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  should = chai.should();

chai.use(chaiHttp);

var 
  userJWT = '',
  restaurantJWT = '';

// Let's set up the data we need to pass to the login method
var 
  userCredentials = {email: 'testUser@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'},
  restaurantCredentials = {email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'restaurant'},
  hospital1 = {name:"Presby 1", phoneNumber:"xxx-xxx-xxxx", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  hospital2 = {name:"Presby 2", phoneNumber:"xxx-xxx-xxxx", email:"test@gmail.com", streetAddress:"201 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()};

before(function(done) {
User.destroy({where: {}})
  .then(function(){done()})
});

before((done) => {  
  request(app)
    .post('/api/auth/signup')
    .send(userCredentials)
    .then((res) => {
      userJWT = "bearer " + res.body.token;
      done();
    })
})

before((done) => {  
  request(app)
    .post('/api/auth/signup')
    .send(restaurantCredentials)
    .then((res) => {
      restaurantJWT = "bearer " + res.body.token;
      done();
    })
})

describe('/GET api/hospitals endpoint', () => {
  
  // Clear the database
  before(function(done) {
    Hospital.destroy({where: {}})
      .then(function(){
        Hospital.bulkCreate([hospital1, hospital2]).then(function() {
          done()        
        })
      })
  });

  it('User with "user" role should get all hospitals', (done) => {
    chai.request(app)
      .get('/api/hospitals')
      .set('Authorization', userJWT)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.hospitals.should.be.a('array');
        res.body.hospitals.length.should.be.eql(2);
        res.body.should.have.property('message').eql('Hospitals successfully found');
        done();
      })
  })

  it('User with "user" role should get all hospitals (filtered by name)', (done) => {
    chai.request(app)
      .get('/api/hospitals')
      .set('Authorization', userJWT)
      .query({name: 'Presby 1'})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.hospitals.should.be.a('array');
        res.body.hospitals.length.should.be.eql(1);
        res.body.should.have.property('message').eql('Hospitals successfully found');
        done();
      })
  })

  it('User with "user" role should get all hospitals (filtered by state, city, zip', (done) => {
    chai.request(app)
      .get('/api/hospitals')
      .set('Authorization', userJWT)
      .query({streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA"})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.hospitals.should.be.a('array');
        res.body.hospitals.length.should.be.eql(1);
        res.body.should.have.property('message').eql('Hospitals successfully found');
        done();
      })
  })

  it('User with "restaurant" role should get all hospitals', (done) => {
    chai.request(app)
      .get('/api/hospitals')
      .set('Authorization', restaurantJWT)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.hospitals.should.be.a('array');
        res.body.hospitals.length.should.be.eql(2);
        res.body.should.have.property('message').eql('Hospitals successfully found');
        done();
      })
  })
});

describe('/GET api/hospitals endpoint', () => {
  
  // Clear the database
  before(function(done) {
    Hospital.destroy({where: {}})
      .then(function(){
        Hospital.bulkCreate([hospital1, hospital2]).then(function() {
          done()        
        })
      })
  });

  it('User with "user" role should get hospital', (done) => {
    chai.request(app)
      .get('/api/hospitals/' + hospital1.id)
      .set('Authorization', userJWT)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Hospital successfully found');
        res.body.hospital.should.have.property('name');
        res.body.hospital.should.have.property('phoneNumber');
        res.body.hospital.should.have.property('email');
        res.body.hospital.should.have.property('streetAddress');
        res.body.hospital.should.have.property('zip');
        res.body.hospital.should.have.property('city');
        res.body.hospital.should.have.property('state');
        done();
      })
  })

  it('User with "restaurant" role should get hospital', (done) => {
    chai.request(app)
      .get('/api/hospitals/' + hospital1.id)
      .set('Authorization', restaurantJWT)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Hospital successfully found');
        res.body.hospital.should.have.property('name');
        res.body.hospital.should.have.property('phoneNumber');
        res.body.hospital.should.have.property('email');
        res.body.hospital.should.have.property('streetAddress');
        res.body.hospital.should.have.property('zip');
        res.body.hospital.should.have.property('city');
        res.body.hospital.should.have.property('state');
        done();
      })
  })
});
