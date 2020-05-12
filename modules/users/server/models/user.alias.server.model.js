'use strict';

/**
 * Restaurant Model
 */

var 
  Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  var UserAlias = sequelize.define('useralias', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    aliasRoles: {
      type: DataTypes.JSONB,
      defaultValue: [],
      isArray: true
    },
  }, {
    associate: function(models) {
      UserAlias.belongsTo(models.user, { foreignKey: 'userId'});
      UserAlias.belongsTo(models.user, { foreignKey: 'aliasId'});
    }
  });

  return UserAlias;
};
