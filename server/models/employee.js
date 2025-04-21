// models/employee.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define(
    "Employee",
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        // อาจจะ unique: true ถ้าต้องการ
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
      // *** เพิ่ม Foreign Key สำหรับ User ***
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // หรือ false ถ้า Employee ต้องมี User เสมอ
        // references ไม่ต้องใส่ที่นี่ associate จัดการให้
      },
    },
    {
      tableName: "employees", // ระบุชื่อตารางให้ชัดเจน (ถ้าต้องการ)
      timestamps: true, // เปิดใช้งาน createdAt, updatedAt (ถ้าต้องการ)
    }
  );

  // *** ย้าย associate มาไว้ข้างในนี้ ***
  Employee.associate = (models) => {
    // Employee belongs to User
    Employee.belongsTo(models.User, {
      // ใช้ models.User ที่ index.js ส่งมา
      foreignKey: "userId", // Foreign key ในตาราง Employee
      as: "user", // <<< ตั้งชื่อ alias (ถ้าต้องการ)
    });
  };

  return Employee; // คืนค่า Model ที่ define แล้ว
};
