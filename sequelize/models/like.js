"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Like.belongsTo(models.User, {
        foreignKey: "user_id",
        targetKey: "id",
      });
      models.Like.belongsTo(models.Post, {
        foreignKey: "post_id",
        targetKey: "id",
      });
      models.Like.belongsTo(models.Comment, {
        foreignKey: "comment_id",
        targetKey: "id",
      });
    }
  }
  Like.init(
    {
      likeable_type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Like",
    },
  );
  return Like;
};
