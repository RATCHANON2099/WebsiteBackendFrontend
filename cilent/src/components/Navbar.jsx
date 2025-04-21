// src/components/Navbar.jsx
import React from "react";
// *** 1. Import message จาก antd (ถ้าต้องการแสดงข้อความ) ***
import { Menu, message } from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { DownOutlined } from "@ant-design/icons";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname;
  const { SubMenu } = Menu;

  // ดึงข้อมูล user จาก localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name?.trim() || "USER";

  // *** 2. สร้างฟังก์ชัน handleLogout ***
  const handleLogout = () => {
    console.log("Logging out...");
    // ลบ token และ user ออกจาก localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    // แสดงข้อความ (Optional)
    message.success("ออกจากระบบสำเร็จ");
    // พาผู้ใช้กลับไปหน้า Login
    navigate("/login");
    // อาจจะ reload หน้าเพื่อให้ state อื่นๆ reset (ถ้าจำเป็น)
    // window.location.reload();
  };

  // *** 3. ฟังก์ชันจัดการการคลิกเมนูหลัก (แยกส่วน Logout ออก) ***
  const handleMenuClick = (e) => {
    // ถ้า key ไม่ใช่ 'logout' ให้ navigate ตามปกติ
    if (e.key !== "logout") {
      navigate(e.key);
    }
    // ถ้า key เป็น 'logout' จะถูกจัดการโดย onClick ของ Menu.Item เอง
  };

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#001529",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
      }}
    >
      <div>
        <Link to="/">
          <img
            src={logo}
            alt="Logo"
            style={{
              height: "60px",
              maxWidth: "auto",
              objectFit: "contain",
              marginTop: "5px",
              marginLeft: "1px",
              marginBottom: "5px",
            }}
          />
        </Link>
      </div>
      <Menu
        mode="horizontal"
        selectedKeys={[selectedKey]}
        // *** 4. ใช้ handleMenuClick แทน navigate โดยตรง ***
        onClick={handleMenuClick}
        theme="dark"
        style={{
          backgroundColor: "transparent",
          borderBottom: "none",
          display: "flex",
          justifyContent: "flex-end",
          flexGrow: 1,
        }}
      >
        <Menu.Item key="/">Home</Menu.Item>

        {/* SUBMENU */}
        <SubMenu
          key="submenu"
          title={
            <span>
              {userName} <DownOutlined />
            </span>
          }
        >
          <Menu.Item key="/datauser">Data</Menu.Item>
          {/* *** 5. แก้ไข Menu.Item ของ Logout *** */}
          <Menu.Item key="logout" onClick={handleLogout}>
            {" "}
            {/* เปลี่ยน key และเพิ่ม onClick */}
            Logout
          </Menu.Item>
        </SubMenu>
      </Menu>
    </div>
  );
};

export default Navbar;
