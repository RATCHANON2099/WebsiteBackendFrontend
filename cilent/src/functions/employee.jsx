import axiosInstance from "../api/axiosInstance";

// ใช้ดึงข้อมูลทั้งหมดของ Employee
export const GetAllMyEmployees = async () => {
  // ควรส่ง token ไปด้วยถ้า endpoint ต้องการ
  return await axiosInstance.get(`/employee/all`);
};

// ใช้ดึงข้อมูลทั้งหมดของ Employee ที่ userId ตรงกับ id ผู้ล็อคอิน
export const FindDataEmployeeByUserId = async () => {
  // ควรส่ง token ไปด้วยถ้า endpoint ต้องการ
  return await axiosInstance.get(`/employee`);
};

// ใช้เพิ่มข้อมูล Employee ที่กรอกลงในฟอร์ม (อันนี้ถูกต้องอยู่แล้ว)
export const AddEmployee = async (data) => {
  console.log("Data being sent:", data);
  return await axiosInstance.post(`/employee/`, data);
};

export const GetDataEmployeeById = async (id) => {
  return await axiosInstance.get(`/employee/${id}`);
};

// ใช้แก้ไขข้อมูล Employee ที่กรอกลงในฟอร์ม
export const UpdateEmployee = async (id, data) => {
  return await axiosInstance.put(`/employee/${id}`, data);
};

// ใช้ลบข้อมูล Employee ที่กรอกลงในฟอร์ม
export const DeleteEmployee = async (id) => {
  return await axiosInstance.delete(`/employee/${id}`);
};
