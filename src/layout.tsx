import { Outlet } from "react-router-dom";
import AppHeader from "./components/layout/app.header";
import { useState } from "react";
import AppFooter from "./components/layout/app.footer";
import ChatWidget from "./components/chat/ChatWidget";

function Layout() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  return (
    <div>
      <AppHeader
      />
      <Outlet context={[searchTerm, setSearchTerm]} />
      <AppFooter />
      {/* <ChatBox /> */}
      <ChatWidget />
    </div>
  )
}

export default Layout;
