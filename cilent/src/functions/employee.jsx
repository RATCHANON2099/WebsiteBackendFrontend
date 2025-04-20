import axios from "axios";

// ดึงค่า API URL จาก environment variable
const API_URL = import.meta.env.VITE_API_URL;

// ใช้ดึงข้อมูลทั้งหมดของ Employee
export const GetAllMyEmployees = async (token) => {
  // ควรส่ง token ไปด้วยถ้า endpoint ต้องการ
  return await axios.get(`${API_URL}/employee/all`, {
    // เปลี่ยน API เป็น API_URL
    headers: {
      Authorization: `Bearer ${token}`, // เพิ่ม header ถ้าจำเป็น
    },
  });
};

// ใช้ดึงข้อมูลทั้งหมดของ Employee ที่ userId ตรงกับ id ผู้ล็อคอิน
export const FindDataEmployeeByUserId = async (token) => {
  // ควรส่ง token ไปด้วยถ้า endpoint ต้องการ
  return await axios.get(`${API_URL}/employee`, {
    // เปลี่ยน API เป็น API_URL
    headers: {
      Authorization: `Bearer ${token}`, // เพิ่ม header ถ้าจำเป็น
    },
  });
};

// ใช้เพิ่มข้อมูล Employee ที่กรอกลงในฟอร์ม (อันนี้ถูกต้องอยู่แล้ว)
export const AddEmployee = async (data, token) => {
  console.log("Data being sent:", data);
  return await axios.post(`${API_URL}/employee/`, data, {
    // ใช้ API_URL (เดิมถูกต้องแล้ว)
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const GetDataEmployeeById = async (id, token) => {
  return await axios.get(`${API_URL}/employee/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ใช้แก้ไขข้อมูล Employee ที่กรอกลงในฟอร์ม
export const UpdateEmployee = async (id, data, token) => {
  return await axios.put(`${API_URL}/employee/${id}`, data, {
    // เปลี่ยน API เป็น API_URL
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ใช้ลบข้อมูล Employee ที่กรอกลงในฟอร์ม
export const DeleteEmployee = async (id, token) => {
  return await axios.delete(`${API_URL}/employee/${id}`, {
    // เปลี่ยน API เป็น API_URL
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
