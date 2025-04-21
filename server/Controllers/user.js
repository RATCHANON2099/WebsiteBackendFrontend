// controllers/user.js
const logger = require("../config/logger");
const { User } = require("../models"); // <<<--- แก้ไข path การ import ให้ตรงกับโครงสร้าง models/index.js

exports.read = async (req, res, next) => {
  // <<<--- เพิ่ม next
  const userId = req.params.id;
  logger.info(`Read user request received for ID: ${userId}`);
  try {
    logger.info(`Fetching user with ID: ${userId}`);
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      logger.warn(`User not found with ID: ${userId}`);
      return res.status(404).json({ message: "User not found." });
    }
    logger.info(`Successfully fetched user with ID: ${userId}`);
    res.json(user);
  } catch (err) {
    logger.error(`Error fetching user with ID ${userId}:`, err); // <<<--- เปลี่ยน console.log เป็น logger.error
    next(err); // <<<--- เปลี่ยน res.status(500) เป็น next(err)
  }
};

exports.list = async (req, res, next) => {
  // <<<--- เพิ่ม next
  logger.info("List users request received.");
  try {
    logger.info("Fetching all users.");
    const users = await User.findAll();
    logger.info(`Successfully fetched ${users.length} users.`);
    res.json(users);
  } catch (err) {
    logger.error("Error fetching all users:", err); // <<<--- เปลี่ยน console.log เป็น logger.error
    next(err); // <<<--- เปลี่ยน res.status(500) เป็น next(err)
  }
};

exports.create = async (req, res, next) => {
  // <<<--- เพิ่ม next
  logger.info("Create user request received.");
  try {
    logger.info("Attempting to create new user.");
    // Note: ควรมีการ validate req.body และอาจจะต้อง hash password ถ้าสร้าง user ผ่าน route นี้
    const user = await User.create(req.body);
    logger.info(`Successfully created user with ID: ${user.id}`);
    res.status(201).json(user); // <<<--- ใช้ 201 Created จะเหมาะสมกว่า
  } catch (err) {
    logger.error("Error creating user:", err); // <<<--- เปลี่ยน console.log เป็น logger.error
    next(err); // <<<--- เปลี่ยน res.status(500) เป็น next(err)
  }
};

exports.update = async (req, res, next) => {
  // <<<--- เพิ่ม next
  const userId = req.params.id;
  logger.info(`Update user request received for ID: ${userId}`);
  try {
    logger.info(`Attempting to update user with ID: ${userId}`);
    // Note: ควรมีการ validate req.body
    // User.update returns an array [numberOfAffectedRows] for Sequelize
    const [numberOfAffectedRows] = await User.update(req.body, {
      where: {
        id: userId,
      },
      // returning: true, // For PostgreSQL to return updated rows, not standard for MySQL/MariaDB
    });

    if (numberOfAffectedRows === 0) {
      logger.warn(
        `Update user failed: User not found or no changes for ID: ${userId}`
      );
      return res
        .status(404)
        .json({ message: "User not found or no data changed." });
    }

    logger.info(
      `Successfully updated user with ID: ${userId}. Rows affected: ${numberOfAffectedRows}`
    );
    // Fetch the updated user data to return it, as User.update doesn't return the object by default in all DBs
    const updatedUser = await User.findByPk(userId);
    res.json(updatedUser);
  } catch (err) {
    logger.error(`Error updating user with ID ${userId}:`, err); // <<<--- เปลี่ยน console.log เป็น logger.error
    next(err); // <<<--- เปลี่ยน res.status(500) เป็น next(err)
  }
};

exports.remove = async (req, res, next) => {
  // <<<--- เพิ่ม next
  const userId = req.params.id;
  logger.info(`Remove user request received for ID: ${userId}`);
  try {
    logger.info(`Attempting to delete user with ID: ${userId}`);
    // User.destroy returns the number of destroyed rows
    const numberOfDestroyedRows = await User.destroy({
      where: {
        id: userId,
      },
    });

    if (numberOfDestroyedRows === 0) {
      logger.warn(`Delete user failed: User not found with ID: ${userId}`);
      return res.status(404).json({ message: "User not found." });
    }

    logger.info(
      `Successfully deleted user with ID: ${userId}. Rows affected: ${numberOfDestroyedRows}`
    );
    res.status(200).json({ message: "User deleted successfully." }); // <<<--- ส่งข้อความยืนยันจะดีกว่าส่งแค่จำนวนแถว
  } catch (err) {
    logger.error(`Error deleting user with ID ${userId}:`, err); // <<<--- เปลี่ยน console.log เป็น logger.error
    next(err); // <<<--- เปลี่ยน res.status(500) เป็น next(err)
  }
};

exports.updateMyInfo = async (req, res, next) => {
  // <<<--- เพิ่ม next
  const userId = req.user?.id; // ดึง id จาก token (auth middleware)
  logger.info(`UpdateMyInfo request received for user ID: ${userId}`);

  if (!userId) {
    logger.warn("UpdateMyInfo failed: User ID not found in request token.");
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const { name, age, phone } = req.body; // ไม่ควรอัปเดต ID ผ่าน route นี้
    logger.info(`Fetching user with ID: ${userId} for self-update.`);

    // ค้นหาผู้ใช้โดยใช้ id ที่ได้จาก token
    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn(`UpdateMyInfo failed: User not found with ID: ${userId}`);
      return res.status(404).send("User not found");
    }

    // อัพเดตข้อมูล
    logger.info(`Attempting to update info for user ID: ${userId}`);
    user.name = name !== undefined ? name : user.name; // หากไม่ได้รับค่า name ใหม่ ใช้ค่าเดิม
    user.age = age !== undefined ? age : user.age; // หากไม่ได้รับค่า age ใหม่ ใช้ค่าเดิม
    user.phone = phone !== undefined ? phone : user.phone; // หากไม่ได้รับค่า phone ใหม่ ใช้ค่าเดิม
    // ไม่ควรอัปเดต user.id ที่นี่

    await user.save(); // บันทึกข้อมูลที่อัพเดต
    logger.info(`Successfully updated info for user ID: ${userId}`);

    res.status(200).json({
      message: "User info updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        phone: user.phone,
        role: user.role,
      },
    }); // <<<--- ส่งข้อมูลที่อัปเดตกลับไปบางส่วน
  } catch (err) {
    logger.error(`Error updating info for user ID ${userId}:`, err); // <<<--- เปลี่ยน console.log เป็น logger.error
    next(err); // <<<--- เปลี่ยน res.status(500) เป็น next(err)
  }
};
