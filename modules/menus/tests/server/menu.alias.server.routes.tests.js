'use strict';

var 
  _ = require('lodash'),
  uuid = require('uuid/v4'),
  expect = require('chai').expect,
  path = require('path'),
  app = require(path.resolve('./test.js')),
  stop = require(path.resolve('./test.js')).stop,
  config = require(path.resolve('./config/config')),
  request = require('supertest'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  User = db.user,
  Menu = db.menu,
  Meal = db.meal,
  Restaurant = db.restaurant,
  Hospital = db.hospital,
  TimeSlot = db.timeslot,
  UserAlias = db.useralias,
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  should = chai.should();

chai.use(chaiHttp);

var 
  restaurantJWT1 = '',
  restaurantJWT2 = '',
  restaurantId1 = '',
  restaurantId2 = '',
  rest1aliasId = '',
  restaurantJWT1alias = '';

// Let's set up the data we need to pass to the login method
var 
  restaurantCredentials1 = {id: uuid(), username: "testuser", email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7326", firstName: 'Chris', account_type: 'restaurant'},
  restaurantCredentials2 = {id: uuid(), username: "testuser1", email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7327", firstName: 'Chris', account_type: 'restaurant'},
  restaurant1 = {name:"Goldie 1", phoneNumber:"504-613-7325", email:"test21@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant2 = {name:"Goldie 2", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  rest1alias = {id: uuid(), username: "testuser4", email: 'testRestaurant4@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7329", firstName: 'Chris', account_type: 'restaurant_subaccount'},
  hospital1 = {name:"Presby 1", phoneNumber:"xxx-xxx-xxxx", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid(), dropoffLocation: "Take the elevator.", dropoffInfo: "Just follow the lights."},
  hospital2 = {name:"Presby 2", phoneNumber:"xxx-xxx-xxxx", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid(), dropoffLocation: "Take the elevator.", dropoffInfo: "Just follow the lights."},
  timeslot1 = {id: uuid(), userId: restaurantCredentials1.id, restaurantId: restaurant1.id, date: "2021-04-05T18:00:00Z", hospitalId: hospital1.id},
  timeslot2 = {id: uuid(), userId: restaurantCredentials2.id, restaurantId: restaurant2.id, date: "2021-04-05T18:00:00Z", hospitalId: hospital2.id},
  timeslot3 = {id: uuid(), userId: restaurantCredentials2.id, restaurantId: restaurant2.id, date: new Date().toISOString()},
  timeslot4 = {id: uuid(), userId: restaurantCredentials2.id, restaurantId: restaurant2.id, date: new Date(Date.now() + config.orderTimeCutoff + 60*1000).toISOString()},
  meal1 = {name: "Not Chicken 1", description: "Its Not Chicken", allergens: "Pine nuts", dietaryRestrictions: "Vegan", finalized: false},
  meal2 = {name: "Not Chicken 2", description: "Its Not Chicken", allergens: "Pine nuts", dietaryRestrictions: "Vegan", finalized: true},
  m1 = {...meal1, userId: restaurantCredentials1.id, id: uuid()},
  m2 = {...meal1, userId: restaurantCredentials2.id, id: uuid()},
  m3 = {...meal2, userId: restaurantCredentials1.id, id: uuid()},
  m4 = {...meal2, userId: restaurantCredentials2.id, id: uuid()};

describe('Menu CRUD tests', function() {
before(function(done) {
  Menu.destroy({where: {}})
  .then(function(){done()})
});
before(function(done) {
  TimeSlot.destroy({where: {}})
  .then(function(){done()})
});

before(function(done) {
User.destroy({where: {}})
	.then(function(){done();});
});

before((done) => {  
  request(app)
	  .post('/api/auth/signup')
	  .send(restaurantCredentials1)
	  .then((res) => {
      restaurantId1 = res.body.user.id;
	    restaurantJWT1 = "bearer " + res.body.token;
	    done();
	  }).catch((err) => {console.log(err)});
});

before((done) => {  
  request(app)
	  .post('/api/auth/signup')
	  .send(restaurantCredentials2)
	  .then((res) => {
      restaurantId2 = res.body.user.id;
	    restaurantJWT2 = "bearer " + res.body.token;
	    done();
	  }).catch((err) => {console.log(err)});
});

before((done) => {  
  request(app)
    .post('/api/auth/signup')
    .send(rest1alias)
    .then((res) => {
      rest1aliasId = res.body.user.id;
      restaurantJWT1alias = "bearer " + res.body.token;
      done();
    })
})

before((done) => {
  m1.userId = restaurantId1;
  m2.userId = restaurantId2;
  m3.userId = restaurantId1;
  m4.userId = restaurantId2;

  timeslot1.userId = restaurantId1;
  timeslot2.userId = restaurantId2;
  timeslot3.userId = restaurantId2;
  timeslot4.userId = restaurantId2;

  done();
});

before((done) => {
  Hospital.destroy({where: {}})
    .then(function() {
      Hospital.bulkCreate([hospital1, hospital2])
        .then(() => {
          done();
        });
    })
});

before((done) =>{
  var r1 = {...restaurant1, ...{userId: restaurantId1}};
  var r2 = {...restaurant2, ...{userId: restaurantId2}};
  Restaurant.bulkCreate([r1, r2])
    .then(() => {done();});
});

before((done) =>{
  TimeSlot.bulkCreate([timeslot1, timeslot2, timeslot3, timeslot4])
    .then(() => {done();}).catch((err) => {console.log("One, " + err)});
});

before((done) =>{
  Meal.bulkCreate([m1, m2, m3, m4])
    .then(() => {done();}).catch((err) => {console.log("Two, " + err)});
});

before(function(done) {
    UserAlias.create({
      id: uuid(),
      userId: rest1aliasId,
      aliasId: restaurantId1
    }).then(function(user) {
      done();
    })
})

describe('/GET /api/rest/timeslots endpoint', () => {

  it('User with "user" role should get menus', (done) => {
    chai.request(app)
      .get('/api/rest/timeslots')
      .set('Authorization', restaurantJWT1alias)
      .end((err, res) => {
       res.body.timeslots.should.be.a('array');
       res.body.timeslots[0].should.not.have.property('userId');
       res.body.timeslots.length.should.be.eql(1);
       res.body.should.have.property('message').eql('Timeslots successfully found');
       res.should.have.status(200);
       done();
      });
  });
});

describe('/GET /api/rest/menus endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    var menu1 = {timeslotId: timeslot1.id, id: uuid(), userId: restaurantId1, mealId: m1.id};
    var menu2 = {timeslotId: timeslot2.id, id: uuid(), userId: restaurantId2, mealId: m3.id};

    Menu.destroy({where: {}})
    	.then(function(){
        Menu.bulkCreate([menu1, menu2], {returning: true}).then(function(menus) {
          done();
        });
      });
  });

  it('User with "restaurant" role should get their menus', (done) => {
    chai.request(app)
      .get('/api/rest/menus')
      .set('Authorization', restaurantJWT1alias)
      .query({startDate: "2019-04-01T06:30:00Z", endDate: "2022-04-05T18:40:00Z"})
      .end((err, res) => {
       res.body.menus.should.be.a('array');
       res.body.menus[0].should.not.have.property('userId');
       res.body.menus[0].timeslot.should.not.have.property('userId');
       res.body.menus[0].should.have.property('mealName');
       res.body.menus[0].should.have.property('mealDescription');
       res.body.menus[0].should.have.property('allergens');
       res.body.menus[0].should.have.property('dietaryRestrictions');
       res.body.menus[0].should.have.property('mealinfo');
       res.body.menus.length.should.be.eql(1);
       res.body.should.have.property('message').eql('Menus successfully found');
       res.should.have.status(200);
       done();
      });
  });
});

describe('/POST /api/rest/menus endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Menu.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "restaurant" role should get their menus', (done) => {
    chai.request(app)
      .post('/api/rest/menus')
      .set('Authorization', restaurantJWT1alias)
      .send({timeslotId: timeslot1.id, mealId: m3.id})
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Menu successfully created');
        res.body.menu.should.have.property('id');
        res.body.menu.should.have.property('mealName');
        res.body.menu.should.have.property('mealDescription');
        res.body.menu.should.have.property('allergens');
        res.body.menu.should.have.property('dietaryRestrictions');
        res.body.menu.should.have.property('mealinfoId');
        res.body.menu.should.not.have.property('userId');
        res.body.menu.should.not.have.property('timeslot');
        res.body.menu.should.not.have.property('meal');
        res.should.have.status(200);
        done();
      });
  });

  it('User with "restaurant" role should get their menus', (done) => {
    chai.request(app)
      .post('/api/rest/menus')
      .set('Authorization', restaurantJWT1alias)
      .send({timeslotId: timeslot2.id, mealId: m1.id})
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('User is not authorized');
        res.should.have.status(403);
        done();
      });
  });

  it('User with "restaurant" role should get their menus', (done) => {
    chai.request(app)
      .post('/api/rest/menus')
      .set('Authorization', restaurantJWT1alias)
      .send({timeslotId: timeslot1.id, mealId: m2.id})
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Meal not found');
        res.should.have.status(400);
        done();
      });
  });
});

describe('/PUT /api/restaurants/:restaurantId/menus/:menuId endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Menu.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "restaurant" role should should be able to update their menu', (done) => {
    Menu.create({timeslotId: timeslot1.id, mealId: m1.id, id: uuid(), userId: restaurantId1, finalized: false, visible: true}).then((menu) => {
      chai.request(app)
        .put('/api/rest/menus/' + menu.id)
        .set('Authorization', restaurantJWT1alias)
        .send({finalized: true})
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Menu successfully updated');
          res.body.menu.should.have.property('visible').eql(true);
          res.body.menu.should.have.property('id');
          res.body.menu.should.not.have.property('userId');
          res.body.menu.should.not.have.property('timeslot');
          res.body.menu.should.not.have.property('meal');
          res.should.have.status(200);
          done();
        });
    });
  });

  it('User with "restaurant" role should should be able to update their menu', (done) => {
    Menu.create({timeslotId: timeslot1.id, mealId: m1.id, id: uuid(), userId: restaurantId1, finalized: true, visible: true}).then((menu) => {
      chai.request(app)
        .put('/api/rest/menus/' + menu.id)
        .set('Authorization', restaurantJWT1alias)
        .send({visible: false})
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Menu successfully updated');
          res.body.menu.should.have.property('visible').eql(false);
          res.body.menu.should.have.property('id');
          res.body.menu.should.not.have.property('userId');
          res.body.menu.should.not.have.property('timeslot');
          res.body.menu.should.not.have.property('meal');
          res.should.have.status(200);
          done();
        });
    });
  });

  it('User with "restaurant" role should should be able to user other restaurants ID for their menu', (done) => {
    Menu.create({timeslotId: timeslot1.id, mealId: m1.id, id: uuid(), userId: restaurantId1, finalized: true}).then((menu) => {
      chai.request(app)
        .put('/api/rest/menus/' + menu.id)
        .set('Authorization', restaurantJWT1alias)
        .send({finalized: false})
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Menu successfully updated');
          res.body.menu.should.have.property('finalized').eql(false);
          res.body.menu.should.have.property('id');
          res.body.menu.should.not.have.property('userId');
          res.body.menu.should.not.have.property('timeslot');
          res.body.menu.should.not.have.property('meal');
          res.should.have.status(200);
          done();        });
    });
  });
});

describe('/GET /api/rest/menus/:menuId endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Menu.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "restaurant" role should should be able to get their menu', (done) => {
    Menu.create({timeslotId: timeslot1.id, mealId: m1.id, id: uuid(), userId: restaurantId1}).then((menu) => {
      chai.request(app)
        .get('/api/rest/menus/' + menu.id)
        .set('Authorization', restaurantJWT1alias)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Menu successfully found');
          res.body.menu.should.have.property('id');
          res.body.menu.should.not.have.property('userId');
          res.body.menu.should.not.have.property('timeslot');
          res.body.menu.should.not.have.property('meal');
          res.should.have.status(200);
          done();
        });
    });
  });
});

describe('/DELETE /api/rest/menus/:menuId endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Menu.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "restaurant" role should should be able to get their menu', (done) => {
    Menu.create({timeslotId: timeslot1.id, mealId: m1.id, id: uuid(), userId: restaurantId1, finalized: false}).then((menu) => {
      chai.request(app)
        .delete('/api/rest/menus/' + menu.id)
        .set('Authorization', restaurantJWT1alias)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Menu successfully deleted');
          res.body.menu.should.have.property('id');
          res.body.menu.should.not.have.property('userId');
          res.body.menu.should.not.have.property('timeslot');
          res.body.menu.should.not.have.property('meal');
          res.should.have.status(200);
          done();
        });
    });
  });
});

after(function(done) {
  Hospital.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  TimeSlot.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  Restaurant.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  User.destroy({where: {}})
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

after((done) => {
  UserAlias.destroy({where: {}})
    .then(function(){done()})
});


after(function(done) {
  stop();
  done();
});
});
