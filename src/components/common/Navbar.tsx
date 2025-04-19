
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Menu, X, Phone, Search, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { currentUser, userDetails, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-white shadow">
      {/* Top Bar */}
      <div className="flex justify-between items-center py-3 px-4 md:px-8 border-b">
        <Link to="/" className="flex items-center">
          <div className="h-12 w-40">
            <span className="text-2xl font-bold text-pharmacy-primary">Pharmacy Care</span>
          </div>
        </Link>

        {/* Search Form - Hidden on Mobile */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search Your Products..."
              className="w-full rounded-md pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search size={20} className="text-gray-500" />
            </button>
          </div>
        </form>

        {/* Contact & Cart - Hidden on Mobile */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex items-center">
            <Phone className="mr-2 h-5 w-5 text-pharmacy-primary" />
            <div>
              <div className="text-sm text-gray-600">Call Us Now:</div>
              <div className="font-medium">+8809638045501</div>
            </div>
          </div>

          <Link to="/cart" className="relative">
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              <div className="ml-2">
                <div className="text-sm text-gray-600">Cart amount</div>
                <div className="font-medium">0 TK</div>
              </div>
            </div>
            <span className="absolute -top-2 -right-2 bg-pharmacy-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              0
            </span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="bg-pharmacy-primary text-white px-4 py-3 hidden md:block">
        <ul className="flex justify-between max-w-6xl mx-auto">
          <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
            <Link to="/categories/dilutions">DILUTIONS & POTENCIES</Link>
          </li>
          <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
            <Link to="/categories/tinctures">MOTHER TINCTURES</Link>
          </li>
          <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
            <Link to="/categories/biochemics">BIOCHEMICS</Link>
          </li>
          <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
            <Link to="/categories/tablets">TABLETS</Link>
          </li>
          <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
            <Link to="/categories/cosmetics">COSMETICS ITEMS</Link>
          </li>
          <li className="px-3 py-1 hover:bg-pharmacy-dark rounded transition">
            <Link to="/categories/other">OTHER PRODUCTS</Link>
          </li>
        </ul>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <form onSubmit={handleSearch} className="p-4 border-b">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search Products..."
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search size={20} className="text-gray-500" />
              </button>
            </div>
          </form>

          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <Phone className="mr-2 h-5 w-5 text-pharmacy-primary" />
              <div>
                <div className="text-sm text-gray-600">Call Us Now:</div>
                <div className="font-medium">+8809638045501</div>
              </div>
            </div>

            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-pharmacy-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              <li className="p-2 hover:bg-gray-100 rounded">
                <Link to="/categories/dilutions" className="block">DILUTIONS & POTENCIES</Link>
              </li>
              <li className="p-2 hover:bg-gray-100 rounded">
                <Link to="/categories/tinctures" className="block">MOTHER TINCTURES</Link>
              </li>
              <li className="p-2 hover:bg-gray-100 rounded">
                <Link to="/categories/biochemics" className="block">BIOCHEMICS</Link>
              </li>
              <li className="p-2 hover:bg-gray-100 rounded">
                <Link to="/categories/tablets" className="block">TABLETS</Link>
              </li>
              <li className="p-2 hover:bg-gray-100 rounded">
                <Link to="/categories/cosmetics" className="block">COSMETICS ITEMS</Link>
              </li>
              <li className="p-2 hover:bg-gray-100 rounded">
                <Link to="/categories/other" className="block">OTHER PRODUCTS</Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* User Auth Section */}
      <div className="flex justify-end items-center bg-gray-100 px-4 py-1 md:px-8">
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center">
                <User size={16} className="mr-2" />
                {userDetails?.name || "Account"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                Dashboard
              </DropdownMenuItem>
              {userDetails?.role === "admin" && (
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/orders")}>
                My Orders
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="ghost" size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
