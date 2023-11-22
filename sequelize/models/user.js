"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User.hasMany(models.Post, {
        foreignKey: "user_id",
        sourceKey: "id",
      });

      models.User.hasMany(models.Comment, {
        foreignKey: "user_id",
        sourceKey: "id",
      });

      models.User.hasMany(models.Like, {
        foreignKey: "user_id",
        sourceKey: "id",
      });
      models.User.hasMany(models.Follow, {
        foreignKey: "user_id",
        sourceKey: "id",
      });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING,
      profile_description: DataTypes.TEXT,
      profile_picture_url: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "User",
      timestamps: true,
    },
  );
  return User;
};
