import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";

const pageTitles = [
  ["/", "Dashboard"],
  ["/products", "Sản phẩm"],
  ["/categories", "Danh mục"],
  ["/import-stock", "Kho hàng"],
  ["/orders", "Đơn hàng"],
  ["/customers", "Khách hàng"],
  ["/reports", "Báo cáo"],
  ["/create-order", "Tạo đơn hàng"],
];

function getPageTitle(pathname) {
  if (/^\/orders\/[^/]+$/.test(pathname)) return "Chi tiết đơn hàng";
  return pageTitles.find(([path]) => path === pathname)?.[1] || "Dashboard";
}

function AppLayout() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLogoutError("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(error.message || "Không thể đăng xuất.");
    }
  }

  return (
    <div className="app-shell">
      <Sidebar pathname={location.pathname} onLogout={handleLogout} />
      <div className="app-main">
        <Header
          title={getPageTitle(location.pathname)}
          userName={profile?.full_name || user?.email || "Tài khoản"}
          role={profile?.role}
        />
        <main className="main-content">
          {logoutError && (
            <p className="logout-error" role="alert">
              {logoutError}
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
