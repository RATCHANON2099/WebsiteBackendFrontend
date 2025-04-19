// src/pages/auth/DataUser.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
// *** Import ฟังก์ชันที่ถูกต้อง ***
import {
  DeleteEmployee,
  FindDataEmployeeByUserId,
} from "../../functions/employee";
// ไม่ต้องใช้ axios โดยตรงแล้ว

const DataUser = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // เริ่มต้นเป็น array ว่าง
  const [loading, setLoading] = useState(true);
  // --- ลบ userHasInfo ออก ---
  // const [userHasInfo, setUserHasInfo] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // --- ฟังก์ชันโหลดข้อมูล (แยกออกมาเพื่อเรียกซ้ำได้) ---
  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("กรุณาเข้าสู่ระบบก่อน");
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      // *** เรียกใช้ฟังก์ชันใหม่เพื่อดึง Array ข้อมูลทั้งหมด ***
      const res = await FindDataEmployeeByUserId(token);

      console.log(
        "Data from /api/employee/my-list (should be array):",
        res.data
      );

      // --- ตั้งค่า State ด้วย Array ที่ได้มาโดยตรง ---
      if (Array.isArray(res.data)) {
        setData(res.data); // *** ใช้ res.data โดยตรง ***
      } else {
        console.error(
          "Expected an array from getAllMyEmployees, but received:",
          res.data
        );
        setData([]); // ตั้งเป็น Array ว่างถ้าข้อมูลไม่ถูกต้อง
      }
      // --- ไม่ต้องใช้ userHasInfo แล้ว ---
    } catch (error) {
      console.error("Error fetching employee list:", error);
      // ... (Error handling) ...
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          message.error(
            "Session หมดอายุ หรือไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่"
          );
          navigate("/login");
        } else {
          message.error(
            `เกิดข้อผิดพลาด ${error.response.status}: ${
              error.response.data?.message || "ไม่สามารถดึงข้อมูลได้"
            }`
          );
        }
      } else {
        message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ หรือการร้องขอข้อมูล");
      }
      setData([]); // เคลียร์ข้อมูลเมื่อเกิด error
    } finally {
      setLoading(false);
    }
  };

  // --- useEffect เรียก fetchData ครั้งแรก ---
  useEffect(() => {
    fetchData();
    // Dependency array ว่าง หรือใส่ navigate ถ้าต้องการให้โหลดใหม่เมื่อ navigate กลับมา
  }, [navigate]);

  // --- ฟังก์ชัน handleEmployeeRemove ---
  const handleEmployeeRemove = async (employeeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      /* ... */ return;
    }
    try {
      setLoading(true);
      await DeleteEmployee(employeeId, token);
      message.success("ลบข้อมูลสำเร็จ");
      // *** โหลดข้อมูลใหม่หลังลบ ***
      fetchData(); // เรียก fetchData() เพื่อโหลดข้อมูลล่าสุด
    } catch (error) {
      console.error("Error deleting employee:", error);
      const errorMsg =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการลบข้อมูล";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Columns (เหมือนเดิม) ---
  const columns = [
    { title: "No.", render: (text, record, index) => index + 1 },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Age", dataIndex: "age", key: "age" },
    { title: "Phone", dataIndex: "phone_number", key: "phone_number" },
    { title: "ID Number", dataIndex: "id_number", key: "id_number" },
    {
      title: "Delete",
      key: "delete",
      render: (text, record) => (
        <Button
          danger
          onClick={() => handleEmployeeRemove(record.id)}
          disabled={loading}
        >
          Delete
        </Button>
      ),
    },
    {
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <Link to={`/updatedata/${record.id}`}>
          <Button type="primary" disabled={loading}>
            Edit
          </Button>
        </Link>
      ),
    },
  ];

  // --- ปุ่ม Add ด้านบน (แสดงเสมอ) ---
  const renderTopButton = () => {
    // ไม่ต้องเช็ค userHasInfo แล้ว
    return (
      <Link to={`/form/${userId}`}>
        {" "}
        {/* Link ไปหน้า FormUser */}
        <Button
          type="primary"
          style={{
            backgroundColor: "#1677ff",
            borderColor: "#1677ff",
            borderRadius: "8px",
            fontWeight: "bold",
            boxShadow: "0 4px 8px rgba(22, 119, 255, 0.3)",
            transition: "all 0.3s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          disabled={loading} // ปิดปุ่มขณะ loading
        >
          Add Your Information
        </Button>
      </Link>
    );
  };

  return (
    <div style={{ padding: "20px 50px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}
      >
        {renderTopButton()} {/* แสดงปุ่ม Add เสมอ */}
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data} // ควรจะเป็น Array ที่มีหลาย object (หรือว่าง)
          rowKey="id"
          pagination={false} // หรือ true ถ้าต้องการแบ่งหน้า
          style={{
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        />
      </Spin>
    </div>
  );
};

export default DataUser;
