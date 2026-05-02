"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    static associate(models) {
      Loan.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        as: "Employee",
      });

      Loan.hasMany(models.Transaction, {
        foreignKey: "loan_id",
        as: "Transactions",
      });
    }
  }

  Loan.init(
    {
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // 🔥 CORE LOAN
      principal_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      interest_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      interest_rate: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      // 🔥 TOTAL
      total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      remaining_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // 🔥 CICILAN
      tenor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      installment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "monthly",
      },

      // 🔥 STATUS FLOW (UPDATED)
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending_manager",
      },

      // 🔥 APPROVAL TRACKING (NEW)
      approved_by_manager: {
        type: DataTypes.INTEGER,
      },

      approved_by_owner: {
        type: DataTypes.INTEGER,
      },

      approved_at_manager: {
        type: DataTypes.DATE,
      },

      approved_at_owner: {
        type: DataTypes.DATE,
      },

      // 🔥 DISBURSEMENT
      disbursed_at: {
        type: DataTypes.DATE,
      },

      due_date: {
        type: DataTypes.DATE,
      },

      // 🔥 DOCUMENTS (NEW)
      loan_agreement: {
        type: DataTypes.TEXT, // URL PDF
      },

      disbursement_proof: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "Loan",
      tableName: "Loans", // 🔥 penting buat match Supabase
      timestamps: true, // createdAt & updatedAt
    },
  );

  return Loan;
};
