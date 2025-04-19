
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import PublicLayout from "@/components/layout/PublicLayout";
import UserLayout from "@/components/layout/UserLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Public Pages
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import CategoryPage from "@/pages/CategoryPage";
import SearchResults from "@/pages/SearchResults";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";

// Auth Pages
import Login from "@/pages/auth/Login";
import SignUp from "@/pages/auth/SignUp";
import ResetPassword from "@/pages/auth/ResetPassword";
import Unauthorized from "@/pages/auth/Unauthorized";

// Protected Routes
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AdminRoute from "@/components/common/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/category/:categoryId/:subcategory" element={<CategoryPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* User Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }>
                <Route index element={<div>User Dashboard</div>} />
                <Route path="orders" element={<div>My Orders</div>} />
                <Route path="profile" element={<div>Profile</div>} />
                <Route path="change-password" element={<div>Change Password</div>} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<div>Admin Dashboard</div>} />
                <Route path="medicines" element={<div>Manage Medicines</div>} />
                <Route path="orders" element={<div>Manage Orders</div>} />
                <Route path="users" element={<div>Manage Users</div>} />
                <Route path="settings" element={<div>Settings</div>} />
              </Route>

              {/* Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
