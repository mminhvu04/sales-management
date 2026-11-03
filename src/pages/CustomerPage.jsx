
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function CustomerPage() {
  const { profile } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    phone: "",
    address: "",
  };

  const [form, setForm] = useState(emptyForm);

  async function loadCustomers() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setError("Không tải được khách hàng: " + error.message);
    } else {
      setCustomers(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!name) {
      setError("Vui lòng nhập tên khách hàng.");
      return;
    }

    // Kiểm tra định dạng số điện thoại cơ bản.
    if (phone && !/^[0-9+\s().-]{8,20}$/.test(phone)) {
      setError("Số điện thoại không hợp lệ.");
      return;
    }

    const customerData = {
      name,
      phone: phone || null,
      address: form.address.trim() || null,
    };

    setSaving(true);

    let result;

    if (editingId !== null) {
      result = await supabase
        .from("customers")
        .update(customerData)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("customers")
        .insert([customerData]);
    }

    setSaving(false);

    if (result.error) {
      setError("Lưu khách hàng thất bại: " + result.error.message);
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);

    await loadCustomers();
  }

  async function handleDelete(customer) {
    if (profile?.role !== "admin") {
      setError("Bạn không có quyền xóa khách hàng.");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa khách hàng "${customer.name}" không?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customer.id);

    if (error) {
      setError("Xóa khách hàng thất bại: " + error.message);
      return;
    }

    await loadCustomers();
  }

  const filteredCustomers = useMemo(() => {
    const searchText = keyword.trim().toLowerCase();

    if (!searchText) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.phone,
        customer.address,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      )
    );
  }, [customers, keyword]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Quản lý khách hàng</h1>
          <p style={styles.subtitle}>
            Lưu trữ và quản lý thông tin khách hàng
          </p>
        </div>

        <div style={styles.navigation}>
          <Link to="/categories">Danh mục</Link>
          <Link to="/products">Sản phẩm</Link>
          <Link to="/">Dashboard</Link>
        </div>
      </div>

      <div style={styles.toolbar}>
        <input
          style={styles.search}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên, số điện thoại hoặc địa chỉ..."
        />

        <button style={styles.addButton} onClick={openAddForm}>
          + Thêm khách hàng
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2>
            {editingId !== null
              ? "Cập nhật khách hàng"
              : "Thêm khách hàng"}
          </h2>

          <label>Họ và tên *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nhập tên khách hàng"
            required
          />

          <label>Số điện thoại</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
          />

          <label>Địa chỉ</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ khách hàng"
            rows="3"
          />

          <div style={styles.formActions}>
            <button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu khách hàng"}
            </button>

            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => setShowForm(false)}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div style={styles.tableContainer}>
        {loading ? (
          <p style={{ padding: "20px" }}>Đang tải dữ liệu...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone || "Chưa có"}</td>
                  <td>{customer.address || "Chưa có"}</td>
                  <td>
                    <button
                      style={styles.editButton}
                      onClick={() => openEditForm(customer)}
                    >
                      Sửa
                    </button>

                    {profile?.role === "admin" && (
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDelete(customer)}
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Không tìm thấy khách hàng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <p style={styles.count}>
        Tổng số khách hàng: {filteredCustomers.length}
      </p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "#f8fafc",
    color: "#1e293b",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#0f172a",
  },
  subtitle: {
    color: "#64748b",
  },
  navigation: {
    display: "flex",
    gap: "15px",
  },
  toolbar: {
    display: "flex",
    gap: "12px",
    margin: "25px 0",
    flexWrap: "wrap",
  },
  search: {
    flex: 1,
    minWidth: "220px",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
  },
  addButton: {
    padding: "12px 18px",
    background: "#2563eb",
    color: "#fff",
    border: 0,
    borderRadius: "7px",
    cursor: "pointer",
  },
  error: {
    padding: "12px",
    marginBottom: "15px",
    color: "#b91c1c",
    background: "#fee2e2",
    borderRadius: "7px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "650px",
    padding: "22px",
    marginBottom: "25px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },
  formActions: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  cancelButton: {
    background: "#64748b",
    color: "#fff",
  },
  tableContainer: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  editButton: {
    marginRight: "7px",
    padding: "7px 10px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "7px 10px",
    color: "#fff",
    background: "#dc2626",
    border: 0,
    borderRadius: "5px",
    cursor: "pointer",
  },
  count: {
    color: "#64748b",
    marginTop: "15px",
  },
};

export default CustomerPage;
