// models/RefreshToken.js
const { DataTypes } = require("sequelize"); // ไม่ต้องใช้ Model ถ้าใช้ define

// *** ไม่ต้อง require sequelize หรือ User ที่นี่ ***
// const sequelize = require("../config/db").sequelize;
// const { User } = require("./user");

// *** เปลี่ยนเป็น export function ***
module.exports = (sequelize, DataTypes) => {
  // *** ใช้ sequelize.define แทน class และ init ***
  const RefreshToken = sequelize.define(
    "RefreshToken", // ชื่อ Model (ตัวพิมพ์ใหญ่ตัวแรกตาม convention)
    {
      // ไม่ต้องกำหนด id, Sequelize จัดการให้
      token: {
        type: DataTypes.STRING(500), // อาจจะลดขนาดลงได้ถ้าไม่ยาวขนาดนั้น
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references ไม่ต้องใส่ที่นี่ associate จัดการให้
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      // createdAt, updatedAt Sequelize จัดการให้ถ้า timestamps: true
    },
    {
      // tableName: 'RefreshTokens', // ปกติ Sequelize ตั้งให้เป็นพหูพจน์อยู่แล้ว
      timestamps: true, // เปิดใช้งาน createdAt, updatedAt
    }
  );

  // *** ย้าย associate มาไว้ข้างในนี้ ***
  RefreshToken.associate = (models) => {
    // RefreshToken belongs to User
    RefreshToken.belongsTo(models.User, {
      // ใช้ models.User ที่ index.js ส่งมา
      foreignKey: "userId",
      as: "user", // <<< Alias ที่ถูกต้อง
    });
  };

  return RefreshToken; // คืนค่า Model ที่ define แล้ว
};
