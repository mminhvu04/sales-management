
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function ImportStockPage() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    const [productResult, movementResult] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, quantity")
        .order("name"),

      supabase
        .from("stock_movements")
        .select("*")
        .eq("type", "import")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (productResult.error) {
      setError("Không tải được sản phẩm: " + productResult.error.message);
    } else {
      setProducts(productResult.data || []);
    }

    if (movementResult.error) {
      setError(
        "Không tải được lịch sử nhập kho: " +
        movementResult.error.message
      );
    } else {
      setMovements(movementResult.data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleImport(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const id = Number(productId);
    const amount = Number(quantity);

    if (!Number.isInteger(id) || id <= 0) {
      setError("Vui lòng chọn sản phẩm.");
      return;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Số lượng nhập phải là số nguyên lớn hơn 0.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase.rpc("import_stock", {
      p_product_id: id,
      p_quantity: amount,
      p_note: note.trim() || null,
    });

    setSaving(false);

    if (error) {
      setError("Nhập kho thất bại: " + error.message);
      return;
    }

    setMessage(
      `Nhập kho thành công! Tồn kho: ${data.old_quantity} → ${data.new_quantity}.`
    );

    setQuantity("1");
    setNote("");

    await loadData();
  }

  const productName = (id) =>
    products.find((product) => product.id === id)?.name ||
    `Sản phẩm #${id}`;

  function formatDate(value) {
    return new Date(value).toLocaleString("vi-VN");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Quản lý nhập kho</h1>
          <p style={styles.subtitle}>
            Nhập hàng và theo dõi lịch sử biến động kho
          </p>
        </div>

        <nav style={styles.nav}>
          <Link to="/products">Sản phẩm</Link>
          <Link to="/customers">Khách hàng</Link>
          <Link to="/">Dashboard</Link>
        </nav>
      </header>

      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.success}>{message}</div>}

      <form onSubmit={handleImport} style={styles.form}>
        <h2>Phiếu nhập kho</h2>

        <label>Sản phẩm</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} (Tồn kho: {product.quantity})
            </option>
          ))}
        </select>

        <label>Số lượng nhập</label>
        <input
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <label>Ghi chú</label>
        <textarea
          rows="3"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Nhập hàng từ nhà cung cấp..."
        />

        <button type="submit" disabled={saving || loading}>
          {saving ? "Đang xử lý..." : "Xác nhận nhập kho"}
        </button>
      </form>

      <section style={styles.section}>
        <h2>Lịch sử nhập kho</h2>

        <div style={styles.tableContainer}>
          {loading ? (
            <p style={{ padding: "15px" }}>Đang tải dữ liệu...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Ghi chú</th>
                  <th>Thời gian</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.id}</td>
                    <td>{productName(movement.product_id)}</td>
                    <td>+{movement.quantity}</td>
                    <td>{movement.note || "Không có ghi chú"}</td>
                    <td>{formatDate(movement.created_at)}</td>
                  </tr>
                ))}

                {movements.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      Chưa có lịch sử nhập kho.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
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
    color: "#0f172a",
    fontSize: "28px",
  },
  subtitle: {
    color: "#64748b",
  },
  nav: {
    display: "flex",
    gap: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "650px",
    padding: "22px",
    marginTop: "25px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },
  section: {
    marginTop: "35px",
  },
  tableContainer: {
    overflowX: "auto",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  error: {
    padding: "12px",
    marginTop: "15px",
    color: "#b91c1c",
    background: "#fee2e2",
    borderRadius: "7px",
  },
  success: {
    padding: "12px",
    marginTop: "15px",
    color: "#166534",
    background: "#dcfce7",
    borderRadius: "7px",
  },
};

export default ImportStockPage;
