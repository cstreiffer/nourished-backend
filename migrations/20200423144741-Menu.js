'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          "menus",
          "visible",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
          },
          { transaction }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("menus", "visible", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
};
