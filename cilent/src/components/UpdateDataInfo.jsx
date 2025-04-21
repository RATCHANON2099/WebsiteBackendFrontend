// src/components/UpdateDataInfo.jsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Layout, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { UpdateEmployee, GetDataEmployeeById } from "../functions/employee";
// *** 1. Import ConfirmEffect (หรือ deleteEffect ถ้าต้องการใช้ชื่อนั้น) ***
import ConfirmEffect from "./ConfirmEffect"; // หรือ import deleteEffect from './DeleteEffect';

const UpdateDataInfo = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { Content } = Layout;
  // *** เปลี่ยนชื่อ state loading ให้ชัดเจนขึ้น (Optional แต่แนะนำ) ***
  const [initialLoading, setInitialLoading] = useState(true); // สำหรับโหลดข้อมูลครั้งแรก
  const [isUpdating, setIsUpdating] = useState(false); // สำหรับตอนกดปุ่มอัปเดต

  useEffect(() => {
    console.log("[UpdateDataInfo] useEffect triggered. ID from params:", id);

    if (!localStorage.getItem("accessToken")) {
      message.error("กรุณาเข้าสู่ระบบก่อน (No Token Found)");
      navigate("/login");
      setInitialLoading(false);
      return;
    }

    const fetchEmployeeData = async () => {
      try {
        console.log(
          "[UpdateDataInfo] Calling GetDataEmployeeById with ID:",
          id
        );
        const res = await GetDataEmployeeById(id);
        console.log("[UpdateDataInfo] API Response Data (res.data):", res.data);
        if (
          res.data &&
          typeof res.data === "object" &&
          !Array.isArray(res.data)
        ) {
          console.log(
            "[UpdateDataInfo] Data is valid object. Setting form values:",
            res.data
          );
          form.setFieldsValue(res.data);
          console.log(
            "[UpdateDataInfo] form.setFieldsValue called successfully."
          );
        } else {
          console.log(
            "[UpdateDataInfo] API did not return a valid single object. res.data:",
            res.data
          );
          message.error(
            "ไม่พบข้อมูลพนักงานที่ต้องการแก้ไข หรือข้อมูลไม่ถูกต้อง"
          );
          navigate("/datauser");
        }
      } catch (error) {
        console.error("[UpdateDataInfo] Error in fetchEmployeeData:", error);
        message.error("เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน");
        navigate("/datauser");
      } finally {
        setInitialLoading(false); // หยุด loading ของข้อมูลครั้งแรก
      }
    };

    if (id) {
      fetchEmployeeData();
    } else {
      console.log("[UpdateDataInfo] No ID found in params.");
      message.error("ไม่พบ ID ของข้อมูลที่ต้องการแก้ไข");
      setInitialLoading(false);
      navigate("/datauser");
    }
  }, [id, navigate, form]);

  // *** 2. แก้ไข onFinish ให้เรียก ConfirmEffect ก่อน ***
  const onFinish = async (values) => {
    console.log("[UpdateDataInfo] onFinish triggered with values:", values);

    if (!localStorage.getItem("accessToken")) {
      message.error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่ (No Token Found)");
      navigate("/login");
      return;
    }

    // --- เรียก ConfirmEffect และรอการยืนยัน ---
    console.log("Before calling ConfirmEffect");
    const isConfirmed = await ConfirmEffect(); // หรือ await deleteEffect();
    console.log("After calling ConfirmEffect, isConfirmed:", isConfirmed);

    // --- ทำงานต่อเมื่อผู้ใช้ยืนยัน ---
    if (isConfirmed) {
      setIsUpdating(true); // *** เริ่ม loading ของการอัปเดต ***
      try {
        // เรียกใช้ UpdateEmployee
        await UpdateEmployee(id, values);
        message.success("อัปเดตข้อมูลสำเร็จ");
        navigate(`/datauser`); // กลับไปหน้าแสดงข้อมูล
      } catch (error) {
        console.error(
          "[UpdateDataInfo] Error in onFinish (UpdateEmployee):",
          error
        );
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data ||
          "เกิดข้อผิดพลาดในการอัปเดตข้อมูล";
        message.error(errorMessage);
      } finally {
        setIsUpdating(false); // *** หยุด loading ของการอัปเดต ***
      }
    } else {
      console.log("Update cancelled by user.");
      // message.info("การอัปเดตถูกยกเลิก"); // (Optional)
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
        {/* *** Spin ใช้ initialLoading สำหรับโหลดข้อมูลครั้งแรก *** */}
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
            {/* --- Header --- */}
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

            {/* --- Form --- */}
            <Form form={form} onFinish={onFinish} layout="vertical">
              {/* ... (Form Items เหมือนเดิม) ... */}
              <Form.Item
                label="อีเมล (ติดต่อ)"
                name="email"
                rules={[
                  { required: true, message: "กรุณากรอก email" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
              <Form.Item
                label="ชื่อ-นามสกุล"
                name="name"
                rules={[{ required: true, message: "กรุณากรอกชื่อ-นามสกุล" }]}
              >
                <Input placeholder="กรอกชื่อ-นามสกุล" />
              </Form.Item>
              <Form.Item
                label="อายุ"
                name="age"
                rules={[{ required: true, message: "กรุณากรอกอายุ" }]}
              >
                <Input placeholder="กรอกอายุ" type="number" />
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
                  // *** 3. ปุ่มใช้ isUpdating สำหรับ loading ***
                  loading={isUpdating}
                >
                  อัปเดตข้อมูล
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
