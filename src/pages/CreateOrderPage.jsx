
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function CreateOrderPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [customerResult, productResult] = await Promise.all([
        supabase
          .from("customers")
          .select("id, name, phone")
          .order("name"),

        supabase
          .from("products")
          .select("id, name, price, quantity")
          .order("name"),
      ]);

      if (customerResult.error || productResult.error) {
        setError(
          customerResult.error?.message ||
          productResult.error?.message ||
          "Không tải được dữ liệu."
        );
      } else {
        setCustomers(customerResult.data || []);
        setProducts(productResult.data || []);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  // Tổng tiền hiển thị trên giao diện.
  // Database vẫn tự lấy lại giá khi tạo đơn.
  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }, [cart]);

  function addProduct(productId) {
    const product = products.find(
      (item) => item.id === Number(productId)
    );

    if (!product) return;

    if (product.quantity <= 0) {
      setError("Sản phẩm đã hết hàng.");
      return;
    }

    setError("");

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        if (existing.quantity >= product.quantity) {
          setError("Số lượng vượt quá tồn kho.");
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          stock: product.quantity,
          quantity: 1,
        },
      ];
    });
  }

  function changeQuantity(productId, value) {
    const amount = Number(value);

    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Số lượng phải là số nguyên lớn hơn 0.");
      return;
    }

    const product = cart.find((item) => item.id === productId);

    if (!product) return;

    if (amount > product.stock) {
      setError(`Sản phẩm ${product.name} chỉ còn ${product.stock}.`);
      return;
    }

    setError("");

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: amount }
          : item
      )
    );
  }

  function removeProduct(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
    setError("");
  }

  function formatMoney(value) {
    return Number(value).toLocaleString("vi-VN") + " đ";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Bạn cần thêm ít nhất một sản phẩm.");
      return;
    }

    setSaving(true);

    const { data, error: rpcError } = await supabase.rpc(
      "create_sale_order",
      {
        p_customer_id: customerId ? Number(customerId) : null,
        p_items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      }
    );

    setSaving(false);

    if (rpcError) {
      setError("Không thể tạo đơn hàng: " + rpcError.message);
      return;
    }

    if (!data?.success || !data?.order_id) {
      setError("Database không trả về thông tin đơn hàng hợp lệ.");
      return;
    }

    navigate(`/orders/${data.order_id}`);
  }

  if (loading) {
    return <div style={styles.page}>Đang tải dữ liệu...</div>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Tạo đơn hàng</h1>
          <p style={styles.subtitle}>
            Chọn khách hàng và sản phẩm cần bán
          </p>
        </div>

        <Link to="/orders">← Danh sách đơn hàng</Link>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <section style={styles.card}>
          <h2>1. Thông tin khách hàng</h2>

          <label>Khách hàng</label>
          <select
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
          >
            <option value="">Khách lẻ / Không chọn khách hàng</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
                {customer.phone ? ` - ${customer.phone}` : ""}
              </option>
            ))}
          </select>
        </section>

        <section style={styles.card}>
          <h2>2. Thêm sản phẩm</h2>

          <div style={styles.productGrid}>
            {products.map((product) => (
              <div key={product.id} style={styles.productCard}>
                <strong>{product.name}</strong>

                <p>Giá: {formatMoney(product.price)}</p>
                <p>Tồn kho: {product.quantity}</p>

                <button
                  type="button"
                  disabled={product.quantity <= 0}
                  onClick={() => addProduct(product.id)}
                >
                  + Thêm vào đơn
                </button>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <h2>3. Chi tiết đơn hàng</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{formatMoney(item.price)}</td>
                    <td>
                      <input
                        style={styles.quantityInput}
                        type="number"
                        min="1"
                        max={item.stock}
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          changeQuantity(item.id, event.target.value)
                        }
                      />
                    </td>
                    <td>
                      {formatMoney(item.price * item.quantity)}
                    </td>
                    <td>
                      <button
                        type="button"
                        style={styles.removeButton}
                        onClick={() => removeProduct(item.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {cart.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      Chưa có sản phẩm trong đơn hàng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={styles.total}>
            Tổng tiền: {formatMoney(totalAmount)}
          </div>

          <button
            type="submit"
            disabled={saving || cart.length === 0}
          >
            {saving ? "Đang tạo đơn..." : "Xác nhận tạo đơn hàng"}
          </button>
        </section>
      </form>
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
    marginBottom: "25px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
  },
  subtitle: {
    color: "#64748b",
  },
  card: {
    background: "#fff",
    padding: "22px",
    marginBottom: "22px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: "15px",
  },
  productCard: {
    padding: "15px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  quantityInput: {
    width: "75px",
    padding: "7px",
  },
  total: {
    textAlign: "right",
    fontSize: "22px",
    fontWeight: "bold",
    margin: "20px 0",
  },
  error: {
    padding: "12px",
    marginBottom: "15px",
    color: "#b91c1c",
    background: "#fee2e2",
    borderRadius: "7px",
  },
  removeButton: {
    background: "#dc2626",
    color: "#fff",
  },
};

export default CreateOrderPage;
