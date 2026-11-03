
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function CategoryPage() {
  const { profile } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  async function loadCategories() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setError("Không tải được danh mục: " + error.message);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm({ name: "", description: "" });
    setError("");
    setShowForm(true);
  }

  function openEditForm(category) {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      description: category.description || "",
    });
    setError("");
    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const name = form.name.trim();

    if (!name) {
      setError("Vui lòng nhập tên danh mục.");
      return;
    }

    const categoryData = {
      name,
      description: form.description.trim() || null,
    };

    setSaving(true);

    let result;

    if (editingId !== null) {
      result = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("categories")
        .insert([categoryData]);
    }

    setSaving(false);

    if (result.error) {
      if (result.error.code === "23505") {
        setError("Tên danh mục này đã tồn tại.");
      } else {
        setError("Không thể lưu danh mục: " + result.error.message);
      }
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", description: "" });

    await loadCategories();
  }

  async function handleDelete(category) {
    if (profile?.role !== "admin") {
      setError("Chỉ Admin mới có quyền xóa danh mục.");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục "${category.name}" không?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      setError("Xóa danh mục thất bại: " + error.message);
      return;
    }

    await loadCategories();
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(keyword.trim().toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Quản lý danh mục</h1>
          <p style={styles.subtitle}>
            Quản lý các nhóm sản phẩm trong hệ thống
          </p>
        </div>

        <div style={styles.navigation}>
          <Link to="/products">Sản phẩm</Link>
          <Link to="/">Dashboard</Link>
        </div>
      </div>

      <div style={styles.toolbar}>
        <input
          style={styles.search}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm danh mục..."
        />

        <button style={styles.addButton} onClick={openAddForm}>
          + Thêm danh mục
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2>
            {editingId !== null ? "Cập nhật danh mục" : "Thêm danh mục"}
          </h2>

          <label>Tên danh mục *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ví dụ: Điện thoại"
            required
          />

          <label>Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả danh mục..."
            rows="3"
          />

          <div style={styles.formActions}>
            <button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu danh mục"}
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
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.description || "Chưa có mô tả"}</td>
                  <td>
                    <button
                      style={styles.editButton}
                      onClick={() => openEditForm(category)}
                    >
                      Sửa
                    </button>

                    {profile?.role === "admin" && (
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDelete(category)}
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    Không tìm thấy danh mục.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <p style={styles.count}>
        Tổng số danh mục: {filteredCategories.length}
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
  },
  subtitle: {
    color: "#64748b",
  },
  navigation: {
    display: "flex",
    gap: "18px",
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

export default CategoryPage;
