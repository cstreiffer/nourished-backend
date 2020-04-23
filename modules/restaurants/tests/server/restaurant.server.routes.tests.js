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
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  should = chai.should();

chai.use(chaiHttp);

var 
  userJWT = '',
  restaurantJWT1 = '',
  restaurantJWT2 = '',
  userId = '',
  restaurantId1 = '',
  restaurantId2 = '';

// Let's set up the data we need to pass to the login method
var 
  userCredentials = {id: uuid(), username: "testuser", email: 'testUser@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'},
  restaurantCredentials1 = {id: uuid(), username: "testuser1", email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7326", firstName: 'Chris', account_type: 'restaurant'},
  restaurantCredentials2 = {id: uuid(), username: "testuser2", email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7327", firstName: 'Chris', account_type: 'restaurant'},
  restaurant = {name:"Goldie", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA"},
  restaurantAlt = {name:"Goldie", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"New Orleans", state:"LA"};


describe('Restaurant CRUD tests', function() {

before(function(done) {
  User.destroy({where: {}})
	 .then(function(){done()})
});

before((done) => {  
  request(app)
	  .post('/api/auth/signup')
	  .send(userCredentials)
	  .then((res) => {
	  	userId = res.body.user.id;
	    userJWT = "bearer " + res.body.token;
	    done();
	  })
})

before((done) => {  
  request(app)
	  .post('/api/auth/signup')
	  .send(restaurantCredentials1)
	  .then((res) => {
	  	restaurantId1 = res.body.user.id;
	    restaurantJWT1 = "bearer " + res.body.token;
	    done();
	  })
})

before((done) => {  
  request(app)
	  .post('/api/auth/signup')
	  .send(restaurantCredentials2)
	  .then((res) => {
	  	restaurantId2 = res.body.user.id;
	    restaurantJWT2 = "bearer " + res.body.token;
	    done();
	  })
})

describe('/POST api/rest/restaurants endpoint', () => {
  
  // Clear the database
  before(function(done) {
    Restaurant.destroy({where: {}})
    	.then(function(){done()})
  });
 

  it('User with "restaurant" role should create restaurant', (done) => {
    chai.request(app)
      .post('/api/rest/restaurants')
      .set('Authorization', restaurantJWT1)
      .send(restaurant)
      .end((err, res) => {
      	res.should.have.status(200);
      	res.body.should.be.a('object');
      	res.body.should.have.property('message').eql('Restaurant successfully created');
      	res.body.restaurant.should.have.property('id');
      	res.body.restaurant.should.have.property('phoneNumber');
      	res.body.restaurant.should.have.property('email');
      	res.body.restaurant.should.have.property('streetAddress');
      	res.body.restaurant.should.have.property('zip');
      	res.body.restaurant.should.have.property('city');
      	res.body.restaurant.should.have.property('state');
        res.body.restaurant.should.not.have.property('userId');
    	  done();
      })
  })

  it('User with "restaurant" role should create restaurant', (done) => {
    chai.request(app)
      .post('/api/rest/restaurants')
      .set('Authorization', restaurantJWT2)
      .send(restaurant)
      .end((err, res) => {
      	res.should.have.status(200);
      	res.body.should.be.a('object');
      	res.body.should.have.property('message').eql('Restaurant successfully created');
      	res.body.restaurant.should.have.property('id');
      	res.body.restaurant.should.have.property('phoneNumber');
      	res.body.restaurant.should.have.property('email');
      	res.body.restaurant.should.have.property('streetAddress');
      	res.body.restaurant.should.have.property('zip');
      	res.body.restaurant.should.have.property('city');
      	res.body.restaurant.should.have.property('state');
        res.body.restaurant.should.not.have.property('userId');
	      done();
      })
  })

  it('User with "user" role should not create restaurant', (done) => {
    chai.request(app)
      .post('/api/rest/restaurants')
      .set('Authorization', userJWT)
      .send(restaurant)
      .end((err, res) => {
      	res.should.have.status(403);
      	res.body.should.have.property('message');
      	res.body.message.should.be.eql("User is not authorized");
	    done();
      })
  })
})

describe('/GET api/restaurants endpoint', () => {
  
  // Clear the database
  before(function(done) {
  	var restaurant1 = {...restaurant, ...{id: uuid(), userId : restaurantId1}};
  	var restaurant2 = {...restaurantAlt, ...{id: uuid(), userId : restaurantId2}};

    Restaurant.destroy({where: {}})
    	.then(function(){
    		Restaurant.bulkCreate([restaurant1, restaurant2]).then(function(res) {
     			done()   			
    		})
    	})
  });

  it('User with "user" role should get all restaurants', (done) => {
    chai.request(app)
      .get('/api/restaurants')
      .set('Authorization', userJWT)
      .query({state: 'PA'})
      .end((err, res) => {
      	res.body.restaurants.should.be.a('array');
      	res.body.restaurants.length.should.be.eql(1);
      	res.body.should.have.property('message').eql('Restaurants successfully found');
        res.body.restaurants[0].should.not.have.property("userId");
      	res.should.have.status(200);
	    done();
      })
  })

  it('User with "restaurant" role should get all restaurants', (done) => {
    chai.request(app)
      .get('/api/restaurants')
      .set('Authorization', restaurantJWT1)
      .end((err, res) => {
      	res.body.restaurants.should.be.a('array');
      	res.body.restaurants.length.should.be.eql(2);
      	res.body.should.have.property('message').eql('Restaurants successfully found');
      	res.should.have.status(200);
	    done();
      })
  })
});

describe('/PUT api/rest/restaurants/:restaurantId endpoint', () => {

  beforeEach(function(done) {
    Restaurant.destroy({where: {}})
    	.then(function(){done()})
  });

  it('User who owns "restaurant" should be able to update', (done) => {
  	Restaurant.create(_.merge(restaurant, {id: uuid(), userId : restaurantId1})).then((restaurant) => {
	    chai.request(app)
	      .put('/api/rest/restaurants/' + restaurant.id)
	      .set('Authorization', restaurantJWT1)
	      .send({name : "Goldie 2!!"})
	      .end((err, res) => {
	      	res.should.have.status(200);
	      	res.body.should.be.a('object');
	      	res.body.should.have.property('message').eql('Restaurant successfully updated');
	      	res.body.restaurant.should.have.property('name').eql('Goldie 2!!');
          res.body.restaurant.should.not.have.property('userId');
		    done();
	      })
  	})
  })

  it('User who does NOT own "restaurant" should NOT be able to update', (done) => {
  	Restaurant.create(_.merge(restaurant, {id: uuid(), userId : restaurantId1})).then((restaurant) => {
	    chai.request(app)
	      .put('/api/rest/restaurants/' + restaurant.id)
	      .set('Authorization', restaurantJWT2)
	      .send({name : "Goldie 2!!"})
	      .end((err, res) => {
	      	res.should.have.status(403);
	      	res.body.should.have.property('message');
	      	res.body.message.should.be.eql("User is not authorized");
		    done();
	      })
  	})
  })
});

describe('/GET api/restaurants/:restaurantId endpoint', () => {

  beforeEach(function(done) {
    Restaurant.destroy({where: {}})
      .then(function(){done()})
  });

  it('User should be able to get "restaurant"', (done) => {
  	Restaurant.create(_.merge(restaurant, {id: uuid(), userId : restaurantId1})).then((restaurant) => {
	    chai.request(app)
	      .get('/api/restaurants/' + restaurant.id)
	      .set('Authorization', restaurantJWT2)
	      .end((err, res) => {
	    	res.should.have.status(200);
	      	res.body.should.be.a('object');
	      	res.body.should.have.property('message').eql('Restaurant successfully found');
	      	res.body.restaurant.should.have.property('id');
	      	res.body.restaurant.should.have.property('phoneNumber');
	      	res.body.restaurant.should.have.property('email');
	      	res.body.restaurant.should.have.property('streetAddress');
          res.body.restaurant.should.have.property('restaurantStripeAccountId');
	      	res.body.restaurant.should.have.property('zip');
	      	res.body.restaurant.should.have.property('city');
	      	res.body.restaurant.should.have.property('state');
          res.body.restaurant.should.not.have.property('userId');
		    done();
	      })
  	})
  })
});

describe('/DELETE api/rest/restaurants/:restaurantId endpoint', () => {

  beforeEach(function(done) {
    Restaurant.destroy({where: {}})
      .then(function(){done()})
  });

  it('User who does NOT own "restaurant" should NOT be able to delete', (done) => {
  	Restaurant.create(_.merge(restaurant, {id: uuid(), userId : restaurantId1})).then((restaurant) => {
	    chai.request(app)
	      .delete('/api/rest/restaurants/' + restaurant.id)
	      .set('Authorization', restaurantJWT2)
	      .end((err, res) => {
	      	res.should.have.status(403);
	      	res.body.should.have.property('message');
	      	res.body.message.should.be.eql("User is not authorized");
		    done();
	      })
  	})
  })

  it('User who does own "restaurant" should be able to delete', (done) => {
  	Restaurant.create(_.merge(restaurant, {id: uuid(), userId : restaurantId1})).then((restaurant) => {
	    chai.request(app)
	      .delete('/api/rest/restaurants/' + restaurant.id)
	      .set('Authorization', restaurantJWT1)
	      .end((err, res) => {
	      	res.should.have.status(200);
	      	res.body.should.have.property('message');
	      	res.body.message.should.be.eql("Restaurant successfully deleted");
		    done();
	      })
  	})
  })

});


describe('/GET api/rest/restaurants endpoint', () => {
  
  before(function(done) {
  	var restaurant1 = {...restaurant, ...{id: uuid(), userId : restaurantId1}};
  	var restaurant2 = {...restaurant, ...{id: uuid(), userId : restaurantId2}};

    Restaurant.destroy({where: {}})
    	.then(function(){
    		Restaurant.bulkCreate([restaurant1, restaurant2]).then(function(res) {
     			done();  			
    		});
    	});
  });

  it('User should be aple to fetch from their own restaurants', (done) => {
    chai.request(app)
      .get('/api/rest/restaurants/')
      .set('Authorization', restaurantJWT1)
      .end((err, res) => {
      	res.should.have.status(200);
      	res.body.restaurants.should.be.a('array');
      	res.body.restaurants.length.should.be.eql(1);
        res.body.restaurants[0].should.not.have.property("userId");
	      done();
      });
  });

  it('User with role "user" should not be able to access endpoint.', (done) => {
    chai.request(app)
      .get('/api/rest/restaurants/')
      .set('Authorization', userJWT)
      .end((err, res) => {
      	res.should.have.status(403);
      	res.body.should.have.property('message');
      	res.body.message.should.be.eql("User is not authorized");
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
  stop();
  done();
});
});
