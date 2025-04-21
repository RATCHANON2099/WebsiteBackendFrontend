// config/logger.js
const winston = require("winston");
const path = require("path");
require("winston-daily-rotate-file");

// กำหนดรูปแบบของ Log message
const logFormat = winston.format.printf(
  ({ level, message, timestamp, stack }) => {
    // ถ้ามี stack trace (สำหรับ error) ให้แสดงด้วย
    return `${timestamp} ${level}: ${stack || message}`;
  }
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // ระดับ Log ขั้นต่ำที่จะแสดง (info, warn, error) อ่านจาก .env หรือ default เป็น info
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // เพิ่ม timestamp
    winston.format.errors({ stack: true }), // ทำให้ error แสดง stack trace
    logFormat // ใช้รูปแบบที่เรากำหนด
  ),
  transports: [
    // Transport 1: แสดง Log ใน Console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // เพิ่มสีสันให้ log ใน console
        logFormat
      ),
    }),
    // Transport 2: บันทึก Log ที่เป็น error ลงไฟล์ error.log
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, "..", "logs", "error-%DATE%.log"), // ตั้งชื่อไฟล์ให้มีวันที่
      datePattern: "YYYY-MM-DD", // รูปแบบวันที่
      level: "error",
      zippedArchive: true, // บีบอัดไฟล์เก่า
      maxSize: "20m", // ขนาดสูงสุดต่อไฟล์
      maxFiles: "14d", // เก็บไฟล์ย้อนหลัง 14 วัน
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, "..", "logs", "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "50m", // อาจให้ขนาดใหญ่กว่า error log
      maxFiles: "7d", // เก็บไฟล์ย้อนหลัง 7 วัน (ตัวอย่าง)
    }),
  ],
  exceptionHandlers: [
    // จับ Uncaught Exceptions แล้วบันทึกลงไฟล์ exceptions.log
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    // จับ Unhandled Promise Rejections แล้วบันทึกลงไฟล์ rejections.log
    new winston.transports.File({
      filename: path.join(__dirname, "..", "logs", "rejections.log"),
    }),
  ],
});

// สร้าง Stream สำหรับให้ Morgan ใช้ (ถ้าต้องการให้ Morgan บันทึกผ่าน Winston ด้วย)
logger.stream = {
  write: (message) => {
    // ลบ newline ที่ Morgan ใส่มาท้ายสุดออก
    logger.info(message.substring(0, message.lastIndexOf("\n")));
  },
};

module.exports = logger;
