// src/pages/auth/FormUser.jsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { AddEmployee } from "../../functions/employee";
import ConfirmEffect from "../../components/ConfirmEffect";

const FormUser = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { Content } = Layout;
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      // เปลี่ยนเป็นภาษาอังกฤษ
      message.error("Please log in first");
      navigate("/login");
    }
    // เพิ่ม dependency array ว่างเพื่อให้ useEffect ทำงานครั้งเดียวตอน mount
  }, [navigate]); // เพิ่ม navigate ใน dependency array

  const onFinish = async (values) => {
    if (!localStorage.getItem("accessToken")) {
      // เปลี่ยนเป็นภาษาอังกฤษ
      message.error("Session expired. Please log in again (No Token Found)");
      navigate("/login");
      return;
    }

    const isConfirmed = await ConfirmEffect();
    console.log("Confirmation result:", isConfirmed);

    if (isConfirmed) {
      setIsSubmitting(true);

      try {
        if (!userId) {
          // เปลี่ยนเป็นภาษาอังกฤษ
          message.error("User data not found. Please try logging in again");
          navigate("/login");
          // ไม่ต้อง setIsSubmitting(false) ที่นี่ เพราะ finally จะทำให้อยู่แล้ว
          return; // ออกจาก function ถ้าไม่มี userId
        }

        const dataToSend = {
          ...values,
        };

        await AddEmployee(dataToSend);

        // เปลี่ยนเป็นภาษาอังกฤษ
        message.success("Data saved successfully");
        form.resetFields();
        navigate(`/datauser`);
      } catch (error) {
        console.error("Error creating employee data:", error); // แก้ไข log message
        // เปลี่ยน default error message เป็นภาษาอังกฤษ
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data ||
          "An error occurred while saving data";
        message.error(errorMessage);
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          navigate("/login");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log("Submission cancelled by user.");
      // message.info("Save operation cancelled"); // เปลี่ยน comment เป็นภาษาอังกฤษ
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
            {/* เปลี่ยน Label และ Placeholder */}
            <Form.Item
              label="Contact Email"
              name="email"
              rules={[{ required: true, message: "Please enter email" }]} // แก้ message
            >
              <Input placeholder="example@email.com" />
            </Form.Item>

            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Please enter name" }]} // แก้ message
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              label="Age"
              name="age"
              rules={[{ required: true, message: "Please enter age" }]} // แก้ message
            >
              {/* เพิ่ม type="number" เพื่อให้ input เหมาะสมขึ้น */}
              <Input placeholder="Enter age" type="number" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone_number"
              rules={[{ required: true, message: "Please enter phone number" }]} // แก้ message
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              label="ID Number"
              name="id_number"
              rules={[{ required: true, message: "Please enter ID number" }]} // แก้ message
            >
              <Input placeholder="Enter ID number" />
            </Form.Item>

            <Form.Item>
              {/* เปลี่ยนข้อความปุ่ม */}
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{ fontSize: "16px", height: "40px" }}
                loading={isSubmitting}
              >
                Save Data
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default FormUser;
