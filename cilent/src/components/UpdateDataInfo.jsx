// src/components/UpdateDataInfo.jsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Layout, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
// *** ตรวจสอบว่า import ฟังก์ชันที่ถูกต้องจาก employee.jsx ***
import { UpdateEmployee, GetDataEmployeeById } from "../functions/employee";

const UpdateDataInfo = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // ดึง id จาก URL parameter
  const { Content } = Layout;
  const [loading, setLoading] = useState(true); // เริ่ม loading เป็น true เพื่อรอข้อมูล

  useEffect(() => {
    // --- Log #1: ตรวจสอบ ID ที่ได้รับ ---
    console.log("[UpdateDataInfo] useEffect triggered. ID from params:", id);

    const token = localStorage.getItem("token");
    if (!token) {
      message.error("กรุณาเข้าสู่ระบบก่อน");
      navigate("/login");
      setLoading(false); // หยุด loading ถ้าไม่มี token
      return;
    }

    // ฟังก์ชันสำหรับดึงข้อมูลพนักงานตาม id
    const fetchEmployeeData = async () => {
      // ไม่ต้อง setLoading(true) ซ้ำ เพราะตั้งค่าเริ่มต้นเป็น true แล้ว
      try {
        // --- Log #2: ตรวจสอบก่อนเรียก API ---
        console.log(
          "[UpdateDataInfo] Calling GetDataEmployeeById with ID:",
          id
        ); // *** ใช้ GetDataEmployeeById ***

        // *** เรียก API ดึงข้อมูล Employee ด้วย ID ที่ถูกต้อง ***
        const res = await GetDataEmployeeById(id, token);

        // --- Log #3: ตรวจสอบ Response ทั้งหมดจาก API ---
        console.log(
          "[UpdateDataInfo] API Response (getEmployeeByIdParm):",
          res
        );

        // --- Log #4: ตรวจสอบข้อมูลที่อยู่ใน res.data (สำคัญมาก!) ---
        console.log("[UpdateDataInfo] API Response Data (res.data):", res.data);

        // *** เพิ่มการตรวจสอบว่าเป็น Object และไม่ใช่ Array ***
        if (
          res.data &&
          typeof res.data === "object" &&
          !Array.isArray(res.data)
        ) {
          // --- Log #5: ตรวจสอบข้อมูลก่อน setFieldsValue ---
          console.log(
            "[UpdateDataInfo] Data is valid object. Attempting form.setFieldsValue with:",
            res.data
          );

          // *** จุดสำคัญ: ตรวจสอบว่า key ใน res.data ตรงกับ name ใน Form.Item หรือไม่? ***
          form.setFieldsValue(res.data); // เติมข้อมูลลงฟอร์ม

          // --- Log #6: ยืนยันว่า setFieldsValue ถูกเรียก ---
          console.log(
            "[UpdateDataInfo] form.setFieldsValue called successfully."
          );
        } else {
          // --- Log #7: กรณี API ไม่คืน Object ที่ถูกต้อง ---
          console.log(
            "[UpdateDataInfo] API did not return a valid single object. res.data:",
            res.data // Log ดูว่าได้อะไรมาแทน
          );
          message.error(
            "ไม่พบข้อมูลพนักงานที่ต้องการแก้ไข หรือข้อมูลไม่ถูกต้อง"
          );
          navigate("/datauser");
        }
      } catch (error) {
        // --- Log #8: ตรวจสอบ Error ที่เกิดขึ้น ---
        console.error("[UpdateDataInfo] Error in fetchEmployeeData:", error);
        if (error.response) {
          console.error(
            "[UpdateDataInfo] Error response data:",
            error.response.data
          );
          console.error(
            "[UpdateDataInfo] Error response status:",
            error.response.status
          );
        }
        message.error("เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน");
        navigate("/datauser");
      } finally {
        setLoading(false); // หยุด loading เมื่อเสร็จสิ้น (ทั้งสำเร็จและ error)
      }
    };

    if (id) {
      fetchEmployeeData(); // เรียกฟังก์ชันดึงข้อมูล
    } else {
      // --- Log #9: กรณีไม่มี ID ใน URL ---
      console.log("[UpdateDataInfo] No ID found in params.");
      message.error("ไม่พบ ID ของข้อมูลที่ต้องการแก้ไข");
      setLoading(false); // หยุด loading ถ้าไม่มี ID
      navigate("/datauser");
    }
  }, [id, navigate, form]); // Dependencies

  // ฟังก์ชัน onFinish สำหรับการอัปเดตข้อมูล (ใช้ onFinish ของ Ant Design)
  const onFinish = async (values) => {
    // values คือข้อมูลจากฟอร์มที่ผ่าน validation แล้ว
    console.log("[UpdateDataInfo] onFinish triggered with values:", values); // Log ข้อมูลที่จะอัปเดต
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        navigate("/login");
        return;
      }

      // เรียกใช้ UpdateEmployee จาก employee.jsx
      await UpdateEmployee(id, values, token);

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
    }
  };

  // --- ส่วน JSX เหมือนกับ FormUser.jsx ---
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
        {/* ใช้ Spin หุ้ม div หลัก เพื่อให้ loading ดูดีขึ้น */}
        <Spin spinning={loading}>
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
            {/* --- ส่วน Header เหมือน FormUser.jsx --- */}
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
                UPDATE DATA INFORMATION {/* เปลี่ยนแค่ข้อความหัวข้อ */}
              </h1>
            </div>
            {/* -------------------------------------- */}

            {/* --- ส่วน Form เหมือน FormUser.jsx --- */}
            {/* ตรวจสอบ name prop ของ Form.Item ให้ตรงกับ key ใน res.data ที่ได้จาก Log #4 */}
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item
                label="อีเมล (ติดต่อ)"
                name="email" // <-- ตรวจสอบ Key จาก Log #4
                rules={[
                  { required: true, message: "กรุณากรอก email" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
              <Form.Item
                label="ชื่อ-นามสกุล"
                name="name" // <-- ตรวจสอบ Key จาก Log #4
                rules={[{ required: true, message: "กรุณากรอกชื่อ-นามสกุล" }]}
              >
                <Input placeholder="กรอกชื่อ-นามสกุล" />
              </Form.Item>
              <Form.Item
                label="อายุ"
                name="age" // <-- ตรวจสอบ Key จาก Log #4
                rules={[{ required: true, message: "กรุณากรอกอายุ" }]}
              >
                <Input placeholder="กรอกอายุ" type="number" />
              </Form.Item>
              <Form.Item
                label="เบอร์โทรศัพท์"
                name="phone_number" // <-- ตรวจสอบ Key จาก Log #4
                rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}
              >
                <Input placeholder="กรอกเบอร์โทรศัพท์" />
              </Form.Item>
              <Form.Item
                label="เลขบัตรประชาชน"
                name="id_number" // <-- ตรวจสอบ Key จาก Log #4
                rules={[{ required: true, message: "กรุณากรอกเลขบัตรประชาชน" }]}
              >
                <Input placeholder="กรอกเลขบัตรประชาชน" />
              </Form.Item>
              {/* ไม่มี field 'role' ในฟอร์มนี้ ถ้าต้องการต้องเพิ่ม Form.Item */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={{ fontSize: "16px", height: "40px" }}
                >
                  อัปเดตข้อมูล {/* เปลี่ยนแค่ข้อความปุ่ม */}
                </Button>
              </Form.Item>
            </Form>
            {/* --------------------------------- */}
          </div>
        </Spin>
      </Content>
    </Layout>
  );
};

export default UpdateDataInfo;
