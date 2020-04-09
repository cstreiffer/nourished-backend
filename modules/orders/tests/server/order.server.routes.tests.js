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
  Menu = db.menu,
  Order = db.order,
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
  userCredentials1 = {email: 'testUser1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'},
  userCredentials2 = {email: 'testUser2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'},
  restaurantCredentials1 = {email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'restaurant'},
  restaurantCredentials2 = {email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'restaurant'},
  restaurant1 = {name:"Goldie 1", phoneNumber:"504-613-7325", email:"test21@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant2 = {name:"Goldie 2", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant3 = {name:"Goldie 3", phoneNumber:"504-613-7325", email:"test23@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant4 = {name:"Goldie 4", phoneNumber:"504-613-7325", email:"test24@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  menu1 = {date: "2021-04-01 13:00:00", id: uuid()},
  menu2 = {date: "2021-04-02 13:00:00", id: uuid()},
  menu3 = {date: "2020-04-03 13:00:00", id: uuid()},
  menu4 = {date: "2020-04-04 13:00:00", id: uuid()},
  meal1 = {name: "Chicken 1", description: "Its Chicken", category: "Meat", price: 7.50, finalized: true},
  meal2 = {name: "Chicken 2", description: "Its Chicken", category: "Meat", price: 7.50, finalized: false},
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

describe('/POST /api/menus/:menuId/orders endpoint', () => {
  
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


  // it('User should not be able to place order after date closed', (done) => {
  //   chai.request(app)
  //     .post('/api/menus/' + menu2.id + '/orders')
  //     .set('Authorization', userJWT1)
  //     .send({...order, userId: userId1, locationId: location1.id})
  //     .end((err, res) => {
  //       res.should.have.status(403);
  //       res.body.should.have.property('message');
  //       res.body.message.should.be.eql("Orders can no longer be created/updated");
  //       done();
  //     });
  // });

  // it('User with "restaurant" role should not be able to create order', (done) => {
  //   chai.request(app)
  //     .post('/api/menus/' + menu1.id + '/orders')
  //     .set('Authorization', restaurantJWT1)
  //     .send({...order, locationId: location1.id})
  //     .end((err, res) => {
  //       res.should.have.status(403);
  //       res.body.should.have.property('message');
  //       res.body.message.should.be.eql("User is not authorized");
  //       done();
  //     });
  // });

  // it('User with "user" role should NOT be able to create order without LOCATION ID', (done) => {
  //   chai.request(app)
  //     .post('/api/menus/' + menu1.id + '/orders')
  //     .set('Authorization', userJWT1)
  //     .send({...order})
  //     .end((err, res) => {
  //       res.should.have.status(400);
  //       res.body.should.have.property('message');
  //       res.body.message.should.be.eql("Please include location");
  //       done();
  //     });
  // });
});

// describe('/GET /api/orders/:orderId endpoint', () => {
  
//   // Clear the database
//   beforeEach(function(done) {
//     Order.destroy({where: {}})
//       .then(function(){done()})
//   });

//   it('User with "user" role should be able to get their order', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .get('/api/menus/' + menu1.id + '/orders/' + order.id)
//         .set('Authorization', userJWT1)
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.should.have.property('message').eql('Order successfully found');
//           res.body.order.should.have.property('date');
//           res.body.order.should.have.property('userStatus');
//           res.body.order.should.have.property('restStatus');
//           res.body.order.should.have.property('quantity');
//           res.body.order.should.have.property('information');
//           res.body.order.should.have.property('id');
//           res.body.order.should.have.property('menuId');
//           res.body.order.should.have.property('userId');
//           res.body.order.should.have.property('locationId');
//           done();
//         });
//     });
//   });

//   it('User with "user" role should NOT be able to get other users order', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .get('/api/menus/' + menu1.id + '/orders/' + order.id)
//         .set('Authorization', userJWT2)
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("User is not authorized");
//           done();
//         });
//     });
//   });
// });

// describe('/PUT /api/menus/:menuId/orders/:orderId endpoint', () => {
  
//   // Clear the database
//   beforeEach(function(done) {
//     Order.destroy({where: {}})
//       .then(function(){done()})
//   });


//   it('User with "user" role who created order should be able to update order', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .put('/api/menus/' + menu1.id + '/orders/' + order.id)
//         .set('Authorization', userJWT1)
//         .send({quantity: 2, information: 'No allergies', locationId: location2.id, menuId: menu2.id, userStatus: "RECEIVED"})
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.should.have.property('message').eql('Order successfully updated');
//           res.body.order.should.have.property('quantity').eql(2);
//           res.body.order.should.have.property('information').eql('No allergies');
//           res.body.order.should.have.property('locationId').eql(location2.id);
//           res.body.order.should.have.property('menuId').eql(menu1.id);
//           res.body.order.should.have.property('userStatus').eql("RECEIVED");
//           done();
//         });
//     });
//   });

//   it('User should not be able to place order after date closed', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu2.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .put('/api/menus/' + menu2.id + '/orders/' + order.id)
//         .set('Authorization', userJWT1)
//         .send({quantity: 2, information: 'No allergies', locationId: location2.id, menuId: menu2.id, userStatus: "RECEIVED"})
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("Orders can no longer be created/updated");
//           done();
//         });
//     });
//   });

//   it('User with "user" role who did NOT create order should NOT be able to update order', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .put('/api/menus/' + menu1.id + '/orders/' + order.id)
//         .set('Authorization', userJWT2)
//         .send({quantity: 2, information: 'No allergies', locationId: location2.id, menuId: menu2.id})
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("User is not authorized");
//           done();
//         });
//     });
//   });

//   it('User with "restaurant" role who owns menu should not be able to update order through this route', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .put('/api/menus/' + menu1.id + '/orders/' + order.id)
//         .set('Authorization', restaurantJWT1)
//         .send({quantity: 2, information: 'No allergies', locationId: location2.id, menuId: menu2.id})
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("User is not authorized");
//           done();
//         });
//     });
//   });

// });


// describe('/DELETE /api/menus/:menuId/orders/:orderId endpoint', () => {
  
//   // Clear the database
//   beforeEach(function(done) {
//     Order.destroy({where: {}})
//       .then(function(){done()})
//   });

//   it('User with "user" role who created order should be able to update order', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .delete('/api/menus/' + menu1.id + '/orders/' + order.id)
//         .set('Authorization', userJWT1)
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.should.have.property('message').eql('Order successfully deleted');
//           done();
//          });
//     });
//   });

//   it('User should not be able to place delete order after date closed', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu2.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .delete('/api/menus/' + menu2.id + '/orders/' + order.id)
//         .set('Authorization', userJWT1)
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("Orders can no longer be created/updated");
//           done();
//         });
//     });
//   });

//   it('User with "user" role who did NOT create order should NOT be able to delete order', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .delete('/api/menus/' + menu1.id + '/orders/' + order.id)
//         .set('Authorization', userJWT2)
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("User is not authorized");
//           done();
//         });
//     });
//   });

//   it('User with "restaurant" role who owns menu should not be able to delete order', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .delete('/api/menus/' + menu1.id + '/orders/' + order.id)
//         .set('Authorization', restaurantJWT1)
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("User is not authorized");
//           done();
//         });
//     });
//   });

// });


// describe('/GET /api/user/orders endpoint', () => {
  
//   // Clear the database
//   beforeEach(function(done) {
//     Order.destroy({where: {}})
//       .then(function(){done()})
//   });


//   it('User with "user" role should be able to get their order', (done) => {
//     var m1 = {...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()};
//     var m2 = {...order, userId: userId2, locationId: location1.id, menuId: menu1.id, id: uuid()};
//     Order.bulkCreate([m1, m2]).then((order) => {
//       chai.request(app)
//         .get('/api/user/orders')
//         .set('Authorization', userJWT1)
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.orders.should.be.a('array');
//           res.body.orders.length.should.be.eql(1);
//           done();
//         });
//     });
//   });

//   it('User with role "restaurant" should NOT be able to access endpoint.', (done) => {
//     var m1 = {...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()};
//     var m2 = {...order, userId: userId2, locationId: location1.id, menuId: menu1.id, id: uuid()};
//       Order.bulkCreate([m1, m2]).then((order) => {
//       chai.request(app)
//         .get('/api/user/orders')
//         .set('Authorization', restaurantJWT1)
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("User is not authorized");
//           done();
//         });
//     });
//   });
// });

// describe('/GET /api/restaurants/:restaurantId//orders/', () => {
  
//   // Clear the database
//   beforeEach(function(done) {
//     Order.destroy({where: {}})
//       .then(function(){done()})
//   });


//   it('User with "restaurant" role should be able to get orders associated with certain menu', (done) => {
//     var m1 = {...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()};
//     var m2 = {...order, userId: userId2, locationId: location1.id, menuId: menu1.id, id: uuid()};
//     var m3 = {...order, userId: userId2, locationId: location1.id, menuId: menu2.id, id: uuid()};
//     Order.bulkCreate([m1, m2, m3]).then((order) => {
//       chai.request(app)
//         .get('/api/restaurants/' + restaurant1.id + '/orders' )
//         .set('Authorization', restaurantJWT1)
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.orders.should.be.a('array');
//           res.body.orders.length.should.be.eql(2);
//           done();
//         });
//     });
//   });

//   it('User with "user" role should NOT be able to access endpoint', (done) => {
//     var m1 = {...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()};
//     var m2 = {...order, userId: userId2, locationId: location1.id, menuId: menu1.id, id: uuid()};
//     var m3 = {...order, userId: userId2, locationId: location1.id, menuId: menu2.id, id: uuid()};
//     Order.bulkCreate([m1, m2, m3]).then((order) => {
//       chai.request(app)
//         .get('/api/restaurants/' + restaurant1.id + '/orders' )
//         .set('Authorization', userJWT1)
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("User is not authorized");
//           done();
//         });
//     });
//   });
// });

// // 
// describe('/PUT /api/restaurants/:restaurantId/menus/:menuId/orders/:orderId endpoint', () => {
  
//   // Clear the database
//   before(function(done) {
//     Order.destroy({where: {}})
//       .then(function(){done()})
//   });

//   it('User with "restaurant" role who owns menu should be able to update restStatus', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .put('/api/restaurants/' + restaurant1.id + '/orders/' + order.id)
//         .set('Authorization', restaurantJWT1)
//         .send({quantity: 2, information: 'No allergies', locationId: location2.id, menuId: menu2.id, restStatus: "RECEIVED"})
//         .end((err, res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.should.have.property('message').eql('Order successfully updated');
//           res.body.order.should.have.property('quantity').eql(order.quantity);
//           res.body.order.should.have.property('information').eql(order.information);
//           res.body.order.should.have.property('locationId').eql(order.locationId);
//           res.body.order.should.have.property('menuId').eql(order.menuId);
//           res.body.order.should.have.property('restStatus').eql("RECEIVED");
//           done();
//         });
//     });
//   });

//   it('User with "user" role who created order should NOT be able to update restStatus', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .put('/api/restaurants/' + restaurant1.id + '/orders/' + order.id)
//         .set('Authorization', userJWT1)
//         .send({restStatus: "RECEIVED"})
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("User is not authorized");
//           done();
//         });
//     });
//   });

//   it('User with "restaurant" role who owns menu NOT associated with order should NOT be able to update resStatus', (done) => {
//     Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
//       chai.request(app)
//         .put('/api/restaurants/' + restaurant2.id + '/orders/' + order.id)
//         .set('Authorization', restaurantJWT2)
//         .send({restStatus: "RECEIVED"})
//         .end((err, res) => {
//           res.should.have.status(403);
//           res.body.should.have.property('message');
//           res.body.message.should.be.eql("User is not authorized");
//           done();
//         });
//     });
//   });

// });





// after(function(done) {
//   Order.destroy({where: {}})
//   .then(function(){done()})
// });

// after(function(done) {
//   console.log("Running this right here");
//   stop();
//   done();
// });

// after(function(done) {
//   Hospital.destroy({where: {}})
//   .then(function(){done()})
// });

// after(function(done) {
//   User.destroy({where: {}})
//   .then(function(){done()})
// });

// after(function(done) {
//   Menu.destroy({where: {}})
//   .then(function(){done()})
// });

// after(function(done) {
//   Meal.destroy({where: {}})
//   .then(function(){done()})
// });


// after(function(done) {
//   Order.destroy({where: {}})
//   .then(function(){done()})
// });
