
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SalesChart({ data = [] }) {
  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("vi-VN") + "đ";

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value + "T00:00:00");
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  }

  return (
    <div className="chart-card">
      <h3>Biểu đồ doanh thu</h3>
      <p>Thống kê doanh thu theo ngày</p>

      {data.length === 0 ? (
        <p>Chưa có dữ liệu doanh thu.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
            />

            <YAxis
              tickFormatter={(value) =>
                `${(value / 1000000).toFixed(0)}tr`
              }
            />

            <Tooltip
              labelFormatter={(value) => formatDate(value)}
              formatter={(value) => [
                formatMoney(value),
                "Doanh thu",
              ]}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SalesChart;
