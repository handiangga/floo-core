"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Employees", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      phone: {
        type: Sequelize.STRING,
      },

      address: {
        type: Sequelize.TEXT,
      },

      photo: {
        type: Sequelize.STRING,
      },

      ktp_photo: {
        type: Sequelize.STRING,
      },

      // 🔥 TAMBAHAN (WAJIB SESUAI DB)
      position: {
        type: Sequelize.STRING,
      },

      salary_type: {
        type: Sequelize.STRING, // weekly / monthly
      },

      salary: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable("Employees");
  },
};
