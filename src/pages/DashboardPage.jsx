
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dashboard from "./Dashboard";

function DashboardPage() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div
        style={{
          padding: "12px 24px",
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div>
          <strong>{profile?.full_name || user?.email}</strong>
          <span style={{ marginLeft: "12px", color: "#64748b" }}>
            Vai trò: {profile?.role}
          </span>
        </div>

        <button onClick={handleLogout}>Đăng xuất</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <Dashboard />
    </>
  );
}

export default DashboardPage;
