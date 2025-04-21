// src/App.jsx
import React from "react"; // ลบ useState ออก เพราะไม่ได้ใช้ในไฟล์นี้โดยตรง
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ConfigProvider, Layout } from "antd"; // <--- Import ConfigProvider และ Layout

// Import หน้าต่างๆ และคอมโพเนนท์
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Navbar from "./components/Navbar"; // ตรวจสอบว่า Navbar ใช้ Layout.Header ของ Antd หรือไม่
import DataUser from "./pages/auth/DataUser";
import FormUser from "./pages/auth/FormUser";
// ตรวจสอบ path นี้ให้แน่ใจว่าถูกต้อง! '/src/...' ดูไม่น่าใช่ path ปกติ
// อาจจะเป็น './components/UpdateDataInfo' หรือ './pages/auth/UpdateDataInfo'
import UpdateDataInfo from "./components/UpdateDataInfo"; // <--- แก้ไข path ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ

// เปลี่ยนชื่อเป็น AppContent เพื่อความชัดเจน และจัดการ Layout
function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);
  const isHomePage = location.pathname === "/";

  // ใช้ Layout ของ Antd เพื่อโครงสร้างที่สอดคล้องกัน
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {" "}
      {/* ครอบทั้งหมดด้วย Layout หลัก */}
      {!shouldHideNavbar && <Navbar />} {/* Navbar ควรจะเป็น Layout.Header */}
      {isHomePage ? (
        // หน้า Home มี Layout ของตัวเอง ไม่ต้องใส่ padding/margin เพิ่ม
        // ไม่ต้องครอบด้วย Layout.Content อีกชั้น ถ้า Home จัดการ Layout เอง
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      ) : (
        // ใช้ Layout.Content สำหรับหน้าอื่นๆ
        <Layout.Content
          style={{
            // เพิ่ม padding และ marginTop ถ้ามี Navbar
            padding: "24px", // ปรับ padding ตามต้องการ (เช่น 2rem หรือ 24px)
            marginTop: shouldHideNavbar ? 0 : 64, // สมมติ Navbar สูง 64px (ปรับตามความสูงจริง)
          }}
        >
          <Routes>
            {/* ไม่ต้องมี Route "/" ซ้ำที่นี่ */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/datauser" element={<DataUser />} />
            <Route path="/form/:userId" element={<FormUser />} />
            <Route path="/updatedata/:id" element={<UpdateDataInfo />} />
            {/* เพิ่ม Route อื่นๆ หรือ fallback ที่นี่ */}
          </Routes>
        </Layout.Content>
      )}
    </Layout>
  );
}

// คอมโพเนนท์ App หลัก
const App = () => (
  <BrowserRouter>
    {/* ครอบ App ทั้งหมดด้วย ConfigProvider */}
    <ConfigProvider
    // คุณสามารถใส่การตั้งค่า theme หรือ locale ที่นี่ได้ในอนาคต
    // เช่น ปรับสีหลัก:
    // theme={{
    //   token: {
    //     colorPrimary: '#1677ff', // สีฟ้า default ของ Antd v5
    //   },
    // }}
    >
      {/* ใช้ชื่อใหม่ AppContent */}
      <AppContent />
    </ConfigProvider>
  </BrowserRouter>
);

export default App;
