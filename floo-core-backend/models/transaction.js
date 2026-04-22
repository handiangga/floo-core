"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.Loan, { foreignKey: "loan_id" });
    }
  }

  Transaction.init(
    {
      loan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },

      proof: DataTypes.STRING,

      remaining_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },

      payment_date: {
        type: DataTypes.DATE,
      },

      type: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["weekly", "monthly"]],
        },
      },
    },
    {
      sequelize,
      modelName: "Transaction",
    },
  );

  return Transaction;
};
