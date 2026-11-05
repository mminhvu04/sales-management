import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle
} from "lucide-react";

const icons = {
  revenue: TrendingUp,
  orders: ShoppingCart,
  products: Package,
  warning: AlertTriangle
};

function StatCard({ title, value, type, description }) {

  const Icon = icons[type];

  return (
    <div className={`stat-card stat-card-${type}`}>

      <div className="stat-info">
        <p>{title}</p>

        <h2>{value}</h2>

        <small>{description}</small>
      </div>

      <div className="stat-icon">
        <Icon size={26} />
      </div>

    </div>
  );
}

export default StatCard;