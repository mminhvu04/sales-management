
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import StatCard from "../components/StatCard";
import SalesChart from "../components/SalesChart";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [
        statsResult,
        ordersCountResult,
        productsCountResult,
        recentOrdersResult,
      ] = await Promise.all([
        supabase.rpc("get_dashboard_stats"),

        supabase
          .from("orders")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("products")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("orders")
          .select(`
            id,
            customer_id,
            total_amount,
            status,
            created_at,
            customers(name)
          `)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (statsResult.error) throw statsResult.error;
      if (ordersCountResult.error) throw ordersCountResult.error;
      if (productsCountResult.error) throw productsCountResult.error;
      if (recentOrdersResult.error) throw recentOrdersResult.error;

      setStats(statsResult.data || {});
      setTotalOrders(ordersCountResult.count || 0);
      setTotalProducts(productsCountResult.count || 0);
      setRecentOrders(recentOrdersResult.data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Không tải được dữ liệu Dashboard: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function formatMoney(value) {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  }

  function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString("vi-VN");
  }

  function getCustomerName(order) {
    const customer = order.customers;

    if (Array.isArray(customer)) {
      return customer[0]?.name || "Khách lẻ";
    }

    return customer?.name || "Khách lẻ";
  }

  function getStatusLabel(status) {
    const labels = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };

    return labels[status] || status;
  }

  const chartData = (stats?.revenue_by_day || []).map((item) => ({
    date: item.date,
    revenue: Number(item.revenue || 0),
  }));

  const topProducts = stats?.top_products || [];
  const lowStockProducts = stats?.low_stock_products || [];

  if (loading) {
    return <div className="dashboard">Đang tải dữ liệu thống kê...</div>;
  }

  return (
    <div className="dashboard">
      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            color: "#b91c1c",
            background: "#fee2e2",
            borderRadius: "8px",
          }}
        >
          {error}
          <button onClick={loadDashboard} style={{ marginLeft: "12px" }}>
            Thử lại
          </button>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Tổng doanh thu"
          value={formatMoney(stats?.total_revenue)}
          type="revenue"
          description="Theo dữ liệu thống kê"
        />

        <StatCard
          title="Tổng đơn hàng"
          value={totalOrders.toLocaleString("vi-VN")}
          type="orders"
          description="Tất cả trạng thái"
        />

        <StatCard
          title="Tổng sản phẩm"
          value={totalProducts.toLocaleString("vi-VN")}
          type="products"
          description="Sản phẩm đang quản lý"
        />

        <StatCard
          title="Sắp hết hàng"
          value={Number(stats?.low_stock_count || 0).toLocaleString("vi-VN")}
          type="warning"
          description="Cần kiểm tra tồn kho"
        />
      </div>

      <SalesChart data={chartData} />

      <div className="table-card">
        <h3>Đơn hàng gần đây</h3>

        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày tạo</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{getCustomerName(order)}</td>
                <td>{formatDate(order.created_at)}</td>
                <td>{formatMoney(order.total_amount)}</td>
                <td>
                  <span className="status">
                    {getStatusLabel(order.status)}
                  </span>
                </td>
              </tr>
            ))}

            {recentOrders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Chưa có đơn hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <h3>Sản phẩm bán chạy</h3>

        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng đã bán</th>
            </tr>
          </thead>

          <tbody>
            {topProducts.map((product) => (
              <tr key={product.product_id}>
                <td>{product.name}</td>
                <td>{product.total_sold}</td>
              </tr>
            ))}

            {topProducts.length === 0 && (
              <tr>
                <td colSpan="2" style={{ textAlign: "center" }}>
                  Chưa có dữ liệu bán hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <h3>Sản phẩm sắp hết hàng</h3>

        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng tồn</th>
            </tr>
          </thead>

          <tbody>
            {lowStockProducts.map((product) => (
              <tr key={product.product_id}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
              </tr>
            ))}

            {lowStockProducts.length === 0 && (
              <tr>
                <td colSpan="2" style={{ textAlign: "center" }}>
                  Không có sản phẩm sắp hết hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
