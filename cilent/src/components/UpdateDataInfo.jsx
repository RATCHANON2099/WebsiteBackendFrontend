// src/components/UpdateDataInfo.jsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Layout, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { UpdateEmployee, GetDataEmployeeById } from "../functions/employee";
import ConfirmEffect from "./ConfirmEffect";

const UpdateDataInfo = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { Content } = Layout;
  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      // เปลี่ยนเป็นภาษาอังกฤษ
      message.error("Please log in first (No Token Found)");
      navigate("/login");
      setInitialLoading(false);
      return;
    }

    const fetchEmployeeData = async () => {
      try {
        const res = await GetDataEmployeeById(id);
        if (
          res.data &&
          typeof res.data === "object" &&
          !Array.isArray(res.data)
        ) {
          form.setFieldsValue(res.data);
        } else {
          // เปลี่ยนเป็นภาษาอังกฤษ
          message.error("Employee data not found or invalid");
          navigate("/datauser");
        }
      } catch (error) {
        console.error("Error fetching employee data:", error); // แก้ไข log message
        // เปลี่ยนเป็นภาษาอังกฤษ
        message.error("Error fetching employee data");
        navigate("/datauser");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchEmployeeData();
    } else {
      // เปลี่ยนเป็นภาษาอังกฤษ
      message.error("ID for the record to be edited not found");
      setInitialLoading(false);
      navigate("/datauser");
    }
  }, [id, navigate, form]); // เพิ่ม form ใน dependency array

  const onFinish = async (values) => {
    if (!localStorage.getItem("accessToken")) {
      // เปลี่ยนเป็นภาษาอังกฤษ
      message.error("Session expired. Please log in again (No Token Found)");
      navigate("/login");
      return;
    }

    const isConfirmed = await ConfirmEffect();

    if (isConfirmed) {
      setIsUpdating(true);
      try {
        await UpdateEmployee(id, values);
        // เปลี่ยนเป็นภาษาอังกฤษ
        message.success("Data updated successfully");
        navigate(`/datauser`);
      } catch (error) {
        console.error("Error updating employee data:", error); // แก้ไข log message
        // เปลี่ยนเป็นภาษาอังกฤษ
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data ||
          "An error occurred while updating data";
        message.error(errorMessage);
      } finally {
        setIsUpdating(false);
      }
    } else {
      console.log("Update cancelled by user.");
      // message.info("Update cancelled"); // เปลี่ยน comment เป็นภาษาอังกฤษ
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
        <Spin spinning={initialLoading}>
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
                  background:
                    "linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "36px",
                  fontWeight: "bold",
                  margin: 0,
                  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.3)",
                  letterSpacing: "1.5px",
                }}
              >
                UPDATE DATA INFORMATION
              </h1>
            </div>

            <Form form={form} onFinish={onFinish} layout="vertical">
              {/* เปลี่ยน Label และ Placeholder */}
              <Form.Item
                label="Contact Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Invalid email format" }, // แก้ message
                ]}
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
                <Input placeholder="Enter age" type="number" />
              </Form.Item>
              <Form.Item
                label="Phone Number"
                name="phone_number"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]} // แก้ message
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
                  loading={isUpdating}
                >
                  Update Data
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Spin>
      </Content>
    </Layout>
  );
};

export default UpdateDataInfo;
