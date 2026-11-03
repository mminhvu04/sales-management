import {
  Search,
  Bell,
  UserCircle
} from "lucide-react";

function Header({ title }) {

  return (
    <header className="header">

      <div>
        <h2>{title}</h2>
        <p>Quản lý hoạt động cửa hàng</p>
      </div>

      <div className="header-right">

        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Tìm kiếm..."
          />
        </div>

        <button className="notification">
          <Bell size={22} />
        </button>

        <div className="user-profile">
          <UserCircle size={35} />

          <div>
            <strong>Admin</strong>
            <small>Quản trị viên</small>
          </div>
        </div>

      </div>

    </header>
  );
}

export default Header;