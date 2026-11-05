
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
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

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="customers" element={<CustomerPage />} />
            <Route path="import-stock" element={<ImportStockPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="create-order" element={<CreateOrderPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="reports" element={<DashboardPage />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <h1>Khu vực quản trị Admin</h1>
                </ProtectedRoute>
              }
            />
          </Route>
          
          

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
