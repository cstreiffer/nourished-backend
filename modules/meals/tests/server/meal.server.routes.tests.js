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
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  should = chai.should(),
  fs = require('fs');

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
  menu1 = {date: "2020-04-01 13:00:00", id: uuid()},
  menu2 = {date: "2020-04-02 13:00:00", id: uuid()},
  menu3 = {date: "2020-04-03 13:00:00", id: uuid()},
  menu4 = {date: "2020-04-04 13:00:00", id: uuid()},
  meal1 = {name: "Chicken 1", description: "Its Chicken", date: "2019-04-08 10:30:00", category: "Meat", price: 7.50, finalized: false},
  meal2 = {name: "Chicken 2", description: "Its Chicken", date: "2019-04-08 10:30:00", category: "Meat", price: 7.50, finalized: true};

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
  Restaurant.bulkCreate([r1, r2, r3, r4])
    .then(() => {
      done();
    });
});

before((done) => {
  var m1 = {...menu1, restaurantId: restaurant1.id, userId: restaurantId1};
  var m2 = {...menu2, restaurantId: restaurant1.id, userId: restaurantId1};
  var m3 = {...menu3, restaurantId: restaurant2.id, userId: restaurantId2};
  var m4 = {...menu4, restaurantId: restaurant2.id, userId: restaurantId2};
  Menu.bulkCreate([m1, m2, m3, m4])
    .then(() => {
      done();
    });
});

describe('/GET /api/menus endpoint', () => {
  
  // Clear the database
  before(function(done) {
    var ml1 = {...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1};
    var ml2 = {...meal2, menuId: menu1.id, id: uuid(), userId: restaurantId1};
    var ml3 = {...meal1, menuId: menu2.id, id: uuid(), userId: restaurantId1};
    var ml4 = {...meal2, menuId: menu2.id, id: uuid(), userId: restaurantId1};
    var ml5 = {...meal1, menuId: menu3.id, id: uuid(), userId: restaurantId2};
    var ml6 = {...meal2, menuId: menu3.id, id: uuid(), userId: restaurantId2};
    var ml7 = {...meal1, menuId: menu4.id, id: uuid(), userId: restaurantId2};
    var ml8 = {...meal2, menuId: menu4.id, id: uuid(), userId: restaurantId2};

     Meal.destroy({where: {}})
    	.then(function(){
        Meal.bulkCreate([ml1, ml2, ml3, ml4, ml5, ml6, ml7, ml8]).then(()=> {
          done()
        })
      })
  });

  it('User with "user" role should get all meals', (done) => {
    chai.request(app)
      .get('/api/meals')
      // .set('Authorization', userJWT1)
      .query({startDate: "2020-04-01 06:30:00", endDate: "2020-04-02 06:20:00"})
      .end((err, res) => {
       res.body.meals.should.be.a('array');
       res.body.meals.length.should.be.eql(2);
       res.body.should.have.property('message').eql('Meals successfully found');
       res.should.have.status(200);
       done();
      });
  });

  it('User with "user" role should get all meals', (done) => {
    chai.request(app)
      .get('/api/meals')
      // .set('Authorization', userJWT1)
      .query({startDate: "2020-04-01 06:30:00", endDate: "2020-04-03 06:20:00", restaurantId: restaurant1.id})
      .end((err, res) => {
       res.body.meals.should.be.a('array');
       res.body.meals.length.should.be.eql(4);
       res.body.should.have.property('message').eql('Meals successfully found');
       res.should.have.status(200);
       done();
      });
  });

  it('User with "user" role should get all meals', (done) => {
    chai.request(app)
      .get('/api/meals')
      // .set('Authorization', userJWT1)
      .query({menuId: menu1.id})
      .end((err, res) => {
       res.body.meals.should.be.a('array');
       res.body.meals.length.should.be.eql(2);
       res.body.should.have.property('message').eql('Meals successfully found');
       res.should.have.status(200);
       done();
      });
  });
});

describe('/GET /api/meals/:mealId endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Meal.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "user" role should get single meal ', (done) => {
    Meal.create({...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1}).then((meal) => {
      chai.request(app)
        .get('/api/meals/' + meal.id)
        // .set('Authorization', userJWT1)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Meal successfully found');
          res.body.meal.should.have.property('id');
          res.body.meal.should.have.property('name');
          res.body.meal.should.have.property('description');
          res.body.meal.should.have.property('category');
          res.body.meal.should.have.property('imageURL');
          res.body.meal.should.have.property('price');
          res.body.meal.should.have.property('minQuantity');
          res.body.meal.should.have.property('maxQuantity');
          res.body.meal.should.have.property('visible');
          res.body.meal.should.have.property('menuId');
          res.body.meal.should.have.property('menuId');
          res.should.have.status(200);
          done();
        });
    });
  });
});

describe('/GET /api/meals/:mealId endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Meal.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "user" role should get single meal ', (done) => {
    Meal.create({...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1}).then((meal) => {
      chai.request(app)
        .get('/api/meals/' + meal.id)
        // .set('Authorization', userJWT1)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Meal successfully found');
          res.body.meal.should.have.property('id');
          res.body.meal.should.have.property('name');
          res.body.meal.should.have.property('description');
          res.body.meal.should.have.property('category');
          res.body.meal.should.have.property('imageURL');
          res.body.meal.should.have.property('price');
          res.body.meal.should.have.property('minQuantity');
          res.body.meal.should.have.property('maxQuantity');
          res.body.meal.should.have.property('visible');
          res.body.meal.should.have.property('menuId');
          res.body.meal.should.have.property('menuId');
          res.should.have.status(200);
          done();
        });
    });
  });
});


describe('/GET /api/rest/meals endpoint', () => {
  
  // Clear the database
  before(function(done) {
    var ml1 = {...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1};
    var ml2 = {...meal2, menuId: menu1.id, id: uuid(), userId: restaurantId1};
    var ml3 = {...meal1, menuId: menu2.id, id: uuid(), userId: restaurantId1};
    var ml4 = {...meal2, menuId: menu2.id, id: uuid(), userId: restaurantId1};
    var ml5 = {...meal1, menuId: menu3.id, id: uuid(), userId: restaurantId2};
    var ml6 = {...meal2, menuId: menu3.id, id: uuid(), userId: restaurantId2};
    var ml7 = {...meal1, menuId: menu4.id, id: uuid(), userId: restaurantId2};
    var ml8 = {...meal2, menuId: menu4.id, id: uuid(), userId: restaurantId2};

     Meal.destroy({where: {}})
      .then(function(){
        Meal.bulkCreate([ml1, ml2, ml3, ml4, ml5, ml6, ml7, ml8]).then(()=> {
          done()
        })
      })
  });

  it('User with "user" role should get all meals', (done) => {
    chai.request(app)
      .get('/api/rest/meals')
      .set('Authorization', restaurantJWT1)
      .query()
      .end((err, res) => {
       res.body.meals.should.be.a('array');
       res.body.meals.length.should.be.eql(4);
       res.body.should.have.property('message').eql('Meals successfully found');
       res.should.have.status(200);
       done();
      });
  });

  it('User with "user" role should get all meals', (done) => {
    chai.request(app)
      .get('/api/rest/meals')
      .set('Authorization', restaurantJWT1)
      .query({startDate: "2020-04-01 06:30:00", endDate: "2020-04-03 06:20:00", restaurantId: restaurant1.id})
      .end((err, res) => {
       res.body.meals.should.be.a('array');
       res.body.meals.length.should.be.eql(4);
       res.body.should.have.property('message').eql('Meals successfully found');
       res.should.have.status(200);
       done();
      });
  });

  it('User with "user" role should get all meals', (done) => {
    chai.request(app)
      .get('/api/rest/meals')
      .set('Authorization', restaurantJWT1)
      .query({menuId: menu1.id})
      .end((err, res) => {
       res.body.meals.should.be.a('array');
       res.body.meals.length.should.be.eql(2);
       res.body.should.have.property('message').eql('Meals successfully found');
       res.should.have.status(200);
       done();
      });
  });
});

describe('/POST api/restaurants/:restaurantId/menus endpoint', () => {
  
  // Clear the database
  before(function(done) {
    Meal.destroy({where: {}})
    	.then(function(){done()})
  });

  it('User with "restaurant" role should be able to create meal', (done) => {
    chai.request(app)
      .post('/api/rest/meals')
      .set('Authorization', restaurantJWT1)
      .send({...meal1, menuId: menu1.id})
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Meal successfully created');
        res.body.meal.should.have.property('id');
        res.body.meal.should.have.property('name');
        res.body.meal.should.have.property('description');
        res.body.meal.should.have.property('category');
        res.body.meal.should.have.property('imageURL');
        res.body.meal.should.have.property('price');
        res.body.meal.should.have.property('minQuantity');
        res.body.meal.should.have.property('maxQuantity');
        res.body.meal.should.have.property('visible');
        res.body.meal.should.have.property('menuId');
        res.body.meal.should.have.property('menuId');
        res.should.have.status(200);
        done();
      });
  });

  it('User with "restaurant" role should be able to create meal', (done) => {
    chai.request(app)
      .post('/api/rest/meals')
      .set('Authorization', restaurantJWT2)
      .send({...meal1, menuId: menu1.id})
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("User is not authorized");
        done();
      });
  });

    it('User with "restaurant" role should be able to create meal', (done) => {
    chai.request(app)
      .post('/api/rest/meals')
      .set('Authorization', userJWT1)
      .send({...meal1, menuId: menu1.id})
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have.property('message');
        res.body.message.should.be.eql("User is not authorized");
        done();
      });
  });
});

describe('/PUT /api/meals/:mealId endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Meal.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "user" role should get single meal ', (done) => {
    Meal.create({...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1}).then((meal) => {
      chai.request(app)
        .put('/api/rest/meals/' + meal.id)
        .set('Authorization', restaurantJWT1)
        .send({menuId: menu2.id, name: "Chicken 2.0", visible: true})
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Meal successfully updated');
          res.body.meal.should.have.property('menuId').eql(menu2.id);
          res.body.meal.should.have.property('visible').eql(false);
          res.body.meal.should.have.property('name').eql("Chicken 2.0");
          res.should.have.status(200);
          done();
        });
    });
  });

  it('User with "user" role should not be able to update to menu they dont own', (done) => {
    Meal.create({...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1}).then((meal) => {
      chai.request(app)
        .put('/api/rest/meals/' + meal.id)
        .set('Authorization', restaurantJWT1)
        .send({menuId: menu3.id, name: "Chicken 2.0", visible: true})
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("User is not authorized");
          done();
        });
    });
  });

  it('User with "user" role should not be able to update finalized menu', (done) => {
    Meal.create({...meal2, menuId: menu1.id, id: uuid(), userId: restaurantId1}).then((meal) => {
      chai.request(app)
        .put('/api/rest/meals/' + meal.id)
        .set('Authorization', restaurantJWT1)
        .send({menuId: menu2.id, price: 10.50, visible: true, name: "Chicken 2.0"})
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Meal successfully updated');
          res.body.meal.should.have.property('menuId').eql(menu1.id);
          res.body.meal.should.have.property('visible').eql(true);
          res.body.meal.should.have.property('name').eql("Chicken 2.0");
          res.body.meal.should.have.property('price').eql(meal.price);
          res.should.have.status(200);
          done();
        });
    });
  });
});

describe('/DELETE /api/meals/:mealId endpoint', () => {
  
  // Clear the database
  beforeEach(function(done) {
    Meal.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "user" role should be able to delete unfinalized meal', (done) => {
    Meal.create({...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1}).then((meal) => {
      chai.request(app)
        .delete('/api/rest/meals/' + meal.id)
        .set('Authorization', restaurantJWT1)
        .end((err, res) => {
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Meal successfully deleted');
          res.should.have.status(200);
          done();
        });
    });
  });

  it('User with "user" role should not be able to delete finalized meal', (done) => {
    Meal.create({...meal2, menuId: menu1.id, id: uuid(), userId: restaurantId1}).then((meal) => {
      chai.request(app)
        .delete('/api/rest/meals/' + meal.id)
        .set('Authorization', restaurantJWT1)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('message');
          res.body.message.should.be.eql("Cannot delete finalized meal");
          done();
        });
    });
  });
});

describe('/POST /api/meals/:mealId/picture endpoint', () => {
  var mealUpd;
  // Clear the database
  before(function(done) {
    Meal.destroy({where: {}})
      .then(function(){done();});
  });

  it('User with "restaurant" role should be able to add picture to menu', (done) => {
    Meal.create({...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1}).then((meal) => {
      chai.request(app)
        .post('/api/rest/meals/' + meal.id + '/picture')
        .set('Authorization', restaurantJWT1)
        .attach('newMealPicture', fs.readFileSync('public/testimage.png'), 'testimage.png')
        .end((err, res) => {
          mealUpd = res.body.meal; 
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Meal image successfully uploaded');
          res.should.have.status(200);
          done();
        });
    });
  });

  it('User with "user" role should be able to change their image', (done) => {
    chai.request(app)
      .post('/api/rest/meals/' + mealUpd.id + '/picture')
      .set('Authorization', restaurantJWT1)
      .attach('newMealPicture', fs.readFileSync('public/testimage.png'), 'testimage.png')
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Meal image successfully uploaded');
        res.should.have.status(200);
        done();
      });
  });

  it('User with "user" role should be able to delete the meal', (done) => {
    chai.request(app)
      .delete('/api/rest/meals/' + mealUpd.id)
      .set('Authorization', restaurantJWT1)
      // .attach('newMealPicture', fs.readFileSync('public/testimage.png'), 'testimage.png')
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Meal successfully deleted');
        res.should.have.status(200);
        done();
      });
  });
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
