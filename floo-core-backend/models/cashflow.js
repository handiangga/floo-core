"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Cashflow extends Model {
    static associate(models) {
      // optional
    }
  }

  Cashflow.init(
    {
      type: DataTypes.STRING,
      amount: DataTypes.BIGINT,
      source: DataTypes.STRING,
      reference_id: DataTypes.INTEGER,
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Cashflow",
    },
  );

  return Cashflow;
};
