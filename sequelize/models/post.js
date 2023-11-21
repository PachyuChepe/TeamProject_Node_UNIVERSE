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
        foreignKey: "post_id",
        sourceKey: "id",
      });
      models.Post.belongsTo(models.User, {
        foreignKey: "user_id",
        targetKey: "id",
      });
      models.Post.hasMany(models.Like, {
        foreignKey: "post_id",
        sourceKey: "id",
      });
    }
  }
  Post.init(
    {
      category_name: DataTypes.STRING,
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      multimedia_url: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Post",
    },
  );
  return Post;
};
