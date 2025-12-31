import { Outlet } from "react-router-dom";
import AppHeader from "./components/layout/app.header";
import { useState } from "react";
import AppFooter from "./components/layout/app.footer";
import ChatWidget from "./components/chat/ChatWidget";
import ScrollToTop from "./components/ScrollToTop";
import StickySocial from "./components/StickySocial";

function Layout() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  return (
    <div>
      <ScrollToTop />   {/* 👈 MỖI lần đổi route sẽ scroll lên đầu */}
      <AppHeader
      />
      <Outlet context={[searchTerm, setSearchTerm]} />
      <AppFooter />
      {/* <ChatBox /> */}
      <ChatWidget />
      {/* 🔥 Nút floating cố định toàn trang */}
      <StickySocial />
    </div>
  )
}

export default Layout;
