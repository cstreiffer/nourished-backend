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
  Restaurant = db.restaurant,
  Location = db.location,
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
  menu1 = {name: "Chicken 1", description: "Its Chicken", date: "2024-04-07 18:20:00", category: "Meat", price: 7.50, id: uuid()},
  menu2 = {name: "Chicken 2", description: "Its Chicken", date: "2019-04-08 10:30:00", category: "Meat", price: 7.50, id: uuid()},
  hospital1 = {name:"Presby 1", phoneNumber:"xxx-xxx-xxxx", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  hospital2 = {name:"Presby 2", phoneNumber:"xxx-xxx-xxxx", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  location1 = {name:"Floor 1", accessInfo: "Take the elevator.", otherInfo: "Just follow the lights.", id: uuid()},
  location2 = {name:"Floor 1", accessInfo: "Take the elevator.", otherInfo: "Just follow the lights.", id: uuid()},
  order = {quantity: 7, information: "Allergic to peanuts"};

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
  var r1 = {...restaurant1, ...{userId: restaurantId1}};
  var r2 = {...restaurant2, ...{userId: restaurantId2}};
  Restaurant.bulkCreate([r1, r2])
    .then(() => {
      var m1 = {...menu1, ...{restaurantId: restaurant1.id}};
      var m2 = {...menu2, ...{restaurantId: restaurant2.id}};
      Menu.bulkCreate([m1, m2]).then(function() {
        done();
      });
    });
});

before(function(done) {
  Hospital.bulkCreate([hospital1, hospital2]).then(function() {
    var l1 = {...location1, ...{hospitalId: hospital1.id}};
    var l2 = {...location2, ...{hospitalId: hospital2.id}};
    Location.bulkCreate([l1, l2]).then(function() {
      done();
    });
  });
});

describe('/POST /api/menus/:menuId/orders endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "user" role should be able to create order', (done) => {
    chai.request(app)
      .post('/api/menus/' + menu1.id + '/orders')
      .set('Authorization', userJWT1)
      .send({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, date: new Date().toISOString()})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Order successfully created');
        res.body.order.should.have.property('date');
        res.body.order.should.have.property('userStatus');
        res.body.order.should.have.property('restStatus');
        res.body.order.should.have.property('quantity');
        res.body.order.should.have.property('information');
        res.body.order.should.have.property('id');
        res.body.order.should.have.property('menuId').eql(menu1.id);
        res.body.order.should.have.property('userId').eql(userId1);
        res.body.order.should.have.property('locationId').eql(location1.id);
        done();
      });
  });


  it('User should not be able to place order after date closed', (done) => {
    chai.request(app)
      .post('/api/menus/' + menu2.id + '/orders')
      .set('Authorization', userJWT1)
      .send({...order, userId: userId1, locationId: location1.id})
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("Orders can no longer be created/updated");
        done();
      });
  });

  it('User with "restaurant" role should not be able to create order', (done) => {
    chai.request(app)
      .post('/api/menus/' + menu1.id + '/orders')
      .set('Authorization', restaurantJWT1)
      .send({...order, locationId: location1.id})
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("User is not authorized");
        done();
      });
  });

  it('User with "user" role should NOT be able to create order without LOCATION ID', (done) => {
    chai.request(app)
      .post('/api/menus/' + menu1.id + '/orders')
      .set('Authorization', userJWT1)
      .send({...order})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("Please include location");
        done();
      });
  });
});

describe('/GET /api/orders/:orderId endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "user" role should be able to get their order', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .get('/api/menus/' + menu1.id + '/orders/' + order.id)
        .set('Authorization', userJWT1)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Order successfully found');
          res.body.order.should.have.property('date');
          res.body.order.should.have.property('userStatus');
          res.body.order.should.have.property('restStatus');
          res.body.order.should.have.property('quantity');
          res.body.order.should.have.property('information');
          res.body.order.should.have.property('id');
          res.body.order.should.have.property('menuId');
          res.body.order.should.have.property('userId');
          res.body.order.should.have.property('locationId');
          done();
        });
    });
  });

  it('User with "user" role should NOT be able to get other users order', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .get('/api/menus/' + menu1.id + '/orders/' + order.id)
        .set('Authorization', userJWT2)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });
});

describe('/PUT /api/menus/:menuId/orders/:orderId endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){done()})
  });


  it('User with "user" role who created order should be able to update order', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .put('/api/menus/' + menu1.id + '/orders/' + order.id)
        .set('Authorization', userJWT1)
        .send({quantity: 2, information: 'No allergies', locationId: location2.id, menuId: menu2.id, userStatus: "RECEIVED"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Order successfully updated');
          res.body.order.should.have.property('quantity').eql(2);
          res.body.order.should.have.property('information').eql('No allergies');
          res.body.order.should.have.property('locationId').eql(location2.id);
          res.body.order.should.have.property('menuId').eql(menu1.id);
          res.body.order.should.have.property('userStatus').eql("RECEIVED");
          done();
        });
    });
  });

  it('User should not be able to place order after date closed', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu2.id, id: uuid()}).then((order) => {
      chai.request(app)
        .put('/api/menus/' + menu2.id + '/orders/' + order.id)
        .set('Authorization', userJWT1)
        .send({quantity: 2, information: 'No allergies', locationId: location2.id, menuId: menu2.id, userStatus: "RECEIVED"})
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("Orders can no longer be created/updated");
          done();
        });
    });
  });

  it('User with "user" role who did NOT create order should NOT be able to update order', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .put('/api/menus/' + menu1.id + '/orders/' + order.id)
        .set('Authorization', userJWT2)
        .send({quantity: 2, information: 'No allergies', locationId: location2.id, menuId: menu2.id})
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });

  it('User with "restaurant" role who owns menu should not be able to update order through this route', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .put('/api/menus/' + menu1.id + '/orders/' + order.id)
        .set('Authorization', restaurantJWT1)
        .send({quantity: 2, information: 'No allergies', locationId: location2.id, menuId: menu2.id})
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });

});


describe('/DELETE /api/menus/:menuId/orders/:orderId endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "user" role who created order should be able to update order', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .delete('/api/menus/' + menu1.id + '/orders/' + order.id)
        .set('Authorization', userJWT1)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Order successfully deleted');
          done();
         });
    });
  });

  it('User should not be able to place delete order after date closed', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu2.id, id: uuid()}).then((order) => {
      chai.request(app)
        .delete('/api/menus/' + menu2.id + '/orders/' + order.id)
        .set('Authorization', userJWT1)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("Orders can no longer be created/updated");
          done();
        });
    });
  });

  it('User with "user" role who did NOT create order should NOT be able to delete order', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .delete('/api/menus/' + menu1.id + '/orders/' + order.id)
        .set('Authorization', userJWT2)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });

  it('User with "restaurant" role who owns menu should not be able to delete order', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .delete('/api/menus/' + menu1.id + '/orders/' + order.id)
        .set('Authorization', restaurantJWT1)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });

});


describe('/GET /api/user/orders endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){done()})
  });


  it('User with "user" role should be able to get their order', (done) => {
    var m1 = {...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()};
    var m2 = {...order, userId: userId2, locationId: location1.id, menuId: menu1.id, id: uuid()};
    Order.bulkCreate([m1, m2]).then((order) => {
      chai.request(app)
        .get('/api/user/orders')
        .set('Authorization', userJWT1)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.orders.should.be.a('array');
          res.body.orders.length.should.be.eql(1);
          done();
        });
    });
  });

  it('User with role "restaurant" should NOT be able to access endpoint.', (done) => {
    var m1 = {...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()};
    var m2 = {...order, userId: userId2, locationId: location1.id, menuId: menu1.id, id: uuid()};
      Order.bulkCreate([m1, m2]).then((order) => {
      chai.request(app)
        .get('/api/user/orders')
        .set('Authorization', restaurantJWT1)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });
});

describe('/GET /api/restaurants/:restaurantId//orders/', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Order.destroy({where: {}})
      .then(function(){done()})
  });


  it('User with "restaurant" role should be able to get orders associated with certain menu', (done) => {
    var m1 = {...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()};
    var m2 = {...order, userId: userId2, locationId: location1.id, menuId: menu1.id, id: uuid()};
    var m3 = {...order, userId: userId2, locationId: location1.id, menuId: menu2.id, id: uuid()};
    Order.bulkCreate([m1, m2, m3]).then((order) => {
      chai.request(app)
        .get('/api/restaurants/' + restaurant1.id + '/orders' )
        .set('Authorization', restaurantJWT1)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.orders.should.be.a('array');
          res.body.orders.length.should.be.eql(2);
          done();
        });
    });
  });

  it('User with "user" role should NOT be able to access endpoint', (done) => {
    var m1 = {...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()};
    var m2 = {...order, userId: userId2, locationId: location1.id, menuId: menu1.id, id: uuid()};
    var m3 = {...order, userId: userId2, locationId: location1.id, menuId: menu2.id, id: uuid()};
    Order.bulkCreate([m1, m2, m3]).then((order) => {
      chai.request(app)
        .get('/api/restaurants/' + restaurant1.id + '/orders' )
        .set('Authorization', userJWT1)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });
});

// 
describe('/PUT /api/restaurants/:restaurantId/menus/:menuId/orders/:orderId endpoint', () => {
  
  // Clear the database
  before(function(done) {
    Order.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "restaurant" role who owns menu should be able to update restStatus', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .put('/api/restaurants/' + restaurant1.id + '/orders/' + order.id)
        .set('Authorization', restaurantJWT1)
        .send({quantity: 2, information: 'No allergies', locationId: location2.id, menuId: menu2.id, restStatus: "RECEIVED"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Order successfully updated');
          res.body.order.should.have.property('quantity').eql(order.quantity);
          res.body.order.should.have.property('information').eql(order.information);
          res.body.order.should.have.property('locationId').eql(order.locationId);
          res.body.order.should.have.property('menuId').eql(order.menuId);
          res.body.order.should.have.property('restStatus').eql("RECEIVED");
          done();
        });
    });
  });

  it('User with "user" role who created order should NOT be able to update restStatus', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .put('/api/restaurants/' + restaurant1.id + '/orders/' + order.id)
        .set('Authorization', userJWT1)
        .send({restStatus: "RECEIVED"})
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });

  it('User with "restaurant" role who owns menu NOT associated with order should NOT be able to update resStatus', (done) => {
    Order.create({...order, userId: userId1, locationId: location1.id, menuId: menu1.id, id: uuid()}).then((order) => {
      chai.request(app)
        .put('/api/restaurants/' + restaurant2.id + '/orders/' + order.id)
        .set('Authorization', restaurantJWT2)
        .send({restStatus: "RECEIVED"})
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });

});
