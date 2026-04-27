// models/cashflow.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Cashflow extends Model {
    static associate(models) {
      // 🔥 RELASI KE LOAN
      Cashflow.belongsTo(models.Loan, {
        foreignKey: "reference_id",
        as: "Loan",
      });
    }
  }

  Cashflow.init(
    {
      type: DataTypes.STRING, // in / out
      amount: DataTypes.BIGINT,
      source: DataTypes.STRING, // payment / disbursement / dll
      reference_id: DataTypes.INTEGER, // loan_id
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Cashflow",
    },
  );

  return Cashflow;
};
