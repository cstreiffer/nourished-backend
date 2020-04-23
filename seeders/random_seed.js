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
  util = require('util');


var users =  [
  {id: fromString('JetJill'), username: 'JetJill', email: 'test_jill@jetwinebar.com', phoneNumber: '5555555555', firstName: 'Jill', lastName: 'Weber', roles: ['restaurant']},
  {id: fromString('HillaryB'), username: 'HillaryB', email: 'test_admin@pumpkinphilly.com', phoneNumber: '5555555556', firstName: 'Hillary', lastName: 'Bor', roles: ['restaurant']},
  {id: fromString('SofiaD'), username: 'SofiaD', email: 'test_sofia@elmerkury.com', phoneNumber: '5555555557', firstName: 'Sofia', lastName: 'Deleon', roles: ['restaurant']},
  {id: fromString('malfix8'), username: 'malfix8', email: 'test_fix.mallory@gmail.com', phoneNumber: '5555555558', firstName: 'Mallory', lastName: 'Fix', roles: ['restaurant']},

  {id: fromString('judyni'), username: 'judyni', email: 'test_baology@gmail.com', phoneNumber: '5555555559', firstName: 'Judy', lastName: 'Ni', roles: ['restaurant']},
  {id: fromString('temp2'), username: 'temp2', email: 'test_renatas@gmail.com', phoneNumber: '5555555560', firstName: 'Ren', lastName: 'Ata', roles: ['restaurant']},
  {id: fromString('abranca'), username: 'abranca', email: 'test_satekampar@gmail.com', phoneNumber: '5555555561', firstName: 'Angelina', lastName: 'Branca', roles: ['restaurant']},

  
  // {id: fromString('cstreiffer'), username: 'cstreiffer', email: 'ccstreiffer@gmail.com',phoneNumber: '5046137325', firstName: 'Chris', lastName: 'Streiffer', roles: ['user']},
  // {id: fromString('ccstreiffer'), username: 'ccstreiffer', email: 'christopher.streiffer@pennmedicine.upenn.edu',phoneNumber: '5046137326', firstName: 'Chris', lastName: 'Streiffer', roles: ['user']},
];

var restaurants = [
  {
    id: fromString('Cafe Ynez'), name: 'Café Ynez', phoneNumber: '2152787579', email: 'clara@cafeynez.com', zip:'19146', city: 'Philadelphia', state: 'PA',
    description: 'Fresh, healthy Mexican cuisine that takes its inspiration from Mexico City’s Aztec origins and cosmopolitan present.',
    userId: fromString('JetJill')
  },
  {
    id: fromString('Pumpkin'), name: 'Pumpkin', phoneNumber: '2155454448', email: 'admin@pumpkinphilly.com', streetAddress: '1713 South Street', zip:'19146', city: 'Philadelphia', state: 'PA',
    description: 'Pumpkin is an intimate 26 seat BYOB serving our community for the past 16 years. Our daily changing menu showcases our regions best local and sustainable products available. We provide a fun, delicious, and unpretentious meal.',
    userId: fromString('HillaryB')
  },
  {
    id: fromString('El Merkury'), name: 'El Merkury', phoneNumber: '2674575952', email: 'sofia@elmerkury.com', zip:'19103', city: 'Philadelphia', state: 'PA',
    description: 'Central American street food and churro restaurant. Caterer, woman/immigrant owned and operated!',
    userId: fromString('SofiaD') 
  },
  {
    id: fromString('On Point Bistro'), name: 'On Point Bistro', phoneNumber: '2676393318', email: 'fix.mallory@gmail.com', zip:'19146', city: 'Philadelphia', state: 'PA',
    description: 'On Point Bistro is a family-operated New American Bistro located in South Philadelphia serving hearty and fresh salads, sandwiches, and other crowd-pleasing dishes!',
    userId: fromString('malfix8')
  },
  {
    id: fromString('Baology'), name: 'Baology', phoneNumber: '5555555555', email: 'test_baology@gmail.com', zip:'19146', city: 'Philadelphia', state: 'PA',
    description: 'Baology description',
    userId: fromString('judyni')
  },
  {
    id: fromString('Renatas'), name: 'Renata\'s', phoneNumber: '5555555555', email: 'test_renatas@gmail.com', zip:'19146', city: 'Philadelphia', state: 'PA',
    description: 'Renata\'s description',
    userId: fromString('temp2')
  },
  {
    id: fromString('Sate Kampar'), name: 'Sate Kampar', phoneNumber: '5555555555', email: 'test_satekampar@gmail.com', zip:'19146', city: 'Philadelphia', state: 'PA',
    description: 'Sate Kampar description',
    userId: fromString('abranca')
  }
];

var hospitals = [
  // {id: fromString('Penn Presby (l)'), name: 'Penn Presbyterian Medical Center (Lunch)',  streetAddress: '51 N 39th St.', city: 'Philadelphia', state: 'PA', zip: '19104', phoneNumber: '2158767167',  dropoffLocation: 'CUPP Building Lobby', dropoffInfo: 'Please call Sarb (215-876-7167) 20 minutes prior to arrival at the hospital. To get to the CUPP building, turn into the main hospital entrance off 38th St. Make a right at your first opportunity and stop in front of the main hospital entrance. Call Sarb again upon arrival at the main entrance to coordinate receipt of the meals.'},
  // {id: fromString('Penn Presby (d)'), name: 'Penn Presbyterian Medical Center (Dinner)', streetAddress: '51 N 39th St.', city: 'Philadelphia', state: 'PA', zip: '19104', phoneNumber: '2154952408',  dropoffLocation: 'CUPP Building Lobby', dropoffInfo: 'Please call Bennett (215-495-2408) 20 minutes prior to arrival at the hospital. To get to the CUPP building, turn into the main hospital entrance off 38th St. Make a right at your first opportunity and stop in front of the main hospital entrance. Call Bennett again upon arrival at the main entrance to coordinate receipt of the meals.'},
  {id: fromString('Penn Presby'), name: 'Penn Presbyterian Medical Center', streetAddress: '51 N 39th St.', city: 'Philadelphia', state: 'PA', zip: '19104', phoneNumber: '2154952408',  dropoffLocation: 'CUPP Building Lobby', dropoffInfo: 'Please call Bennett (215-495-2408) 20 minutes prior to arrival at the hospital. To get to the CUPP building, turn into the main hospital entrance off 38th St. Make a right at your first opportunity and stop in front of the main hospital entrance. Call Bennett again upon arrival at the main entrance to coordinate receipt of the meals.'},
  {id: fromString('Penn Hospital'), name: 'Pennsylvania Hospital', streetAddress: '800 Spruce St.', city: 'Philadelphia', state: 'PA', zip: '19107',  dropoffLocation: 'TBD', dropoffInfo: 'TBD'},
  {id: fromString('HUP'), name: 'Hospital of the University of Pennsylvania', streetAddress: '3400 Spruce St.', city: 'Philadelphia', state: 'PA', zip: '19104', dropoffLocation: 'TBD', dropoffInfo: 'TBD'}
];

var mealinfo = [
  {id: fromString('lunch'), type: 'lunch',  price: 5.00, time: '12:00PM'},
  {id: fromString('dinner'), type: 'dinner', price: 5.00, time: '8:00PM'},
  {id: fromString('lunch/dinner'), type: 'lunch/dinner', price: 5.00, time: '12:00PM/8:00PM'},
];
 // id | name | description | dietaryRestrictions | allergens | imageURL | minQuantity | maxQuantity | visible | finalized | createdAt | updatedAt | userId | mealinfoId | restaurantId 
var meals = [
  {id: fromString("CY ML1"), restaurantId: fromString('Cafe Ynez'), 
    name: "Ensalada Ynez w/ Shrimp", 
    description: "Grilled shrimp, romaine, tomatoes, red onions, avocado, tortilla strips, queso fresco, chipotle ranch", 
    dietaryRestrictions: "Gluten Free",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML2"), restaurantId: fromString('Cafe Ynez'), 
    name: "Steak Burrito", 
    description: "Seared flank steak, cheddar cheese, pico de gallo, sliced avocado, refried black beans, and chipotle ranch, whole wheat tortilla, side salad.",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML3"), restaurantId: fromString('Cafe Ynez'), 
    name: "Cauliflower Tacos", 
    description: "Fried cauliflower topped with chipotle, radish slaw, red cabbage, avocado served on two soft corn tortillas.", 
    dietaryRestrictions: "Vegan",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML4"), restaurantId: fromString('Cafe Ynez'), 
    name: "Grilled Chicken Tacos", 
    description: "Grilled chicken tacos topped with pico de gallo, cotija cheese, smoked jalapeno salsa served on two soft corn tortillas", 
    dietaryRestrictions: "Gluten Free",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML5"), restaurantId: fromString('Cafe Ynez'), 
    name: "Roast Chicken", 
    description: "Herb-roasted half chicken, seasonal vegetables, tortillas.", 
    dietaryRestrictions: "",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML6"), restaurantId: fromString('Cafe Ynez'), 
    name: "Fish Tacos", 
    description: "Grilled tilapia, pineapple-habanero salsa, avocado, sour cream, lettuce, corn tortillas.", 
    dietaryRestrictions: "",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML7"), restaurantId: fromString('Cafe Ynez'), 
    name: "Veggie Burrito", 
    description: "Corn, black beans, baby spinach, shallot, garlic, pico de gallo, avocado and quinoa, whole wheat tortilla, side salad.", 
    dietaryRestrictions: "Vegan",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML8"), restaurantId: fromString('Cafe Ynez'), 
    name: "Caesar salad w/ shrimp", 
    description: "Grilled shrimp, romaine, red onions, grape tomato, brioche croutons, parmesan cheese, caesar dressing", 
    dietaryRestrictions: "",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML9"), restaurantId: fromString('Cafe Ynez'), 
    name: "Chicken Tinga Burrito", 
    description: "Pulled chicken in chipotle tomato sauce with onions, cheddar cheese, lettuce, rice, refried black beans, sour cream, whole wheat tortilla, side salad", 
    dietaryRestrictions: "",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML10"), restaurantId: fromString('Cafe Ynez'), 
    name: "Veggie Burrito", 
    description: "Corn, black beans, baby spinach, shallot, garlic, pico de gallo, avocado and quinoa, whole wheat tortilla, side salad.", 
    dietaryRestrictions: "Vegan",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML11"), restaurantId: fromString('Cafe Ynez'), 
    name: "Carnitas Tacos", 
    description: "Pork confit tacos topped with pico de gallo, cotija cheese, smoked jalapeno salsa served on two soft corn tortillas.", 
    dietaryRestrictions: "Gluten Free",
    mealinfoId: fromString('lunch/dinner')},

  {id: fromString("BA ML1"), restaurantId: fromString("Baology"), 
    name: "Chicken Friend Rice", 
    description: "Roasted 5-Spiced Rubbed Pastured Chicken served with our Egg Fried Forbidden Rice", 
    dietaryRestrictions: "Gluten Free",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML2"), restaurantId: fromString("Baology"), 
    name: "Pork Fried Rice", 
    description: "Roasted Heritage Pork Belly served with our Egg Fried Forbidden Rice", 
    dietaryRestrictions: "Gluten Free",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML3"), restaurantId: fromString("Baology"), 
    name: "Mushroom Fried Rice", 
    description: "Roasted Organic Mushrooms served with our Egg Fried Forbidden Rice", 
    dietaryRestrictions: "Gluten Free, Vegetarian",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML4"), restaurantId: fromString("Baology"), 
    name: "Taiwanese Fried Chicken Bento", 
    description: "Over Forbidden Rice with pickled red cabbage & local veggies - served with a lemon aioli", 
    dietaryRestrictions: "Gluten Free" ,
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML5"), restaurantId: fromString("Baology"), 
    name: "Jail Island Salmon Bento", 
    description: "Over Forbidden Rice with pickled red cabbage & local veggies", 
    dietaryRestrictions: "Gluten Free",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML6"), restaurantId: fromString("Baology"), 
    name: "Local Tofu Bento", 
    description: "Over Forbidden Rice with pickled red cabbage & local veggies - served with hoisin sauce", 
    dietaryRestrictions: "Vegan",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML7"), restaurantId: fromString("Baology"), 
    name: "Pulled Heritage Pork", 
    description: "Over Forbidden Rice with pickled red cabbage & local veggies - served with a garlic aioli (on the side)", 
    dietaryRestrictions: "Gluten Free" ,
    mealinfoId: fromString('lunch/dinner')},

  {id: fromString("OP ML1"), restaurantId: fromString("On Point Bistro"), 
    name: "Cobb Salad w/ Blackened Chicken", 
    description: "Romaine, tomatoes, blue cheese crumble, bacon, hardboiled egg, balsamic",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("OP ML2"), restaurantId: fromString("On Point Bistro"), 
    name: "Chicken Parm Sandwich", 
    description: "Basil pesto and mozzarella; served w housemade adobo chips",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("OP ML3"), restaurantId: fromString("On Point Bistro"), 
    name: "Grilled Chicken", 
    description: "With mashed potatoes, brussels sprouts, lemon butter sauce",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("OP ML4"), restaurantId: fromString("On Point Bistro"), 
    name: "Vegan Falafel Pita", 
    description: "Falafel, cabbage, cucumber, tomato, cilantro, mayo; served w housemade adobo chips",
    mealinfoId: fromString('lunch/dinner')},

  {id: fromString("PU ML1"), restaurantId: fromString("Pumpkin"), 
    name: "Crab Cake",
    description: "With Cabbage & Cucumber Slaw, Horseradish Aioli",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("PU ML2"), restaurantId: fromString("Pumpkin"),
    name: "Jerk Chicken",
    description: "With Kale, Coconut Rice",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("PU ML3"), restaurantId: fromString("Pumpkin"),
    name: "Grilled Golden Beets",
    description: "With Braised Chickpeas, Dukkah, Yogurt Vegetarian",
    mealinfoId: fromString('lunch/dinner')},

  {id: fromString('RA ML1'), restaurantId: fromString('Renatas'),
    name: "Chicken Mohammara (spicy)",
    description: "Teta's 18 hour harissa marinated chicken baked over yukon gold potatoes and served with grilled pita & cookie",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('RA ML2'), restaurantId: fromString('Renatas'),
    name: "Kefta B'Thine",
    description: "Ground lamb and yukon gold potatoes drowned in tahini and topped with tomatoes and baked until bubbly, served with grilled pita & cookie Contains sesame",
    allergens: "Contains sesame",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('RA ML3'), restaurantId: fromString('Renatas'),
    name: "Mjaddara",
    description: "Caramelized Spiced lentils and cracked wheat served with side salad, tzatziki & cookie. Vegetarian",
    dietaryRestrictions: "Vegetarian",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('RA ML4'), restaurantId: fromString('Renatas'),
    name: "Falafel Wrap",
    description: "Falafel Balls, Tahini, pickles, lettuce tomato wrapped in tortilla. Served with Mama's potatoes & cookie",
    dietaryRestrictions: "Vegan",
    mealinfoId: fromString('lunch/dinner')},

  {id: fromString('EM ML1'), restaurantId: fromString('El Merkury'),
    name: "Pepian chicken dobladas",
    description: "Corn flour dumpling stuffed with pumpkin seed cilantro sauce chicken, served with salsa and pickled cabbage, yellow spiced rice, refried beans",
    dietaryRestrictions: "",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('EM ML2'), restaurantId: fromString('El Merkury'),
    name: "Potato dobladas",
    description: "Corn flour dumpling stuffed with a mix of potato and pea, served with salsa and pickled cabbage, yellow spiced rice, refried beans",
    dietaryRestrictions: "Vegan",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('EM ML3'), restaurantId: fromString('El Merkury'),
    name: "Chicharron Pupusa",
    description: "Stuffed corn tortillas with shredded spiced pork- served with curtido, salsa, pickled onion, green salad, plantain chips",
    dietaryRestrictions: "",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('EM ML4'), restaurantId: fromString('El Merkury'),
    name: "Cheese & Bean Pupusa",
    description: "Stuffed corn tortillas with fresh cheese and beans, served with curtido, salsa, pickled onion, green salad, plantain chips",
    dietaryRestrictions: "Vegetarian",
    mealinfoId: fromString('lunch/dinner')},
];


var restMeals = [
  {name: 'Cafe Ynez', meals: ['CY ML1', 'CY ML2', 'CY ML3', 'CY ML4', 'CY ML5', 'CY ML6', 'CY ML7', 'CY ML8', 'CY ML9', 'CY ML10', 'CY ML11']},
  {name: 'Pumpkin', meals: ['PU ML1', 'PU ML2', 'PU ML3']},
  {name: 'El Merkury', meals: ['EM ML1', 'EM ML2', 'EM ML3', 'EM ML4']},
  {name: 'On Point Bistro', meals: ['OP ML1', 'OP ML2', 'OP ML3', 'OP ML4']},
  {name: 'Baology', meals: ['BA ML1', 'BA ML2', 'BA ML3', 'BA ML4', 'BA ML5', 'BA ML6', 'BA ML7']},
]

// var hospitalNames = ['Penn Presby', 'Penn Hospital', 'HUP'];

var generateData = function(vals) {
  var timeslots = [];
  var menus = [];

  for (var a=0; a < vals.length; a++) {
    var start = vals[a][0];
    var stop = vals[a][1];
    var dateStr = vals[a][2];

    for(var i=start; i<stop; i++) {
      // Shuffle array
      const rests = restMeals.sort(() => 0.5 - Math.random()).slice(0, 3);

      // Iterate, create timeslots, etc.
      for(var j=0; j < 3; j++) { 
        var timeslotId = uuid();
        var meal = rests[j];

        timeslots.push({
          id: timeslotId,
          date: util.format(dateStr, i),
          restaurant: fromString(meal.name),
          hospital: hospitals[j].id
        });

        var mls = meal.meals.sort(() => 0.5 - Math.random()).slice(0, 3);
        for(var k=0; k < 3; k++) {
          menus.push({
            id: uuid(),
            timeslotId: timeslotId,
            mealId: fromString(mls[k])
          })
        }
      }
    }
  }

  return [timeslots, menus];
}

// var vals = generateData([24, 31, '2020-04-%sT16:00:00Z'], [25, 31, '2020-04-%sT00:00:00Z']);
var vals = generateData([[24, 31, '2020-04-%sT16:00:00Z'], [25, 31, '2020-04-%sT00:00:00Z']]);

var timeslots = vals[0];
var menus = vals[1];

var buildUser = function(creds) {
  var user = User.build(creds);
  user.salt = user.makeSalt();
  user.hashedPassword = user.encryptPassword(crypto.randomBytes(15).toString('hex'), user.salt);
  user.email = user.email.toLowerCase();
  user.phoneNumber = user.phoneNumber.replace(/-|\(|\)| /g, '');
  return user.save()
    .then((user))
}

async.waterfall([
  function(done) {
        Hospital.bulkCreate(hospitals).then(() => {
          done();
        });
  },
  function(done) {
        Promise.all(users.map((user) => buildUser(user))).then(function(users) {
          done();
        });
  },
  function(done) {
        Restaurant.bulkCreate(restaurants, {validate: true}).then(() => {
          done();
        });
  },
  function(done) {
        TimeSlot.bulkCreate(timeslots, {validate: true}).then(()=> {
          done()
        })
  },
  function(done) {
        MealInfo.bulkCreate(mealinfo, {validate: true}).then(()=> {
          done()
        })
  }, 
  function(done) {
        Meal.bulkCreate(meals, {validate: true}).then(()=> {
          done()
        })
  },
  function(done) {
        Menu.bulkCreate(menus, {validate: true}).then(() => {
          done();
        });
  },
function(done) {
  process.exit(0);
}
]);

// async.waterfall([
//   function(done) {
//     Hospital.destroy({where: {}})
//       .then(function() {
//         Hospital.bulkCreate(hospitals)
//           .then(() => {
//             done();
//           });
//       })
//   },
//   function(done) {
//     User.destroy({where: {}})
//       .then(() => {
//         Promise.all(users.map((user) => buildUser(user)))
//           .then(function(users) {
//             done();
//           });
//       });
//   },
//   function(done) {
//     Restaurant.destroy({where: {}})
//       .then(function() {
//         Restaurant.bulkCreate(restaurants, {validate: true})
//           .then(() => {
//             done();
//           });
//       }).catch((err) => {
//         console.log(err);
//       });
//   },
//   function(done) {
//     TimeSlot.destroy({where: {}})
//       .then(function(){
//         TimeSlot.bulkCreate(timeslots, {validate: true}).then(()=> {
//           done()
//         })
//       })
//   },
//   function(done) {
//     MealInfo.destroy({where: {}})
//       .then(function(){
//         MealInfo.bulkCreate(mealinfo, {validate: true}).then(()=> {
//           done()
//         })
//       })
//   }, 
//   function(done) {
//     Meal.destroy({where: {}})
//       .then(function(){
//         Meal.bulkCreate(meals, {validate: true}).then(()=> {
//           done()
//         })
//       })
//   },
//   function(done) {
//     Menu.destroy({where: {}})
//       .then(function() {
//         Menu.bulkCreate(menus, {validate: true})
//           .then(() => {
//             done();
//           }).catch((err) => console.log(err))
//         });
//   },
// function(done) {
//   process.exit(0);
// }
// ]);


// var timeslots = [
//   {id: fromString('4/23/20 12:00 1'), date: '2020-04-23T16:00:00Z', restaurant: fromString('El Merkury'), hospital: fromString('Penn Presby (l)')},
//   {id: fromString('4/23/20 12:00 2'), date: '2020-04-23T16:00:00Z', restaurant: fromString('Cafe Ynez'), hospital: fromString('HUP')},
//   {id: fromString('4/23/20 12:00 3'), date: '2020-04-23T16:00:00Z', restaurant: fromString('On Point Bistro'), hospital: fromString('Penn Hospital')},

//   {id: fromString('4/23/20 20:00 1'), date: '2020-04-24T00:00:00Z', restaurant: fromString('Pumpkin'), hospital: fromString('Penn Presby (d)')},
//   {id: fromString('4/23/20 20:00 2'), date: '2020-04-24T00:00:00Z', restaurant: fromString('Cafe Ynez'), hospital: fromString('Penn Hospital')},
//   {id: fromString('4/23/20 20:00 3'), date: '2020-04-24T00:00:00Z', restaurant: fromString('Cafe Ynez'), hospital: fromString('HUP')},

//   {id: fromString('4/24/20 12:00 1'), date: '2020-04-24T16:00:00Z', restaurant: fromString('Renatas'), hospital: fromString('Penn Presby (l)')},
//   {id: fromString('4/24/20 12:00 2'), date: '2020-04-24T16:00:00Z', restaurant: fromString('Baology'), hospital: fromString('HUP')},
//   {id: fromString('4/24/20 12:00 3'), date: '2020-04-24T16:00:00Z', restaurant: fromString('Cafe Ynez'), hospital: fromString('Penn Hospital')},

//   {id: fromString('4/24/20 20:00 1'), date: '2020-04-25T00:00:00Z', restaurant: fromString('On Point Bistro'), hospital: fromString('Penn Presby (d)')},
//   {id: fromString('4/24/20 20:00 2'), date: '2020-04-25T00:00:00Z', restaurant: fromString('El Merkury'), hospital: fromString('HUP')},
//   {id: fromString('4/24/20 20:00 3'), date: '2020-04-25T00:00:00Z', restaurant: fromString('El Merkury'), hospital: fromString('Penn Hospital')},

//   {id: fromString('4/25/20 12:00 1'), date: '2020-04-25T16:00:00Z', restaurant: fromString('Sate Kampar'), hospital: fromString('Penn Presby (l)')},
//   {id: fromString('4/25/20 12:00 2'), date: '2020-04-25T16:00:00Z', restaurant: fromString('Cafe Ynez'), hospital: fromString('HUP')},
//   {id: fromString('4/25/20 12:00 3'), date: '2020-04-25T16:00:00Z', restaurant: fromString('Baology'), hospital: fromString('Penn Hospital')},

//   {id: fromString('4/25/20 20:00 1'), date: '2020-04-26T00:00:00Z', restaurant: fromString('Renatas'), hospital: fromString('Penn Presby (d)')},
//   {id: fromString('4/25/20 20:00 2'), date: '2020-04-26T00:00:00Z', restaurant: fromString('Baology'), hospital: fromString('HUP')},
//   {id: fromString('4/25/20 20:00 3'), date: '2020-04-26T00:00:00Z', restaurant: fromString('Baology'), hospital: fromString('Penn Hospital')},

//   {id: fromString('4/26/20 12:00 1'), date: '2020-04-26T16:00:00Z', restaurant: fromString('Sate Kampar'), hospital: fromString('Penn Presby (l)')},
//   {id: fromString('4/26/20 12:00 2'), date: '2020-04-26T16:00:00Z', restaurant: fromString('Cafe Ynez'), hospital: fromString('HUP')},
//   {id: fromString('4/26/20 12:00 3'), date: '2020-04-26T16:00:00Z', restaurant: fromString('Baology'), hospital: fromString('Penn Hospital')},

//   {id: fromString('4/26/20 20:00 1'), date: '2020-04-27T00:00:00Z', restaurant: fromString('Renatas'), hospital: fromString('Penn Presby (d)')},
//   {id: fromString('4/26/20 20:00 2'), date: '2020-04-27T00:00:00Z', restaurant: fromString('Baology'), hospital: fromString('HUP')},
//   {id: fromString('4/26/20 20:00 3'), date: '2020-04-27T00:00:00Z', restaurant: fromString('Baology'), hospital: fromString('Penn Hospital')},

//   {id: fromString('4/27/20 12:00 1'), date: '2020-04-27T16:00:00Z', restaurant: fromString('Sate Kampar'), hospital: fromString('Penn Presby (l)')},
//   {id: fromString('4/27/20 12:00 2'), date: '2020-04-27T16:00:00Z', restaurant: fromString('Cafe Ynez'), hospital: fromString('HUP')},
//   {id: fromString('4/27/20 12:00 3'), date: '2020-04-27T16:00:00Z', restaurant: fromString('Baology'), hospital: fromString('Penn Hospital')},

//   {id: fromString('4/27/20 20:00 1'), date: '2020-04-28T00:00:00Z', restaurant: fromString('Renatas'), hospital: fromString('Penn Presby (d)')},
//   {id: fromString('4/27/20 20:00 2'), date: '2020-04-28T00:00:00Z', restaurant: fromString('Baology'), hospital: fromString('HUP')},
//   {id: fromString('4/27/20 20:00 3'), date: '2020-04-28T00:00:00Z', restaurant: fromString('Baology'), hospital: fromString('Penn Hospital')},

//   {id: fromString('4/28/20 12:00 1'), date: '2020-04-28T16:00:00Z', restaurant: fromString('Sate Kampar'), hospital: fromString('Penn Presby (l)')},
//   {id: fromString('4/28/20 12:00 2'), date: '2020-04-28T16:00:00Z', restaurant: fromString('Cafe Ynez'), hospital: fromString('HUP')},
//   {id: fromString('4/28/20 12:00 3'), date: '2020-04-28T16:00:00Z', restaurant: fromString('Baology'), hospital: fromString('Penn Hospital')},

//   {id: fromString('4/28/20 20:00 1'), date: '2020-04-29T00:00:00Z', restaurant: fromString('Renatas'), hospital: fromString('Penn Presby (d)')},
//   {id: fromString('4/28/20 20:00 2'), date: '2020-04-29T00:00:00Z', restaurant: fromString('Baology'), hospital: fromString('HUP')},
//   {id: fromString('4/28/20 20:00 3'), date: '2020-04-29T00:00:00Z', restaurant: fromString('Baology'), hospital: fromString('Penn Hospital')},
// ];


// var menus = [

//   // Day 1
//   {id: fromString('MN1AA'), timeslotId: fromString('4/23/20 12:00 1'), mealId: fromString('EM ML1')},
//   {id: fromString('MN2AA'), timeslotId: fromString('4/23/20 12:00 1'), mealId: fromString('EM ML2')},
//   {id: fromString('MN3AA'), timeslotId: fromString('4/23/20 12:00 1'), mealId: fromString('EM ML3')},
//   {id: fromString('MN4AA'), timeslotId: fromString('4/23/20 12:00 1'), mealId: fromString('EM ML4')},

//   {id: fromString('MN5AA'), timeslotId: fromString('4/23/20 12:00 2'), mealId: fromString('CY ML1')},
//   {id: fromString('MN6AA'), timeslotId: fromString('4/23/20 12:00 2'), mealId: fromString('CY ML2')},
//   {id: fromString('MN7AA'), timeslotId: fromString('4/23/20 12:00 2'), mealId: fromString('CY ML7')},
//   {id: fromString('MN8AA'), timeslotId: fromString('4/23/20 12:00 2'), mealId: fromString('CY ML8')},

//   {id: fromString('MN9AA'), timeslotId: fromString('4/23/20 12:00 3'), mealId: fromString('OP ML1')},
//   {id: fromString('MN10AA'), timeslotId: fromString('4/23/20 12:00 3'), mealId: fromString('OP ML2')},
//   {id: fromString('MN11AA'), timeslotId: fromString('4/23/20 12:00 3'), mealId: fromString('OP ML3')},
//   {id: fromString('MN12AA'), timeslotId: fromString('4/23/20 12:00 3'), mealId: fromString('OP ML4')},

//   {id: fromString('MN13AA'), timeslotId: fromString('4/23/20 20:00 1'), mealId: fromString('PU ML1')},
//   {id: fromString('MN14AA'), timeslotId: fromString('4/23/20 20:00 1'), mealId: fromString('PU ML2')},
//   {id: fromString('MN15AA'), timeslotId: fromString('4/23/20 20:00 1'), mealId: fromString('PU ML3')},
//   {id: fromString('MN16AA'), timeslotId: fromString('4/23/20 20:00 1'), mealId: fromString('PU ML3')},

//   {id: fromString('MN17AA'), timeslotId: fromString('4/23/20 20:00 2'), mealId: fromString('CY ML1')},
//   {id: fromString('MN18AA'), timeslotId: fromString('4/23/20 20:00 2'), mealId: fromString('CY ML2')},
//   {id: fromString('MN19AA'), timeslotId: fromString('4/23/20 20:00 2'), mealId: fromString('CY ML3')},
//   {id: fromString('MN20AA'), timeslotId: fromString('4/23/20 20:00 2'), mealId: fromString('CY ML4')},

//   {id: fromString('MN21AA'), timeslotId: fromString('4/23/20 20:00 3'), mealId: fromString('CY ML1')},
//   {id: fromString('MN22AA'), timeslotId: fromString('4/23/20 20:00 3'), mealId: fromString('CY ML2')},
//   {id: fromString('MN23AA'), timeslotId: fromString('4/23/20 20:00 3'), mealId: fromString('CY ML3')},
//   {id: fromString('MN24AA'), timeslotId: fromString('4/23/20 20:00 3'), mealId: fromString('CY ML4')},

//   // Day 2
// ]
  