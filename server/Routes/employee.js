// Routes/employee.js
const express = require("express");
const router = express.Router();
const { auth } = require("../Middleware/auth");

const {
  AddEmployee,
  GetDataEmployeeById, // ***  ใช้ Controller ที่แก้ไขแล้ว ***
  UpdateEmployee,
  DeleteEmployee,
  FindDataEmployeeByUserId,
} = require("../Controllers/employee");

// ใช้สำรหับหาข้อมูลทั้งหมดที่ userId ตรงกับ id ของผู้ที่ล็อคอิน
// ไม่ต้องรับ id มาโดยตรง เพราะในฟังก์ชั่นดู id จาก Token ที่มากับ auth
router.get("/employee", auth, FindDataEmployeeByUserId);

// ✅ พนักงานเพิ่มข้อมูลของตัวเอง
// ตรวจสอบแค่ว่า id อะไรเพื่อสร้างให้ข้อมูลมี userId ตรงกับ id ของผู้สร้าง
router.post("/employee", auth, AddEmployee); // *** เพิ่ม auth middleware ***

// ✅ ดึงข้อมูล Employee ด้วย ID ที่ระบุ (สำหรับหน้า Edit)
router.get("/employee/:id", auth, GetDataEmployeeById);

// ✅ ปุ่มแก้ไขข้อมูล ใช้สำหรับอัพเดทข้อมูลที่กดบันทึกมาใหม่
router.put("/employee/:id", auth, UpdateEmployee);

// ✅ พนักงานลบข้อมูลของตัวเอง
router.delete("/employee/:id", auth, DeleteEmployee); // *** เพิ่ม Route สำหรับ Delete ***

module.exports = router;
