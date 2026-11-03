
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import DashboardPage from "./pages/DashboardPage";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import CustomerPage from "./pages/CustomerPage";
import ImportStockPage from "./pages/ImportStockPage";
import OrdersPage from "./pages/OrdersPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import OrderDetailPage from "./pages/OrderDetailPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
  path="/products"
  element={
    <ProtectedRoute>
      <ProductPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/categories"
  element={
    <ProtectedRoute>
      <CategoryPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/customers"
  element={
    <ProtectedRoute>
      <CustomerPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/import-stock"
  element={
    <ProtectedRoute>
      <ImportStockPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/orders"
  element={
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/create-order"
  element={
    <ProtectedRoute>
      <CreateOrderPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/orders/:id"
  element={
    <ProtectedRoute>
      <OrderDetailPage />
    </ProtectedRoute>
  }
/>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <h1>Khu vực quản trị Admin</h1>
              </ProtectedRoute>
            }
          />
          
          

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
