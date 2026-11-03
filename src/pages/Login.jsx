
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1>Sales Management</h1>
        <p>Đăng nhập vào hệ thống quản lý bán hàng</p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email"
          required
        />

        <label>Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          required
        />

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f1f5f9",
    padding: "20px",
  },
  form: {
    width: "100%",
    maxWidth: "400px",
    padding: "32px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  error: {
    color: "#dc2626",
    background: "#fee2e2",
    padding: "10px",
    borderRadius: "6px",
  },
};

export default Login;
