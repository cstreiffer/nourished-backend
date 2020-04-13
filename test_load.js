'use strict';

process.env.NODE_ENV = 'development';

var 
  _ = require('lodash'),
  uuid = require('uuid/v4'),
  path = require('path'),
  app = require(path.resolve('./server.js')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  async = require('async'),
  User = db.user,
  Hospital = db.hospital,
  Restaurant = db.restaurant,
  Meal = db.meal,
  Menu = db.menu,
  Order = db.order,
  Cart = db.cart;

// Let's set up the data we need to pass to the login method
var 
  user1 = {id: "e205f838-57ea-4a60-9820-76574a31d24b", username: "testuser", email: 'testUser1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', roles: ['user']},
  user2 = {id: "76bd12c8-4be3-4fef-9782-f69db274a872", username: "testuser1", email: 'testUser2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7326", firstName: 'Chris', roles: ['user']},
  rest1 = {id: uuid(), username: "testuser2", email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7327", firstName: 'Chris', roles: ['restaurant']},
  rest2 = {id: uuid(), username: "testuser3", email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7328", firstName: 'Chris', roles: ['restaurant']},
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
  meal3 = {name: "Chicken 3", description: "Its Chicken", category: "Meat", price: 7.50, finalized: true},
  meal4 = {name: "Chicken 4", description: "Its Chicken", category: "Meat", price: 7.50, finalized: false},
  ml1 = {...meal1, menuId: menu1.id, id: uuid(), userId: rest1.id},
  ml2 = {...meal2, menuId: menu1.id, id: uuid(), userId: rest1.id},
  ml3 = {...meal1, menuId: menu2.id, id: uuid(), userId: rest1.id},
  ml4 = {...meal2, menuId: menu2.id, id: uuid(), userId: rest1.id},
  ml5 = {...meal1, menuId: menu3.id, id: uuid(), userId: rest2.id},
  ml6 = {...meal2, menuId: menu3.id, id: uuid(), userId: rest2.id},
  ml7 = {...meal1, menuId: menu4.id, id: uuid(), userId: rest2.id},
  ml8 = {...meal2, menuId: menu4.id, id: uuid(), userId: rest2.id},
  ml9 = {...meal3, menuId: menu4.id, id: uuid(), userId: rest2.id},
  ml10 = {...meal4, menuId: menu4.id, id: uuid(), userId: rest2.id},
  ml11 = {...meal3, menuId: menu4.id, id: uuid(), userId: rest2.id},
  ml12 = {...meal4, menuId: menu4.id, id: uuid(), userId: rest2.id},
  hospital1 = {name:"Presby 1", phoneNumber:"800-999-5428", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid(), dropoffLocation: "Take the elevator.", dropoffInfo: "Just follow the lights."},
  hospital2 = {name:"Presby 2", phoneNumber:"800-999-5427", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid(), dropoffLocation: "Take the elevator.", dropoffInfo: "Just follow the lights."},
  order = {quantity: 5, information: "Allergic to nuts."};

async.waterfall([
  function(done) {
    User.destroy({where: {}})
      .then(() => {
        User.bulkCreate([user1, user2, rest1, rest2])
          .then(() => {
            done();
          });
      });
  },
  function(done) {
    var r1 = {...restaurant1, userId: rest1.id};
    var r2 = {...restaurant2, userId: rest1.id};
    var r3 = {...restaurant3, userId: rest2.id};
    var r4 = {...restaurant4, userId: rest2.id};
    Restaurant.destroy({where: {}})
      .then(function() {
        Restaurant.bulkCreate([r1, r2, r3, r4])
          .then(() => {
            done();
          });
      }).catch((err) => {
        console.log(err);
      });
  },
  function(done) {
    var m1 = {...menu1, restaurantId: restaurant1.id, userId: rest1.id};
    var m2 = {...menu2, restaurantId: restaurant1.id, userId: rest1.id};
    var m3 = {...menu3, restaurantId: restaurant2.id, userId: rest2.id};
    var m4 = {...menu4, restaurantId: restaurant2.id, userId: rest2.id};
    Menu.destroy({where: {}})
      .then(function() {
        Menu.bulkCreate([m1, m2, m3, m4])
          .then(() => {
            done();
          });
        });
  },
  function(done) {
    var meals = [
      {...ml1, menuId: menu1.id, userId: rest1.id},
      {...ml2, menuId: menu1.id, userId: rest1.id},
      {...ml3, menuId: menu2.id, userId: rest1.id},
      {...ml4, menuId: menu2.id, userId: rest1.id},
      {...ml5, menuId: menu3.id, userId: rest2.id},
      {...ml6, menuId: menu3.id, userId: rest2.id},
      {...ml7, menuId: menu4.id, userId: rest2.id},
      {...ml8, menuId: menu4.id, userId: rest2.id},
      {...ml9, menuId: menu4.id, userId: rest1.id},
      {...ml10, menuId: menu4.id, userId: rest1.id},
      {...ml11, menuId: menu4.id, userId: rest2.id},
      {...ml12, menuId: menu4.id, userId: rest2.id}
    ]
    Meal.destroy({where: {}})
      .then(function(){
        Meal.bulkCreate(meals).then(()=> {
          done()
        })
      })
  },
  function(done) {
    Hospital.destroy({where: {}})
      .then(function() {
        Hospital.bulkCreate([hospital1, hospital2])
          .then(() => {
            done();
          });
      })
  },
  function(done) {
    var groupId1 = uuid();
    var groupId2 = uuid();
    var groupId3 = uuid();
    var groupId4 = uuid();
    var orders = [
          {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: user1.id, id: uuid(), groupId: groupId1},
          {...order, hospitalId: hospital1.id, mealId: ml2.id, userId: user1.id, id: uuid(), groupId: groupId1},
          {...order, hospitalId: hospital1.id, mealId: ml3.id, userId: user1.id, id: uuid(), groupId: groupId1},
          {...order, hospitalId: hospital2.id, mealId: ml5.id, userId: user1.id, id: uuid(), groupId: groupId1},
          {...order, hospitalId: hospital1.id, mealId: ml6.id, userId: user1.id, id: uuid(), groupId: groupId2},
          {...order, hospitalId: hospital1.id, mealId: ml7.id, userId: user1.id, id: uuid(), groupId: groupId2},
          {...order, hospitalId: hospital1.id, mealId: ml8.id, userId: user1.id, id: uuid(), groupId: groupId2},
          {...order, hospitalId: hospital2.id, mealId: ml9.id, userId: user1.id, id: uuid(), groupId: groupId2},
          {...order, hospitalId: hospital1.id, mealId: ml1.id, userId: user2.id, id: uuid(), groupId: groupId3},
          {...order, hospitalId: hospital1.id, mealId: ml2.id, userId: user2.id, id: uuid(), groupId: groupId3},
          {...order, hospitalId: hospital1.id, mealId: ml3.id, userId: user2.id, id: uuid(), groupId: groupId3},
          {...order, hospitalId: hospital2.id, mealId: ml5.id, userId: user2.id, id: uuid(), groupId: groupId3},
          {...order, hospitalId: hospital1.id, mealId: ml6.id, userId: user2.id, id: uuid(), groupId: groupId4},
          {...order, hospitalId: hospital1.id, mealId: ml7.id, userId: user2.id, id: uuid(), groupId: groupId4},
          {...order, hospitalId: hospital1.id, mealId: ml8.id, userId: user2.id, id: uuid(), groupId: groupId4},
          {...order, hospitalId: hospital2.id, mealId: ml9.id, userId: user2.id, id: uuid(), groupId: groupId4}
        ]
    Order.destroy({where: {}})
      .then(function() {
        Order.bulkCreate(orders).then(function() {
          done();
        });
      });
  }, 
function(done) {
  process.exit(0);
}
]);

