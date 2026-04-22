"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      loan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      proof: {
        type: Sequelize.STRING,
      },

      remaining_after: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      payment_date: {
        type: Sequelize.DATE,
      },

      type: {
        type: Sequelize.STRING, // 🔥 "in" / "out"
        allowNull: false,
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

  async down(queryInterface) {
    await queryInterface.dropTable("Transactions");
  },
};
