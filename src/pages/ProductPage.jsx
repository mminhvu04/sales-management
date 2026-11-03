
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function ProductPage() {
  const { profile } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    category_id: "",
    price: "",
    quantity: "",
    description: "",
    image_url: "",
  };

  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    setLoading(true);
    setError("");

    const [productResult, categoryResult] = await Promise.all([
      supabase.from("products").select("*").order("id", {
        ascending: false,
      }),
      supabase.from("categories").select("id, name").order("name"),
    ]);

    if (productResult.error) {
      setError("Không tải được sản phẩm: " + productResult.error.message);
    } else {
      setProducts(productResult.data || []);
    }

    if (categoryResult.error) {
      setError(
        "Không tải được danh mục: " + categoryResult.error.message
      );
    } else {
      setCategories(categoryResult.data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
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

  function openEditForm(product) {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      category_id: product.category_id
        ? String(product.category_id)
        : "",
      price: String(product.price ?? ""),
      quantity: String(product.quantity ?? ""),
      description: product.description || "",
      image_url: product.image_url || "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Giá sản phẩm không hợp lệ.");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Số lượng phải là số nguyên không âm.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      category_id: form.category_id
        ? Number(form.category_id)
        : null,
      price,
      quantity,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);

    let result;

    if (editingId !== null) {
      result = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("products")
        .insert([productData]);
    }

    setSaving(false);

    if (result.error) {
      setError("Lưu sản phẩm thất bại: " + result.error.message);
      return;
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    await loadData();
  }

  async function handleDelete(product) {
    if (profile?.role !== "admin") {
      setError("Bạn không có quyền xóa sản phẩm.");
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setError("Xóa sản phẩm thất bại: " + error.message);
      return;
    }

    await loadData();
  }

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((product) =>
      product.name.toLowerCase().includes(keyword)
    );
  }, [products, search]);

  function formatPrice(value) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={{ ...styles.title, color: "#000000" }}>Quản lý sản phẩm</h1>
          <p style={styles.subtitle}>
            Quản lý danh sách và số lượng hàng hóa
          </p>
        </div>

        <Link to="/" style={styles.backLink}>
          ← Dashboard
        </Link>
      </div>

      <div style={styles.toolbar}>
        <input
          style={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tên sản phẩm..."
        />

        <button style={styles.addButton} onClick={openAddForm}>
          + Thêm sản phẩm
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2>
            {editingId !== null ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
          </h2>

          <label>Tên sản phẩm *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ví dụ: iPhone 16"
            required
          />

          <label>Danh mục</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <div style={styles.twoColumns}>
            <div>
              <label>Giá bán (VNĐ) *</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Số lượng *</label>
              <input
                type="number"
                name="quantity"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label>Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
          />

          <label>Đường dẫn hình ảnh</label>
          <input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://..."
          />

          <div style={styles.formActions}>
            <button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={styles.cancelButton}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div style={styles.tableContainer}>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Số lượng</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const category = categories.find(
                  (item) => item.id === product.category_id
                );

                return (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{category?.name || "Chưa phân loại"}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{product.quantity}</td>
                    <td>
                      <button
                        onClick={() => openEditForm(product)}
                        style={styles.editButton}
                      >
                        Sửa
                      </button>

                      {profile?.role === "admin" && (
                        <button
                          onClick={() => handleDelete(product)}
                          style={styles.deleteButton}
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    Không tìm thấy sản phẩm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <p style={styles.count}>
        Tổng số sản phẩm: {filteredProducts.length}
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
  backLink: {
    color: "#2563eb",
    textDecoration: "none",
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
  twoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
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

export default ProductPage;
