
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, FileText, Settings, LogOut, Layout } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";

const UserLayout = () => {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="border rounded-lg overflow-hidden bg-white">
              {/* User Profile Summary */}
              <div className="p-6 border-b bg-gray-50 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full mb-4 bg-pharmacy-light flex items-center justify-center">
                  <User size={48} className="text-pharmacy-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-1">{userDetails?.name || "User"}</h2>
                <p className="text-gray-500 text-sm">{userDetails?.email}</p>
              </div>
              
              {/* Navigation Links */}
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <Link 
                      to="/dashboard"
                      className={`flex items-center p-3 rounded-md ${
                        isActive("/dashboard") 
                          ? "bg-pharmacy-primary text-white" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Layout size={20} className="mr-3" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/dashboard/orders"
                      className={`flex items-center p-3 rounded-md ${
                        isActive("/dashboard/orders") 
                          ? "bg-pharmacy-primary text-white" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <FileText size={20} className="mr-3" />
                      <span>My Orders</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/dashboard/profile"
                      className={`flex items-center p-3 rounded-md ${
                        isActive("/dashboard/profile") 
                          ? "bg-pharmacy-primary text-white" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <User size={20} className="mr-3" />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/dashboard/change-password"
                      className={`flex items-center p-3 rounded-md ${
                        isActive("/dashboard/change-password") 
                          ? "bg-pharmacy-primary text-white" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Settings size={20} className="mr-3" />
                      <span>Change Password</span>
                    </Link>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 rounded-md hover:bg-gray-100"
                      onClick={handleLogout}
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
          <div className="md:w-3/4">
            <div className="bg-white border rounded-lg p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default UserLayout;
