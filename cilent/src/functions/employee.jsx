import axiosInstance from "../api/axiosInstance";

// ดึงค่า API URL จาก environment variable
const API_URL = import.meta.env.VITE_API_URL;

// ใช้ดึงข้อมูลทั้งหมดของ Employee
export const GetAllMyEmployees = async (accessToken) => {
  // ควรส่ง token ไปด้วยถ้า endpoint ต้องการ
  return await axiosInstance.get(`/employee/all`, {
    // เปลี่ยน API เป็น API_URL
    headers: {
      Authorization: `Bearer ${accessToken}`, // เพิ่ม header ถ้าจำเป็น
    },
  });
};

// ใช้ดึงข้อมูลทั้งหมดของ Employee ที่ userId ตรงกับ id ผู้ล็อคอิน
export const FindDataEmployeeByUserId = async (accessToken) => {
  // ควรส่ง token ไปด้วยถ้า endpoint ต้องการ
  return await axiosInstance.get(`/employee`, {
    // เปลี่ยน API เป็น API_URL
    headers: {
      Authorization: `Bearer ${accessToken}`, // เพิ่ม header ถ้าจำเป็น
    },
  });
};

// ใช้เพิ่มข้อมูล Employee ที่กรอกลงในฟอร์ม (อันนี้ถูกต้องอยู่แล้ว)
export const AddEmployee = async (data, accessToken) => {
  console.log("Data being sent:", data);
  return await axiosInstance.post(`/employee/`, data, {
    // ใช้ API_URL (เดิมถูกต้องแล้ว)
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const GetDataEmployeeById = async (id, accessToken) => {
  return await axiosInstance.get(`/employee/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

// ใช้แก้ไขข้อมูล Employee ที่กรอกลงในฟอร์ม
export const UpdateEmployee = async (id, data, accessToken) => {
  return await axiosInstance.put(`/employee/${id}`, data, {
    // เปลี่ยน API เป็น API_URL
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

// ใช้ลบข้อมูล Employee ที่กรอกลงในฟอร์ม
export const DeleteEmployee = async (id, accessToken) => {
  return await axiosInstance.delete(`/employee/${id}`, {
    // เปลี่ยน API เป็น API_URL
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
