import { Navigate, Outlet } from "react-router-dom";
import { useCurrentApp } from "@/components/context/app.context";

const AdminGuard = () => {
    const { user } = useCurrentApp();

    // Chưa đăng nhập → đá về login
    if (!user?._id) return <Navigate to="/login" replace />;

    // Không phải SUPER_ADMIN → đá về trang chủ
    if (user.role?.name !== "SUPER_ADMIN") {
        return <Navigate to="/" replace />;
    }

    // Đúng quyền → cho phép vào admin
    return <Outlet />;
};

export default AdminGuard;
