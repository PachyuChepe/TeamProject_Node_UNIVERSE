"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CommentLike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.CommentLike.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
      });
      models.CommentLike.belongsTo(models.Comment, {
        foreignKey: "commentId",
        targetKey: "id",
      });
    }
  }
  CommentLike.init(
    {},
    {
      sequelize,
      modelName: "CommentLike",
    },
  );
  return CommentLike;
};
