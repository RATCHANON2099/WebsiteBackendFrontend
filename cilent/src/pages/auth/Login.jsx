// src/components/Login.jsx
import React from "react";
import { Button, Form, Input, notification, message } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { Menu } from "antd";
import { DownOutlined } from "@ant-design/icons"; // นำเข้าลูกศรชี้ลง

const Login = () => {
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      // เรียก backend /login
      const res = await axiosInstance.post("/login", values);

      // รับข้อมูลจาก Backend
      const user = res.data.user; // { id, name, email }
      const accessToken = res.data.accessToken;

      // ตรวจสอบว่ามีข้อมูล user และ token หรือไม่
      if (!user || !user.id || !accessToken) {
        throw new Error("Missing user or token"); // โยน error เอง
      }

      // บันทึกข้อมูลลง localStorage เผื่อใช้ภายหลัง
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);

      // ถ้าไม่มีชื่อหรือ name เป็น null ให้แสดงชื่อเป็น USER
      const userName = user?.name?.trim() ? user.name : "USER";

      //แสดงข้อความหาก Login สำเร็จ
      notification.success({
        message: "Login Success",
        description: `Welcome, ${userName}`,
      });

      // ไปหน้า /data
      navigate(`/datauser`);
    } catch (err) {
      console.error("Login Error", err);

      // ตรวจสอบว่า error มาจาก response หรือไม่
      if (err.response && err.response.data) {
        // ถ้ามีข้อมูลใน response.body ให้แสดงข้อความจาก backend
        message.error(err.response.data); // แสดงข้อความที่ได้จาก backend
      } else {
        // ถ้าไม่มีข้อมูลใน response.body หรือ error อื่นๆ
        message.error("Invalid email or password");
      }
    }
  };

  // Navbar (เพิ่มเติม)
  const location = window.location.pathname; // ตรวจสอบ path ปัจจุบัน
  const selectedKey = location;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 10,
          backgroundColor: "#001529",
          padding: "0 1rem",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={(e) => navigate(e.key)}
          theme="dark"
          style={{
            backgroundColor: "transparent",
            borderBottom: "none",
          }}
          overflowedIndicator={<DownOutlined />}
        >
          <Menu.Item key="/">Home</Menu.Item>
        </Menu>
      </div>

      {/* Form Login */}
      <div style={{ width: "300px", margin: "120px auto" }}>
        {" "}
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              LOGIN
            </Button>
          </Form.Item>
          <Form.Item>
            <Button block onClick={() => navigate("/register")}>
              REGISTER
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default Login;
