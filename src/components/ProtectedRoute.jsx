
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading, profileError } = useAuth();

  if (loading) {
    return <p style={{ padding: "30px" }}>Đang kiểm tra đăng nhập...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profileError || !profile) {
    return (
      <div style={{ padding: "30px", color: "red" }}>
        Không thể tải hồ sơ người dùng: {profileError || "Thiếu profile"}
      </div>
    );
  }

  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
