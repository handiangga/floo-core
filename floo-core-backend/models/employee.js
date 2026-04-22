"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.hasMany(models.Loan, {
        foreignKey: "employee_id",
        as: "Loans",
      });
    }
  }

  Employee.init(
    {
      name: DataTypes.STRING,
      position: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.TEXT,
      photo: DataTypes.STRING,
      ktp_photo: DataTypes.STRING,

      salary: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      salary_type: {
        type: DataTypes.ENUM("weekly", "monthly"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Employee",
    },
  );

  return Employee;
};
