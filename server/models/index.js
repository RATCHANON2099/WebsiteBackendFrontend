// models/index.js

"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize"); // ยังคงต้องใช้ Sequelize class
// const process = require('process'); // ไม่จำเป็นแล้ว
const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development'; // ไม่จำเป็นแล้ว
// const config = require(__dirname + '/../config/config.json')[env]; // ลบออก: ไม่ใช้ config.json

// --- การเปลี่ยนแปลงที่ 1: นำเข้า sequelize instance ที่มีอยู่ ---
const { sequelize } = require("../config/db"); // <<< ใช้ instance จาก config/db.js ของคุณ

const db = {};

// --- ลบส่วนการสร้าง sequelize instance จาก config.json ---
// let sequelize;
// if (config.use_env_variable) { ... } else { ... }

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    // --- การเปลี่ยนแปลงที่ 2: ปรับปรุงการโหลด Model ---
    const modelDefinition = require(path.join(__dirname, file));
    let model;

    if (typeof modelDefinition === "function") {
      // กรณี Model export ฟังก์ชัน (เช่น user.js ที่แก้ไขแล้ว)
      model = modelDefinition(sequelize, Sequelize.DataTypes);
    } else if (
      modelDefinition &&
      modelDefinition.init &&
      typeof modelDefinition.init === "function"
    ) {
      // กรณี Model export Class ที่มี .init (เช่น RefreshToken.js)
      // Sequelize model ที่ extends Model และเรียก init จะมี property 'name'
      model = modelDefinition;
    }

    // ตรวจสอบว่าได้ model ที่ถูกต้องและมีชื่อ ก่อนเพิ่มเข้า db
    if (model && model.name) {
      db[model.name] = model;
    } else {
      // อาจเพิ่ม log แจ้งเตือนถ้าโหลด model ไม่สำเร็จ
      console.warn(
        `[models/index.js] Could not properly load model from file: ${file}`
      );
    }
  });

// --- ส่วนนี้ถูกต้องแล้ว: ทำการเชื่อมโยง Association ---
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // เรียก .associate ของแต่ละ model
  }
});

// --- ส่วนนี้ถูกต้องแล้ว: Export db object ---
db.sequelize = sequelize; // เพิ่ม instance sequelize เข้าไปใน db object
db.Sequelize = Sequelize; // เพิ่ม Class Sequelize เข้าไป (เผื่อใช้)

module.exports = db; // Export db object ที่มี model และ sequelize instance
