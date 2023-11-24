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
        foreignKey: "userId",
        sourceKey: "id",
      });

      models.User.hasMany(models.Comment, {
        foreignKey: "userId",
        sourceKey: "id",
      });

      models.User.hasMany(models.CommentLike, {
        foreignKey: "userId",
        sourceKey: "id",
      });
      models.User.hasMany(models.PostLike, {
        foreignKey: "userId",
        sourceKey: "id",
      });
      models.User.hasMany(models.Follow, {
        as: "Followers",
        foreignKey: "follower",
        sourceKey: "id",
      });
      models.User.hasMany(models.Follow, {
        as: "Following",
        foreignKey: "following",
        sourceKey: "id",
      });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING,
      profileDescription: {
        type: DataTypes.TEXT,
        defaultValue: "나를 소개하세요!",
      },
      profilePictureUrl: {
        type: DataTypes.TEXT,
        defaultValue: "../../front.public/image/Default-Profile-Image.png",
      },
      // // ============ 효진님 코드
      provider: {
        type: DataTypes.ENUM("naver", "kakao"),
      },
      snsId: {
        type: DataTypes.STRING(30),
      },
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
