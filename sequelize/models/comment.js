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
      models.Comment.hasMany(models.CommentLike, {
        foreignKey: "commentId",
        sourceKey: "id",
      });

      models.Comment.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
      });
      models.Comment.belongsTo(models.Post, {
        foreignKey: "postId",
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
