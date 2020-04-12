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
  Restaurant = db.restaurant,
  Meal = db.meal,
  Menu = db.menu,
  Cart = db.cart,
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
  userCredentials1 = {username: "testuser", email: 'testUser1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'},
  userCredentials2 = {username: "testuser1", email: 'testUser2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7326", firstName: 'Chris', account_type: 'user'},
  restaurantCredentials1 = {username: "testuser2", email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7327", firstName: 'Chris', account_type: 'restaurant'},
  restaurantCredentials2 = {username: "testuser3", email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7328", firstName: 'Chris', account_type: 'restaurant'},
  restaurant1 = {name:"Goldie 1", phoneNumber:"504-613-7325", email:"test21@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant2 = {name:"Goldie 2", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant3 = {name:"Goldie 3", phoneNumber:"504-613-7325", email:"test23@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant4 = {name:"Goldie 4", phoneNumber:"504-613-7325", email:"test24@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  menu1 = {date: "2021-04-01T18:00:00Z", id: uuid()},
  menu2 = {date: "2021-04-02T18:00:00Z", id: uuid()},
  menu3 = {date: "2020-04-03T18:00:00Z", id: uuid()},
  menu4 = {date: "2020-04-04T18:00:00Z", id: uuid()},
  meal1 = {name: "Chicken 1", description: "Its Chicken", category: "Meat", price: 7.50, finalized: true},
  meal2 = {name: "Chicken 2", description: "Its Chicken", category: "Meat", price: 7.50, finalized: false},
  ml1 = {...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1},
  ml2 = {...meal2, menuId: menu1.id, id: uuid(), userId: restaurantId1},
  ml3 = {...meal1, menuId: menu2.id, id: uuid(), userId: restaurantId1},
  ml4 = {...meal2, menuId: menu2.id, id: uuid(), userId: restaurantId1},
  ml5 = {...meal1, menuId: menu3.id, id: uuid(), userId: restaurantId2},
  ml6 = {...meal2, menuId: menu3.id, id: uuid(), userId: restaurantId2},
  ml7 = {...meal1, menuId: menu4.id, id: uuid(), userId: restaurantId2},
  ml8 = {...meal2, menuId: menu4.id, id: uuid(), userId: restaurantId2};

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

// Create the meals
before(function(done) {
  var
    _ml1 = {...ml1, menuId: menu1.id, userId: restaurantId1},
    _ml2 = {...ml2, menuId: menu1.id, userId: restaurantId1},
    _ml3 = {...ml3, menuId: menu2.id, userId: restaurantId1},
    _ml4 = {...ml4, menuId: menu2.id, userId: restaurantId1},
    _ml5 = {...ml5, menuId: menu3.id, userId: restaurantId2},
    _ml6 = {...ml6, menuId: menu3.id, userId: restaurantId2},
    _ml7 = {...ml7, menuId: menu4.id, userId: restaurantId2},
    _ml8 = {...ml8, menuId: menu4.id, userId: restaurantId2};
  Meal.destroy({where: {}})
    .then(function(){
      Meal.bulkCreate([_ml1, _ml2, _ml3, _ml4, _ml5, _ml6, _ml7, _ml8]).then(()=> {
        done()
      })
    })
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
      .send({mealId: ml1.id, quantity: 7})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully created');
        res.body.cart.should.have.property('id');
        res.body.cart.should.have.property('mealId');
        res.body.cart.should.have.property('quantity').eql(7);
        done();
      });
  });
});

describe('/GET /api/user/carts endpoint', () => {
  // Clear the database
  beforeEach(function(done) {

    var carts = [
      {quantity: 5, mealId: ml1.id, userId: userId1, id: uuid()},
      {quantity: 5, mealId: ml2.id, userId: userId2, id: uuid()},
      {quantity: 5, mealId: ml3.id, userId: userId1, id: uuid()},
      {quantity: 5, mealId: ml4.id, userId: userId2, id: uuid()},
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
        done();
      });
  });
});

describe('/GET /api/user/carts endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    var carts = [
      {quantity: 5, mealId: ml1.id, userId: userId1, id: uuid()},
      {quantity: 5, mealId: ml2.id, userId: userId2, id: uuid()},
      {quantity: 5, mealId: ml3.id, userId: userId1, id: uuid()},
      {quantity: 5, mealId: ml4.id, userId: userId2, id: uuid()},
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
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid()}).then(function(cart) {
      chai.request(app)
      .put('/api/user/carts/' + cart.id)
      .set('Authorization', userJWT1)
      .send({quantity: 100})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully updated');
        res.body.cart.should.have.property('id');
        res.body.cart.should.have.property('mealId');
        res.body.cart.should.have.property('quantity').eql(100);
        done();
      });
    })
  });

  it('User with "user" role should NOT be able to update their cart', (done) => {
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid()}).then(function(cart) {
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
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid()}).then(function(cart) {
      chai.request(app)
      .delete('/api/user/carts/' + cart.id)
      .set('Authorization', userJWT1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully deleted');
        done();
      });
    })
  });

  it('User with "user" role should NOT be able to delete their cart', (done) => {
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid()}).then(function(cart) {
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
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid()}).then(function(cart) {
      chai.request(app)
      .get('/api/user/carts/' + cart.id)
      .set('Authorization', userJWT1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Cart item successfully found');
        done();
      });
    })
  });

  it('User with "user" role should NOT be able to get their cart', (done) => {
    Cart.create({quantity: 5, mealId: ml4.id, userId: userId1, id: uuid()}).then(function(cart) {
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