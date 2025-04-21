"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("RefreshTokens", {
      // ชื่อตารางในฐานข้อมูล
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      token: {
        type: Sequelize.STRING(500), // เผื่อ token ยาวๆ
        allowNull: false,
        unique: true, // สำคัญ: refresh token แต่ละอันต้องไม่ซ้ำกัน
      },
      userId: {
        type: Sequelize.INTEGER, // <<< ตรวจสอบชนิดข้อมูล ID ของ User ให้ตรงกัน
        allowNull: false,
        references: {
          // สร้าง Foreign Key Constraint
          model: "users", // <<<--- **สำคัญ:** ตรวจสอบชื่อตาราง Users จริงๆ ใน DB ของคุณ
          key: "id", // <<<--- **สำคัญ:** ตรวจสอบชื่อ Primary Key ของตาราง Users
        },
        onUpdate: "CASCADE", // ถ้า User ID เปลี่ยน ให้ update ที่นี่ด้วย
        onDelete: "CASCADE", // ถ้า User ถูกลบ ให้ลบ Refresh Token ที่เกี่ยวข้องด้วย
      },
      expiresAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"), // สำหรับ MySQL/MariaDB
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ), // สำหรับ MySQL/MariaDB
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // --- โค้ดสำหรับลบตาราง RefreshTokens (กรณี Rollback) ---
    await queryInterface.dropTable("RefreshTokens");
  },
};
