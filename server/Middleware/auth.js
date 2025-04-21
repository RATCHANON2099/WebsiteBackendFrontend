// server\Middleware\auth.js
const jwt = require("jsonwebtoken");
const logger = require("../config/logger"); // <<<--- เพิ่ม: import logger

// ไม่จำเป็นต้อง import User Model ที่นี่ ถ้าเราใช้ข้อมูลจาก Payload โดยตรง

exports.auth = async (req, res, next) => {
  // ทำให้เป็น async เผื่ออนาคต แต่ตอนนี้ไม่จำเป็น
  // --- Log #1: เช็คว่า Middleware เริ่มทำงาน ---
  logger.info("--- Middleware auth started ---"); // <<<--- เปลี่ยน console.log เป็น logger.info
  try {
    // 1. อ่าน Header 'Authorization'
    const authHeader = req.header("Authorization"); // ใช้ req.header() เป็นวิธีมาตรฐานกว่า
    // --- Log #2: ดู Header ที่ได้รับ ---
    // <<<--- เปลี่ยน console.log เป็น logger.debug (เหมาะสำหรับข้อมูลละเอียด)
    logger.debug("Authorization Header received:", authHeader);

    // 2. ตรวจสอบว่า Header มีค่าและขึ้นต้นด้วย 'Bearer ' หรือไม่
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // <<<--- เปลี่ยน console.log เป็น logger.warn
      logger.warn("Auth Error: No Token or Invalid Authorization Format.");
      // ใช้ 401 Unauthorized
      // <<<--- สร้าง Error object เพื่อส่งต่อให้ central error handler
      const err = new Error("No Token or Invalid Authorization Format");
      err.status = 401;
      return next(err);
      // return res
      //   .status(401)
      //   .send({ message: "No Token or Invalid Authorization Format" });
    }

    // 3. แยกเอาเฉพาะ Token
    const tokenValue = authHeader.replace("Bearer ", "");
    // --- Log #3: ดู Token ที่แยกออกมา ---
    // <<<--- เปลี่ยน console.log เป็น logger.debug (อาจพิจารณา log แค่บางส่วนของ token ใน production)
    logger.debug("Token extracted:", tokenValue);

    // --- Log #4: ดู Secret Key ที่ใช้ (สำคัญมาก!) ---
    // ตรวจสอบว่า Secret Key ตรงกับตอน Sign Token หรือไม่
    // ถ้าใช้ Environment Variable ให้ Log process.env.JWT_SECRET แทน "jwtsecret"
    // <<<--- เปลี่ยน console.log เป็น logger.debug
    logger.debug(
      "Verifying token with secret from process.env.JWT_ACCESS_SECRET"
    ); // แก้ไข Log

    // 4. ตรวจสอบ token และดึงข้อมูล Payload
    const decoded = jwt.verify(
      tokenValue,
      process.env.JWT_ACCESS_SECRET // <--- *** แก้ไขตรงนี้ *** ใช้ Secret จาก .env
    );

    // --- Log #5: ดู Payload ที่ถอดรหัสได้ (สำคัญมาก!) ---
    // ตรวจสอบว่ามี id, email, role ถูกต้องหรือไม่
    // <<<--- เปลี่ยน console.log เป็น logger.debug
    logger.debug("Decoded Payload:", decoded);

    // 5. ตรวจสอบว่า Payload มีข้อมูลที่จำเป็นหรือไม่
    if (!decoded || !decoded.id || !decoded.role) {
      // ตรวจสอบ id และ role เป็นอย่างน้อย
      // <<<--- เปลี่ยน console.log เป็น logger.warn
      logger.warn(
        "Auth Error: Decoded payload is missing required fields (id, role)."
      );
      throw new Error("Invalid token payload"); // โยน Error เพื่อให้ไปที่ catch block
    }

    // 6. สร้าง Object ที่จะแนบเข้า req.user
    const userPayload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      // ใส่ field อื่นๆ จาก decoded ถ้าต้องการ
    };

    // --- Log #6: ดูข้อมูลที่จะแนบเข้า req.user ---
    // <<<--- เปลี่ยน console.log เป็น logger.debug
    logger.debug("Attaching to req.user:", userPayload);

    // *** แนบข้อมูล User เข้ากับ req ***
    req.user = userPayload;

    // --- Log #7: ยืนยันว่า req.user ถูกกำหนดค่าแล้ว ---
    // <<<--- เปลี่ยน console.log เป็น logger.debug
    logger.debug("req.user attached successfully:", req.user);

    // <<<--- เปลี่ยน console.log เป็น logger.info
    logger.info("--- Middleware auth finished, calling next() ---");
    next(); // ไปยัง middleware หรือ controller ถัดไป
  } catch (err) {
    // --- Log #8: ดู Error ที่เกิดขึ้นใน Middleware อย่างละเอียด ---
    // <<<--- เปลี่ยน console.error เป็น logger.error
    logger.error("!!! Auth Middleware Error:", {
      errorName: err.name,
      errorMessage: err.message,
      // stack: err.stack // เอา comment ออกถ้าต้องการดู Stack Trace เต็มๆ
    });

    // จัดการ Error ประเภทต่างๆ ของ JWT และกำหนด status ก่อนส่งต่อ
    if (err.name === "JsonWebTokenError") {
      err.status = 401; // กำหนด status สำหรับ central handler
      err.message = "Invalid Token"; // อาจจะ override message ให้ชัดเจน
    } else if (err.name === "TokenExpiredError") {
      err.status = 401; // กำหนด status สำหรับ central handler
      err.message = "Token Expired"; // อาจจะ override message ให้ชัดเจน
    } else {
      // สำหรับ Error อื่นๆ ที่โยนมา เช่น "Invalid token payload" หรือ Error ที่ไม่คาดคิด
      // ถ้าไม่ได้กำหนด status ไว้ จะถูกจัดการเป็น 500 โดย central handler
      if (!err.status) {
        err.message = err.message || "Server Error during authentication";
      }
    }
    next(err); // <<<--- ส่งต่อ error ให้ central error handler เสมอ

    // --- ลบส่วนการส่ง response โดยตรงจากที่นี่ ---
    // if (err.name === "JsonWebTokenError") {
    //   return res.status(401).send({ message: "Invalid Token" });
    // }
    // if (err.name === "TokenExpiredError") {
    //   return res.status(401).send({ message: "Token Expired" });
    // }
    // res.status(500).send({ message: "Server Error during authentication" });
  }
};

// --- ส่วน Middleware isAdmin ไม่จำเป็นต้องแก้ไข ถ้า auth ทำงานถูกต้อง ---
// (แต่ถ้าต้องการใช้ ก็ควรตรวจสอบว่า req.user มีค่าก่อน)
exports.isAdmin = async (req, res, next) => {
  // --- Log เพื่อดูว่า isAdmin ถูกเรียกหรือไม่ และ req.user คืออะไร ---
  logger.info("--- Middleware isAdmin started ---"); // <<<--- เปลี่ยน console.log เป็น logger.info
  logger.debug("isAdmin checking req.user:", req.user); // <<<--- เปลี่ยน console.log เป็น logger.debug

  try {
    // ควรเช็ค req.user ก่อนเสมอ เพราะ auth middleware อาจ fail ก่อนมาถึงตรงนี้
    if (!req.user || !req.user.id) {
      // <<<--- เปลี่ยน console.error เป็น logger.error
      logger.error(
        "isAdmin Middleware Error: req.user is not defined or missing id (auth likely failed)."
      );
      // <<<--- สร้าง Error object เพื่อส่งต่อ
      const err = new Error("Authentication required (isAdmin).");
      err.status = 401;
      return next(err);
      // return res
      //   .status(401)
      //   .send({ message: "Authentication required (isAdmin)." });
    }

    // ไม่จำเป็นต้อง Query DB ซ้ำ ถ้าเชื่อถือ Role จาก Token ได้
    // const user = await User.findByPk(req.user.id);
    // if (!user || user.role !== "admin") { ... }

    // ตรวจสอบ Role จาก req.user ที่ได้จาก Middleware auth โดยตรง
    if (req.user.role !== "admin") {
      // <<<--- เปลี่ยน console.log เป็น logger.warn
      logger.warn(
        "isAdmin Access Denied: Role is not admin. Role found:",
        req.user.role
      );
      // <<<--- สร้าง Error object เพื่อส่งต่อ
      const err = new Error("Forbidden: Admin access required (isAdmin).");
      err.status = 403;
      return next(err);
      // return res
      //   .status(403)
      //   .send({ message: "Forbidden: Admin access required (isAdmin)." });
    }

    logger.info("--- Middleware isAdmin passed ---"); // <<<--- เปลี่ยน console.log เป็น logger.info
    next();
  } catch (err) {
    // <<<--- เปลี่ยน console.error เป็น logger.error
    logger.error("isAdmin Middleware Error:", err);
    // <<<--- ส่งต่อ error ให้ central error handler
    err.message = err.message || "Server Error in isAdmin"; // อาจจะตั้ง default message
    next(err);
    // res.status(500).send({ message: "Server Error in isAdmin" });
  }
};
