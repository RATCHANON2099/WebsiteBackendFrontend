// src/pages/Home.jsx
import React from "react";
import { Layout, Typography, Button, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  // --- ฟังก์ชันตรวจสอบ Token (ตัวอย่าง: ใช้ localStorage) ---
  // คุณอาจจะต้องปรับแก้ส่วนนี้ให้ตรงกับวิธีที่คุณเก็บ token จริงๆ
  const checkTokenValidity = () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return false; // ไม่มี token
    }

    return true; // มี token (และอาจจะยังไม่หมดอายุ ถ้าเช็ค)
  };

  // --- ฟังก์ชันที่จะทำงานเมื่อคลิกปุ่ม Get Started ---
  const handleGetStartedClick = () => {
    if (checkTokenValidity()) {
      // ถ้ามี token ที่ยังใช้ได้ -> ไปหน้า DataUser
      console.log("Token found, navigating to /datauser");
      navigate("/datauser");
    } else {
      // ถ้าไม่มี token หรือหมดอายุ -> ไปหน้า Login
      console.log("No valid token found, navigating to /login");
      navigate("/login");
    }
  };

  return (
    <Layout
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        background: "linear-gradient(to bottom right, #89f7fe, #66a6ff)",
        overflow: "hidden",
      }}
    >
      <Content>
        <Row
          justify="center"
          align="middle"
          style={{
            height: "100%",
            textAlign: "center",
            padding: "0 1rem",
          }}
        >
          <Col>
            <Title
              level={1}
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "4rem",
                textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              Welcome
            </Title>
            <Paragraph
              style={{
                color: "#f8f8f8",
                fontSize: "1.2rem",
                marginBottom: "2rem",
              }}
            >
              Let&apos;s Start With Us!
            </Paragraph>
            <Button
              size="large"
              style={{
                backgroundColor: "white",
                color: "#1E90FF",
                borderRadius: "50px",
                padding: "0 2rem",
                height: "48px",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
              onClick={handleGetStartedClick}
            >
              Get Started
            </Button>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Home;
