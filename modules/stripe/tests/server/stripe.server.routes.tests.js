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
  Meal = db.meal,
  Menu = db.menu,
  Order = db.order,
  MealInfo = db.mealinfo,
  TimeSlot = db.timeslot,
  Restaurant = db.restaurant,
  Stripe = db.stripe,
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  should = chai.should();

chai.use(chaiHttp);

var
  userJWT1 = '',
  user1 = {id: uuid(), fullName: "Test User", email: "test@gmail.com", phoneNumber: "504-504-5004"},
  userJWT2 = '',
  user2 = {id: uuid()},
  restaurant1 = {id: uuid(), name: "Goldie 1", phoneNumber: "5046137325"},
  restaurant2 = {id: uuid(), name: "Goldie 2", phoneNumber: "5046137325"},
  timeslot1 = {id: uuid(), restaurantId: restaurant1.id, date: "2020-04-05T18:00:00Z"},
  timeslot2 = {id: uuid(), restaurantId: restaurant2.id, date: "2020-04-05T18:00:00Z"},
  mealInfo1 = {type: "lunch", price: 10, time: "1:00", id: uuid()},
  mealInfo2 = {type: "dinner", price: 10, time: "7:00", id: uuid()},
  meal1 = {name: "Chicken 1", finalized: true, mealinfoId: mealInfo1.id, id: uuid()},
  meal2 = {name: "Chicken 1", finalized: true, mealinfoId: mealInfo2.id, id: uuid()},
  menu1 = {id: uuid(), mealId: meal1.id, timeslotId: timeslot1.id},
  menu2 = {id: uuid(), mealId: meal2.id, timeslotId: timeslot2.id},
  group1 = {id: uuid()},
  group2 = {id: uuid()},
  group3 = {id: uuid()},
  group4 = {id: uuid()};

before((done) => {  
  request(app)
    .post('/api/auth/signup')
    .send(user1)
    .then((res) => {
      userJWT1 = "bearer " + res.body.token;
      done();
    });
});

before((done) => {  
  request(app)
    .post('/api/auth/signup')
    .send(user2)
    .then((res) => {
      userJWT2 = "bearer " + res.body.token;
      done();
    });
});

before((done) => {
  Restaurant.destroy({where: {}})
    .then(function(){
      Restaurant.bulkCreate([restaurant1, restaurant2]).then(()=> {
        done();
      });
    });
});

before((done) => {
  TimeSlot.destroy({where: {}})
    .then(function(){
      TimeSlot.bulkCreate([timeslot1, timeslot2]).then(()=> {
        done();
      });
    });
});

before((done) => {
  MealInfo.destroy({where: {}})
    .then(function(){
      MealInfo.bulkCreate([mealInfo1, mealInfo2]).then(()=> {
        done();
      });
    });
});

// Create the meals
before(function(done) {
  Meal.destroy({where: {}})
    .then(function(){
      Meal.bulkCreate([meal1, meal2])
        .then(()=> {done();});
      });
});

before((done) => {
  Menu.destroy({where: {}})
    .then(function() {
      Menu.bulkCreate([menu1, menu2])
        .then(() => {done();});
      });
});

before(function(done) {
  var orders = [
    {quantity: 4, menuId: menu1.id, userId: user1.id, id: uuid(), groupId: group1.id},
    {quantity: 4, menuId: menu2.id, userId: user1.id, id: uuid(), groupId: group1.id},
    {quantity: 6, menuId: menu1.id, userId: user1.id, id: uuid(), groupId: group2.id},
    {quantity: 8, menuId: menu2.id, userId: user1.id, id: uuid(), groupId: group2.id},
  ];
  Order.destroy({where: {}})
    .then(function(){
      Order.bulkCreate(orders).then(function(){done();});
    });
});

describe('/POST /stripe/create-payment-intent endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Stripe.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "user" role should be able to create payment intent for their order', (done) => {
    chai.request(app)
      .post('/api/stripe/create-payment-intent')
      .set('Authorization', userJWT1)
      .send({groupId: group1.id})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Payment intents successfully created');
        res.body.should.not.have.property('userId');
        res.body.should.have.property('publishableKey');
        res.body.should.have.property('stripeData');
        res.body.should.have.property('stripeOrders');
        res.body.stripeData[0].should.not.have.property('userId');
        res.body.stripeData[0].should.have.property('amount').eql(4000);
        res.body.stripeData[0].should.have.property('groupId');
        res.body.stripeData[0].should.have.property('timeslotId');
        res.body.stripeData[0].should.have.property('clientSecret');
        done();
      });
  });

  it('User with "user" role should NOT be able to create payment intent for if intent already exists', (done) => {
    Stripe.create({id: uuid(), userId: user1.id, groupId: group1.id, paymentIntentId: "test", amount: 100.00}).then(function(stripe) {
      chai.request(app)
        .post('/api/stripe/create-payment-intent')
        .set('Authorization', userJWT1)
        .send({groupId: group1.id})
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Payment intent already exists');
          done();
        });
    });
  });
});

describe('/GET /user/stripe', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Stripe.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "user" role should be able to create payment intent for their order', (done) => {
    var stripes = [
      {id: uuid(), userId: user1.id, groupId: group1.id, paymentIntentId: "test", amount: 105},
      {id: uuid(), userId: user2.id, groupId: group2.id, paymentIntentId: "test", amount: 106},
      {id: uuid(), userId: user1.id, groupId: group3.id, paymentIntentId: "test", amount: 105},
      {id: uuid(), userId: user2.id, groupId: group4.id, paymentIntentId: "test", amount: 106},
    ];
    Stripe.bulkCreate(stripes).then(function(stripes) {
      chai.request(app)
        .get('/api/user/stripe')
        .set('Authorization', userJWT1)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Stripe entries successfully found');
          res.body.stripeOrders[0].should.not.have.property('userId');
          res.body.stripeOrders[0].should.have.property('groupId').eql(group1.id);
          res.body.stripeOrders[0].should.have.property('amount').eql(105);
          res.body.stripeOrders.should.be.a('array');
          res.body.stripeOrders.length.should.be.eql(2);
          done();
        });
    });
  });
});

describe('/GET /api/user/stripe/:stripeId', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Stripe.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "user" role should be able to create payment intent for their order', (done) => {
    chai.request(app)
      .post('/api/stripe/create-payment-intent')
      .set('Authorization', userJWT1)
      .send({groupId: group1.id})
      .end((err, res) => {
            chai.request(app)
            .get('/api/user/stripe/' + res.body.stripeOrders[0].id)
            .set('Authorization', userJWT1)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Payment intent successfully created');
              res.body.should.not.have.property('userId');
              res.body.should.have.property('publishableKey');
              res.body.should.have.property('clientSecret');
              res.body.should.have.property('stripeOrder');
              res.body.stripeOrder.should.not.have.property('userId');
              res.body.stripeOrder.should.not.have.property('paymentIntentId');
              res.body.stripeOrder.should.have.property('groupId');
              res.body.stripeOrder.should.have.property('amount').equal(4000);
              done();
            });
      });
  });

  it('User with "user" role should NOT be able to get payment they didnt create', (done) => {
    Stripe.create({id: uuid(), userId: user1.id, groupId: group1.id, paymentIntentId: "test", amount: 100.00}).then(function(stripe) {
      chai.request(app)
        .get('/api/user/stripe/' + stripe.id)
        .set('Authorization', userJWT2)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('User is not authorized');
          done();
        });
    });
  });
});

after(function(done) {
  Restaurant.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  Order.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  User.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  TimeSlot.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  Menu.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  Meal.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  Stripe.destroy({where: {}})
  .then(function(){done()})
});

after((done) => {
  MealInfo.destroy({where: {}})
    .then(function(){done()})
});

after(function(done) {
  stop();
  done();
});