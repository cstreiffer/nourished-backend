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
  util = require('util');

var users =  [
  {id: fromString('JetJill'), username: 'JetJill', email: 'test_ranate@gmail.com', phoneNumber: '5555555555', firstName: 'Jill', lastName: 'Weber', roles: ['restaurant']},
  {id: fromString('HillaryB'), username: 'HillaryB', email: 'test_admin@pumpkinphilly.com', phoneNumber: '5555555556', firstName: 'Hillary', lastName: 'Bor', roles: ['restaurant']},
  {id: fromString('SofiaD'), username: 'SofiaD', email: 'test_sofia@elmerkury.com', phoneNumber: '5555555557', firstName: 'Sofia', lastName: 'Deleon', roles: ['restaurant']},
  {id: fromString('malfix8'), username: 'malfix8', email: 'test_fix.mallory@gmail.com', phoneNumber: '5555555558', firstName: 'Mallory', lastName: 'Fix', roles: ['restaurant']},

  {id: fromString('judyni'), username: 'judyni', email: 'test_baology@gmail.com', phoneNumber: '5555555559', firstName: 'Judy', lastName: 'Ni', roles: ['restaurant']},
  {id: fromString('temp2'), username: 'temp2', email: 'test_renatas@gmail.com', phoneNumber: '5555555560', firstName: 'Ren', lastName: 'Ata', roles: ['restaurant']},
  {id: fromString('abranca'), username: 'abranca', email: 'test_satekampar@gmail.com', phoneNumber: '5555555561', firstName: 'Angelina', lastName: 'Branca', roles: ['restaurant']},

  {id: fromString('cstreiffer'), username: 'cstreiffer', email: 'ccstreiffer@gmail.com',phoneNumber: '5046137325', firstName: 'Chris', lastName: 'Streiffer', roles: ['user']},
  {id: fromString('jazz'), username: 'jazz', email: 'jazz_test_test@gmail.com',phoneNumber: '5046137326', firstName: 'Jazz', lastName: '', roles: ['user']},
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
  {id: fromString('HUP'), name: 'Hospital of the University of Pennsylvania (HUP)', streetAddress: '36 and Spruce Street', city: 'Philadelphia', state: 'PA', zip: '19104', phoneNumber: '2156622677', email: 'joseph.forte2@pennmedicine.upenn.edu', dropoffLocation: 'Maloney Entrance on the corner of 36th and Spruce. Look for "FOOD DELIVERY LOCATION" (Red and White Sign) at entrance.', dropoffInfo: 'Food Delivery Location is staffed 24/7. Penn Medicine staff member will take delivery at the door.'}
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
    dietaryRestrictions: ["Gluten Free"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML2"), restaurantId: fromString('Cafe Ynez'), 
    name: "Steak Burrito", 
    description: "Seared flank steak, cheddar cheese, pico de gallo, sliced avocado, refried black beans, and chipotle ranch, whole wheat tortilla, side salad.",
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML3"), restaurantId: fromString('Cafe Ynez'), 
    name: "Cauliflower Tacos", 
    description: "Fried cauliflower topped with chipotle, radish slaw, red cabbage, avocado served on two soft corn tortillas.", 
    dietaryRestrictions: ["Vegan"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML4"), restaurantId: fromString('Cafe Ynez'), 
    name: "Grilled Chicken Tacos", 
    description: "Grilled chicken tacos topped with pico de gallo, cotija cheese, smoked jalapeno salsa served on two soft corn tortillas", 
    dietaryRestrictions: ["Gluten Free"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML5"), restaurantId: fromString('Cafe Ynez'), 
    name: "Roast Chicken", 
    description: "Herb-roasted half chicken, seasonal vegetables, tortillas.", 
    dietaryRestrictions: [],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML6"), restaurantId: fromString('Cafe Ynez'), 
    name: "Fish Tacos", 
    description: "Grilled tilapia, pineapple-habanero salsa, avocado, sour cream, lettuce, corn tortillas.", 
    dietaryRestrictions: [],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML7"), restaurantId: fromString('Cafe Ynez'), 
    name: "Veggie Burrito", 
    description: "Corn, black beans, baby spinach, shallot, garlic, pico de gallo, avocado and quinoa, whole wheat tortilla, side salad.", 
    dietaryRestrictions: ["Vegan"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML8"), restaurantId: fromString('Cafe Ynez'), 
    name: "Caesar salad w/ shrimp", 
    description: "Grilled shrimp, romaine, red onions, grape tomato, brioche croutons, parmesan cheese, caesar dressing", 
    dietaryRestrictions: [],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML9"), restaurantId: fromString('Cafe Ynez'), 
    name: "Chicken Tinga Burrito", 
    description: "Pulled chicken in chipotle tomato sauce with onions, cheddar cheese, lettuce, rice, refried black beans, sour cream, whole wheat tortilla, side salad", 
    dietaryRestrictions: [],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML10"), restaurantId: fromString('Cafe Ynez'), 
    name: "Veggie Burrito", 
    description: "Corn, black beans, baby spinach, shallot, garlic, pico de gallo, avocado and quinoa, whole wheat tortilla, side salad.", 
    dietaryRestrictions: ["Vegan"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("CY ML11"), restaurantId: fromString('Cafe Ynez'), 
    name: "Carnitas Tacos", 
    description: "Pork confit tacos topped with pico de gallo, cotija cheese, smoked jalapeno salsa served on two soft corn tortillas.", 
    dietaryRestrictions: ["Gluten Free"],
    mealinfoId: fromString('lunch/dinner')},

  {id: fromString("BA ML1"), restaurantId: fromString("Baology"), 
    name: "Chicken Friend Rice", 
    description: "Roasted 5-Spiced Rubbed Pastured Chicken served with our Egg Fried Forbidden Rice", 
    dietaryRestrictions: ["Gluten Free"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML2"), restaurantId: fromString("Baology"), 
    name: "Pork Fried Rice", 
    description: "Roasted Heritage Pork Belly served with our Egg Fried Forbidden Rice", 
    dietaryRestrictions: ["Gluten Free"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML3"), restaurantId: fromString("Baology"), 
    name: "Mushroom Fried Rice", 
    description: "Roasted Organic Mushrooms served with our Egg Fried Forbidden Rice", 
    dietaryRestrictions: ["Gluten Free", "Vegetarian"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML4"), restaurantId: fromString("Baology"), 
    name: "Taiwanese Fried Chicken Bento", 
    description: "Over Forbidden Rice with pickled red cabbage & local veggies - served with a lemon aioli", 
    dietaryRestrictions: ["Gluten Free"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML5"), restaurantId: fromString("Baology"), 
    name: "Jail Island Salmon Bento", 
    description: "Over Forbidden Rice with pickled red cabbage & local veggies", 
    dietaryRestrictions: ["Gluten Free"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML6"), restaurantId: fromString("Baology"), 
    name: "Local Tofu Bento", 
    description: "Over Forbidden Rice with pickled red cabbage & local veggies - served with hoisin sauce", 
    dietaryRestrictions: ["Vegan"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString("BA ML7"), restaurantId: fromString("Baology"), 
    name: "Pulled Heritage Pork", 
    description: "Over Forbidden Rice with pickled red cabbage & local veggies - served with a garlic aioli (on the side)", 
    dietaryRestrictions: ["Gluten Free"] ,
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
    allergens: ["Contains sesame"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('RA ML3'), restaurantId: fromString('Renatas'),
    name: "Mjaddara",
    description: "Caramelized Spiced lentils and cracked wheat served with side salad, tzatziki & cookie. Vegetarian",
    dietaryRestrictions: ["Vegetarian"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('RA ML4'), restaurantId: fromString('Renatas'),
    name: "Falafel Wrap",
    description: "Falafel Balls, Tahini, pickles, lettuce tomato wrapped in tortilla. Served with Mama's potatoes & cookie",
    dietaryRestrictions: ["Vegan"],
    mealinfoId: fromString('lunch/dinner')},

  {id: fromString('EM ML1'), restaurantId: fromString('El Merkury'),
    name: "Pepian chicken dobladas",
    description: "Corn flour dumpling stuffed with pumpkin seed cilantro sauce chicken, served with salsa and pickled cabbage, yellow spiced rice, refried beans",
    dietaryRestrictions: [],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('EM ML2'), restaurantId: fromString('El Merkury'),
    name: "Potato dobladas",
    description: "Corn flour dumpling stuffed with a mix of potato and pea, served with salsa and pickled cabbage, yellow spiced rice, refried beans",
    dietaryRestrictions: ["Vegan"],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('EM ML3'), restaurantId: fromString('El Merkury'),
    name: "Chicharron Pupusa",
    description: "Stuffed corn tortillas with shredded spiced pork- served with curtido, salsa, pickled onion, green salad, plantain chips",
    dietaryRestrictions: [],
    mealinfoId: fromString('lunch/dinner')},
  {id: fromString('EM ML4'), restaurantId: fromString('El Merkury'),
    name: "Cheese & Bean Pupusa",
    description: "Stuffed corn tortillas with fresh cheese and beans, served with curtido, salsa, pickled onion, green salad, plantain chips",
    dietaryRestrictions: ["Vegetarian"],
    mealinfoId: fromString('lunch/dinner')},
];

var restMeals = [
  {name: 'Cafe Ynez', user: 'JetJill', meals: ['CY ML1', 'CY ML2', 'CY ML3', 'CY ML4', 'CY ML5', 'CY ML6', 'CY ML7', 'CY ML8', 'CY ML9', 'CY ML10', 'CY ML11']},
  {name: 'Pumpkin', user: 'HillaryB', meals: ['PU ML1', 'PU ML2', 'PU ML3']},
  {name: 'El Merkury', user: 'SofiaD', meals: ['EM ML1', 'EM ML2', 'EM ML3', 'EM ML4']},
  {name: 'On Point Bistro', user: 'malfix8', meals: ['OP ML1', 'OP ML2', 'OP ML3', 'OP ML4']},
  {name: 'Baology', user: 'judyni', meals: ['BA ML1', 'BA ML2', 'BA ML3', 'BA ML4', 'BA ML5', 'BA ML6', 'BA ML7']},
]

var mealLookup = meals.reduce(function(acc, cur) {
  acc[cur.id] = cur;
  return acc;
}, {});

var userIds = [fromString('cstreiffer'), fromString('jazz')];

// var userIds = 
// ["76bd12c8-4be3-4fef-9782-f69db274a872",
// "49d6ebbb-f794-49ea-93f9-7e68d3b889ef",
// "1cf6934a-9b56-490a-a0fe-9eb228d8a895",
// "f86124d8-ec15-4445-a17f-a91fb16244e6",
// "4e0f7a18-f4ab-4126-a10c-bd7ce6e161f9",
// "08bb6ed7-7653-4046-adea-9112bc7e8374",
// "7f31693b-34ba-418a-983d-19e293cca883",
// "9d2bb2fe-ec08-499c-8f2d-f0e9683a1f32",
// "42158f4b-1847-4e56-9f2f-ccdbc6941403",
// "83ca9f6a-da39-4975-83ac-0625fb55a849",
// "a8406450-8ea1-4707-9663-a3fa4c48d354",
// "013a2ee5-7ee0-43a6-96ad-2696cfb11748",
// "dd15854e-e9a5-474b-980f-660950fa3859",
// "0e41604f-e1e2-4e2e-ae93-5d49b6040fc7",
// "a7aa4e6f-b4bc-42c0-a575-69123a8fec45",
// "a3de2bac-e353-4bfe-845f-8ee32eeaf427",
// "5b1bfb9e-c541-448a-bcf2-0b493813314b",
// "2e4e8193-d266-4328-a4ba-5033f07ccf91",
// "3a19cb94-067c-4822-aa66-ba77dc12aa3d",
// "2fb12548-12dd-454f-ad65-46b2bb85afbe",
// "5a01943e-0636-4159-96e0-411e7c800958",
// "04ed2442-9f1c-4705-b39f-d1fa1a63e728",
// "13d88653-09f6-5e4e-a34b-617f1ebbb3ba",
// "949356c0-c4e8-5133-ba84-45b3fd262d19",
// "cefb8c90-366c-5e8b-9152-cc87f33cc833",
// "e71d159f-95e4-5ae4-84d2-2277a65a03d5",
// "bb0cf964-bea4-5ac6-b50b-045f3384ffed",
// "4a2d67f6-fdf9-54b0-bd94-e4961f481b9b",
// "1d2dd2c7-04c3-4751-ac49-bc0d444df7e1",
// "c8ac6fd2-7ee7-5c16-8fc2-e23194bf54d9",
// "60c38856-7143-4be7-a8e7-1de171906ef1",
// "60ef1cfe-9c6b-4b50-81ba-60c980454f2f",
// "56e664e0-6a58-4a05-ada9-1789df1dceec",
// "3c425d93-f104-4678-8ead-6d863a30b10c",
// "eafcff6a-ab48-4322-8a83-ed663561b605",
// "8fb34ece-37aa-4968-86d4-2cc49430593e",
// "35e781cd-4e03-4232-adfc-7fd8bf6a4edc",
// "8b17a28d-ace3-43a2-9ef0-b0f6f6ec643e",
// "12ba9b7f-8a3c-4161-a07a-3deba9ee7282",
// "8bfcac6a-4571-487b-b1be-430f90e46cef",
// "e67b1d28-0f90-4248-8080-0ce786f93010",
// "99591fdc-64a1-4f4a-a5a5-b939dd069842",
// "90d48cd6-1de3-4e22-89cf-92a21e55b368",
// "2483e5d1-e7aa-4394-b52a-3f08f7da60b7",
// "1bff954b-0efe-44ba-b413-0d0374390502"]

var generateData = function(vals) {
  var timeslots = [];
  var menus = [];
  var orders = [];

  // Let's get spooky
  var bulkId = uuid();
  var bulkUser = userIds.sort(() => 0.5 - Math.random()).slice(0, 1)[0];

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
          date: util.format(dateStr, pad(i, 2)),
          restaurantId: fromString(meal.name),
          hospitalId: hospitals[j].id,
          userId: fromString(meal.user)
        });

        var mls = meal.meals.sort(() => 0.5 - Math.random()).slice(0, 3);
        var groupId = uuid();
        var groupUser = userIds.sort(() => 0.5 - Math.random()).slice(0, 1)[0];

        for(var k=0; k < 3; k++) {
          var menuId = uuid();
          var mealCopy = {...mealLookup[fromString(mls[k])]};
          // console.log(mealCopy);
          mealCopy.mealName = mealCopy.name;
          mealCopy.mealDescription = mealCopy.description;
          delete mealCopy.id

          menus.push({
            ...mealCopy,
            id: menuId,
            timeslotId: timeslotId,
            userId: fromString(meal.user)
          })
          // if(Math.random() > 0.7) {
            var quantity = Math.floor(Math.random()*10);
            orders.push({
              ...mealCopy,
              type: 'lunch',
              price: 5.00,
              total: quantity*5.00,
              quantity: quantity,
              id: uuid(),
              deliveryDate: menuId,
              userId: groupUser,
              restaurantId: fromString(meal.name),
              hospitalId: hospitals[j].id,
              groupId: groupId,
              deliveryDate: util.format(dateStr, pad(i, 2))
            })
          // } else if (Math.random() > 0.7) {
            var quantity = Math.floor(Math.random()*10);
            orders.push({
              ...mealCopy,
              type: 'lunch',
              price: 5.00,
              total: quantity*5.00,
              quantity: quantity,
              id: uuid(),
              deliveryDate: menuId,
              userId: bulkUser,
              restaurantId: fromString(meal.name),
              hospitalId: hospitals[j].id,
              groupId: bulkId,
              deliveryDate: util.format(dateStr, pad(i, 2))
            })
          // }
        }
        if(Math.random() > 0.8){
          bulkId = uuid();
          bulkUser = userIds.sort(() => 0.5 - Math.random()).slice(0, 1)[0];
        }
      }
    }
  }

  return [timeslots, menus, orders];
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

var vals = generateData([[1, 14, '2020-05-%sT16:00:00Z'], [1, 14, '2020-05-%sT00:00:00Z'], [1, 14, '2020-05-%sT00:30:00Z']]);

// var vals = generateData([[28, 31, '2020-04-%sT19:00:00Z']])

var timeslots = vals[0];
var menus = vals[1];
var orders = vals[2];
console.log(orders.length);
// console.log(orders);

var buildUser = function(creds) {
  var user = User.build(creds);
  user.salt = user.makeSalt();
  user.hashedPassword = user.encryptPassword('password', user.salt);
  user.email = user.email.toLowerCase();
  user.phoneNumber = user.phoneNumber.replace(/-|\(|\)| /g, '');
  return user.save()
    .then((user))
}

async.waterfall([
  function(done) {
    Hospital.destroy({where: {}})
      .then(function() {
        Hospital.bulkCreate(hospitals)
          .then(() => {
            done();
          }).catch((err) => {console.log("Hospital error"); done()});
      })
  },
  function(done) {
    User.destroy({where: {}})
      .then(() => {
        Promise.all(users.map((user) => buildUser(user)))
          .then(function(users) {
            done();
          }).catch((err) => {console.log("User error"); done()});
      });
  },
  function(done) {
    Restaurant.destroy({where: {}})
      .then(function() {
        Restaurant.bulkCreate(restaurants, {validate: true})
          .then(() => {
            done();
          }).catch((err) => {console.log("Restaurant error"); done()});
      }).catch((err) => {
        console.log(err);
      });
  },
  function(done) {
    MealInfo.destroy({where: {}})
      .then(function(){
        MealInfo.bulkCreate(mealinfo, {validate: true}).then(()=> {
          done()
        }).catch((err) => {console.log("Meal info error"); done()});
      })
  }, 
  function(done) {
    Meal.destroy({where: {}})
      .then(function(){
        Meal.bulkCreate(meals, {validate: true}).then(()=> {
          done()
        }).catch((err) => {console.log("Meal error"); done()});
      })
  },
  function(done) {
    TimeSlot.destroy({where: {}})
      .then(function(){
        TimeSlot.bulkCreate(timeslots, {validate: true}).then(()=> {
          done()
        })
      })
  },
  function(done) {
    Menu.destroy({where: {}})
      .then(function() {
        Menu.bulkCreate(menus, {validate: true})
          .then(() => {
            done();
          }).catch((err) => console.log(err))
        });
  },
  function(done) {
    Order.destroy({where: {}})
      .then(function() {
        Order.bulkCreate(orders, {validate: true})
          .then(() => {
            done();
          }).catch((err) => console.log(err))
        });
  },
function(done) {
  process.exit(0);
}
]);
  