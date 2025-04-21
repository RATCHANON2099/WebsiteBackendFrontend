// Controllers/auth.js
// ใช้เข้ารหัส
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const logger = require("../config/logger");
const db = require("../models");
const { User, RefreshToken } = db;

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    // เข้ารหัส Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(200).send("Registered Successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.login = async (req, res, next) => {
  // <<<--- เพิ่ม next สำหรับ error handling
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`); // <<<--- Log การพยายาม Login

    const user = await User.findOne({ where: { email } });
    // console.log(user); // <<<--- เอา console.log ออก หรือเปลี่ยนเป็น logger.debug

    if (!user) {
      logger.warn(`Login failed: User not found for email ${email}`);
      // ใช้ status 401 (Unauthorized) สำหรับ login failure จะเหมาะสมกว่า 404
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password for email ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // --- สร้าง Access Token (อายุสั้น) ---
    const accessTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      // ไม่ควรใส่ข้อมูล sensitive มากเกินไปใน Payload
    };
    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.JWT_ACCESS_SECRET, // <<<--- อ่าน Secret จาก .env
      { expiresIn: "10s" } // <<<--- ตั้งค่าอายุสั้น (เช่น 15 นาที)
    );

    // --- สร้าง Refresh Token (อายุยาว) ---
    const refreshTokenString = crypto.randomBytes(64).toString("hex");
    const refreshTokenExpiresMs = 7 * 24 * 60 * 60 * 1000; // อายุ 7 วัน (เป็น milliseconds)
    const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenExpiresMs);

    // --- บันทึก Refresh Token ลง DB ---
    // (Optional: ลบ Refresh Token เก่าของ User นี้ออกก่อน ถ้าต้องการให้มีแค่ 1 session ต่อ user)
    // await RefreshToken.destroy({ where: { userId: user.id } });

    await RefreshToken.create({
      token: refreshTokenString, // เก็บ token แบบ string สุ่ม
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    });
    logger.info(`Refresh token created for user ID: ${user.id}`);

    // --- ส่ง Token กลับไปให้ Client ---

    // 1. ส่ง Refresh Token เป็น HttpOnly Cookie
    res.cookie("refreshToken", refreshTokenString, {
      httpOnly: true, // ป้องกัน JavaScript อ่านค่า (ป้องกัน XSS)
      secure: process.env.NODE_ENV === "production", // ส่งเฉพาะ HTTPS ใน Production
      sameSite: "strict", // ป้องกัน CSRF (อาจจะใช้ 'lax' ถ้ามี cross-site request ที่จำเป็น)
      maxAge: refreshTokenExpiresMs, // กำหนดอายุ Cookie เป็น milliseconds ให้ตรงกับอายุ Token
      // path: '/api/auth' // (Optional) จำกัด path ที่ cookie จะถูกส่งไป
    });

    // 2. ส่ง Access Token และข้อมูล User (ที่ไม่ sensitive) ใน JSON Body
    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error("Login error:", err); // <<<--- ใช้ logger บันทึก Error
    // ส่ง Error ต่อไปให้ Middleware จัดการ (ที่อยู่ใน server.js)
    next(err); // <<<--- ใช้ next(err) แทน res.status(500)
  }
};

//โค้ดฟังก์ชั่นการ RefreshToken
// เพิ่มต่อท้ายไฟล์ Controllers/auth.js

exports.refreshToken = async (req, res, next) => {
  // 1. ดึง Refresh Token จาก HttpOnly Cookie
  const incomingRefreshToken = req.cookies.refreshToken; // <<< ต้องมี middleware 'cookie-parser'
  logger.debug(
    "Refresh token request received. Token from cookie:",
    incomingRefreshToken ? "present" : "missing"
  );

  if (!incomingRefreshToken) {
    logger.warn("Refresh token failed: No token provided in cookie.");
    // 401 Unauthorized เหมาะสมกว่า เพราะไม่มี credential (token) ส่งมา
    return res.status(401).json({ message: "Refresh token not found" });
  }

  try {
    // 2. ค้นหา Token ในฐานข้อมูล และดึงข้อมูล User ที่เกี่ยวข้องมาด้วย
    const storedToken = await RefreshToken.findOne({
      where: { token: incomingRefreshToken },
      include: {
        model: User,
        as: "user", // <<< ใช้ alias ที่กำหนดใน RefreshToken.associate
      },
    });

    // 3. ตรวจสอบว่าเจอ Token ใน DB หรือไม่
    if (!storedToken) {
      logger.warn(
        `Refresh token failed: Token not found in DB or invalid: ${incomingRefreshToken.substring(
          0,
          10
        )}...`
      );
      // 403 Forbidden เหมาะสมกว่า เพราะ Token ที่ส่งมาอาจเคยใช้ได้ หรือเป็น Token ปลอม
      // (Optional: อาจจะเคลียร์ Cookie ฝั่ง Client ด้วย ถ้าทำได้)
      // res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // 4. ตรวจสอบว่า Token หมดอายุหรือยัง
    if (new Date(storedToken.expiresAt) < new Date()) {
      logger.warn(
        `Refresh token failed: Token expired for user ID ${
          storedToken.userId
        }. Token: ${incomingRefreshToken.substring(0, 10)}...`
      );
      // ลบ Token ที่หมดอายุออกจาก DB
      await storedToken.destroy();
      // (Optional: เคลียร์ Cookie)
      // res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      return res.status(403).json({ message: "Refresh token expired" });
    }

    // 5. ถ้า Token hợp lệ (valid) และยังไม่หมดอายุ: สร้าง Access Token ใหม่
    const user = storedToken.user; // <<< เข้าถึงข้อมูล User ที่ include มา
    if (!user) {
      // กรณีนี้ไม่ควรเกิด ถ้า DB integrity ถูกต้อง แต่ดักไว้เผื่อ
      logger.error(
        `Refresh token error: User not found for valid token ID ${storedToken.id}`
      );
      await storedToken.destroy(); // อาจจะลบ token ที่มีปัญหาทิ้ง
      return res
        .status(403)
        .json({ message: "Invalid refresh token state: User not found" });
    }

    const newAccessTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const newAccessToken = jwt.sign(
      newAccessTokenPayload,
      process.env.JWT_ACCESS_SECRET, // <<< ใช้ Secret เดิมสำหรับ Access Token
      { expiresIn: "15m" } // <<< ตั้งอายุเท่าเดิม หรือตามต้องการ
    );

    logger.info(`Access token refreshed successfully for user ID: ${user.id}`);

    // --- (Optional but Recommended: Rolling Refresh Tokens) ---
    // เพื่อความปลอดภัยยิ่งขึ้น เราสามารถสร้าง Refresh Token ใหม่ทุกครั้งที่ทำการรีเฟรช
    // และอัปเดตใน DB และ Cookie ทำให้ Token เก่าใช้ไม่ได้อีก
    /*
    const newRefreshTokenString = crypto.randomBytes(64).toString("hex");
    const newRefreshTokenExpiresMs = 7 * 24 * 60 * 60 * 1000; // 7 วันเท่าเดิม
    const newRefreshTokenExpiresAt = new Date(Date.now() + newRefreshTokenExpiresMs);

    // อัปเดต Token ใน DB
    storedToken.token = newRefreshTokenString;
    storedToken.expiresAt = newRefreshTokenExpiresAt;
    await storedToken.save();
    logger.info(`Rolled refresh token for user ID: ${user.id}`);

    // ส่ง Refresh Token ใหม่กลับไปใน Cookie
    res.cookie("refreshToken", newRefreshTokenString, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: newRefreshTokenExpiresMs,
    });
    */
    // --- End Optional Rolling Refresh Tokens ---

    // 6. ส่ง Access Token ใหม่กลับไปให้ Client
    res.json({
      accessToken: newAccessToken,
      // ไม่ต้องส่งข้อมูล user ซ้ำก็ได้ เพราะ Client ควรจะมีอยู่แล้วจากการ Login ครั้งแรก
      // หรือจะส่งเฉพาะข้อมูลที่อาจมีการเปลี่ยนแปลงก็ได้ (ถ้ามี)
    });
  } catch (err) {
    logger.error("Refresh token error:", err);
    next(err); // ส่งต่อให้ Error Handler กลาง
  }
};
