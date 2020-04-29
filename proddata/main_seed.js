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

var _REST_NAMES; 
var _HOSP_NAMES; 
var _TS_SEED;

var genUser = function(username, email, phoneNumber, first, last, password) {
  return {
    id: fromString(username),
    username: username,
    email: email.toLowerCase(),
    phoneNumber: phoneNumber.replace(/-|\(|\)| /g, ''),
    firstName: first,
    lastName: last,
    roles: ['restaurant'],
    password: password
  }
}

var buildUser = function(creds) {
  var user = User.build(creds);
  user.salt = user.makeSalt();
  user.hashedPassword = user.encryptPassword(creds.password, user.salt);
  user.email = user.email.toLowerCase();
  user.phoneNumber = user.phoneNumber.replace(/-|\(|\)| /g, '');
  return user.save()
    .then((user))
}

var genRestaurant = function(username, name, email, phoneNumber, zip, description) {
  console.log(username);
  return {
    id: fromString(name),
    userId: fromString(username),
    description: description,
    name: name,
    email: email.toLowerCase(), 
    phoneNumber: phoneNumber.replace(/-|\(|\)| /g, ''),
    city: 'Philadelphia',
    state: 'PA',
    zip: zip
  }
}

var genHospital = function(name, streetAddress, zip, phoneNumber, email, dropoffLocation, dropoffInfo) {
  return {
    id: fromString(name),
    name: name, 
    streetAddress: streetAddress,
    city: 'Philadelphia',
    state: 'PA',
    zip: zip,
    phoneNumber: phoneNumber.replace(/-|\(|\)| /g, ''),
    email: email.toLowerCase(),
    dropoffLocation: dropoffLocation,
    dropoffInfo: dropoffInfo,
    email: email
  }
}

var getDate = function(time) {
  return new Date(time).toISOString();
}

var genTimeslot = function(ts, user, rest) {
  if(! ts.hospital in _HOSP_NAMES) process.exit(0); 
  return {
    id: fromString(ts.id),
    hospitalId: fromString(ts.hospital),
    date: getDate(ts.date),
    userId: user,
    restaurantId: rest,
  }
}

var genMeal = function(ts, user, rest) {
  return {
    id: fromString(ts.name + rest),
    name: ts.name,
    dietaryRestrictions: ts.dietaryRestrictions,
    allergens: ts.allergens,
    description: ts.description,
    mealinfoId: fromString(ts.mealinfoId),
    userId: user,
    restaurantId: rest
  }
}

var genMenu = function(ts, user) {
  return {
    id: fromString(ts.timeslotId + ts.mealName + user),
    timeslotId: fromString(ts.timeslotId),
    mealName: ts.mealName,
    mealDescription: ts.mealDescription,
    dietaryRestrictions: ts.dietaryRestrictions,
    allergens: ts.allergens,
    mealinfoId: fromString(ts.mealinfoId),
    userId: user,
  }
}

const start = async function() {
const userLoad = await csvtojsonV2().fromFile(path.resolve('proddata/data/users.csv'));
const restLoad = await csvtojsonV2().fromFile(path.resolve('proddata/data/restaurants.csv'));
const hospLoad = await csvtojsonV2().fromFile(path.resolve('proddata/data/hospitals.csv'));
const mealLoad = await csvtojsonV2().fromFile(path.resolve('proddata/data/mealinfo.csv'));

// Create the checks
_REST_NAMES = restLoad.map((rest) => rest.name);
_HOSP_NAMES = hospLoad.map((hosp) => hosp.name);

// Create the data structures
var users = userLoad.map((user) => genUser(user.username, user.email, user.phoneNumber, user.firstName, user.lastName, user.password));
var userLookup = userLoad.reduce(function(acc, cur) {
  if(! cur.restaurant in _REST_NAMES) process.exit(0)
  acc[cur.restaurant] = cur.username;
  return acc;
}, {});

var restaurants = restLoad.map((rest) => genRestaurant(userLookup[rest.name], rest.name, rest.email, rest.phoneNumber, rest.zip, rest.description));
var restLookup = restaurants.reduce(function(acc, cur) {
  acc[cur.name] = cur;
  return acc;
}, {});
_TS_SEED = restaurants.map((r) => r.id);

var hospitals = hospLoad.map((hosp) => genHospital(hosp.name, hosp.streetAddress, hosp.zip, hosp.phoneNumber, hosp.email, hosp.dropoff, hosp.dropoffInfo));
var mealinfo = mealLoad.map((meal) => {return {id: fromString(meal.type), type: meal.type, price: meal.price, time: meal.time}});

// Generate the bulkd of the data
var loadData = require(path.resolve('proddata/seed_data.json'));
var seedData = {}

Object.keys(loadData).forEach((key) => {
  // console.log(key);
  if(!key in _REST_NAMES) {
    console.log(key);
    process.exit(0);
  }
  var user = restLookup[key].userId;
  var rest = restLookup[key].id;

  // Construct the timeslots
  var timeslots = loadData[key]['timeslots'].map(ts => {
    return genTimeslot(ts, user, rest);
  });

  // Construct the meals
  var meals = loadData[key]['meals'].map(ts => {
    return genMeal(ts, user, rest);
  });

  // Construct the menus
  var menus = loadData[key]['menus'].map(ts => {
    return genMenu(ts, user);
  });

  seedData[key] = {
    timeslots: timeslots,
    meals: meals,
    menus: menus
  }
});

// Run once
var initalSeed = function() {
  async.waterfall([
    function(done) {
        Hospital.bulkCreate(hospitals)
          .then(() => {
            done();
          }).catch((err) => {console.log("Hospital error"); done()});
    },
    function(done) {
        MealInfo.bulkCreate(mealinfo, {validate: true}).then(()=> {
          done()
        }).catch((err) => {console.log("Meal info error" + err); done()});
    }, 
    function(done) {
        Promise.all(users.map((user) => buildUser(user)))
          .then(function(users) {
            done();
          }).catch((err) => {console.log("User error"); done()});
    },
    function(done) {
        Restaurant.bulkCreate(restaurants, {validate: true})
          .then(() => {
            done();
          }).catch((err) => {console.log("Restaurant error"); done()});
    },
    function(done) {
      console.log("Finished that!");
    }
  ], function(err) {
    if(err) {
      console.log(err);
    }
  });
}

var sem = require('semaphore')(1);
var timeslotSeed = function() {

  // Check if we're done
  if(!_TS_SEED.length) process.exit(0);

  Restaurant.findAll({
    where: {
      id: _TS_SEED,
      verified: true
    }
  }).then(function(rests) {
    var ids = rests.map(r => r.id);
    var names = rests.map(r => r.name);
    
    // Aggregate them
    names.forEach(function(name) {
      async.waterfall([
        function(done) {
          console.log("Seeding Timeslots: " + name);
          var ts = seedData[name]['timeslots'];
          TimeSlot.bulkCreate(ts, {validate: true}).then(()=> {
            console.log("Seeded Timeslots: " + name);
            done(null)
          }).catch(function(err) {
            console.log(err);
            console.log("Error seeding Timeslots: " + name);
          })
        },
        function(done) {
          console.log("Seeding Meals: " + name);
          var meals = seedData[name]['meals'];
          Meal.bulkCreate(meals, {validate: true}).then(()=> {
            console.log("Seeded Meals: " + name);
            done(null)
          }).catch(function(err) {
            console.log("Error seeding Meals: " + name);
          })
        },
        function(done) {
          console.log("Seeding Menus: " + name);
          var menus = seedData[name]['menus'];
          Menu.bulkCreate(menus, {validate: true}).then(()=> {
            console.log("Seeded Menus: " + name);
            done(null)
          }).catch(function(err) {
            console.log("Error seeding Menus: " + name);
          })
        },
      ], function(err) {
        if(err) {
          console.log(err);
        } else{
          sem.take(function() {
            _TS_SEED = _TS_SEED.filter((v) => v !== fromString(name))
            sem.leave();
          })
        }
      });
    });
  });
}

initalSeed();
setInterval(timeslotSeed, 5000);
}

start();

  