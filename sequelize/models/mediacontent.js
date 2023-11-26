"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MediaContent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.MediaContent.belongsTo(models.Post, {
        foreignKey: "postId",
        targetKey: "id",
      });
    }
  }
  MediaContent.init(
    {
      multimediaUrl: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "MediaContent",
    },
  );
  return MediaContent;
};
