// src/components/Navbar.jsx
import React from "react";
// *** 1. Import Layout และ message จาก antd ***
import { Layout, Menu, message, Space, Typography } from "antd"; // เพิ่ม Layout, Space, Typography
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  DownOutlined,
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  DatabaseOutlined,
} from "@ant-design/icons"; // เพิ่ม Icons อื่นๆ (ถ้าต้องการ)
import logo from "../assets/logo.png"; // ตรวจสอบว่า path logo ถูกต้อง

// ดึง Header จาก Layout
const { Header } = Layout;
// ดึง Text จาก Typography (ถ้าต้องการใช้)
const { Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname;

  // ดึงข้อมูล user จาก localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  // ให้ค่า default ที่ชัดเจนขึ้นถ้า user ไม่มี หรือไม่มี name
  const userName = user?.name?.trim() || "Guest";

  // ฟังก์ชัน Logout (เหมือนเดิม)
  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("accessToken"); // ตรวจสอบ key ของ token ให้ถูกต้อง
    localStorage.removeItem("user");
    message.success("ออกจากระบบสำเร็จ");
    navigate("/login");
    // window.location.reload(); // ไม่แนะนำถ้าไม่จำเป็นจริงๆ
  };

  // *** 2. สร้างโครงสร้าง items สำหรับ Menu v5 ***
  const menuItems = [
    {
      key: "/",
      // ใช้ Link ภายใน label เพื่อให้ SPA navigation ทำงานถูกต้อง
      label: <Link to="/">Home</Link>,
      icon: <HomeOutlined />, // (Optional) เพิ่ม icon
    },
    {
      // ใช้ key ที่ไม่ซ้ำซ้อนและสื่อความหมาย (ไม่ใช่ path)
      key: "userSubMenu",
      // แสดงชื่อผู้ใช้ใน label ของ Submenu
      label: (
        <Space>
          {/* <UserOutlined /> */} {/* (Optional) icon user */}
          {userName}
          <DownOutlined />
        </Space>
      ),
      // children คือ รายการใน Submenu
      children: [
        {
          key: "/datauser",
          label: <Link to="/datauser">Data</Link>,
          icon: <DatabaseOutlined />, // (Optional) icon data
        },
        {
          // ใช้ key ที่สื่อถึง action
          key: "logout",
          label: "Logout",
          icon: <LogoutOutlined />, // (Optional) icon logout
          // เราจะจัดการ onClick ใน handleMenuClick ด้านล่าง
          // หรือจะใส่ onClick ที่นี่ก็ได้ แต่จัดการที่เดียวง่ายกว่า
          // onClick: handleLogout, // ถ้าใส่ตรงนี้ handleMenuClick ไม่ต้องเช็ค 'logout'
        },
      ],
    },
  ];

  // *** 3. ฟังก์ชันจัดการการคลิกเมนู (ปรับปรุงสำหรับ v5) ***
  const handleMenuClick = (e) => {
    // e คือ object ที่มี key, keyPath, domEvent
    console.log("Menu clicked:", e.key);
    if (e.key === "logout") {
      handleLogout();
    } else if (e.key && e.key.startsWith("/")) {
      // ถ้า key เป็น path (ขึ้นต้นด้วย /) ให้ navigate
      navigate(e.key);
    }
    // ไม่ต้องทำอะไรสำหรับ key อื่นๆ เช่น 'userSubMenu'
  };

  // *** 4. ใช้ Layout.Header และปรับโครงสร้าง ***
  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px", // ปรับ padding ตามต้องการ
        backgroundColor: "#001529", // สีพื้นหลังของ Header
        position: "fixed", // ทำให้ Navbar อยู่กับที่ด้านบน
        zIndex: 1, // ให้ Navbar อยู่เหนือ Content
        width: "100%", // ทำให้ Header กว้างเต็มจอ
        // ไม่ต้องกำหนด height ถ้า content กำหนดความสูงได้เอง
      }}
    >
      {/* ส่วน Logo */}
      <div className="logo" style={{ display: "flex", alignItems: "center" }}>
        <Link to="/">
          <img
            src={logo}
            alt="Logo"
            style={{
              height: "40px", // ปรับขนาด logo ตามต้องการ
              // maxWidth: "auto", // ไม่จำเป็นถ้า height กำหนดแล้ว
              // objectFit: "contain", // ไม่จำเป็นถ้า height กำหนดแล้ว
              // marginTop: "5px", // ใช้ align-items ของ flex แทน
              // marginLeft: "1px",
              // marginBottom: "5px",
            }}
          />
          {/* อาจจะเพิ่มชื่อแอปข้างๆ logo */}
          {/* <Text style={{ color: 'white', marginLeft: '10px', fontSize: '1.2rem' }}>MyApp</Text> */}
        </Link>
      </div>

      {/* ส่วน Menu */}
      <Menu
        theme="dark"
        mode="horizontal"
        // selectedKeys บอกว่าเมนูไหน active (ใช้ path ปัจจุบัน)
        selectedKeys={[selectedKey]}
        // ใช้ prop items แทนการเขียน Menu.Item/SubMenu โดยตรง
        items={menuItems}
        // onClick จัดการการคลิกเมนู
        onClick={handleMenuClick}
        // ทำให้ Menu ชิดขวา (อาจจะไม่ต้องใช้ flexGrow ถ้า Header จัดการ layout แล้ว)
        style={{
          lineHeight: "64px", // ทำให้ item สูงเท่า Header (ถ้า Header สูง 64px)
          backgroundColor: "transparent", // ทำให้พื้นหลัง Menu โปร่งใส (ใช้สี Header)
          borderBottom: "none", // เอาเส้นใต้ Menu ออก
          flex: 1, // ให้ Menu ขยายเต็มพื้นที่ที่เหลือ
          minWidth: 0, // ป้องกันการบีบตัวของ Menu ในจอเล็ก (สำคัญ!)
          display: "flex", // จัดเรียง items แนวนอน
          justifyContent: "flex-end", // ดัน items ไปทางขวา
        }}
        // overflowedIndicator={<MenuOutlined />} // (Optional) แสดง icon เมื่อเมนูถูกย่อในจอเล็ก
      />
    </Header>
  );
};

export default Navbar;
