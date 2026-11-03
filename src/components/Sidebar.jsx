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

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Sản phẩm",
    icon: Package
  },
  {
    name: "Danh mục",
    icon: Tags
  },
  {
    name: "Kho hàng",
    icon: Warehouse
  },
  {
    name: "Đơn hàng",
    icon: ShoppingCart
  },
  {
    name: "Khách hàng",
    icon: Users
  },
  {
    name: "Báo cáo",
    icon: ChartColumn
  }
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">

      <div className="logo">
        <Package size={28} />
        <h2>SalesPro</h2>
      </div>

      <p className="menu-title">MENU</p>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={
                activePage === item.name
                  ? "menu-item active"
                  : "menu-item"
              }
              onClick={() => setActivePage(item.name)}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <button className="menu-item logout">
        <LogOut size={20} />
        <span>Đăng xuất</span>
      </button>

    </aside>
  );
}

export default Sidebar;