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
  Hospital = db.hospital,
  Restaurant = db.restaurant,
  Meal = db.meal,
  MealInfo = db.mealinfo,
  Menu = db.menu,
  Order = db.order,
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
  userCredentials1 = {id: uuid(), username: "testuser", email: 'testUser1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'},
  userCredentials2 = {id: uuid(), username: "testuser1", email: 'testUser2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7326", firstName: 'Chris', account_type: 'user'},
  restaurantCredentials1 = {id: uuid(), username: "testuser2", email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7327", firstName: 'Chris', account_type: 'restaurant'},
  restaurantCredentials2 = {id: uuid(), username: "testuser3", email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7328", firstName: 'Chris', account_type: 'restaurant'},
  restaurant1 = {name:"Goldie 1", phoneNumber:"504-613-7325", email:"test21@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant2 = {name:"Goldie 2", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant3 = {name:"Goldie 3", phoneNumber:"504-613-7325", email:"test23@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant4 = {name:"Goldie 4", phoneNumber:"504-613-7325", email:"test24@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  menu1 = {date: "2021-04-01T18:00:00Z", id: uuid()},
  menu2 = {date: "2021-04-02T18:00:00Z", id: uuid()},
  menu3 = {date: "2020-04-03T18:00:00Z", id: uuid()},
  menu4 = {date: "2020-04-04T18:00:00Z", id: uuid()},
  mealInfo1 = {type: "lunch", price: 5.00, time: "1:00", id: uuid()},
  mealInfo2 = {type: "dinner", price: 5.00, time: "7:00", id: uuid()},
  meal1 = {name: "Chicken 1", description: "Its Chicken", category: "Meat", mealinfoId: mealInfo1.id, finalized: true},
  meal2 = {name: "Chicken 2", description: "Its Chicken", category: "Meat", mealinfoId: mealInfo2.id, finalized: false},
  ml1 = {...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1},
  ml2 = {...meal2, menuId: menu1.id, id: uuid(), userId: restaurantId1},
  ml3 = {...meal1, menuId: menu2.id, id: uuid(), userId: restaurantId1},
  ml4 = {...meal2, menuId: menu2.id, id: uuid(), userId: restaurantId1},
  ml5 = {...meal1, menuId: menu3.id, id: uuid(), userId: restaurantId2},
  ml6 = {...meal2, menuId: menu3.id, id: uuid(), userId: restaurantId2},
  ml7 = {...meal1, menuId: menu4.id, id: uuid(), userId: restaurantId2},
  ml8 = {...meal2, menuId: menu4.id, id: uuid(), userId: restaurantId2},
  hospital1 = {name:"Presby 1", phoneNumber:"xxx-xxx-xxxx", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid(), dropoffLocation: "Take the elevator.", dropoffInfo: "Just follow the lights."},
  hospital2 = {name:"Presby 2", phoneNumber:"xxx-xxx-xxxx", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid(), dropoffLocation: "Take the elevator.", dropoffInfo: "Just follow the lights."},
  order = {quantity: 5, information: "Allergic to nuts."};

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
  MealInfo.destroy({where: {}})
    .then(function(){
      MealInfo.bulkCreate([mealInfo1, mealInfo2]).then(()=> {
        done()
      })
    })
})

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

before((done) => {
  Hospital.destroy({where: {}})
    .then(function() {
      Hospital.bulkCreate([hospital1, hospital2])
        .then(() => {
          done();
        });
    })
});

describe('/POST /api/user/orders endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "user" role should be able to create order', (done) => {
    chai.request(app)
      .post('/api/user/orders')
      .set('Authorization', userJWT1)
      .send({orders: [
          {...order, hospitalId: hospital1.id, mealId: ml1.id},
          {...order, hospitalId: hospital2.id, mealId: ml3.id},
      ]})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Orders successfully created');
        res.body.orders.should.be.a('array');
        res.body.orders[0].should.not.have.property('userId');
        res.body.orders[0].should.not.have.property('meal');
        res.body.orders[0].should.not.have.property('hospital');
        res.body.orders[0].should.have.property('groupId');
        res.body.orders[0].should.have.property('quantity');
        res.body.orders[0].should.have.property('mealId');
        res.body.orders[0].should.have.property('hospitalId');
        res.body.orders.length.should.be.eql(2);
        done();
      });
  });

  it('User with "user" role should NOT be able to create order if meal date expired', (done) => {
    chai.request(app)
      .post('/api/user/orders')
      .set('Authorization', userJWT1)
      .send({orders: [
          {...order, hospitalId: hospital1.id, mealId: ml1.id},
          {...order, hospitalId: hospital2.id, mealId: ml5.id},
      ]})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("Invalid order");
        done();
      });
  });

  it('User with "user" role should NOT be able to create order if meal NOT finalized', (done) => {
    chai.request(app)
      .post('/api/user/orders')
      .set('Authorization', userJWT1)
      .send({orders: [
          {...order, hospitalId: hospital1.id, mealId: ml1.id},
          {...order, hospitalId: hospital2.id, mealId: ml2.id},
      ]})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("Invalid order");
        done();
      });
  });

  it('User with "user" role should be NOT able to create order if mealId doesnt exist', (done) => {
    chai.request(app)
      .post('/api/user/orders')
      .set('Authorization', userJWT1)
      .send({orders: [
          {...order, hospitalId: hospital1.id, mealId: uuid()},
          {...order, hospitalId: hospital2.id, mealId: ml2.id},
      ]})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("Invalid meal IDs");
        done();
      });
  });

  it('User with "user" role should be NOT able to create order if NOT formatted correctly', (done) => {
    chai.request(app)
      .post('/api/user/orders')
      .set('Authorization', userJWT1)
      .send({orders: [
          {...order, mealId: ml1.id},
          {...order, hospitalId: hospital2.id, mealId: ml3.id},
      ]})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("Please include hospital and meal ids in every order");
        done();
      });
  });
});

// describe('/POST /api/user/orders endpoint with CART delete', () => {

//   before(function(done) {
//     var carts = [
//       {quantity: 5, mealId: ml1.id, userId: userId1, id: uuid()},
//       {quantity: 5, mealId: ml2.id, userId: userId2, id: uuid()},
//       {quantity: 5, mealId: ml3.id, userId: userId1, id: uuid()},
//       {quantity: 5, mealId: ml4.id, userId: userId2, id: uuid()},
//     ];
//     Cart.destroy({where: {}})
//       .then(function(){
//         Cart.bulkCreate(carts).then(function(){done();});
//       });
//   });

//   it('User with "user" role - cart should be wipe when post completes ', (done) => {
//     chai.request(app)
//       .post('/api/user/orders')
//       .set('Authorization', userJWT1)
//       .send({orders: [
//           {...order, hospitalId: hospital1.id, mealId: ml1.id},
//           {...order, hospitalId: hospital2.id, mealId: ml3.id},
//       ]})
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.should.have.property('message').eql('Orders successfully created');
//         res.body.orders.should.be.a('array');
//         res.body.orders.length.should.be.eql(2);
//         chai.request(app)
//           .get('/api/user/carts/')
//           .set('Authorization', userJWT1)
//           .end((err, res) => {
//             res.should.have.status(200);
//             res.body.should.be.a('object');
//             res.body.should.have.property('message').eql('Cart items successfully found');
//             res.body.carts.should.be.a('array');
//             res.body.carts.length.should.be.eql(0);
//             done();
//           });
//       });
//   });
// });

describe('/GET /api/orders/:orderId endpoint', () => {
  // Clear the database
  beforeEach(function(done) {

    var orders = [
      {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital1.id, mealId: ml2.id, userId: userId2, id: uuid(), groupId: userId2},
      {...order, hospitalId: hospital1.id, mealId: ml3.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital2.id, mealId: ml4.id, userId: userId2, id: uuid(), groupId: userId2},
    ];
    Order.destroy({where: {}})
      .then(function(){
        Order.bulkCreate(orders).then(function(){done();});
      });
  });

  it('User with "user" role should be able to get their orders', (done) => {
    chai.request(app)
      .get('/api/user/orders')
      .set('Authorization', userJWT1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Orders successfully found');
        res.body.orders.should.be.a('array');
        res.body.orders[0].should.have.property('groupId');
        res.body.orders[0].should.have.property('quantity');
        res.body.orders[0].should.have.property('mealId');
        res.body.orders[0].should.have.property('hospitalId');
        res.body.orders[0].should.not.have.property('userId');
        res.body.orders[0].meal.should.not.have.property('userId');
        res.body.orders[0].meal.menu.should.not.have.property('userId');
        res.body.orders[0].meal.menu.restaurant.should.not.have.property('userId');
        res.body.orders.length.should.be.eql(2);
        done();
      });
  });
});


describe('/PUT /api/user/orders endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "user" role should be able to get their orders', (done) => {
    var orders = [
      {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital1.id, mealId: ml3.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital2.id, mealId: ml4.id, userId: userId2, id: uuid(), groupId: userId2}
    ];
    Order.bulkCreate(orders).then(function() {
      chai.request(app)
      .put('/api/user/orders')
      .set('Authorization', userJWT1)
      .send({orders: [
          {...orders[0], quantity: 8},
          {...orders[1], quantity: 9, hospitalId: hospital2.id}
        ]})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Orders successfully updated');
        res.body.orders.should.be.a('array');
        res.body.orders[0].should.not.have.property('userId');
        res.body.orders[0].should.not.have.property('meal');
        res.body.orders[0].should.not.have.property('hospital');
        res.body.orders[0].should.have.property('groupId');
        res.body.orders[0].should.have.property('quantity');
        res.body.orders[0].should.have.property('mealId');
        res.body.orders[0].should.have.property('hospitalId');
        res.body.orders.length.should.be.eql(2);
        done();
      });
    })
  });

  it('User with "user" role should NOT be able to update order thats not theirs', (done) => {
    var orders = [
      {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital1.id, mealId: ml3.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital2.id, mealId: ml4.id, userId: userId2, id: uuid(), groupId: userId2}
    ];
    Order.bulkCreate(orders).then(function() {
      chai.request(app)
      .put('/api/user/orders')
      .set('Authorization', userJWT1)
      .send({orders: [
          {...orders[0], quantity: 8},
          {...orders[1], quantity: 9, hospitalId: hospital2.id},
          {...orders[2], quantity: 8}
        ]})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("Invalid order");
        done();
      });
    })
  });
});

describe('/DELETE /api/user/orders endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "user" role should be able to delete their orders', (done) => {
    var orders = [
      {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital1.id, mealId: ml3.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital2.id, mealId: ml4.id, userId: userId2, id: uuid(), groupId: userId2}
    ];
    Order.bulkCreate(orders).then(function() {
      chai.request(app)
      .delete('/api/user/orders')
      .set('Authorization', userJWT1)
      .send({orders: [
          {...orders[0]},
          {...orders[1]}
        ]})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Orders markerd as deleted');
        res.body.orders.should.be.a('array');
        res.body.orders[0].should.not.have.property('userId');
        res.body.orders[0].should.not.have.property('meal');
        res.body.orders[0].should.not.have.property('hospital');
        res.body.orders[0].should.have.property('groupId');
        res.body.orders[0].should.have.property('quantity');
        res.body.orders[0].should.have.property('mealId');
        res.body.orders[0].should.have.property('hospitalId');
        res.body.orders.length.should.be.eql(2);
        done();
      });
    })
  });

  it('User with "user" role should NOT be able to delete order thats not theirs', (done) => {
    var orders = [
      {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital1.id, mealId: ml3.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital2.id, mealId: ml4.id, userId: userId2, id: uuid(), groupId: userId2}
    ];
    Order.bulkCreate(orders).then(function() {
      chai.request(app)
      .delete('/api/user/orders')
      .set('Authorization', userJWT1)
      .send({orders: orders})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("Invalid order");
        done();
      });
    })
  });
});

describe('/PUT /api/user/orders/status endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "user" role should be able to update status by groupId', (done) => {
    var orders = [
      {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital1.id, mealId: ml3.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital2.id, mealId: ml4.id, userId: userId2, id: uuid(), groupId: userId2}
    ];
    Order.bulkCreate(orders).then(function() {
      chai.request(app)
      .put('/api/user/orders/status')
      .set('Authorization', userJWT1)
      .send({groupId: userId1, userStatus: "NOT_DELIVERED"})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Orders successfully updated');
        res.body.orders.should.be.a('array');
        res.body.orders[0].should.not.have.property('userId');
        res.body.orders[0].should.not.have.property('meal');
        res.body.orders[0].should.not.have.property('hospital');
        done();
      });
    })
  });


  it('User with "user" role should be able to update status by orderId array', (done) => {
    var orders = [
      {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital1.id, mealId: ml3.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital2.id, mealId: ml4.id, userId: userId2, id: uuid(), groupId: userId2}
    ];
    Order.bulkCreate(orders).then(function() {
      chai.request(app)
      .put('/api/user/orders/status')
      .set('Authorization', userJWT1)
      .send({orderIds: [orders[0].id, orders[1].id], userStatus: "NOT_DELIVERED"})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Orders successfully updated');
        res.body.orders.should.be.a('array');
        res.body.orders[0].should.not.have.property('userId');
        res.body.orders[0].should.not.have.property('meal');
        res.body.orders[0].should.not.have.property('hospital');
        done();
      });
    })
  });

  it('User with "user" role should be able to update status by mealId', (done) => {
    var orders = [
      {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital1.id, mealId: ml3.id, userId: userId1, id: uuid(), groupId: userId1},
      {...order, hospitalId: hospital2.id, mealId: ml1.id, userId: userId2, id: uuid(), groupId: userId2}
    ];
    Order.bulkCreate(orders).then(function() {
      chai.request(app)
      .put('/api/user/orders/status')
      .set('Authorization', userJWT1)
      .send({mealId: ml1.id, userStatus: "NOT_DELIVERED"})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Orders successfully updated');
        res.body.orders.should.be.a('array');
        res.body.orders[0].should.not.have.property('userId');
        res.body.orders[0].should.not.have.property('meal');
        res.body.orders[0].should.not.have.property('hospital');
        done();
      });
    })
  });
});

describe('/GET /api/rest/orders endpoint', () => {
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){
        var orders = [
          {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: userId1, id: uuid(), groupId: userId1},
          {...order, hospitalId: hospital1.id, mealId: ml2.id, userId: userId1, id: uuid(), groupId: userId1},
          {...order, hospitalId: hospital1.id, mealId: ml5.id, userId: userId1, id: uuid(), groupId: userId1},
          {...order, hospitalId: hospital2.id, mealId: ml6.id, userId: userId2, id: uuid(), groupId: userId2},
          {...order, hospitalId: hospital2.id, mealId: ml1.id, userId: userId2, id: uuid(), groupId: userId2},
          {...order, hospitalId: hospital2.id, mealId: ml2.id, userId: userId2, id: uuid(), groupId: userId2},
          {...order, hospitalId: hospital2.id, mealId: ml7.id, userId: userId2, id: uuid(), groupId: userId2},
          {...order, hospitalId: hospital2.id, mealId: ml8.id, userId: userId2, id: uuid(), groupId: userId2},
        ];
        Order.bulkCreate(orders).then(function() {
          done();
        });
      });
  });

  it('User with "restaurant" role should be able get all orders belonging to them', (done) => {
    chai.request(app)
    .get('/api/rest/orders')
    .set('Authorization', restaurantJWT1)
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('Orders successfully found');
      res.body.orders.should.be.a('array');
      res.body.orders.length.should.be.eql(4);
      res.body.orders[0].should.have.property('groupId');
      res.body.orders[0].should.have.property('quantity');
      res.body.orders[0].should.have.property('mealId');
      res.body.orders[0].should.have.property('hospitalId');
      res.body.orders[0].should.not.have.property('userId');
      res.body.orders[0].meal.should.not.have.property('userId');
      res.body.orders[0].meal.menu.should.not.have.property('userId');
      res.body.orders[0].meal.mealinfo.should.have.property('price');
      done();
    });
  });

  it('User with "restaurant" role should be able get all orders belonging to them and query by mealId', (done) => {
    chai.request(app)
    .get('/api/rest/orders')
    .set('Authorization', restaurantJWT1)
    .query({mealId: ml1.id})
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('Orders successfully found');
      res.body.orders.should.be.a('array');
      res.body.orders.length.should.be.eql(2);
      res.body.orders[0].should.have.property('groupId');
      res.body.orders[0].should.have.property('quantity');
      res.body.orders[0].should.have.property('mealId');
      res.body.orders[0].should.have.property('hospitalId');
      res.body.orders[0].should.not.have.property('userId');
      res.body.orders[0].meal.should.not.have.property('userId');
      res.body.orders[0].meal.menu.should.not.have.property('userId');
      res.body.orders[0].meal.mealinfo.should.have.property('price');
      done();
    });
  });

  it('User with "restaurant" role should be able get all orders belonging to them and query by date', (done) => {
    chai.request(app)
    .get('/api/rest/orders')
    .set('Authorization', restaurantJWT2)
    .query({startDate: "2020-04-01T11:30:00Z", endDate: "2021-04-04T12:30:00Z"})
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('Orders successfully found');
      res.body.orders.should.be.a('array');
      res.body.orders.length.should.be.eql(4);
      res.body.orders[0].should.have.property('groupId');
      res.body.orders[0].should.have.property('quantity');
      res.body.orders[0].should.have.property('mealId');
      res.body.orders[0].should.have.property('hospitalId');
      res.body.orders[0].should.not.have.property('userId');
      res.body.orders[0].meal.should.not.have.property('userId');
      res.body.orders[0].meal.menu.should.not.have.property('userId');
      res.body.orders[0].meal.mealinfo.should.have.property('price');
      done();
    });
  });
  
  it('User with "restaurant" role should be able get all orders belonging to them and query by menuId', (done) => {
    chai.request(app)
    .get('/api/rest/orders')
    .set('Authorization', restaurantJWT1)
    .query({menuId: menu1.id})
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('Orders successfully found');
      res.body.orders.should.be.a('array');
      res.body.orders.length.should.be.eql(4);
      res.body.orders[0].should.have.property('groupId');
      res.body.orders[0].should.have.property('quantity');
      res.body.orders[0].should.have.property('mealId');
      res.body.orders[0].should.have.property('hospitalId');
      res.body.orders[0].should.not.have.property('userId');
      res.body.orders[0].meal.should.not.have.property('userId');
      res.body.orders[0].meal.menu.should.not.have.property('userId');
      res.body.orders[0].meal.mealinfo.should.have.property('price');
      done();
    });
  });
});

describe('/PUT /api/rest/orders/status endpoint', () => {
  // Clear the database
  var orders;

  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){
        orders = [
          {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: userId1, id: uuid(), groupId: userId1},
          {...order, hospitalId: hospital1.id, mealId: ml2.id, userId: userId1, id: uuid(), groupId: userId1},
          {...order, hospitalId: hospital1.id, mealId: ml5.id, userId: userId1, id: uuid(), groupId: userId1},
          {...order, hospitalId: hospital2.id, mealId: ml6.id, userId: userId2, id: uuid(), groupId: userId2},
          {...order, hospitalId: hospital2.id, mealId: ml1.id, userId: userId2, id: uuid(), groupId: userId2},
          {...order, hospitalId: hospital2.id, mealId: ml2.id, userId: userId2, id: uuid(), groupId: userId2},
          {...order, hospitalId: hospital2.id, mealId: ml7.id, userId: userId2, id: uuid(), groupId: userId2},
          {...order, hospitalId: hospital2.id, mealId: ml8.id, userId: userId2, id: uuid(), groupId: userId2},
        ];
        Order.bulkCreate(orders).then(function() {
          done();
        });
      });
  });

  it('User with "restaurant" role shoudl be able to update orders by menuId', (done) => {
    chai.request(app)
    .put('/api/rest/orders/status')
    .set('Authorization', restaurantJWT1)
    .send({restStatus: "COMPLETE", menuId: menu1.id})
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('Orders successfully updated');
      res.body.orders.should.be.a('array');
      res.body.orders.length.should.be.eql(4);
      res.body.orders[0].should.not.have.property('userId');
      res.body.orders[0].should.not.have.property('meal');
      res.body.orders[0].should.not.have.property('hospital');
      done();
    });
  });

  it('User with "restaurant" role should be able to update orders based on mealId', (done) => {
    chai.request(app)
    .put('/api/rest/orders/status')
    .set('Authorization', restaurantJWT1)
    .send({restStatus: "COMPLETE", mealIds: [ml1.id, ml2.id]})
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('Orders successfully updated');
      res.body.orders.should.be.a('array');
      res.body.orders.length.should.be.eql(4);
      res.body.orders[0].should.not.have.property('userId');
      res.body.orders[0].should.not.have.property('meal');
      res.body.orders[0].should.not.have.property('hospital');
      done();
    });
  });

  it('User with "restaurant" role should NOT be able to update orders not belonging to them by menuId', (done) => {
    chai.request(app)
    .put('/api/rest/orders/status')
    .set('Authorization', restaurantJWT1)
    .send({restStatus: "COMPLETE", menuId: menu3.id})
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('Orders successfully updated');
      res.body.orders.should.be.a('array');
      res.body.orders.length.should.be.eql(0);
      done();
    });
  });

  it('User with "restaurant" role should be able to update orders based on orderId', (done) => {
    chai.request(app)
    .put('/api/rest/orders/status')
    .set('Authorization', restaurantJWT1)
    .send({restStatus: "COMPLETE", orderIds: [orders[0].id, orders[1].id]})
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('Orders successfully updated');
      res.body.orders.should.be.a('array');
      res.body.orders.length.should.be.eql(2);
      res.body.orders[0].should.not.have.property('userId');
      res.body.orders[0].should.not.have.property('meal');
      res.body.orders[0].should.not.have.property('hospital');
      done();
    });
  });

  it('User with "restaurant" role should only be able to updat orders belonging to them', (done) => {
    chai.request(app)
    .put('/api/rest/orders/status')
    .set('Authorization', restaurantJWT1)
    .send({restStatus: "COMPLETE", orderIds: [orders[0].id, orders[6].id]})
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('message').eql('Orders successfully updated');
      res.body.orders.should.be.a('array');
      res.body.orders.length.should.be.eql(1);
      res.body.orders[0].should.not.have.property('userId');
      res.body.orders[0].should.not.have.property('meal');
      res.body.orders[0].should.not.have.property('hospital');
      done();
    });
  });
});

after(function(done) {
  Order.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  Restaurant.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  Hospital.destroy({where: {}})
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
  Cart.destroy({where: {}})
  .then(function(){done()})
});

after(function(done) {
  stop();
  done();
});
