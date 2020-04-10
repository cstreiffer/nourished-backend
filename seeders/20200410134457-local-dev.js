'use strict';

  // userCredentials1 = {email: 'testUser1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'},
  // userCredentials2 = {email: 'testUser2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'user'},
  // restaurantCredentials1 = {email: 'testRestaurant1@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'restaurant'},
  // restaurantCredentials2 = {email: 'testRestaurant2@test.com', password: 'h4dm322i8!!ssfSS', phoneNumber:"504-613-7325", firstName: 'Chris', account_type: 'restaurant'},
  // restaurant1 = {name:"Goldie 1", phoneNumber:"504-613-7325", email:"test21@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  // restaurant2 = {name:"Goldie 2", phoneNumber:"504-613-7325", email:"test22@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  // restaurant3 = {name:"Goldie 3", phoneNumber:"504-613-7325", email:"test23@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  // restaurant4 = {name:"Goldie 4", phoneNumber:"504-613-7325", email:"test24@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid()},
  // menu1 = {date: "2021-04-01 13:00:00", id: uuid()},
  // menu2 = {date: "2021-04-02 13:00:00", id: uuid()},
  // menu3 = {date: "2020-04-03 13:00:00", id: uuid()},
  // menu4 = {date: "2020-04-04 13:00:00", id: uuid()},
  // meal1 = {name: "Chicken 1", description: "Its Chicken", category: "Meat", price: 7.50, finalized: true},
  // meal2 = {name: "Chicken 2", description: "Its Chicken", category: "Meat", price: 7.50, finalized: false},
  // ml1 = {...meal1, menuId: menu1.id, id: uuid(), userId: restaurantId1},
  // ml2 = {...meal2, menuId: menu1.id, id: uuid(), userId: restaurantId1},
  // ml3 = {...meal1, menuId: menu2.id, id: uuid(), userId: restaurantId1},
  // ml4 = {...meal2, menuId: menu2.id, id: uuid(), userId: restaurantId1},
  // ml5 = {...meal1, menuId: menu3.id, id: uuid(), userId: restaurantId2},
  // ml6 = {...meal2, menuId: menu3.id, id: uuid(), userId: restaurantId2},
  // ml7 = {...meal1, menuId: menu4.id, id: uuid(), userId: restaurantId2},
  // ml8 = {...meal2, menuId: menu4.id, id: uuid(), userId: restaurantId2},
  // hospital1 = {name:"Presby 1", phoneNumber:"xxx-xxx-xxxx", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid(), dropoffLocation: "Take the elevator.", dropoffInfo: "Just follow the lights."},
  // hospital2 = {name:"Presby 2", phoneNumber:"xxx-xxx-xxxx", email:"test@gmail.com", streetAddress:"20 lane", zip:"19146", city:"Philadelphia", state:"PA", id: uuid(), dropoffLocation: "Take the elevator.", dropoffInfo: "Just follow the lights."},
  // order = {quantity: 5, information: "Allergic to nuts."};

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('User', [{
      firstName: 'Grace',
      lastName: 'Hopper',
      phoneNumber: '215-555-1111',
      email: 'grace.hopper@example.com',
      hashedPassword: 'h4dm322i8!!ssfSS'
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
