// src/pages/auth/Register.jsx
import React from "react";
// *** 1. Import เพิ่ม Layout, Card, Icons และลบ Menu ***
import {
  Form,
  Input,
  Button,
  message,
  notification,
  Layout,
  Card,
  Typography,
} from "antd";
import { useNavigate, Link } from "react-router-dom"; // เพิ่ม Link
import { register } from "../../functions/user";
// *** ลบ Menu และ DownOutlined ออกไป และเพิ่ม Icons สำหรับ Form ***
// import { Menu } from "antd";
// import { DownOutlined } from "@ant-design/icons";
import { UserOutlined, LockOutlined } from "@ant-design/icons"; // เพิ่ม Icons

// ดึงคอมโพเนนท์ย่อยจาก Antd
const { Content } = Layout;
const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();
  // *** 2. เพิ่ม hook สำหรับจัดการ Form instance ***
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false); // เพิ่ม state loading

  const onFinish = async (values) => {
    // เปลี่ยนเป็น async เพื่อใช้ await (ถ้าต้องการ)
    setLoading(true); // เริ่ม loading
    // ไม่ต้องส่ง confirmPassword ไป backend
    const { confirmPassword, ...dataToSend } = values;

    try {
      // ใช้ await ถ้า register function คืน Promise (ซึ่ง .then/.catch บอกว่าใช่)
      const res = await register(dataToSend);
      console.log("Register Success:", res.data);
      // แสดง notification หรือ message บอกว่าสำเร็จ
      notification.success({
        // ใช้ notification เพื่อความสอดคล้องกับ Login
        message: "Registration Successful",
        description: "You can now log in with your new account.",
      });
      navigate("/login"); // ไปหน้า Login หลังสมัครสำเร็จ
    } catch (err) {
      console.error("Register Error:", err);
      // ปรับปรุงการแสดงข้อความ error (คล้าย Login)
      let errorMessage = "Registration failed. Please try again."; // Default message
      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (
          err.response.data.message &&
          typeof err.response.data.message === "string"
        ) {
          errorMessage = err.response.data.message;
        }
      }
      message.error(errorMessage);
    } finally {
      setLoading(false); // หยุด loading เสมอ
    }
  };

  // *** 3. ลบฟังก์ชัน validate ที่ไม่ได้ใช้และอาจไม่ถูกต้อง ***
  // const validate = (value) => { ... };

  // *** 4. ลบส่วน Navbar ที่ซ้ำซ้อนออกทั้งหมด ***
  // const location = window.location.pathname;
  // const selectedKey = location;
  // <div style={{ position: 'fixed', ... }}> <Menu> ... </Menu> </div> // <--- ลบส่วนนี้ทิ้ง

  return (
    // *** 5. ใช้ Layout และจัดกึ่งกลาง Form (เหมือน Login) ***
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Title level={2}>Register</Title>
          </div>

          {/* *** 6. ปรับปรุง Form และ Inputs *** */}
          <Form
            form={form} // ผูก form instance
            name="register-form" // เพิ่ม name ให้ Form
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your Email!" },
                { type: "email", message: "Please enter a valid Email!" },
              ]}
            >
              {/* เพิ่ม icon */}
              <Input
                prefix={<UserOutlined />}
                placeholder="Email Address"
                type="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your Password!" },
                // (Optional) เพิ่ม rule ความยาวขั้นต่ำ
                // { min: 6, message: 'Password must be at least 6 characters long!' }
              ]}
            >
              {/* เพิ่ม icon */}
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]} // สำคัญ! ทำให้ re-validate เมื่อช่อง password เปลี่ยน
              hasFeedback // (Optional) แสดง icon feedback ตอน validate
              rules={[
                { required: true, message: "Please confirm your Password!" },
                // ใช้ validator function ที่ให้มา (ถูกต้องแล้ว)
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              {/* เพิ่ม icon */}
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: "10px" }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading} // ใช้ state loading
              >
                REGISTER
              </Button>
            </Form.Item>

            <Form.Item>
              {/* ใช้ Link เพื่อความหมายที่ดีกว่า Button เฉยๆ */}
              <div style={{ textAlign: "center" }}>
                Already have an account? <Link to="/login">Login now!</Link>
              </div>
              {/* หรือถ้าต้องการปุ่มเหมือนเดิม */}
              {/* <Button block onClick={() => navigate("/login")}>
                Back to Login
              </Button> */}
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Register;
