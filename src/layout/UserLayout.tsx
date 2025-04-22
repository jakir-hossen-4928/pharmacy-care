import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, FileText, Settings, LogOut, Layout, Menu, X } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const UserLayout = () => {
  const { userDetails, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-between"
              onClick={toggleSidebar}
            >
              <span>Menu</span>
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          {/* Sidebar */}
          <div
            className={`lg:w-1/4 w-full transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              {/* User Profile Summary */}
              <div className="p-4 sm:p-6 border-b bg-gray-50 flex flex-col items-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-4 bg-pharmacy-light flex items-center justify-center">
                  <User size={36} className="text-pharmacy-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mb-1 text-center">
                  {userDetails?.name || "User"}
                </h2>
                <p className="text-gray-500 text-sm text-center break-all">
                  {userDetails?.email}
                </p>
              </div>

              {/* Navigation Links */}
              <nav className="p-4">
                <ul className="space-y-2">
                  {[
                    { path: "/dashboard", icon: Layout, label: "Dashboard" },
                    { path: "/dashboard/orders", icon: FileText, label: "My Orders" },
                    { path: "/dashboard/profile", icon: User, label: "Profile" },
                    { path: "/dashboard/change-password", icon: Settings, label: "Change Password" },
                  ].map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center p-3 rounded-md text-sm sm:text-base transition-colors ${
                          isActive(item.path)
                            ? "bg-pharmacy-primary text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <item.icon size={20} className="mr-3" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 rounded-md hover:bg-gray-100 text-sm sm:text-base text-gray-700"
                      onClick={() => {
                        handleLogout();
                        setIsSidebarOpen(false);
                      }}
                    >
                      <LogOut size={20} className="mr-3" />
                      <span>Logout</span>
                    </Button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 w-full">
            <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        className="text-sm"
      />
    </div>
  );
};

export default UserLayout;