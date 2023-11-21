"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Follow.belongsTo(models.User, {
        foreignKey: "user_id",
        targetKey: "id",
      });
    }
  }
  Follow.init(
    {
      follower: DataTypes.INTEGER,
      following: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Follow",
    },
  );
  return Follow;
};
