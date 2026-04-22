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
        type: DataTypes.INTEGER, // uang diterima pegawai
        allowNull: false,
      },

      interest_amount: {
        type: DataTypes.INTEGER, // total bunga
        allowNull: false,
        defaultValue: 0,
      },

      interest_rate: {
        type: DataTypes.FLOAT, // persen (5 = 5%)
        allowNull: false,
        defaultValue: 0,
      },

      // 🔥 TOTAL (principal + bunga)
      total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      remaining_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // 🔥 CICILAN
      tenor: {
        type: DataTypes.INTEGER, // jumlah bulan / minggu
        allowNull: false,
      },

      installment: {
        type: DataTypes.INTEGER, // cicilan per periode
        allowNull: false,
      },

      type: {
        type: DataTypes.STRING, // monthly / weekly
        allowNull: false,
        defaultValue: "monthly",
      },

      status: {
        type: DataTypes.STRING, // ongoing / paid
        allowNull: false,
        defaultValue: "ongoing",
      },

      // 🔥 OPTIONAL PRO
      disbursed_at: {
        type: DataTypes.DATE,
      },

      due_date: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Loan",
    },
  );

  return Loan;
};
