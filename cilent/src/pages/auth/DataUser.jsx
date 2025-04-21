// src/pages/auth/DataUser.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
// สมมติว่า deleteEffect คือ ConfirmEffect
import deleteEffect from "../../components/ConfirmEffect";
import {
  DeleteEmployee,
  FindDataEmployeeByUserId,
  GetAllMyEmployees,
} from "../../functions/employee";

const DataUser = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const userId = user?.id;

  const fetchData = async () => {
    setLoading(true);

    if (!localStorage.getItem("accessToken")) {
      // เปลี่ยนเป็นภาษาอังกฤษ
      message.error("Please log in first (No Token Found)");
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (userRole === "admin") {
        res = await GetAllMyEmployees();
      } else {
        res = await FindDataEmployeeByUserId();
      }

      if (Array.isArray(res.data)) {
        setData(res.data);
      } else {
        console.error("Expected an array from API, but received:", res.data);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching employee list:", error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          // เปลี่ยนเป็นภาษาอังกฤษ
          message.error("Session expired or unauthorized. Please log in again");
          navigate("/login");
        } else {
          // เปลี่ยนเป็นภาษาอังกฤษ
          message.error(
            `Error ${error.response.status}: ${
              error.response.data?.message || "Could not fetch data"
            }`
          );
        }
      } else {
        // เปลี่ยนเป็นภาษาอังกฤษ
        message.error("Connection or request error occurred");
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]); // เพิ่ม navigate ใน dependency array

  const handleEmployeeRemove = async (employeeId) => {
    if (!localStorage.getItem("accessToken")) {
      // เปลี่ยนเป็นภาษาอังกฤษ
      message.error("Please log in first (No Token Found)");
      navigate("/login");
      return;
    }

    const isConfirmed = await deleteEffect(); // ใช้ deleteEffect หรือ ConfirmEffect

    if (isConfirmed) {
      try {
        setLoading(true);
        await DeleteEmployee(employeeId);
        // เปลี่ยนเป็นภาษาอังกฤษ
        message.success("Data deleted successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting employee:", error);
        // เปลี่ยนเป็นภาษาอังกฤษ
        const errorMsg =
          error.response?.data?.message ||
          "An error occurred while deleting data";
        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Deletion cancelled by user.");
      // message.info("Deletion cancelled"); // เปลี่ยน comment เป็นภาษาอังกฤษ
    }
  };

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

  const renderTopButton = () => {
    return (
      <Link to={`/form/${userId}`}>
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
          disabled={loading}
        >
          {/* ข้อความปุ่มเป็นภาษาอังกฤษอยู่แล้ว */}
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
        {renderTopButton()}
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
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
