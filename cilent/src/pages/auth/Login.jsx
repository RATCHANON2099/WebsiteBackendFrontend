// src/pages/auth/Login.jsx
import React from "react";
// *** 1. Import เพิ่ม Layout, Card, Icons และลบ Menu ***
import {
  Button,
  Form,
  Input,
  notification,
  message,
  Layout,
  Card,
  Typography,
} from "antd";
import { useNavigate, Link } from "react-router-dom"; // เพิ่ม Link
import axiosInstance from "../../api/axiosInstance";
// *** ลบ Menu ออกไป ***
// import { Menu } from "antd";
// *** ลบ DownOutlined ออกไป และเพิ่ม Icons สำหรับ Form ***
import { UserOutlined, LockOutlined } from "@ant-design/icons";

// ดึงคอมโพเนนท์ย่อยจาก Antd
const { Content } = Layout;
const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  // *** 2. เพิ่ม hook สำหรับจัดการ Form instance (Best practice) ***
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false); // เพิ่ม state สำหรับ loading

  const onFinish = async (values) => {
    setLoading(true); // เริ่ม loading
    try {
      const res = await axiosInstance.post("/login", values);
      const user = res.data.user;
      const accessToken = res.data.accessToken;

      if (!user || !user.id || !accessToken) {
        throw new Error("Missing user data or token from server response");
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);

      const userName = user?.name?.trim() || "User"; // ใช้ User แทน USER

      notification.success({
        message: "Login Success",
        description: `Welcome back, ${userName}!`, // ปรับข้อความเล็กน้อย
      });

      navigate(`/datauser`);
    } catch (err) {
      console.error("Login Error:", err); // แสดง error ใน console ชัดเจนขึ้น
      let errorMessage = "Invalid email or password. Please try again."; // Default message
      if (err.response && err.response.data) {
        // พยายามใช้ message จาก backend ถ้ามี
        // ตรวจสอบว่าเป็น string หรือ object
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (
          err.response.data.message &&
          typeof err.response.data.message === "string"
        ) {
          errorMessage = err.response.data.message;
        }
        // อาจจะเพิ่มการตรวจสอบ status code ที่นี่ถ้าต้องการ
        // if (err.response.status === 401) { ... }
      } else if (
        err.message === "Missing user data or token from server response"
      ) {
        errorMessage = "Login failed: Incomplete data received from server.";
      }
      message.error(errorMessage);
    } finally {
      setLoading(false); // หยุด loading เสมอ
    }
  };

  // *** 3. ลบส่วน Navbar ที่ซ้ำซ้อนออกทั้งหมด ***
  // const location = window.location.pathname;
  // const selectedKey = location;
  // <div style={{ position: 'fixed', ... }}> <Menu> ... </Menu> </div> // <--- ลบส่วนนี้ทิ้ง

  return (
    // *** 4. ใช้ Layout และจัดกึ่งกลาง Form ***
    <Layout
      style={{
        minHeight: "100vh",
        background: "#f0f2f5" /* สีพื้นหลังอ่อนๆ */,
      }}
    >
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        {/* ใช้ Card หรือ div ครอบ Form */}
        <Card
          style={{
            width: "100%",
            maxWidth: "400px", // ปรับขนาดตามต้องการ
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            {/* อาจจะใส่ Logo หรือ Title ที่นี่ */}
            <Title level={2}>Login</Title>
          </div>

          {/* *** 5. ปรับปรุง Form และ Inputs *** */}
          <Form
            form={form} // ผูก form instance
            name="login-form" // เพิ่ม name ให้ Form
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ remember: true }} // (Optional) ถ้ามีช่อง remember me
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your Email!" },
                { type: "email", message: "Please enter a valid Email!" }, // เพิ่ม rule ตรวจสอบ format email
              ]}
            >
              {/* เพิ่ม icon */}
              <Input prefix={<UserOutlined />} placeholder="Email Address" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              {/* เพิ่ม icon */}
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            {/* (Optional) เพิ่มส่วนอื่นๆ เช่น Forgot password */}
            {/* <Form.Item>
              <a href="/forgot-password" style={{ float: 'right' }}>Forgot password?</a>
            </Form.Item> */}

            <Form.Item style={{ marginBottom: "10px" }}>
              {" "}
              {/* ลด margin ล่าง */}
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading} // ใช้ state loading
              >
                LOGIN
              </Button>
            </Form.Item>

            <Form.Item>
              <Button block onClick={() => navigate("/register")}>
                Don't have an account? REGISTER
              </Button>
              {/* หรือใช้ Link ของ react-router-dom */}
              {/* <div style={{ textAlign: 'center', marginTop: '10px' }}>
                 Or <Link to="/register">Register now!</Link>
              </div> */}
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;
