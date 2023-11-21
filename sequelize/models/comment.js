"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Comment.hasMany(models.Like, {
        foreignKey: "comment_id",
        sourceKey: "id",
      });
      models.Like.belongsTo(models.User, {
        foreignKey: "user_id",
        targetKey: "id",
      });
      models.Like.belongsTo(models.Post, {
        foreignKey: "post_id",
        targetKey: "id",
      });
    }
  }
  Comment.init(
    {
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Comment",
    },
  );
  return Comment;
};
