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
  should = chai.should(),
  UserAlias = db.useralias;

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
  restaurantCredentials1 = {id: uuid(), username: "testuser1", email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7326", firstName: 'Chris', account_type: 'restaurant'},
  restaurantCredentials2 = {id: uuid(), username: "testuser2", email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7327", firstName: 'Chris', account_type: 'restaurant'},
  rest1alias = {id: uuid(), username: "testuser3", email: 'testRestaurant3@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7328", firstName: 'Chris', account_type: 'restaurant_subaccount'},
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

before(function(done) {
    UserAlias.create({
      id: uuid(),
      userId: rest1aliasId,
      aliasId: restaurantId1,
      aliasRoles: ['restaurant']
    }).then(function(user) {
      console.log(user);
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
      .set('Authorization', restaurantJWT1alias)
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
})

describe('/PUT api/rest/restaurants/:restaurantId endpoint', () => {

  beforeEach(function(done) {
    Restaurant.destroy({where: {}})
    	.then(function(){done()})
  });

  it('User who owns "restaurant" should be able to update', (done) => {
  	Restaurant.create(_.merge(restaurant, {id: uuid(), userId : restaurantId1})).then((restaurant) => {
	    chai.request(app)
	      .put('/api/rest/restaurants/' + restaurant.id)
	      .set('Authorization', restaurantJWT1alias)
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
});

describe('/DELETE api/rest/restaurants/:restaurantId endpoint', () => {

  beforeEach(function(done) {
    Restaurant.destroy({where: {}})
      .then(function(){done()})
  });

  it('User who does own "restaurant" should be able to delete', (done) => {
  	Restaurant.create(_.merge(restaurant, {id: uuid(), userId : restaurantId1})).then((restaurant) => {
	    chai.request(app)
	      .delete('/api/rest/restaurants/' + restaurant.id)
	      .set('Authorization', restaurantJWT1alias)
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
      .set('Authorization', restaurantJWT1alias)
      .end((err, res) => {
      	res.should.have.status(200);
      	res.body.restaurants.should.be.a('array');
      	res.body.restaurants.length.should.be.eql(1);
        res.body.restaurants[0].should.not.have.property("userId");
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

after((done) => {
  UserAlias.destroy({where: {}})
    .then(function(){done()})
});

after(function(done) {
  stop();
  done();
});

});
