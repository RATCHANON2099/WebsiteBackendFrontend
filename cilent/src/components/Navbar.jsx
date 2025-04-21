// src/components/Navbar.jsx
import React from "react";
import { Layout, Menu, message, Space, Typography } from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  DownOutlined,
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import logo from "../assets/logo.png";

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname;

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name?.trim() || "Guest";

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    // เปลี่ยนเป็นภาษาอังกฤษ
    message.success("Logged out successfully");
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/",
      label: <Link to="/">Home</Link>,
      icon: <HomeOutlined />,
    },
    {
      key: "userSubMenu",
      label: (
        <Space>
          {userName}
          <DownOutlined />
        </Space>
      ),
      children: [
        {
          key: "/datauser",
          label: <Link to="/datauser">Data</Link>,
          icon: <DatabaseOutlined />,
        },
        {
          key: "logout",
          label: "Logout",
          icon: <LogoutOutlined />,
        },
      ],
    },
  ];

  const handleMenuClick = (e) => {
    console.log("Menu clicked:", e.key);
    if (e.key === "logout") {
      handleLogout();
    } else if (e.key && e.key.startsWith("/")) {
      navigate(e.key);
    }
  };

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        backgroundColor: "#001529",
        position: "fixed",
        zIndex: 1,
        width: "100%",
      }}
    >
      <div className="logo" style={{ display: "flex", alignItems: "center" }}>
        <Link to="/">
          <img
            src={logo}
            alt="Logo"
            style={{
              height: "40px",
            }}
          />
        </Link>
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          lineHeight: "64px",
          backgroundColor: "transparent",
          borderBottom: "none",
          flex: 1,
          minWidth: 0,
          display: "flex",
          justifyContent: "flex-end",
        }}
      />
    </Header>
  );
};

export default Navbar;
