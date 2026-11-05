import {
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
  ShoppingCart,
  Users,
  ChartColumn,
  LogOut
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, end: true },
  { name: "Sản phẩm", path: "/products", icon: Package },
  { name: "Danh mục", path: "/categories", icon: Tags },
  { name: "Kho hàng", path: "/import-stock", icon: Warehouse },
  { name: "Đơn hàng", path: "/orders", icon: ShoppingCart },
  { name: "Khách hàng", path: "/customers", icon: Users },
  { name: "Báo cáo", path: "/reports", icon: ChartColumn },
];

function Sidebar({ pathname, onLogout }) {
  return (
    <aside className="sidebar">
      <NavLink className="logo" to="/" end aria-label="SalesPro, về Dashboard">
        <span className="logo-mark"><Package size={20} /></span>
        <span className="logo-name">SalesPro</span>
      </NavLink>

      <p className="menu-title">QUẢN LÝ</p>

      <nav className="sidebar-nav" aria-label="Điều hướng chính">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === "/orders"
            ? pathname.startsWith("/orders")
            : item.path === "/import-stock"
              ? pathname === item.path
              : pathname === item.path;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={`menu-item${isActive ? " active" : ""}`}
              aria-label={item.name}
              title={item.name}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <button className="menu-item logout" onClick={onLogout}>
        <LogOut size={18} aria-hidden="true" />
        <span>Đăng xuất</span>
      </button>
    </aside>
  );
}

export default Sidebar;