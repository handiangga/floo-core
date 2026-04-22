"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Loans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      // 🔥 CORE
      principal_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      interest_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      interest_rate: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      // 🔥 TOTAL
      total_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      remaining_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      // 🔥 CICILAN
      tenor: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      installment: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      type: {
        type: Sequelize.STRING, // weekly / monthly
        allowNull: false,
        defaultValue: "monthly",
      },

      status: {
        type: Sequelize.STRING, // ongoing / paid
        allowNull: false,
        defaultValue: "ongoing",
      },

      // 🔥 OPTIONAL
      disbursed_at: {
        type: Sequelize.DATE,
      },

      due_date: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("Loans");
  },
};
