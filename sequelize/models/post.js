"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Post.hasMany(models.Comment, {
        foreignKey: "postId",
        sourceKey: "id",
      });

      models.Post.hasMany(models.PostLike, {
        foreignKey: "postId",
        sourceKey: "id",
      });

      models.Post.hasMany(models.MediaContent, {
        foreignKey: "postId",
        sourceKey: "id",
      });

      models.Post.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
      });
    }
  }
  Post.init(
    {
      categoryName: DataTypes.STRING,
      title: DataTypes.STRING,
      content: DataTypes.TEXT("long"),
    },
    {
      sequelize,
      modelName: "Post",
    },
  );
  return Post;
};
