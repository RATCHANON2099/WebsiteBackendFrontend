// Controllers/employee.js
//notdone
const { Employee } = require("../models/employee");

//ใช้สำหรับหา Data ที่มี userId ตรงกับ id ผู้ใช้
//ใช้ตรวจสอบค้นหา Data ใน Table employees ว่า Data อันไหนมี userId ตรงกับ id ที่ล็อคอินอยู่
//findAll หาข้อมูลทั้งหมดในตาราง โดยสามารถกำหนดเงื่อนไขได้
exports.FindDataEmployeeByUserId = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    console.log("--- FindDataEmployeeByUserId ---");
    console.log("User ID from token (req.user.id):", req.user.id);
    console.log("Type of req.user.id:", typeof req.user.id); // ดูชนิดข้อมูลด้วย

    const employees = await Employee.findAll({
      where: { userId: req.user.id },
    });

    res.json(employees); // คืนค่า Object เดียว
  } catch (err) {
    console.error("Error fetching employee data for current user:", err);
    res.status(500).send("Server Error");
  }
};

// สำหรับเพิ่มข้อมูลใน Table employees โดยมีการผูกให้ userId ตรงกับ id ของผู้ที่กรอกข้อมูล
exports.AddEmployee = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const newEmployee = await Employee.create({
      ...req.body,
      userId: req.user.id, // *** ผูกกับ User ที่ Login *** หรือก็คือ userId นี้จะมีค่าเท่ากับ id ของ user เพื่อรู้ได้ว่าใครเป็นคนกรอกข้อมูล
    });

    res.status(201).json(newEmployee);
  } catch (err) {
    console.error("Error adding employee:", err);
    res.status(500).send("Server Error");
  }
};

//สำหรับ Edit ข้อมูล
//หาข้อมูลของ employee ใน table จาก id ที่รับเข้ามาจากหน้าบ้าน แล้วเอามาเก็บไว้ในตัวแปร employee
//ซึ่งในตาราง employee id ไม่ซ้ำกันอยู่แล้ว ก็จะได้มาแค่ข้อมูลแถวเดียวในตาราง
//เวลาใช้ก็ต้องรับ id มาเพื่อใช้ค้นหา
//findByPk ต้องรับมาโดยตรงเพื่อตรวจสอบเพราะใส่เงื่อนไขไม่ได้
exports.GetDataEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      //ถ้าไม่ใช่ employee
      return res.status(404).json({ message: "Employee not found." });
    }

    res.json(employee); // *** คืนค่า Object เดียว ***
  } catch (err) {
    console.error("Error fetching employee by ID:", err);
    // จัดการ error กรณี ID format ผิด
    if (err.name === "SequelizeDatabaseError" || err.name === "CastError") {
      // ตัวอย่างสำหรับ Sequelize/Mongoose
      return res.status(400).json({ message: "Invalid Employee ID format." });
    }
    res.status(500).send("Server Error");
  }
};

// ใช้บันทึกข้อมูลใหม่ลงในตาราง
exports.UpdateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).send("Employee not found");
    }

    // *** รับค่าให้ตรงกับ Frontend ***
    const { name, email, age, phone_number, id_number } = req.body;

    employee.email = email !== undefined ? email : employee.email; // อัปเดตถ้ามีค่าส่งมา
    employee.name = name !== undefined ? name : employee.name;
    employee.age = age !== undefined ? age : employee.age;
    employee.phone_number =
      phone_number !== undefined ? phone_number : employee.phone_number;
    employee.id_number =
      id_number !== undefined ? id_number : employee.id_number;
    await employee.save(); // บันทึกข้อมูลลงใน employee
    res.status(200).json(employee);
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).send("Server Error");
  }
};

// --- Controller deleteEmployee (เพิ่มการเช็คสิทธิ์) ---
exports.DeleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).send("Employee not found");
    }

    await employee.destroy();
    res.status(200).send("Employee deleted successfully");
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).send("Server Error");
  }
};
