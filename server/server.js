// server.js
const express = require("express");
const { readdirSync } = require("fs");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
// const config = require("./config"); // อาจจะไม่จำเป็นแล้ว ถ้า db.js จัดการ config
// const { sequelize, testconnectDB } = require("./config/db.js"); // ไม่ต้องใช้ testconnectDB ที่นี่
const dotenv = require("dotenv");
const path = require("path");
const logger = require("./config/logger");
const cookieParser = require("cookie-parser");
// const authRoutes = require("./Routes/auth"); // <<< ลบบรรทัดนี้ออก

dotenv.config();

const app = express();

// --- แก้ไขการเชื่อมต่อฐานข้อมูล ---
// Import db object ที่มี models และ sequelize instance จาก index.js
const db = require("./models");

const corsOptions = {
  origin: "http://localhost:5173", // *** ระบุ Origin ของ Frontend ของคุณ ***
  credentials: true, // *** อนุญาตให้ส่ง Cookies และ Authorization Headers ***
  optionsSuccessStatus: 200, // บาง Browser เก่าๆ มีปัญหากับ 204
};

// ตรวจสอบการเชื่อมต่อโดยใช้ sequelize instance จาก db object
db.sequelize
  .authenticate()
  .then(() => {
    logger.info(
      "Database connection verified successfully via models/index.js."
    );
    // Optional: Sync database ที่นี่ ถ้าต้องการ (ใช้ด้วยความระมัดระวัง)
    // return db.sequelize.sync({ force: false }); // force: true จะลบข้อมูลเดิม!
  })
  // .then(() => logger.info('Database synchronized.'))
  .catch((err) => {
    logger.error("Unable to connect to the database via models/index.js:", err);
    process.exit(1); // ออกจากโปรแกรมถ้าเชื่อมต่อ DB ไม่ได้
  });

// Middleware
app.use(morgan("dev"));
app.use(cors(corsOptions)); // พิจารณาตั้งค่า options สำหรับ production
app.use(bodyParser.json({ limit: "10mb" }));
app.use(cookieParser());
// app.use("/api/auth", authRoutes); // <<< ลบบรรทัดนี้ออกแล้ว

// --- แก้ไขการโหลด Route อัตโนมัติ ---
try {
  logger.info("Loading routes...");
  readdirSync("./Routes").forEach((file) => {
    // ใช้ forEach ก็ได้
    // ตรวจสอบว่าเป็นไฟล์ .js และไม่ใช่ index.js (ถ้ามี)
    if (file.endsWith(".js") && file.toLowerCase() !== "index.js") {
      const routePath = path.join(__dirname, "Routes", file);
      const router = require(routePath); // require router ที่ export จากไฟล์
      // Mount router ภายใต้ prefix /api
      // path ภายในไฟล์ route (เช่น /login) จะสัมพันธ์กับ /api
      app.use("/api", router);
      logger.info(`Loaded route: ${file} mounted under /api`);
    }
  });
  logger.info("Finished loading routes.");
} catch (error) {
  logger.error("Fatal error during route loading:", error);
  process.exit(1); // ออกจากโปรแกรมถ้าโหลด route ไม่ได้
}
// --- สิ้นสุดการแก้ไขการโหลด Route ---

// --- 404 Not Found Handler ---
// วางไว้ *หลัง* route ทั้งหมด
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  logger.warn(
    `404 - Not Found - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  next(error); // ส่งต่อไปให้ central error handler
});

// --- Central Error Handler ---
// ต้องมี 4 arguments (err, req, res, next)
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`,
    { stack: err.stack } // บันทึก stack trace ด้วย
  );

  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      // ไม่ควรส่ง stack trace ให้ client ใน production
      ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    },
  });
});

// --- รันเซิร์ฟเวอร์ ---
const PORT = 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server Running On Port ${PORT}`);
});

// จัดการ Error ตอนเริ่ม Server (เช่น port ไม่ว่าง)
server.on("error", (err) => {
  logger.error(`Server failed to start on port ${PORT}:`, err);
  process.exit(1);
});
