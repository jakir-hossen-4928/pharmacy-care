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
  Home,
  Menu,
  X
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

const AdminLayout = () => {
  const { userDetails, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.includes(path + "/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebarOnOutsideClick = (event) => {
    if (
      isSidebarOpen &&
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target)
    ) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener("mousedown", closeSidebarOnOutsideClick);
      document.addEventListener("touchstart", closeSidebarOnOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", closeSidebarOnOutsideClick);
      document.removeEventListener("touchstart", closeSidebarOnOutsideClick);
    };
  }, [isSidebarOpen]);

  if (userDetails?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel.
          </p>
          <Button onClick={() => navigate("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const currentRouteName = () => {
    if (location.pathname === "/admin") return "Dashboard";
    if (location.pathname.includes("/admin/medicines")) return "Manage Medicines";
    if (location.pathname.includes("/admin/add-medicines")) return "Add New Medicine";
    if (location.pathname.includes("/admin/orders")) return "Manage Orders";
    if (location.pathname.includes("/admin/users")) return "Manage Users";
    if (location.pathname.includes("/admin/settings")) return "Settings";
    return "";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Header with Menu and Logout */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm h-16 flex items-center justify-between px-4 z-50">
        <Button
 variant="ghost"
 className="p-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center space-x-2 transition-colors duration-200"
 onClick={toggleSidebar}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          <span className="text-gray-800 font-semibold truncate">{currentRouteName()}</span>
        </Button>
        <Button
          variant="ghost"
          className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          onClick={handleLogout}
        >
          <LogOut size={24} />
        </Button>
      </header>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 lg:static lg:w-64 flex flex-col shadow-lg pt-16 lg:pt-0`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-center">Admin Panel</h2>
          <p className="text-gray-400 text-sm text-center mt-1">Pharmacy Care</p>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-center">
            <div className="mr-3 bg-pharmacy-primary p-2 rounded-full">
              <User size={16} />
            </div>
            <div className="text-center">
              <p className="font-medium truncate max-w-[150px]">{userDetails?.name}</p>
              <p className="text-xs text-gray-400 truncate max-w-[150px]">{userDetails?.email}</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 flex-1">
          <ul className="space-y-1 px-2">
            <li>
              <Link
                to="/admin"
                className={`flex items-center p-3 rounded-md mx-auto w-full max-w-[90%] ${
                  isActive("/admin")
                    ? "bg-pharmacy-primary text-white"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <BarChart size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/medicines"
                className={`flex items-center p-3 rounded-md mx-auto w-full max-w-[90%] ${
                  isActive("/admin/medicines")
                    ? "bg-pharmacy-primary text-white"
                    : "hover:bg-slate-700"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Package size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">Medicines</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/add-medicines"
                className={`flex items-center p-3 rounded-md mx-auto w-full max-w-[90%] ${
                  isActive("/admin/medicines")
                    ? "bg-pharmacy-primary text-white"
                    : "hover:bg-slate-700"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Package size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">Add New Medicines</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className={`flex items-center p-3 rounded-md mx-auto w-full max-w-[90%] ${
                  isActive("/admin/orders")
                    ? "bg-pharmacy-primary text-white"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <ShoppingBag size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">Orders</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className={`flex items-center p-3 rounded-md mx-auto w-full max-w-[90%] ${
                  isActive("/admin/users")
                    ? "bg-pharmacy-primary text-white"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Users size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">Users</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/settings"
                className={`flex items-center p-3 rounded-md mx-auto w-full max-w-[90%] ${
                  isActive("/admin/settings")
                    ? "bg-pharmacy-primary text-white"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Settings size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">Settings</span>
              </Link>
            </li>
            <li className="mt-6">
              <Button
                variant="ghost"
                className="w-full max-w-[90%] mx-auto flex items-center p-3 rounded-md hover:bg-gray-700 text-white"
                onClick={() => {
                  handleLogout();
                  setIsSidebarOpen(false);
                }}
              >
                <LogOut size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">Logout</span>
              </Button>
            </li>
            <li>
              <Link
                to="/"
                className="flex items-center p-3 rounded-md hover:bg-gray-700 mx-auto w-full max-w-[90%]"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Home size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">Back to Site</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white shadow-sm h-16 items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-800 truncate">
            {currentRouteName()}
          </h1>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-0">
          <Outlet />
        </main>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default AdminLayout;