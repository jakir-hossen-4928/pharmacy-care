
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart, 
  Settings, 
  LogOut,
  Home 
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const { userDetails, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (userDetails?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">
              You don't have permission to access the admin panel.
            </p>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-gray-400 text-sm mt-1">Pharmacy Care</p>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="mr-3 bg-pharmacy-primary p-2 rounded-full">
              <User size={16} />
            </div>
            <div>
              <p className="font-medium">{userDetails?.name}</p>
              <p className="text-xs text-gray-400">{userDetails?.email}</p>
            </div>
          </div>
        </div>

        <nav className="mt-4">
          <ul className="space-y-1 px-2">
            <li>
              <Link 
                to="/admin"
                className={`flex items-center p-3 rounded-md ${
                  isActive("/admin") 
                    ? "bg-pharmacy-primary text-white" 
                    : "hover:bg-gray-700"
                }`}
              >
                <BarChart size={18} className="mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/medicines"
                className={`flex items-center p-3 rounded-md ${
                  isActive("/admin/medicines") || location.pathname.includes("/admin/medicines/")
                    ? "bg-pharmacy-primary text-white" 
                    : "hover:bg-gray-700"
                }`}
              >
                <Package size={18} className="mr-3" />
                <span>Medicines</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/orders"
                className={`flex items-center p-3 rounded-md ${
                  isActive("/admin/orders") || location.pathname.includes("/admin/orders/")
                    ? "bg-pharmacy-primary text-white" 
                    : "hover:bg-gray-700"
                }`}
              >
                <ShoppingBag size={18} className="mr-3" />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/users"
                className={`flex items-center p-3 rounded-md ${
                  isActive("/admin/users") || location.pathname.includes("/admin/users/")
                    ? "bg-pharmacy-primary text-white" 
                    : "hover:bg-gray-700"
                }`}
              >
                <Users size={18} className="mr-3" />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/settings"
                className={`flex items-center p-3 rounded-md ${
                  isActive("/admin/settings") 
                    ? "bg-pharmacy-primary text-white" 
                    : "hover:bg-gray-700"
                }`}
              >
                <Settings size={18} className="mr-3" />
                <span>Settings</span>
              </Link>
            </li>
            <li className="mt-6">
              <Button
                variant="ghost"
                className="w-full justify-start p-3 rounded-md hover:bg-gray-700 text-white"
                onClick={handleLogout}
              >
                <LogOut size={18} className="mr-3" />
                <span>Logout</span>
              </Button>
            </li>
            <li>
              <Link 
                to="/"
                className="flex items-center p-3 rounded-md hover:bg-gray-700"
              >
                <Home size={18} className="mr-3" />
                <span>Back to Site</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-800">
            {location.pathname === "/admin" && "Dashboard"}
            {location.pathname === "/admin/medicines" && "Manage Medicines"}
            {location.pathname === "/admin/orders" && "Manage Orders"}
            {location.pathname === "/admin/users" && "Manage Users"}
            {location.pathname === "/admin/settings" && "Settings"}
          </h1>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
      
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default AdminLayout;
