"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      profileDescription: {
        type: Sequelize.TEXT,
        defaultValue: "나를 소개하세요!",
      },
      profilePictureUrl: {
        type: Sequelize.TEXT,
        defaultValue: "https://blog.kakaocdn.net/dn/bmSKig/btsAUKUIbIH/6tC2ekqFZRELEBZxijKa6K/img.png",
      },
      provider: {
        type: Sequelize.ENUM("local", "kakao", "naver"),
      },
      snsId: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
