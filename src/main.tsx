import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Layout from '@/layout';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import AboutPage from 'pages/client/about';
import LoginPage from 'pages/client/auth/login';
import RegisterPage from 'pages/client/auth/register';
import 'styles/global.scss'
import HomePage from 'pages/client/home';

import { App, ConfigProvider } from 'antd';
import { AppProvider } from 'components/context/app.context';
import ProtectedRoute from '@/components/auth';

import DashBoardPage from 'pages/admin/dashboard';
import ManageOrderPage from 'pages/admin/manage.order';
import ManageUserPage from 'pages/admin/manage.user';
import LayoutAdmin from 'components/layout/layout.admin';
import OrderPage from 'pages/client/order';
import HistoryPage from 'pages/client/history';

import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';

import ManageProductPage from './pages/admin/manage.product';
import ProductPage from './pages/client/product';
import ManageCategoryPage from './pages/admin/manage.category';
import Showroom from './pages/client/showroom';
import ContactInfo from './pages/client/lienhe';

import ChatWidget from './components/chat/ChatWidget';
import AdminChatPage from './pages/admin/AdminChatPage';

// ⭐⭐ Guard mới — bảo vệ quyền SUPER_ADMIN
import AdminGuard from "@/components/auth/AdminGuard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/Product/:id", element: <ProductPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/showroom", element: <Showroom /> },
      { path: "/lienhe", element: <ContactInfo /> },

      {
        path: "/order",
        element: (
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        )
      },

      {
        path: "/history",
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      }
    ]
  },

  // ⭐⭐⭐ PHẦN ADMIN — CHỈ SUPER_ADMIN được vào
  {
    path: "/admin",
    element: <AdminGuard />,   // ✔ Bảo vệ toàn bộ admin
    children: [
      {
        path: "",
        element: <LayoutAdmin />,
        children: [
          { index: true, element: <DashBoardPage /> },
          { path: "product", element: <ManageProductPage /> },
          { path: "category", element: <ManageCategoryPage /> },
          { path: "order", element: <ManageOrderPage /> },
          { path: "user", element: <ManageUserPage /> },
          { path: "chat", element: <AdminChatPage /> },
        ]
      }
    ]
  },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <AppProvider>
        <ConfigProvider locale={enUS}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </AppProvider>
    </App>
  </StrictMode>,
);
