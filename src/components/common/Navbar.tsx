import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Menu, X, Phone, Search, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const Navbar = () => {
  const { currentUser, userDetails, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleAddToCart = () => {
    toast.success("Item added to cart successfully!");
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

        {/* Search Form - Hidden on Mobile unless toggled */}
        {(!isMobile || isSearchOpen) && (
          <form onSubmit={handleSearch} className={`${
            isMobile ? "absolute top-full left-0 right-0 bg-white p-4 shadow-md" : 
            "hidden md:flex flex-1 max-w-md mx-8"
          }`}>
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search medicines..."
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={isMobile}
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search size={20} className="text-gray-500" />
              </button>
            </div>
          </form>
        )}

        {/* Mobile Search Toggle and Cart */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-700"
            >
              {isSearchOpen ? <X size={24} /> : <Search size={24} />}
            </button>
          )}

          {/* Contact Info - Hidden on Mobile */}
          <div className="hidden md:flex items-center">
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

          {/* Auth Section */}
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
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="default" size="sm" className="bg-pharmacy-primary hover:bg-pharmacy-dark" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 ml-4"
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
    </div>
  );
};

export default Navbar;
