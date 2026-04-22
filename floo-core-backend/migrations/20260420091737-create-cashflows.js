"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Cashflows", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      type: {
        type: Sequelize.STRING, // "in" / "out"
        allowNull: false,
      },

      amount: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      source: {
        type: Sequelize.STRING, // "loan" / "payment"
        allowNull: true,
      },

      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // 🔥 INDEX (BIAR CEPAT QUERY DASHBOARD)
    await queryInterface.addIndex("Cashflows", ["type"]);
    await queryInterface.addIndex("Cashflows", ["createdAt"]);
    await queryInterface.addIndex("Cashflows", ["reference_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Cashflows");
  },
};
