'use strict';

process.env.NODE_ENV = 'development';

var 
  _ = require('lodash'),
  uuid = require('uuid/v4'),
  path = require('path'),
  express = require(path.resolve('./config/lib/express')),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  app = express.init(sequelize),
  // app = require(path.resolve('./server.js')),
  chalk = require('chalk'),
  db = require(path.resolve('./config/lib/sequelize')).models,
  async = require('async'),
  User = db.user,
  Hospital = db.hospital,
  Restaurant = db.restaurant,
  Meal = db.meal,
  MealInfo = db.mealinfo,
  Menu = db.menu,
  Order = db.order,
  Cart = db.cart,
  TimeSlot = db.timeslot;

// Let's set up the data we need to pass to the login method
var 
  user1 = {id: "e205f838-57ea-4a60-9820-76574a31d24b", username: "testuser", email: 'testUser1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"5046137325", firstName: 'Chris', roles: ['user']},
  user2 = {id: "76bd12c8-4be3-4fef-9782-f69db274a872", username: "testuser1", email: 'testUser2@test.com', password: 'h4dm322i8!!ssfSS', firstName: 'Chris', roles: ['user']},
  rest1 = {id: uuid(), username: "testuser2", email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"5046137325", firstName: 'Chris', roles: ['restaurant']},
  rest2 = {id: uuid(), username: "testuser3", email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', firstName: 'Chris', roles: ['restaurant']},
  restaurant1 = {name:"Goldie 1", phoneNumber:"504-613-7325", email:"test21@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant2 = {name:"Goldie 2", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant3 = {name:"Goldie 3", phoneNumber:"504-613-7325", email:"test23@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant4 = {name:"Goldie 4", phoneNumber:"504-613-7325", email:"test24@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  mealInfo1 = {type: "lunch", price: 5.00, time: "1:00", id: uuid()},
  mealInfo2 = {type: "dinner", price: 5.00, time: "7:00", id: uuid()},
  hospital1 = {name:"Presby 1", phoneNumber:"504-613-7325", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid(), dropoffLocation: "Take the elevator.", dropoffInfo: "Just follow the lights."},
  hospital2 = {name:"Presby 2", phoneNumber:"504-613-7325", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid(), dropoffLocation: "Take the elevator.", dropoffInfo: "Just follow the lights."},
  restaurant1 = {name:"Goldie 1", phoneNumber:"504-613-7325", email:"test21@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant2 = {name:"Goldie 2", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant3 = {name:"Goldie 3", phoneNumber:"504-613-7325", email:"test23@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  restaurant4 = {name:"Goldie 4", phoneNumber:"504-613-7325", email:"test24@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  timeslot1 = {id: uuid(), userId: rest1.id, restaurantId: restaurant1.id, date: new Date().toISOString(), hospitalId: hospital1.id},
  timeslot2 = {id: uuid(), userId: rest1.id, restaurantId: restaurant2.id, date: "2021-04-05T18:00:00Z", hospitalId: hospital1.id},
  timeslot3 = {id: uuid(), userId: rest2.id, restaurantId: restaurant3.id, date: new Date().toISOString(), hospitalId: hospital2.id},
  timeslot4 = {id: uuid(), userId: rest2.id, restaurantId: restaurant4.id, date: "2021-04-05T18:00:00Z", hospitalId: hospital2.id},
  meal1 = {name: "Chicken 1", description: "Its Chicken", category: "Meat", price: 7.50, finalized: true, timeslotId: timeslot1.id, mealinfoId: mealInfo1.id},
  meal2 = {name: "Chicken 2", description: "Its Chicken", category: "Meat", price: 7.50, finalized: false, timeslotId: timeslot2.id, mealinfoId: mealInfo2.id},
  meal3 = {name: "Chicken 3", description: "Its Chicken", category: "Meat", mealinfoId: mealInfo1.id, timeslotId: timeslot3.id,},
  meal4 = {name: "Chicken 4", description: "Its Chicken", category: "Meat", mealinfoId: mealInfo2.id, finalized: false, timeslotId: timeslot4.id,},
  ml1 = {...meal1, id: uuid(), userId: rest1.id, restaurantId: restaurant1.id},
  ml2 = {...meal2, id: uuid(), userId: rest1.id, restaurantId: restaurant1.id},
  ml3 = {...meal3, id: uuid(), userId: rest1.id, restaurantId: restaurant1.id},
  ml4 = {...meal4, id: uuid(), userId: rest1.id, restaurantId: restaurant1.id},
  ml5 = {...meal1, id: uuid(), userId: rest2.id, restaurantId: restaurant2.id},
  ml6 = {...meal2, id: uuid(), userId: rest2.id, restaurantId: restaurant2.id},
  ml7 = {...meal3, id: uuid(), userId: rest2.id, restaurantId: restaurant2.id},
  ml8 = {...meal4, id: uuid(), userId: rest2.id, restaurantId: restaurant2.id},
  ml9 = {...meal1, id: uuid(), userId: rest2.id, restaurantId: restaurant2.id},
  ml10 = {...meal2, id: uuid(), userId: rest2.id, restaurantId: restaurant2.id},
  ml11 = {...meal3, id: uuid(), userId: rest2.id, restaurantId: restaurant2.id},
  ml12 = {...meal4, id: uuid(), userId: rest2.id, restaurantId: restaurant2.id},
  menu1 = {id: uuid(), userId: rest1.id, mealId: ml1.id, timeslotId: timeslot1.id, finalized: true},
  menu2 = {id: uuid(), userId: rest1.id, mealId: ml2.id, timeslotId: timeslot1.id, finalized: true},
  menu3 = {id: uuid(), userId: rest1.id, mealId: ml3.id, timeslotId: timeslot1.id, finalized: true},
  menu4 = {id: uuid(), userId: rest1.id, mealId: ml4.id, timeslotId: timeslot1.id, finalized: true},
  menu5 = {id: uuid(), userId: rest1.id, mealId: ml1.id, timeslotId: timeslot2.id, finalized: true},
  menu6 = {id: uuid(), userId: rest1.id, mealId: ml2.id, timeslotId: timeslot2.id, finalized: true},
  menu7 = {id: uuid(), userId: rest1.id, mealId: ml3.id, timeslotId: timeslot2.id, finalized: true},
  menu8 = {id: uuid(), userId: rest1.id, mealId: ml4.id, timeslotId: timeslot2.id, finalized: true},
  menu9 =  {id: uuid(), userId: rest1.id, mealId: ml5.id, timeslotId: timeslot3.id, finalized: true},
  menu10 = {id: uuid(), userId: rest1.id, mealId: ml6.id, timeslotId: timeslot3.id, finalized: true},
  menu11 = {id: uuid(), userId: rest1.id, mealId: ml7.id, timeslotId: timeslot3.id, finalized: true},
  menu12 = {id: uuid(), userId: rest1.id, mealId: ml8.id, timeslotId: timeslot3.id, finalized: true},
  menu13 = {id: uuid(), userId: rest1.id, mealId: ml5.id, timeslotId: timeslot4.id, finalized: true},
  menu14 = {id: uuid(), userId: rest1.id, mealId: ml6.id, timeslotId: timeslot4.id, finalized: true},
  menu15 = {id: uuid(), userId: rest1.id, mealId: ml7.id, timeslotId: timeslot4.id, finalized: true},
  menu16 = {id: uuid(), userId: rest1.id, mealId: ml8.id, timeslotId: timeslot4.id, finalized: true},
  order = {quantity: 5, information: "Allergic to nuts."};

async.waterfall([
  function(done) {
    Hospital.destroy({where: {}})
      .then(function() {
        Hospital.bulkCreate([hospital1, hospital2], {validate: true})
          .then(() => {
            done();
          });
      })
  },
  function(done) {
    User.destroy({where: {}})
      .then(() => {
        User.bulkCreate([user1, user2, rest1, rest2], {validate: true})
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
        Restaurant.bulkCreate([r1, r2, r3, r4], {validate: true})
          .then(() => {
            done();
          });
      }).catch((err) => {
        console.log(err);
      });
  },
  function(done) {
    TimeSlot.destroy({where: {}})
      .then(function(){
        TimeSlot.bulkCreate([timeslot1, timeslot2, timeslot3, timeslot4], {validate: true}).then(()=> {
          done()
        })
      })
  },
  function(done) {
    MealInfo.destroy({where: {}})
      .then(function(){
        MealInfo.bulkCreate([mealInfo1, mealInfo2], {validate: true}).then(()=> {
          done()
        })
      })
  }, 
  function(done) {
    var meals = [ml1, ml2, ml3, ml4, ml5, ml6, ml7, ml8, ml9, ml10, ml11, ml12]
    Meal.destroy({where: {}})
      .then(function(){
        Meal.bulkCreate(meals, {validate: true}).then(()=> {
          done()
        })
      })
  },
  function(done) {
    var menus = [
            menu1, menu2, menu3, menu4, menu5, menu6, menu7, menu8,
            menu9, menu10, menu11, menu12, menu13, menu14, menu15, menu16,
          ];
    Menu.destroy({where: {}})
      .then(function() {
        Menu.bulkCreate(menus, {validate: true})
          .then(() => {
            done();
          });
        });
  },
  function(done) {
    var carts = [
      {quantity: 5, menuId: menu1.id, userId: user1.id, id: uuid()},
      {quantity: 5, menuId: menu2.id, userId: user1.id, id: uuid()},
      {quantity: 5, menuId: menu3.id, userId: user2.id, id: uuid()},
      {quantity: 5, menuId: menu4.id, userId: user2.id, id: uuid()},
    ];
    Cart.destroy({where: {}})
      .then(function(){
        Cart.bulkCreate(carts, {validate: true}).then(function(){done();});
      });
  },
  function(done) {
    var groupId1 = '7dccd0eb-bbce-4977-839d-e303c8bee3df';
    var groupId2 = uuid();
    var groupId3 = uuid();
    var groupId4 = uuid();
    var orders = [
          {...order, hospitalId: hospital1.id, menuId: menu1.id, userId: user1.id, id: uuid(), groupId: groupId1},
          {...order, hospitalId: hospital1.id, menuId: menu2.id, userId: user1.id, id: uuid(), groupId: groupId1},
          {...order, hospitalId: hospital1.id, menuId: menu3.id, userId: user1.id, id: uuid(), groupId: groupId1},
          {...order, hospitalId: hospital2.id, menuId: menu5.id, userId: user1.id, id: uuid(), groupId: groupId1},
          {...order, hospitalId: hospital1.id, menuId: menu6.id, userId: user1.id, id: uuid(), groupId: groupId2},
          {...order, hospitalId: hospital1.id, menuId: menu7.id, userId: user1.id, id: uuid(), groupId: groupId2},
          {...order, hospitalId: hospital1.id, menuId: menu8.id, userId: user1.id, id: uuid(), groupId: groupId2},
          {...order, hospitalId: hospital2.id, menuId: menu9.id, userId: user1.id, id: uuid(), groupId: groupId2},
          {...order, hospitalId: hospital1.id, menuId: menu1.id, userId: user2.id, id: uuid(), groupId: groupId3},
          {...order, hospitalId: hospital1.id, menuId: menu2.id, userId: user2.id, id: uuid(), groupId: groupId3},
          {...order, hospitalId: hospital1.id, menuId: menu3.id, userId: user2.id, id: uuid(), groupId: groupId3},
          {...order, hospitalId: hospital2.id, menuId: menu5.id, userId: user2.id, id: uuid(), groupId: groupId3},
          {...order, hospitalId: hospital1.id, menuId: menu6.id, userId: user2.id, id: uuid(), groupId: groupId4},
          {...order, hospitalId: hospital1.id, menuId: menu7.id, userId: user2.id, id: uuid(), groupId: groupId4},
          {...order, hospitalId: hospital1.id, menuId: menu8.id, userId: user2.id, id: uuid(), groupId: groupId4},
          {...order, hospitalId: hospital2.id, menuId: menu9.id, userId: user2.id, id: uuid(), groupId: groupId4}
        ]
    Order.destroy({where: {}})
      .then(function() {
        Order.bulkCreate(orders, {validate: true}).then(function() {
          done();
        });
      });
  }, 
function(done) {
  process.exit(0);
}
]);


