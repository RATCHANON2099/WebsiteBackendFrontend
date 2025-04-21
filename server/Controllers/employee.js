// Controllers/employee.js
const logger = require("../config/logger");
const { Employee } = require("../models");

exports.GetAllEmployee = async (req, res, next) => {
  // *** เพิ่ม Log เพื่อดู req.user ที่ Middleware ส่งมา ***
  logger.info("GetAllEmployee request received.");
  logger.debug("GetAllEmployee - req.user value:", req.user); // <--- Log สำคัญ! ดูว่ามี { id: ..., email: ..., role: 'admin' } หรือไม่

  try {
    // การตรวจสอบสิทธิ์
    // ใช้ Optional Chaining (?.) เพื่อป้องกัน Error ถ้า req.user ไม่มีอยู่
    if (!req.user || req.user.role !== "admin") {
      // ตรวจสอบค่า 'admin' ให้ตรง (ตัวพิมพ์เล็ก)
      logger.warn(
        `GetAllEmployee - Access Denied. User ID: ${req.user?.id}, Role: ${req.user?.role}`
      ); // Log ค่าที่ทำให้เข้าเงื่อนไขนี้
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required." });
    }

    // ถ้าเป็น Admin, ดำเนินการดึงข้อมูลทั้งหมด
    logger.info(
      "GetAllEmployee - Admin access granted. Fetching all employees."
    );
    const employees = await Employee.findAll(); // ดึงข้อมูลทั้งหมดจากตาราง Employee
    logger.info(
      `GetAllEmployee - Successfully fetched ${employees.length} employees.`
    );
    res.json(employees); // ส่งข้อมูลทั้งหมดกลับไปเป็น JSON array
  } catch (err) {
    logger.error("GetAllEmployee - Error fetching all employees:", err);
    next(err); // ตอบกลับเป็นข้อผิดพลาดของเซิร์ฟเวอร์
  }
};

//ใช้สำหรับหา Data ที่มี userId ตรงกับ id ผู้ใช้
//ใช้ตรวจสอบค้นหา Data ใน Table employees ว่า Data อันไหนมี userId ตรงกับ id ที่ล็อคอินอยู่
//findAll หาข้อมูลทั้งหมดในตาราง โดยสามารถกำหนดเงื่อนไขได้
exports.FindDataEmployeeByUserId = async (req, res, next) => {
  // <<<--- เพิ่ม next

  logger.info(
    `FindDataEmployeeByUserId request received for user ID: ${req.user?.id}`
  );

  try {
    if (!req.user || !req.user.id) {
      logger.warn(
        "FindDataEmployeeByUserId - Authentication required but user ID not found in request."
      );
      return res.status(401).json({ message: "Authentication required." });
    }

    logger.debug(
      `FindDataEmployeeByUserId - User ID from token: ${
        req.user.id
      }, Type: ${typeof req.user.id}`
    );

    const employees = await Employee.findAll({
      where: { userId: req.user.id },
    });
    logger.info(
      `FindDataEmployeeByUserId - Successfully fetched ${employees.length} employee records for user ID: ${req.user.id}`
    );

    res.json(employees); // คืนค่า Object เดียว
  } catch (err) {
    logger.error(
      `FindDataEmployeeByUserId - Error fetching employee data for user ID ${req.user?.id}:`,
      err
    );
    next(err); // <<<--- เปลี่ยนเป็น next(err)
  }
};

// สำหรับเพิ่มข้อมูลใน Table employees โดยมีการผูกให้ userId ตรงกับ id ของผู้ที่กรอกข้อมูล
exports.AddEmployee = async (req, res, next) => {
  // <<<--- เพิ่ม next
  logger.info(`AddEmployee request received from user ID: ${req.user?.id}`);
  try {
    if (!req.user || !req.user.id) {
      logger.warn(
        "AddEmployee - Authentication required but user ID not found in request."
      );
      return res.status(401).json({ message: "Authentication required." });
    }

    logger.info(
      `AddEmployee - Attempting to add employee for user ID: ${req.user.id}`
    );

    const newEmployee = await Employee.create({
      ...req.body,
      userId: req.user.id, // *** ผูกกับ User ที่ Login *** หรือก็คือ userId นี้จะมีค่าเท่ากับ id ของ user เพื่อรู้ได้ว่าใครเป็นคนกรอกข้อมูล
    });
    logger.info(
      `AddEmployee - Successfully added employee with ID: ${newEmployee.id} for user ID: ${req.user.id}`
    );
    res.status(201).json(newEmployee);
  } catch (err) {
    logger.error(
      `AddEmployee - Error adding employee for user ID ${req.user?.id}:`,
      err
    );
    next(err); // <<<--- เปลี่ยนเป็น next(err)
  }
};

//สำหรับ Edit ข้อมูล
//หาข้อมูลของ employee ใน table จาก id ที่รับเข้ามาจากหน้าบ้าน แล้วเอามาเก็บไว้ในตัวแปร employee
//ซึ่งในตาราง employee id ไม่ซ้ำกันอยู่แล้ว ก็จะได้มาแค่ข้อมูลแถวเดียวในตาราง
//เวลาใช้ก็ต้องรับ id มาเพื่อใช้ค้นหา
//findByPk ต้องรับมาโดยตรงเพื่อตรวจสอบเพราะใส่เงื่อนไขไม่ได้
exports.GetDataEmployeeById = async (req, res, next) => {
  // <<<--- เพิ่ม next
  const employeeId = req.params.id;
  logger.info(
    `GetDataEmployeeById request received for employee ID: ${employeeId}`
  );
  try {
    logger.info(
      `GetDataEmployeeById - Fetching employee with ID: ${employeeId}`
    );
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
      logger.warn(
        `GetDataEmployeeById - Employee not found with ID: ${employeeId}`
      );
      //ถ้าไม่ใช่ employee
      return res.status(404).json({ message: "Employee not found." });
    }

    logger.info(
      `GetDataEmployeeById - Successfully fetched employee with ID: ${employeeId}`
    );
    res.json(employee); // *** คืนค่า Object เดียว ***
  } catch (err) {
    logger.error(
      `GetDataEmployeeById - Error fetching employee by ID ${employeeId}:`,
      err
    ); // <<<--- เปลี่ยน console.error เป็น logger.error
    // จัดการ error กรณี ID format ผิด
    if (err.name === "SequelizeDatabaseError" || err.name === "CastError") {
      logger.warn(
        `GetDataEmployeeById - Invalid Employee ID format: ${employeeId}`
      );
      // ตัวอย่างสำหรับ Sequelize/Mongoose
      return res.status(400).json({ message: "Invalid Employee ID format." });
    }
    next(err); // <<<--- เปลี่ยนเป็น next(err)
  }
};

// ใช้บันทึกข้อมูลใหม่ลงในตาราง
exports.UpdateEmployee = async (req, res, next) => {
  // <<<--- เพิ่ม next
  const { id } = req.params;
  logger.info(`UpdateEmployee request received for employee ID: ${id}`);
  try {
    logger.info(
      `UpdateEmployee - Fetching employee with ID: ${id} for update.`
    );
    const employee = await Employee.findByPk(id);

    if (!employee) {
      logger.warn(`UpdateEmployee - Employee not found with ID: ${id}`);
      return res.status(404).send("Employee not found");
    }

    // *** รับค่าให้ตรงกับ Frontend ***
    const { name, email, age, phone_number, id_number } = req.body;
    logger.info(
      `UpdateEmployee - Attempting to update employee with ID: ${id}`
    );

    employee.email = email !== undefined ? email : employee.email; // อัปเดตถ้ามีค่าส่งมา
    employee.name = name !== undefined ? name : employee.name;
    employee.age = age !== undefined ? age : employee.age;
    employee.phone_number =
      phone_number !== undefined ? phone_number : employee.phone_number;
    employee.id_number =
      id_number !== undefined ? id_number : employee.id_number;

    await employee.save(); // บันทึกข้อมูลลงใน employee
    logger.info(
      `UpdateEmployee - Successfully updated employee with ID: ${id}`
    );
    res.status(200).json(employee);
  } catch (err) {
    logger.error(
      `UpdateEmployee - Error updating employee with ID ${id}:`,
      err
    ); // <<<--- เปลี่ยน console.error เป็น logger.error
    next(err); // <<<--- เปลี่ยนเป็น next(err)
  }
};

// --- Controller deleteEmployee (เพิ่มการเช็คสิทธิ์) ---
exports.DeleteEmployee = async (req, res, next) => {
  // <<<--- เพิ่ม next
  const { id } = req.params;
  logger.info(`DeleteEmployee request received for employee ID: ${id}`);
  try {
    logger.info(
      `DeleteEmployee - Fetching employee with ID: ${id} for deletion.`
    );
    const employee = await Employee.findByPk(id);

    if (!employee) {
      logger.warn(`DeleteEmployee - Employee not found with ID: ${id}`);
      return res.status(404).send("Employee not found");
    }

    logger.info(
      `DeleteEmployee - Attempting to delete employee with ID: ${id}`
    );
    await employee.destroy();
    logger.info(
      `DeleteEmployee - Successfully deleted employee with ID: ${id}`
    );
    res.status(200).send("Employee deleted successfully");
  } catch (err) {
    logger.error(
      `DeleteEmployee - Error deleting employee with ID ${id}:`,
      err
    ); // <<<--- เปลี่ยน console.error เป็น logger.error
    next(err); // <<<--- เปลี่ยนเป็น next(err)
  }
};
