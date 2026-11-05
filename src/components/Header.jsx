import {
  Search,
  Bell,
  UserCircle
} from "lucide-react";

function Header({ title, userName, role }) {
  return (
    <header className="header">
      <div className="header-title">
        <h2>{title}</h2>
        <p>Không gian quản lý bán hàng</p>
      </div>

      <div className="header-right">
        <label className="search-box">
          <Search size={17} aria-hidden="true" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            aria-label="Tìm kiếm"
          />
        </label>

        <button className="notification" type="button" aria-label="Thông báo">
          <Bell size={19} aria-hidden="true" />
          <span className="notification-dot" />
        </button>

        <div className="user-profile">
          <span className="user-avatar"><UserCircle size={23} aria-hidden="true" /></span>
          <div>
            <strong>{userName}</strong>
            <small>{role === "admin" ? "Quản trị viên" : role || "Nhân viên"}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;