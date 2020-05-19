"use strict";

var
  path = require('path'),
  sequelize = require(path.resolve('./config/lib/sequelize-connect')),
  db = require(path.resolve('./config/lib/sequelize')).models,
  { fromString, uuid } = require('uuidv4'),
  async = require('async'),
  crypto = require('crypto'),
  Hospital = db.hospital,
  User = db.user,
  Restaurant = db.restaurant,
  Meal = db.meal,
  MealInfo = db.mealinfo,
  TimeSlot = db.timeslot,
  Menu = db.menu,
  Order = db.order,
  util = require('util'),
  csvtojsonV2=require("csvtojson/v2");

var getDate = function(time) {
  return new Date(time).toISOString();
}

var genTimeslot = function(ts) {
  return {
    id: fromString(ts.id),
    hospitalId: ts.hospitalId,
    date: getDate(ts.date),
    userId: ts.userId,
    restaurantId: ts.restaurantId,
  }
}

var genMeal = function(ts) {
  return {
    id: fromString(ts.name + ts.restaurantId + ts.mealinfoId),
    name: ts.name,
    dietaryRestrictions: ts.dietaryRestrictions,
    allergens: ts.allergens,
    description: ts.description,
    mealinfoId: fromString(ts.mealinfoId),
    userId: ts.userId,
    restaurantId: ts.restaurantId,
    price: ts.price,
  }
}

var genMenu = function(ts) {
  return {
    id: fromString(ts.timeslotId + ts.mealName + ts.userId),
    timeslotId: fromString(ts.timeslotId),
    mealName: ts.mealName,
    mealDescription: ts.mealDescription,
    dietaryRestrictions: ts.dietaryRestrictions,
    allergens: ts.allergens,
    mealinfoId: fromString(ts.mealinfoId),
    userId: ts.userId,
    price: ts.price
  }
}

var getMealInfo = function(ts) {
  return {
    id: fromString(ts.id),
    type: ts.type,
    price: ts.price
  }
}

const start = async function() {
// Generate the mealInfo data
var mealData = require(path.resolve('proddata/mi_update_data.json'));
var mealinfo = [];
Object.keys(mealData).forEach(key => {
  mealinfo.push(getMealInfo(mealData[key]))
})

// Generate the bulkd of the data
var loadData = require(path.resolve('proddata/update_data.json'));
var seedData = {
  timeslots: [],
  meals: [],
  menus: []
}

Object.keys(loadData).forEach((key) => {
  // Construct the timeslots
  var timeslots = loadData[key]['timeslots'].map(ts => {
    return genTimeslot(ts);
  });

  // Construct the meals
  var meals = loadData[key]['meals'].map(ts => {
    return genMeal(ts);
  });

  // console.log(meals);

  // Construct the menus
  var menus = loadData[key]['menus'].map(ts => {
    return genMenu(ts);
  });

  seedData.timeslots = seedData.timeslots.concat(timeslots);
  seedData.meals = seedData.meals.concat(meals);
  seedData.menus = seedData.menus.concat(menus);
});

// console.log(seedData.timeslots);

var timeslotSeed = function() {
    async.waterfall([
      function(done) {
        MealInfo.bulkCreate(mealinfo, {validate: true}).then(()=> {
            done()
          }).catch((err) => {console.log("Meal info error" + err); done()});
      }, 
      function(done) {
        console.log("Seeding Timeslots");
        var ts = seedData['timeslots'];
        TimeSlot.bulkCreate(ts, {validate: true}).then(()=> {
          console.log("Seeded Timeslots");
          done()
        }).catch(function(err) {
          console.log(err);
          console.log("Error seeding Timeslots");
        })
      },

      function(done) {
        console.log("Seeding Meals");
        var meals = seedData['meals'];
        Meal.bulkCreate(meals, {validate: true}).then(()=> {
          console.log("Seeded Meals");
          done()
        }).catch(function(err) {
          console.log(err);
          console.log("Error seeding Meals");
        })
      },

      function(done) {
        console.log("Seeding Menus");
        var menus = seedData['menus'];
        Menu.bulkCreate(menus, {validate: true}).then(()=> {
          console.log("Seeded Menus");
          done()
        }).catch(function(err) {
          console.log("Error seeding Menus");
        })
      },
    ], function(err) {
      if(err) {
        console.log(err);
      } 
    });
  }
  timeslotSeed();
}

start();

  