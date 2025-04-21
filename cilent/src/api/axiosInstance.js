// src/api/axiosInstance.js
import axios from "axios";

// สร้าง Instance ของ Axios
const axiosInstance = axios.create({
  // ทำให้เวลาเรียก API ไม่ต้องพิมพ์ URL เต็มทุกครั้ง
  baseURL: import.meta.env.VITE_API_URL,

  // ตั้งค่า Timeout (Optional) หน่วยเป็น milliseconds
  // timeout: 10000, // 10 วินาที

  // *** สำคัญมาก: ตั้งค่าให้ Axios ส่ง Cookies ไปกับ Request ด้วย ***
  // เพื่อให้ Backend (/api/refresh) ได้รับ refreshToken Cookie
  withCredentials: true,
});

// ทำให้ Requet Interceptor ทำงานก่อนที่ Request จะถูกส่งออกไป
axiosInstance.interceptors.request.use(
  (config) => {
    // อ่าน accessToken จาก localStorage
    const accessToken = localStorage.getItem("accessToken");

    // ถ้ามี accessToken และ Request ไม่ใช่การเรียก /login หรือ /refresh
    // (เราไม่ต้องการส่ง Token ไปยัง Endpoint เหล่านี้)
    // *** ปรับเงื่อนไข URL ตาม Endpoint จริงของคุณ ***
    const isAuthEndpoint =
      config.url.endsWith("/login") || config.url.endsWith("/refresh");

    if (accessToken && !isAuthEndpoint) {
      // เพิ่ม Header Authorization เข้าไปใน Request config
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      console.log(
        "[Request Interceptor] Added Authorization header to:",
        config.url
      ); // Log เพื่อ Debug
    } else {
      console.log("[Request Interceptor] No token added for:", config.url); // Log เพื่อ Debug
    }

    // คืนค่า config ที่แก้ไขแล้วเพื่อให้ Request ดำเนินการต่อ
    return config;
  },
  (error) => {
    // จัดการ Error ที่เกิดขึ้นก่อนส่ง Request (เช่น Network error)
    console.error("[Request Interceptor] Error:", error);
    return Promise.reject(error);
  }
);

// Export ตัว Instance นี้ออกไปเพื่อให้ไฟล์อื่นเรียกใช้ได้
export default axiosInstance;
