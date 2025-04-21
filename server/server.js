// server.js
// ทำให้ run server ได้
const express = require("express"); // ประกาศตัวแปร express เพื่อมารับการทำงานจาก express
const { readdirSync } = require("fs"); // นำเข้า fs module เพื่อใช้ในการอ่านไฟล์ใน directory
const morgan = require("morgan"); // นำเข้า morgan middleware เพื่อใช้ในการ log request
const cors = require("cors"); // นำเข้า cors middleware เพื่อใช้ในการจัดการ CORS
const bodyParser = require("body-parser"); // นำเข้า body-parser middleware เพื่อใช้ในการ parse request body
const config = require("./config"); // นำเข้า config module เพื่อใช้ในการตั้งค่าต่างๆ
const { sequelize, testconnectDB } = require("./config/db.js"); // นำเข้า sequelize instance จาก config module
const dotenv = require("dotenv"); // นำเข้า dotenv module เพื่อใช้ในการโหลด env
const path = require("path"); // นำเข้า path เพื่อใช้จัดการ path ของไฟล์ต่าง ๆ
const logger = require("./config/logger"); // นำเข้า logger module เพื่อใช้ในการ log

dotenv.config(); // โหลด dotenv เพื่อให้สามารถใช้ env ได้

const app = express(); // สร้างตัวแปร app เพื่อใช้ในการทำงานของ express
testconnectDB() // เชื่อมต่อกับ database พร้อมแสดงข้อความว่าเชื่อมต่อสำเร็จ
  .then(() => {
    logger.info("Database connection has been established successfully.");
  })
  .catch((err) => {
    logger.error("Unable to connect to the database:", err);
    process.exit(1);
  });
// Auto-load models นำเข้าจาก models อัตโนมัติ
const basename = path.basename(__filename);
const modelsPath = path.join(__dirname, "models");
try {
  readdirSync(modelsPath)
    .filter((file) => file !== basename && file.endsWith(".js"))
    .forEach((file) => {
      require(path.join(modelsPath, file)); // auto-load models ทั้งหมดในโฟลเดอร์ models
      logger.info(`Loaded model: ${file}`);
    });
} catch (error) {
  logger.error(`Error loading models: ${error}`);
}

// Middleware
app.use(morgan("dev")); // ใช้ morgan middleware เพื่อ log request ในรูปแบบ dev
app.use(cors()); // ใช้ cors middleware เพื่อจัดการ CORS
app.use(bodyParser.json({ limit: "10mb" })); // ใช้ body-parser middleware เพื่อ parse request body เป็น json

// Route
// เชื่อมต่อ Routes สำหรับ Login
try {
  readdirSync("./Routes").map((file) => {
    app.use("/api", require(`./Routes/${file}`));
    logger.info(`Loaded route: ${file}`);
  });
} catch (error) {
  logger.error("Error loading routes:", error);
}

app.use((err, req, res, next) => {
  // Log error ที่เกิดขึ้นใน route handlers หรือ middleware ก่อนหน้า
  // ใช้ logger.error เพื่อบันทึกรายละเอียด error รวมถึง stack trace
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`,
    { stack: err.stack } // ส่ง stack trace ไปกับ log ด้วย
  );

  // ตอบกลับ Client ด้วยสถานะ Error มาตรฐาน
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

// --- Middleware สำหรับ 404 Not Found (แนะนำให้เพิ่ม) ---
// วางไว้หลังสุด ก่อน Error Handler ด้านบน
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  // Log เป็น warning เมื่อหา route ไม่เจอ
  logger.warn(
    `404 - Not Found - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  next(error); // ส่งต่อไปให้ Error Handler ด้านบนจัดการ
});

// --- รันเซิร์ฟเวอร์ ---
const PORT = process.env.mariaDB_PORT;

// รันเซิร์ฟเวอร์
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server Running On Port ${PORT}`);
});

// เพิ่มการดักจับ error ของ app.listen (ถ้าต้องการ)
server.on("error", (err) => {
  logger.error("Server failed to start:", err);
  process.exit(1);
});
