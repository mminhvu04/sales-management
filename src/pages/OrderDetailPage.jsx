
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      setError("Mã đơn hàng không hợp lệ.");
      setLoading(false);
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      setError("Không tải được đơn hàng: " + orderError.message);
      setLoading(false);
      return;
    }

    const { data: itemData, error: itemError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("id");

    if (itemError) {
      setError("Không tải được chi tiết đơn: " + itemError.message);
      setLoading(false);
      return;
    }

    setOrder(orderData);
    setItems(itemData || []);

    if (orderData.customer_id) {
      const { data: customerData } = await supabase
        .from("customers")
        .select("id, name, phone, address")
        .eq("id", orderData.customer_id)
        .maybeSingle();

      setCustomer(customerData || null);
    } else {
      setCustomer(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleCancel() {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn hủy đơn hàng này? Tồn kho sẽ được hoàn lại."
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setMessage("");

    const { data, error: rpcError } = await supabase.rpc(
      "cancel_sale_order",
      {
        p_order_id: Number(id),
      }
    );

    setSaving(false);

    if (rpcError) {
      setError("Không thể hủy đơn: " + rpcError.message);
      return;
    }

    if (!data?.success) {
      setError("Không nhận được xác nhận hủy đơn từ Database.");
      return;
    }

    setMessage("Đã hủy đơn hàng và hoàn lại tồn kho.");
    await loadData();
  }

  function formatMoney(value) {
    return Number(value).toLocaleString("vi-VN") + " đ";
  }

  function formatDate(value) {
    return new Date(value).toLocaleString("vi-VN");
  }

  const statusLabels = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };

  if (loading) {
    return <div style={styles.page}>Đang tải đơn hàng...</div>;
  }

  if (!order) {
    return (
      <div style={styles.page}>
        <p>{error || "Không tìm thấy đơn hàng."}</p>
        <Link to="/orders">Quay lại danh sách đơn</Link>
      </div>
    );
  }

  const canCancel = ["pending", "processing"].includes(order.status);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={{ color: "#080808" }}>Chi tiết đơn hàng #{order.id}</h1>
          <p>Ngày tạo: {formatDate(order.created_at)}</p>
        </div>

        <Link to="/orders">← Danh sách đơn hàng</Link>
      </header>

      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.success}>{message}</div>}

      <section style={styles.card}>
        <h2 style={{ color: "#080808" }}>Thông tin đơn hàng</h2>

        <p>
          <strong>Khách hàng:</strong>{" "}
          {customer?.name || "Khách lẻ"}
        </p>

        {customer?.phone && (
          <p>
            <strong>Số điện thoại:</strong> {customer.phone}
          </p>
        )}

        {customer?.address && (
          <p>
            <strong>Địa chỉ:</strong> {customer.address}
          </p>
        )}

        <p>
          <strong>Trạng thái:</strong>{" "}
          {statusLabels[order.status] || order.status}
        </p>

        <p>
          <strong>Tổng tiền:</strong>{" "}
          {formatMoney(order.total_amount)}
        </p>
      </section>

      <section style={styles.card}>
        <h2>Sản phẩm trong đơn</h2>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Mã sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_id}</td>
                  <td>{item.quantity}</td>
                  <td>{formatMoney(item.unit_price)}</td>
                  <td>{formatMoney(item.subtotal)}</td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    Đơn hàng chưa có chi tiết sản phẩm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {canCancel && (
        <button
          type="button"
          disabled={saving}
          style={styles.cancelButton}
          onClick={handleCancel}
        >
          {saving ? "Đang hủy..." : "Hủy đơn hàng và hoàn kho"}
        </button>
      )}
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
  card: {
    padding: "22px",
    marginBottom: "20px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  cancelButton: {
    padding: "12px 18px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
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
  success: {
    padding: "12px",
    marginBottom: "15px",
    color: "#166534",
    background: "#dcfce7",
    borderRadius: "7px",
  },
};

export default OrderDetailPage;
