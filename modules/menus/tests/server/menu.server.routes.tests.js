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
  Menu = db.menu,
  Meal = db.meal,
  Restaurant = db.restaurant,
  TimeSlot = db.timeslot,
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  should = chai.should();

chai.use(chaiHttp);

var 
  restaurantJWT1 = '',
  restaurantJWT2 = '',
  restaurantId1 = '',
  restaurantId2 = '';

// Let's set up the data we need to pass to the login method
var 
  restaurantCredentials1 = {id: uuid(), username: "testuser", email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7326", firstName: 'Chris', account_type: 'restaurant'},
  restaurantCredentials2 = {id: uuid(), username: "testuser1", email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7327", firstName: 'Chris', account_type: 'restaurant'},
  restaurant1 = {name:"Goldie 1", phoneNumber:"504-613-7325", email:"test21@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant2 = {name:"Goldie 2", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  timeslot1 = {id: uuid(), userId: restaurantCredentials1.id, restaurantId: restaurant1.id, date: "2020-04-05T18:00:00Z"},
  timeslot2 = {id: uuid(), userId: restaurantCredentials2.id, restaurantId: restaurant2.id, date: "2020-04-05T18:00:00Z"},
  meal1 = {name: "Not Chicken 1", description: "Its Not Chicken", allergens: "Pine nuts", dietaryRestrictions: "Vegan", finalized: false},
  meal2 = {name: "Not Chicken 2", description: "Its Not Chicken", allergens: "Pine nuts", dietaryRestrictions: "Vegan", finalized: true},
  m1 = {...meal1, userId: restaurantCredentials1.id, id: uuid()},
  m2 = {...meal1, userId: restaurantCredentials2.id, id: uuid()},
  m3 = {...meal2, userId: restaurantCredentials1.id, id: uuid()},
  m4 = {...meal2, userId: restaurantCredentials2.id, id: uuid()};

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

before((done) =>{
  var r1 = {...restaurant1, ...{userId: restaurantId1}};
  var r2 = {...restaurant2, ...{userId: restaurantId2}};
  Restaurant.bulkCreate([r1, r2])
    .then(() => {done();});
});

before((done) =>{
  TimeSlot.bulkCreate([timeslot1, timeslot2])
    .then(() => {done();}).catch((err) => {console.log("One, " + err)});
});

before((done) =>{
  Meal.bulkCreate([m1, m2, m3, m4])
    .then(() => {done();}).catch((err) => {console.log("Two, " + err)});
});

describe('/GET /api/timeslots endpoint', () => {

  it('User with "user" role should get menus', (done) => {
    chai.request(app)
      .get('/api/timeslots')
      .end((err, res) => {
       res.body.timeslots.should.be.a('array');
       res.body.timeslots[0].should.not.have.property('userId');
       res.body.timeslots.length.should.be.eql(2);
       res.body.should.have.property('message').eql('Timeslots successfully found');
       res.should.have.status(200);
       done();
      });
  });
});

describe('/GET /api/rest/timeslots endpoint', () => {

  it('User with "user" role should get menus', (done) => {
    chai.request(app)
      .get('/api/rest/timeslots')
      .set('Authorization', restaurantJWT1)
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

describe('/GET /api/menus endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    var menu1 = {timeslotId: timeslot1.id, id: uuid(), userId: restaurantId1, mealId: m1.id};
    var menu2 = {timeslotId: timeslot2.id, id: uuid(), userId: restaurantId2, mealId: m3.id};

    Menu.destroy({where: {}})
      .then(function(){
        Menu.bulkCreate([menu1, menu2], {returning: true}).then(function(menus) {
          done();
        }).catch((err)=> {console.log(err)});
      });
  });

  it('User with "user" role should get menus', (done) => {
    chai.request(app)
      .get('/api/menus')
      .end((err, res) => {
       res.body.menus.should.be.a('array');
       res.body.menus[0].should.not.have.property('userId');
       res.body.menus[0].timeslot.should.not.have.property('userId');
       res.body.menus[0].meal.should.not.have.property('userId');
       res.body.menus.length.should.be.eql(2);
       res.body.should.have.property('message').eql('Menus successfully found');
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
      .set('Authorization', restaurantJWT1)
      .query({startDate: "2020-04-01T06:30:00Z", endDate: "2020-04-05T18:40:00Z"})
      .end((err, res) => {
       res.body.menus.should.be.a('array');
       res.body.menus[0].should.not.have.property('userId');
       res.body.menus[0].timeslot.should.not.have.property('userId');
       res.body.menus[0].meal.should.not.have.property('userId');
       res.body.menus.length.should.be.eql(1);
       res.body.should.have.property('message').eql('Menus successfully found');
       res.should.have.status(200);
       done();
      });
  });

  it('User with "restaurant" role should not get their menus with wrong credentials', (done) => {
    chai.request(app)
      .get('/api/rest/menus')
      .set('Authorization', restaurantJWT2)
      .send({restaurantId: restaurant1.id})
      .query({startDate: "2020-04-01T06:30:00Z", endDate: "2020-04-05T18:40:00Z"})
      .end((err, res) => {
         res.body.menus.should.be.a('array');
         res.body.menus[0].should.not.have.property('userId');
         res.body.menus[0].timeslot.should.not.have.property('userId');
         res.body.menus[0].meal.should.not.have.property('userId');
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
      .set('Authorization', restaurantJWT1)
      .send({timeslotId: timeslot1.id, mealId: m1.id})
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Menu successfully created');
        res.body.menu.should.have.property('id');
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
      .set('Authorization', restaurantJWT1)
      .send({timeslotId: timeslot2.id, mealId: m1.id})
      .end((err, res) => {
        res.body.should.be.a('object');
        res.should.have.status(403);
        done();
      });
  });

  it('User with "restaurant" role should get their menus', (done) => {
    chai.request(app)
      .post('/api/rest/menus')
      .set('Authorization', restaurantJWT1)
      .send({timeslotId: timeslot1.id, mealId: m2.id})
      .end((err, res) => {
        res.body.should.be.a('object');
        res.should.have.status(403);
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
    Menu.create({timeslotId: timeslot1.id, mealId: m1.id, id: uuid(), userId: restaurantId1, finalized: false}).then((menu) => {
      chai.request(app)
        .put('/api/rest/menus/' + menu.id)
        .set('Authorization', restaurantJWT1)
        .send({finalized: true})
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Menu successfully updated');
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
        .set('Authorization', restaurantJWT1)
        .send({finalized: false})
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });

  it('User with "restaurant" role should should be able to user other restaurants ID for their menu', (done) => {
    Menu.create({timeslotId: timeslot1.id, mealId: m1.id, id: uuid(), userId: restaurantId1, finalized: true}).then((menu) => {
      chai.request(app)
        .put('/api/rest/menus/' + menu.id)
        .set('Authorization', restaurantJWT2)
        .send({finalized: false})
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
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
        .set('Authorization', restaurantJWT1)
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

  it('User with "restaurant" role should who doesnt own menu should NOT be able to get their menu', (done) => {
    Menu.create({timeslotId: timeslot1.id, mealId: m1.id, id: uuid(), userId: restaurantId1, finalized: true}).then((menu) => {
      chai.request(app)
        .get('/api/rest/menus/' + menu.id)
        .set('Authorization', restaurantJWT2)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
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
        .set('Authorization', restaurantJWT1)
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

  it('User with "restaurant" role should who doesnt own menu should NOT be able to get their menu', (done) => {
    Menu.create({timeslotId: timeslot1.id, mealId: m1.id, id: uuid(), userId: restaurantId1}).then((menu) => {
      chai.request(app)
        .delete('/api/rest/menus/' + menu.id)
        .set('Authorization', restaurantJWT2)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });
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


after(function(done) {
  stop();
  done();
});
