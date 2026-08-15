"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Documents", "type", {
      type: Sequelize.ENUM("resume", "cv", "cover_letter"),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Documents", "type", {
      type: Sequelize.ENUM("resume", "cover_letter"),
      allowNull: false,
    });
  },
};
