
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingOrderId, setSavingOrderId] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");

    const [orderResult, customerResult] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("customers")
        .select("id, name"),
    ]);

    if (orderResult.error) {
      setError("Không tải được đơn hàng: " + orderResult.error.message);
    } else {
      setOrders(orderResult.data || []);
    }

    if (customerResult.error) {
      setError("Không tải được khách hàng: " + customerResult.error.message);
    } else {
      setCustomers(customerResult.data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders =
    status === "all"
      ? orders
      : orders.filter((order) => order.status === status);

  function customerName(id) {
    if (!id) return "Khách lẻ";

    return (
      customers.find((customer) => customer.id === id)?.name ||
      `Khách hàng #${id}`
    );
  }
async function handleChangeStatus(order, nextStatus) {
  const actionName =
    nextStatus === "processing"
      ? "xác nhận xử lý"
      : "hoàn thành";

  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn ${actionName} đơn hàng #${order.id}?`
  );

  if (!confirmed) return;

  setSavingOrderId(order.id);
  setError("");

  const { data, error } = await supabase.rpc(
    "change_order_status",
    {
      p_order_id: order.id,
      p_new_status: nextStatus,
    }
  );

  setSavingOrderId(null);

  if (error) {
    setError("Không thể cập nhật trạng thái: " + error.message);
    return;
  }

  if (!data?.success) {
    setError("Database chưa xác nhận cập nhật trạng thái.");
    return;
  }

  await loadData();
}
  function formatMoney(value) {
    return Number(value).toLocaleString("vi-VN") + " đ";
  }

  function formatDate(value) {
    return new Date(value).toLocaleString("vi-VN");
  }

  function statusLabel(value) {
    const labels = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };

    return labels[value] || value;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.subtitle}>
            Theo dõi và quản lý các đơn bán hàng
          </p>
        </div>

        <nav style={styles.nav}>
          <Link to="/create-order">+ Tạo đơn hàng</Link>
        </nav>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <section style={styles.card}>
        <div style={styles.filter}>
          <label>Lọc trạng thái:</label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">Tất cả đơn hàng</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <button type="button" onClick={loadData}>
            Làm mới
          </button>
        </div>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày tạo</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{customerName(order.customer_id)}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>{formatMoney(order.total_amount)}</td>
                    <td>{statusLabel(order.status)}</td>
                    <td>
                      <Link to={`/orders/${order.id}`}>
                        Xem chi tiết
                      </Link>
                    </td>
                    <td>
  {order.status === "pending" && (
    <button
      disabled={savingOrderId === order.id}
      onClick={() =>
        handleChangeStatus(order, "processing")
      }
    >
      {savingOrderId === order.id
        ? "Đang xử lý..."
        : "Xác nhận đơn"}
    </button>
  )}

  {order.status === "processing" && (
    <button
      disabled={savingOrderId === order.id}
      onClick={() =>
        handleChangeStatus(order, "completed")
      }
    >
      {savingOrderId === order.id
        ? "Đang xử lý..."
        : "Hoàn thành"}
    </button>
  )}

  {["completed", "cancelled"].includes(order.status) && (
    <span>Không còn thao tác</span>
  )}
</td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p style={styles.count}>
          Tổng số đơn hiển thị: {filteredOrders.length}
        </p>
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
    marginBottom: "25px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
  },
  subtitle: {
    color: "#64748b",
  },
  nav: {
    display: "flex",
    gap: "18px",
  },
  card: {
    padding: "22px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },
  filter: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  count: {
    color: "#64748b",
    marginTop: "20px",
  },
  error: {
    padding: "12px",
    marginBottom: "15px",
    color: "#b91c1c",
    background: "#fee2e2",
    borderRadius: "7px",
  },
};

export default OrdersPage;
