// src/pages/auth/FormUser.jsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { AddEmployee } from "../../functions/employee";

const FormUser = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { Content } = Layout;
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("กรุณาเข้าสู่ระบบก่อน");
      navigate("/login");
    }
  }, []);

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem("token");

      if (!token || !userId) {
        message.error("ข้อมูลการยืนยันตัวตนไม่สมบูรณ์ กรุณาลองเข้าสู่ระบบใหม่");
        navigate("/login");
        return;
      }
      const dataToSend = {
        ...values,
        userId: userId,
      };

      await AddEmployee(dataToSend, token);

      message.success("บันทึกข้อมูลสำเร็จ");
      form.resetFields();
      navigate(`/datauser`);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการสร้างข้อมูลพนักงาน:", error);

      const errorMessage =
        error.response?.data?.message || // ลองดึง message จาก backend response
        error.response?.data || // ลองดึงข้อมูล error อื่นๆ จาก backend response
        "เกิดข้อผิดพลาดในการบันทึกข้อมูล"; // ข้อความ fallback
      message.error(errorMessage);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            background: "#fff",
            padding: "40px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              background: "#001529",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                background: "linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "36px",
                fontWeight: "bold",
                margin: 0,
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.3)",
                letterSpacing: "1.5px",
              }}
            >
              USER FORM
            </h1>
          </div>

          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              label="อีเมล (ติดต่อ)"
              name="email"
              rules={[{ required: true, message: "กรุณากรอก email" }]}
            >
              <Input placeholder="example@email.com" />
            </Form.Item>

            <Form.Item
              label="ชื่อ-นามสกุล"
              name="name"
              rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
            >
              <Input placeholder="กรอกชื่อ-นามสกุล" />
            </Form.Item>

            <Form.Item
              label="อายุ"
              name="age"
              rules={[{ required: true, message: "กรุณากรอกอายุ" }]}
            >
              <Input placeholder="กรอกอายุ" />
            </Form.Item>

            <Form.Item
              label="เบอร์โทรศัพท์"
              name="phone_number"
              rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}
            >
              <Input placeholder="กรอกเบอร์โทรศัพท์" />
            </Form.Item>

            <Form.Item
              label="เลขบัตรประชาชน"
              name="id_number"
              rules={[{ required: true, message: "กรุณากรอกเลขบัตรประชาชน" }]}
            >
              <Input placeholder="กรอกเลขบัตรประชาชน" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{ fontSize: "16px", height: "40px" }}
              >
                บันทึกข้อมูล
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default FormUser;
