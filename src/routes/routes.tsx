// routes.tsx

import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts (Lazy Loaded)
const PublicLayout = lazy(() => import('@/layout/PublicLayout'));
const UserLayout = lazy(() => import('@/layout/UserLayout'));
const AdminLayout = lazy(() => import('@/layout/AdminLayout'));

// Public Pages (Lazy Loaded)
const Home = lazy(() => import('@/pages/Home'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const SearchResults = lazy(() => import('@/pages/SearchResults'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));

// Auth Pages (Lazy Loaded)
const Login = lazy(() => import('@/authentication/Login'));
const SignUp = lazy(() => import('@/authentication/SignUp'));
const ResetPassword = lazy(() => import('@/authentication/ResetPassword'));
const Unauthorized = lazy(() => import('@/authentication/Unauthorized'));

// Protected Routes (Lazy Loaded)
const ProtectedRoute = lazy(() => import('@/routes/ProtectedRoute'));
const AdminRoute = lazy(() => import('@/routes/AdminRoute'));

// Admin Dashboard (Lazy Loaded)
const AdminDashboardOverview = lazy(() => import('@/admindashboar/admindashboaroverview/AdminDashboardOverview'));
const ProductManegment = lazy(() => import('@/admindashboar/productManegment/ProductManegment'));
const AddNewProduct = lazy(() => import('@/admindashboar/addnewproduct/AddNewProduct'));
const OrdersManegment = lazy(() => import('@/admindashboar/ordermanegment/OrdersManegment'));
const UsersManegment = lazy(() => import('@/admindashboar/usersmanegment/UsersManegment'));
const Settings = lazy(() => import('@/admindashboar/settings/Settings')); // Corrected to import Settings.tsx

// User Dashboard (Lazy Loaded)
const UserDashboardOverview = lazy(() => import('@/userdashboard/userdashboardoverview/UserDashboardOverview'));
const UserOrders = lazy(() => import('@/userdashboard/usersorders/UserOrders'));
const UserProfile = lazy(() => import('@/userdashboard/userprofile/UserProfile'));
const ChangePassword = lazy(() => import('@/userdashboard/changepassword/ChangePassword'));

const AppRoutes = () => {
  return (
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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboardOverview />} />
        <Route path="orders" element={<UserOrders />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardOverview />} />
        <Route path="medicines" element={<ProductManegment />} />
        <Route path="add-medicines" element={<AddNewProduct />} />
        <Route path="orders" element={<OrdersManegment />} />
        <Route path="users" element={<UsersManegment />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;