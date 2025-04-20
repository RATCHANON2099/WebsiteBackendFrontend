// c:\project2\server\Middleware\auth.js
const jwt = require("jsonwebtoken");
// ไม่จำเป็นต้อง import User Model ที่นี่ ถ้าเราใช้ข้อมูลจาก Payload โดยตรง

exports.auth = async (req, res, next) => {
  // ทำให้เป็น async เผื่ออนาคต แต่ตอนนี้ไม่จำเป็น
  // --- Log #1: เช็คว่า Middleware เริ่มทำงาน ---
  console.log("--- Middleware auth started ---");
  try {
    // 1. อ่าน Header 'Authorization'
    const authHeader = req.header("Authorization"); // ใช้ req.header() เป็นวิธีมาตรฐานกว่า
    // --- Log #2: ดู Header ที่ได้รับ ---
    console.log("Authorization Header received:", authHeader);

    // 2. ตรวจสอบว่า Header มีค่าและขึ้นต้นด้วย 'Bearer ' หรือไม่
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth Error: No Token or Invalid Authorization Format.");
      // ใช้ 401 Unauthorized
      return res
        .status(401)
        .send({ message: "No Token or Invalid Authorization Format" });
    }

    // 3. แยกเอาเฉพาะ Token
    const tokenValue = authHeader.replace("Bearer ", "");
    // --- Log #3: ดู Token ที่แยกออกมา ---
    console.log("Token extracted:", tokenValue);

    // --- Log #4: ดู Secret Key ที่ใช้ (สำคัญมาก!) ---
    // ตรวจสอบว่า Secret Key ตรงกับตอน Sign Token หรือไม่
    // ถ้าใช้ Environment Variable ให้ Log process.env.JWT_SECRET แทน "jwtsecret"
    console.log("Verifying token with secret:", "jwtsecret"); // หรือ process.env.JWT_SECRET

    // 4. ตรวจสอบ token และดึงข้อมูล Payload
    const decoded = jwt.verify(tokenValue, "jwtsecret"); // ใช้ Secret Key ของคุณ

    // --- Log #5: ดู Payload ที่ถอดรหัสได้ (สำคัญมาก!) ---
    // ตรวจสอบว่ามี id, email, role ถูกต้องหรือไม่
    console.log("Decoded Payload:", decoded);

    // 5. ตรวจสอบว่า Payload มีข้อมูลที่จำเป็นหรือไม่
    if (!decoded || !decoded.id || !decoded.role) {
      // ตรวจสอบ id และ role เป็นอย่างน้อย
      console.log(
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
    console.log("Attaching to req.user:", userPayload);

    // *** แนบข้อมูล User เข้ากับ req ***
    req.user = userPayload;

    // --- Log #7: ยืนยันว่า req.user ถูกกำหนดค่าแล้ว ---
    console.log("req.user attached successfully:", req.user);

    console.log("--- Middleware auth finished, calling next() ---");
    next(); // ไปยัง middleware หรือ controller ถัดไป
  } catch (err) {
    // --- Log #8: ดู Error ที่เกิดขึ้นใน Middleware อย่างละเอียด ---
    console.error("!!! Auth Middleware Error:", {
      errorName: err.name,
      errorMessage: err.message,
      // stack: err.stack // เอา comment ออกถ้าต้องการดู Stack Trace เต็มๆ
    });

    // จัดการ Error ประเภทต่างๆ ของ JWT
    if (err.name === "JsonWebTokenError") {
      return res.status(401).send({ message: "Invalid Token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).send({ message: "Token Expired" });
    }

    // Error อื่นๆ ที่ไม่คาดคิด
    res.status(500).send({ message: "Server Error during authentication" });
  }
};

// --- ส่วน Middleware isAdmin ไม่จำเป็นต้องแก้ไข ถ้า auth ทำงานถูกต้อง ---
// (แต่ถ้าต้องการใช้ ก็ควรตรวจสอบว่า req.user มีค่าก่อน)
exports.isAdmin = async (req, res, next) => {
  // --- Log เพื่อดูว่า isAdmin ถูกเรียกหรือไม่ และ req.user คืออะไร ---
  console.log("--- Middleware isAdmin started ---");
  console.log("isAdmin checking req.user:", req.user);

  try {
    if (!req.user || !req.user.id) {
      console.error(
        "isAdmin Middleware Error: req.user is not defined or missing id."
      );
      return res
        .status(401)
        .send({ message: "Authentication required (isAdmin)." });
    }

    // ไม่จำเป็นต้อง Query DB ซ้ำ ถ้าเชื่อถือ Role จาก Token ได้
    // const user = await User.findByPk(req.user.id);
    // if (!user || user.role !== "admin") { ... }

    // ตรวจสอบ Role จาก req.user ที่ได้จาก Middleware auth โดยตรง
    if (req.user.role !== "admin") {
      console.log(
        "isAdmin Access Denied: Role is not admin. Role found:",
        req.user.role
      );
      return res
        .status(403)
        .send({ message: "Forbidden: Admin access required (isAdmin)." });
    }

    console.log("--- Middleware isAdmin passed ---");
    next();
  } catch (err) {
    console.error("isAdmin Middleware Error:", err);
    res.status(500).send({ message: "Server Error in isAdmin" });
  }
};
