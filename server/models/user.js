// models/user.js
const { DataTypes } = require("sequelize");
// const { sequelize } = require("../config/db"); // ไม่ต้อง import sequelize โดยตรงถ้าใช้ index.js

// *** เปลี่ยนรูปแบบการ export ให้รับ sequelize และ DataTypes ***
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User", // <<< ใช้ชื่อ Model เป็นตัวพิมพ์ใหญ่ตัวแรก (Convention)
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // <<< ควรเพิ่ม unique constraint
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "employee",
      },
    },
    {
      tableName: "users", // <<< ระบุชื่อตารางให้ชัดเจน
      timestamps: true, // <<< เปิดใช้งาน createdAt/updatedAt (ถ้าต้องการ)
    }
  );

  // *** เพิ่มเมธอด associate ***
  User.associate = (models) => {
    // User หนึ่งคน มี RefreshToken ได้หลายอัน
    User.hasMany(models.RefreshToken, {
      // ใช้ models.RefreshToken ที่ส่งเข้ามา
      foreignKey: "userId", // Foreign key ในตาราง RefreshToken
      as: "refreshTokens", // <<< Alias ที่ถูกต้องสำหรับฝั่ง User
    });
    // หากมี association อื่นๆ ก็ใส่เพิ่มตรงนี้
  };

  return User; // คืนค่า Model ที่ define แล้ว
};
