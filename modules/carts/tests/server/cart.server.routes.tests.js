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
  Restaurant = db.restaurant,
  Meal = db.meal,
  MealInfo = db.mealinfo,
  Menu = db.menu,
  Cart = db.cart,
  TimeSlot = db.timeslot,
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  should = chai.should();

chai.use(chaiHttp);

var 
  userJWT1 = '',
  userJWT2 = '',
  restaurantJWT1 = '',
  restaurantJWT2 = '',
  userId1 = '',
  userId2 = '',
  restaurantId1 = '',
  restaurantId2 = '';

// Let's set up the data we need to pass to the login method
var 
  userCredentials1 = {id: uuid(), username: "testuser", email: 'testUser1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'},
  userCredentials2 = {id: uuid(), username: "testuser1", email: 'testUser2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7326", firstName: 'Chris', account_type: 'user'},
  restaurantCredentials1 = {id: uuid(), username: "testuser2", email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7327", firstName: 'Chris', account_type: 'restaurant'},
  restaurantCredentials2 = {id: uuid(), username: "testuser3", email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7328", firstName: 'Chris', account_type: 'restaurant'},
  mealInfo1 = {type: "lunch", price: 5.00, time: "1:00", id: uuid()},
  mealInfo2 = {type: "dinner", price: 5.00, time: "7:00", id: uuid()},
  restaurant1 = {name:"Goldie 1", phoneNumber:"504-613-7325", email:"test21@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant2 = {name:"Goldie 2", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant3 = {name:"Goldie 3", phoneNumber:"504-613-7325", email:"test23@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant4 = {name:"Goldie 4", phoneNumber:"504-613-7325", email:"test24@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  timeslot1 = {id: uuid(), userId: restaurantCredentials1.id, restaurantId: restaurant1.id, date: "2021-04-05T18:00:00Z"},
  timeslot2 = {id: uuid(), userId: restaurantCredentials2.id, restaurantId: restaurant2.id, date: "2021-04-05T18:00:00Z"},
  timeslot3 = {id: uuid(), userId: restaurantCredentials2.id, restaurantId: restaurant2.id, date: new Date().toISOString()},
  timeslot4 = {id: uuid(), userId: restaurantCredentials2.id, restaurantId: restaurant2.id, date: new Date(Date.now() + config.orderTimeCutoff + 60*1000).toISOString()},
  meal1 = {name: "Chicken 1", description: "Its Chicken", category: "Meat", price: 7.50, finalized: true, timeslotId: timeslot1.id},
  meal2 = {name: "Chicken 2", description: "Its Chicken", category: "Meat", price: 7.50, finalized: false, timeslotId: timeslot1.id},
  ml1 = {...meal1, id: uuid(), userId: restaurantCredentials1.id},
  ml2 = {...meal2, id: uuid(), userId: restaurantCredentials1.id},
  ml3 = {...meal1, id: uuid(), userId: restaurantCredentials2.id},
  ml4 = {...meal2, id: uuid(), userId: restaurantCredentials2.id},
  menu1 = {id: uuid(), userId: restaurantCredentials1.id, mealId: ml1.id, timeslotId: timeslot1.id, finalized: true},
  menu2 = {id: uuid(), userId: restaurantCredentials1.id, mealId: ml2.id, timeslotId: timeslot1.id,  finalized: true},
  menu3 = {id: uuid(), userId: restaurantCredentials2.id, mealId: ml3.id, timeslotId: timeslot3.id,  finalized: true},
  menu4 = {id: uuid(), userId: restaurantCredentials2.id, mealId: ml4.id, timeslotId: timeslot4.id,  finalized: true};

describe('Cart CRUD tests', function() {
before(function(done) {
  Cart.destroy({where: {}})
  .then(function(){done()})
});

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
      userId2 = res.body.user.id;
      userJWT2 = "bearer " + res.body.token;
      done();
    });
});

before((done) => {  
  request(app)
    .post('/api/auth/signup')
    .send(restaurantCredentials1)
    .then((res) => {
      restaurantId1 = res.body.user.id;
      restaurantJWT1 = "bearer " + res.body.token;
      done();
    });
});

before((done) => {  
  request(app)
    .post('/api/auth/signup')
    .send(restaurantCredentials2)
    .then((res) => {
      restaurantId2 = res.body.user.id;
      restaurantJWT2 = "bearer " + res.body.token;
      done();
    });
});

before((done) => {
  ml1.userId = restaurantId1;
  ml2.userId = restaurantId1;
  ml3.userId = restaurantId2;
  ml4.userId = restaurantId2;

  timeslot1.userId = restaurantId1;
  timeslot2.userId = restaurantId2;
  timeslot3.userId = restaurantId2;
  timeslot4.userId = restaurantId2;

  menu1.userId = restaurantId1;
  menu2.userId = restaurantId1;
  menu3.userId = restaurantId2;
  menu4.userId = restaurantId2;

  done();
});

before((done) =>{
  var r1 = {...restaurant1, userId: restaurantId1};
  var r2 = {...restaurant2, userId: restaurantId1};
  var r3 = {...restaurant3, userId: restaurantId2};
  var r4 = {...restaurant4, userId: restaurantId2};
  Restaurant.destroy({where: {}})
    .then(function() {
      Restaurant.bulkCreate([r1, r2, r3, r4])
        .then(() => {
          done();
        });
    })
});

before((done) => {
  MealInfo.destroy({where: {}})
    .then(function(){
      MealInfo.bulkCreate([mealInfo1, mealInfo2]).then(()=> {
        done()
      })
    })
})

before((done) =>{
  TimeSlot.bulkCreate([timeslot1, timeslot2, timeslot3, timeslot4])
    .then(() => {done();}).catch((err) => {console.log("One, " + err)});
});

// Create the meals
before(function(done) {
  Meal.destroy({where: {}})
    .then(function(){
      Meal.bulkCreate([ml1, ml2, ml3, ml4]).then(()=> {
        done()
      })
    })
});

before((done) => {
  var m1 = {...menu1, restaurantId: restaurant1.id, userId: restaurantId1};
  var m2 = {...menu2, restaurantId: restaurant1.id, userId: restaurantId1};
  var m3 = {...menu3, restaurantId: restaurant2.id, userId: restaurantId2};
  var m4 = {...menu4, restaurantId: restaurant2.id, userId: restaurantId2};
  Menu.destroy({where: {}})
    .then(function() {
      Menu.bulkCreate([m1, m2, m3, m4])
        .then(() => {
          done();
        });
      });
});

describe('/POST /api/user/carts endpoint', () => {
  
  // Clear the database
  before(function(done) {
    Cart.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "user" role should be able to create cart item', (done) => {
    chai.request(app)
      .post('/api/user/carts/increment')
      .set('Authorization', userJWT1)
      .send({menuId: menu1.id})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully updated');
        res.body.cart.should.have.property('id');
        res.body.cart.should.have.property('menuId');
        res.body.cart.should.have.property('quantity').eql(1);
        res.body.cart.should.not.have.property('userId');
        res.body.cart.should.not.have.property('menu');
        done();
      });
  });

  it('User with "user" role should be able to create cart item', (done) => {
    chai.request(app)
      .post('/api/user/carts/increment')
      .set('Authorization', userJWT1)
      .send({menuId: menu1.id})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully updated');
        res.body.cart.should.have.property('id');
        res.body.cart.should.have.property('menuId');
        res.body.cart.should.have.property('quantity').eql(2);
        res.body.cart.should.not.have.property('userId');
        res.body.cart.should.not.have.property('menu');
        done();
      });
  });

  it('User with "user" role should be able to create cart item (close cutoff time)', (done) => {
    chai.request(app)
      .post('/api/user/carts/increment')
      .set('Authorization', userJWT1)
      .send({menuId: menu4.id})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully updated');
        res.body.cart.should.have.property('id');
        res.body.cart.should.have.property('menuId');
        res.body.cart.should.have.property('quantity').eql(1);
        res.body.cart.should.not.have.property('userId');
        res.body.cart.should.not.have.property('menu');
        done();
      });
  });

  it('User with "user" role should be able to create cart item', (done) => {
    chai.request(app)
      .post('/api/user/carts/increment')
      .set('Authorization', userJWT1)
      .send({menuId: menu3.id})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Invalid menu IDs');
        done();
      });
  });

  it('User with "user" role should be able to create cart item', (done) => {
    chai.request(app)
      .post('/api/user/carts/decrement')
      .set('Authorization', userJWT1)
      .send({menuId: menu1.id})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully updated');
        res.body.cart.should.have.property('id');
        res.body.cart.should.have.property('menuId');
        res.body.cart.should.have.property('quantity').eql(1);
        res.body.cart.should.not.have.property('userId');
        res.body.cart.should.not.have.property('menu');
        done();
      });
  });

  it('User with "user" role should be able to create cart item', (done) => {
    chai.request(app)
      .post('/api/user/carts/decrement')
      .set('Authorization', userJWT1)
      .send({menuId: menu1.id})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.cart.should.have.property('quantity').eql(0);
        res.body.should.have.property('message').eql('Cart item deleted');
        res.body.cart.should.not.have.property('userId');
        res.body.cart.should.not.have.property('menu');
        done();
      });
  });

});

describe('/POST /api/user/carts endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Cart.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "user" role should be able to create cart item', (done) => {
    chai.request(app)
      .post('/api/user/carts')
      .set('Authorization', userJWT1)
      .send({menuId: menu1.id, quantity: 7})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully created');
        res.body.cart.should.have.property('id');
        res.body.cart.should.have.property('menuId');
        res.body.cart.should.have.property('quantity').eql(7);
        res.body.cart.should.not.have.property('userId');
        res.body.cart.should.not.have.property('menu');
        done();
      });
  });
});

describe('/GET /api/user/carts endpoint', () => {
  // Clear the database
  beforeEach(function(done) {

    var carts = [
      {quantity: 5, menuId: menu1.id, userId: userId1, id: uuid()},
      {quantity: 5, menuId: menu2.id, userId: userId2, id: uuid()},
      {quantity: 5, menuId: menu3.id, userId: userId1, id: uuid()},
      {quantity: 5, menuId: menu4.id, userId: userId2, id: uuid()},
    ];
    Cart.destroy({where: {}})
      .then(function(){
        Cart.bulkCreate(carts).then(function(){done();});
      });
  });

  it('User with "user" role should be able to get their carts', (done) => {
    chai.request(app)
      .get('/api/user/carts/')
      .set('Authorization', userJWT1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart items successfully found');
        res.body.carts.should.be.a('array');
        res.body.carts.length.should.be.eql(2);
        res.body.carts[0].should.have.property('quantity');
        res.body.carts[0].should.have.property('menuId');
        res.body.carts[0].menu.should.have.property('mealName');
        res.body.carts[0].menu.should.have.property('mealDescription');
        res.body.carts[0].menu.should.have.property('mealinfo');
        res.body.carts[0].menu.should.not.have.property('userId');
        res.body.carts[0].menu.timeslot.restaurant.should.not.have.property('userId');
        done();
      });
  });
});

describe('/DELETE /api/user/carts endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    var carts = [
      {quantity: 5, menuId: menu1.id, userId: userId1, id: uuid()},
      {quantity: 5, menuId: menu2.id, userId: userId2, id: uuid()},
      {quantity: 5, menuId: menu3.id, userId: userId1, id: uuid()},
      {quantity: 5, menuId: menu4.id, userId: userId2, id: uuid()},
    ];
    Cart.destroy({where: {}})
      .then(function(){
        Cart.bulkCreate(carts).then(function(){done();});
      });
  });

  it('User with "user" role should be able to delete their carts', (done) => {
    chai.request(app)
      .delete('/api/user/carts/')
      .set('Authorization', userJWT1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart successfully deleted');
        chai.request(app)
          .get('/api/user/carts/')
          .set('Authorization', userJWT1)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Cart items successfully found');
            res.body.carts.should.be.a('array');
            res.body.carts.length.should.be.eql(0);
            done();
          });
      });
  });
});


describe('/PUT /api/user/carts/:cartId endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    Cart.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "user" role should be able to update their cart', (done) => {
    Cart.create({quantity: 5, menuId: menu4.id, userId: userId1, id: uuid(), menuId: menu1.id}).then(function(cart) {
      chai.request(app)
      .put('/api/user/carts/' + cart.id)
      .set('Authorization', userJWT1)
      .send({quantity: 100})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully updated');
        res.body.cart.should.have.property('id');
        res.body.cart.should.have.property('menuId');
        res.body.cart.should.have.property('quantity').eql(100);
        res.body.cart.should.not.have.property('userId');
        res.body.cart.should.not.have.property('meal');
        done();
      });
    })
  });

  it('User with "user" role should NOT be able to update their cart', (done) => {
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid(), menuId: menu1.id}).then(function(cart) {
      chai.request(app)
      .put('/api/user/carts/' + cart.id)
      .set('Authorization', userJWT2)
      .send({quantity: 100})
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('User is not authorized');
        done();
      });
    })
  });
});

describe('/DELETE /api/user/carts/:cartId endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    Cart.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "user" role should be able to delete their cart', (done) => {
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid(), menuId: menu1.id}).then(function(cart) {
      chai.request(app)
      .delete('/api/user/carts/' + cart.id)
      .set('Authorization', userJWT1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully deleted');
        res.body.cart.should.not.have.property('userId');
        res.body.cart.should.not.have.property('meal');
        done();
      });
    })
  });

  it('User with "user" role should NOT be able to delete their cart', (done) => {
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid(), menuId: menu1.id}).then(function(cart) {
      chai.request(app)
      .delete('/api/user/carts/' + cart.id)
      .set('Authorization', userJWT2)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('User is not authorized');
        done();
      });
    })
  });
});

describe('/GET /api/user/carts/:cartId endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    Cart.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "user" role should be able to get their cart', (done) => {
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid(), menuId: menu1.id}).then(function(cart) {
      chai.request(app)
      .get('/api/user/carts/' + cart.id)
      .set('Authorization', userJWT1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully found');
        res.body.cart.should.not.have.property('userId');
        res.body.cart.should.not.have.property('meal');
        done();
      });
    })
  });

  it('User with "user" role should NOT be able to get their cart', (done) => {
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid(), menuId: menu1.id}).then(function(cart) {
      chai.request(app)
      .get('/api/user/carts/' + cart.id)
      .set('Authorization', userJWT2)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('User is not authorized');
        done();
      });
    })
  });
});

after(function(done) {
  Cart.destroy({where: {}})
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
});