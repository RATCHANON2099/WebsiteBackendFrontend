// models/employee.js
//alreadydone
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { User } = require("../models/user");

const Employee = sequelize.define(
  "employee",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {}
);

Employee.belongsTo(User, { foreignKey: "userId" });

module.exports = { Employee };
