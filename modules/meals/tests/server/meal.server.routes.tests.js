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
  Menu = db.menu,
  Restaurant = db.restaurant,
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
  menu = {name: "Chicken", description: "Its Chicken", date: "2020-03-31 13:00:00", category: "Meat", price: 7.50};

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
  var r2 = {...restaurant2, ...{userId: restaurantId1}};
  var r3 = {...restaurant3, ...{userId: restaurantId2}};
  var r4 = {...restaurant4, ...{userId: restaurantId2}};
  Restaurant.bulkCreate([r1, r2, r3, r4])
    .then(() => {
      done();
    });
});

describe('/GET /api/menus endpoint', () => {
  
  // Clear the database
  before(function(done) {
    var menu1 = {...menu, restaurantId: restaurant1.id, id: uuid(), visible: false, date: "2020-04-04 06:30:00"};
    var menu2 = {...menu, restaurantId: restaurant1.id, id: uuid(), category: "Vegan", date: "2020-04-05 06:30:00"};
    var menu3 = {...menu, restaurantId: restaurant2.id, id: uuid(), date: "2020-06-05 06:30:00"};
    var menu4 = {...menu, restaurantId: restaurant2.id, id: uuid(), price: 5.00};

    Menu.destroy({where: {}})
    	.then(function(){
        Menu.bulkCreate([menu1, menu2, menu3, menu4], {returning: true}).then(function(menus) {
          done()
        })
      })
  });

  it('User with "user" role should get all menus', (done) => {
    chai.request(app)
      .get('/api/menus')
      .set('Authorization', userJWT1)
      .query({startDate: "2020-04-01 06:30:00", endDate: "2020-04-05 06:20:00"})
      .end((err, res) => {
       res.body.menus.should.be.a('array');
       res.body.menus.length.should.be.eql(1);
       res.body.should.have.property('message').eql('Menus successfully found');
       res.should.have.status(200);
       done();
      });
  });

  it('User with "restaurant" role should get all menus', (done) => {
    chai.request(app)
      .get('/api/menus')
      .set('Authorization', restaurantJWT1)
      .end((err, res) => {
       res.body.menus.should.be.a('array');
       res.body.menus.length.should.be.eql(4);
       res.body.should.have.property('message').eql('Menus successfully found');
       res.should.have.status(200);
     done();
      });
  });
});

describe('/GET /api/restaurants/:restaurantId/menus endpoint', () => {
  
  // Clear the database
  before(function(done) {
    var menu1 = {...menu, restaurantId: restaurant1.id, id: uuid(), visible: false};
    var menu2 = {...menu, restaurantId: restaurant1.id, id: uuid(), category: "Vegan"};
    var menu3 = {...menu, restaurantId: restaurant2.id, id: uuid(), date: "2020-04-05 06:30:00"};
    var menu4 = {...menu, restaurantId: restaurant2.id, id: uuid(), price: 5.00};

    Menu.destroy({where: {}})
      .then(function(){
        Menu.bulkCreate([menu1, menu2, menu3, menu4], {returning: true}).then(function(menus) {
          done()
        });
      });
  });

  it('User with "user" role should get all menus associated with restaurant1', (done) => {
    chai.request(app)
      .get('/api/restaurants/' + restaurant1.id + '/menus')
      .set('Authorization', userJWT1)
      .end((err, res) => {
        res.body.menus.should.be.a('array');
        res.body.menus.length.should.be.eql(2);
        res.body.should.have.property('message').eql('Menus successfully found');
        res.should.have.status(200);
        done();
      });
  });

  it('User with "restaurant" role should get all menus associated with rest', (done) => {
    chai.request(app)
      .get('/api/restaurants/' + restaurant1.id + '/menus')
      .set('Authorization', restaurantJWT1)
      .end((err, res) => {
        res.body.menus.should.be.a('array');
        res.body.menus.length.should.be.eql(2);
        res.body.should.have.property('message').eql('Menus successfully found');
        res.should.have.status(200);
        done();
      });
  });
});

describe('/POST api/restaurants/:restaurantId/menus endpoint', () => {
  
  // Clear the database
  before(function(done) {
    Menu.destroy({where: {}})
    	.then(function(){done()})
  });

  //  id | name | description | date | category | menuImageURL | price | minQuantity | maxQuantity | visible | createdAt | updatedAt | restaurantId 

  it('User with "restaurant" role should be able to create menu for associated restaurant', (done) => {
    chai.request(app)
      .post('/api/restaurants/' + restaurant1.id + '/menus')
      .set('Authorization', restaurantJWT1)
      .send(menu)
      .end((err, res) => {
    	  res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Menu successfully created');
        res.body.menu.should.have.property('id');
        res.body.menu.should.have.property('name');
        res.body.menu.should.have.property('description');
        res.body.menu.should.have.property('date');
        res.body.menu.should.have.property('category');
        res.body.menu.should.have.property('menuImageURL');
        res.body.menu.should.have.property('price');
        res.body.menu.should.have.property('minQuantity');
        res.body.menu.should.have.property('maxQuantity');
        res.body.menu.should.have.property('visible');
        res.body.menu.should.have.property('restaurantId');
        done();
      });
  });

  it('User with "restaurant" role should NOT be able to create menu for NON-associated restaurant', (done) => {
    chai.request(app)
      .post('/api/restaurants/' + restaurant1.id + '/menus')
      .set('Authorization', restaurantJWT2)
      .send(menu)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("User is not authorized");
        done();
      });
  });

  it('User with "user" role should NOT be able to access endpoint', (done) => {
    chai.request(app)
      .post('/api/restaurants/' + restaurant1.id + '/menus')
      .set('Authorization', userJWT1)
      .send(menu)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("User is not authorized");
        done();
      });
  });
});

describe('/PUT api/restaurants/:restaurantId/menus endpoint', () => {
  
  // Clear the database
  before(function(done) {
    Menu.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "restaurant" role should be able to update menu for associated restaurant', (done) => {
    Menu.create({...menu, id: uuid(), restaurantId : restaurant1.id}).then( (menu) => {
      chai.request(app)
        .put('/api/restaurants/' + restaurant1.id + '/menus/' + menu.id)
        .set('Authorization', restaurantJWT1)
        .send({name: "Chicken 2!!", date: "2020-06-05 18:30:00"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Menu successfully updated');
          res.body.menu.should.have.property('name').eql('Chicken 2!!');
          done();
        });
      });
  });

  it('User with "restaurant" role should NOT be able to update menu for NON-associated restaurant', (done) => {
    Menu.create({...menu, id: uuid(), restaurantId : restaurant1.id}).then( (menu) => {
      chai.request(app)
        .put('/api/restaurants/' + restaurant1.id + '/menus/' + menu.id)
        .set('Authorization', restaurantJWT2)
        .send({name: "Chicken 2!!"})
        .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.property('message');
            res.body.message.should.be.eql("User is not authorized");
            done();
          });
      });
  });

  it('User with "restaurant" role should NOT be able to update NON-associated menu for associated restaurant', (done) => {
    Menu.create({...menu, id: uuid(), restaurantId : restaurant1.id}).then( (menu) => {
      chai.request(app)
        .put('/api/restaurants/' + restaurant2.id + '/menus/' + menu.id)
        .set('Authorization', restaurantJWT2)
        .send({name: "Chicken 2!!"})
        .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.property('message');
            res.body.message.should.be.eql("User is not authorized");
            done();
          });
      });
  });

  it('User with "user" role should NOT be able to access endpoint', (done) => {
    Menu.create({...menu, id: uuid(), restaurantId : restaurant1.id}).then( (menu) => {
      chai.request(app)
        .put('/api/restaurants/' + restaurant1.id + '/menus/' + menu.id)
        .set('Authorization', userJWT1)
        .send({name: "Chicken 2!!"})
        .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.property('message');
            res.body.message.should.be.eql("User is not authorized");
            done();
          });
      });
  });
});

describe('/DELETE api/restaurants/:restaurantId/menus endpoint', () => {
  
  // Clear the database
  before(function(done) {
    Menu.destroy({where: {}})
      .then(function(){done()})
  });

  it('User with "restaurant" role should be able to delete menu for associated restaurant', (done) => {
    Menu.create({...menu, ...{id: uuid(), restaurantId : restaurant1.id}}).then( (menu) => {
      chai.request(app)
        .delete('/api/restaurants/' + restaurant1.id + '/menus/' + menu.id)
        .set('Authorization', restaurantJWT1)
        .end((err, res) => {
             res.should.have.status(200);
             res.body.should.have.property('message');
             res.body.message.should.be.eql("Menu successfully deleted");
             done();
          });
      });
  });

  it('User with "restaurant" role should be NOT be able to delete menu for NON-associated restaurant', (done) => {
    Menu.create({...menu, ...{id: uuid(), restaurantId : restaurant1.id}}).then( (menu) => {
      chai.request(app)
        .delete('/api/restaurants/' + restaurant1.id + '/menus/' + menu.id)
        .set('Authorization', restaurantJWT2)
        .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.property('message');
            res.body.message.should.be.eql("User is not authorized");
            done();
          });
      });
  });

  it('User with "restaurant" role should be NOT be able to delete menu for NON-associated restaurant', (done) => {
    Menu.create({...menu, ...{id: uuid(), restaurantId : restaurant1.id}}).then( (menu) => {
      chai.request(app)
        .delete('/api/restaurants/' + restaurant2.id + '/menus/' + menu.id)
        .set('Authorization', restaurantJWT2)
        .end((err, res) => {
            res.should.have.status(403);
            res.body.should.have.property('message');
            res.body.message.should.be.eql("User is not authorized");
            done();
          });
      });
  });

  it('User with "user" role should be NOT be able to access delete endpoint', (done) => {
    Menu.create({...menu, ...{id: uuid(), restaurantId : restaurant1.id}}).then( (menu) => {
      chai.request(app)
        .delete('/api/restaurants/' + restaurant1.id + '/menus/' + menu.id)
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
