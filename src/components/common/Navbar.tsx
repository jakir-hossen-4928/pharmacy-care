
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Menu, X, Phone, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import NavbarSearchForm from "../navbar/NavbarSearchForm";
import NavbarUserMenu from "../navbar/NavbarUserMenu";
import NavbarMobileMenu from "../navbar/NavbarMobileMenu";
import NavbarDesktopNav from "../navbar/NavbarDesktopNav";

const Navbar = () => {
  const { currentUser, userDetails, logout } = useAuth();
  const { cartCount } = useCart();
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
      <div className="flex justify-between items-center py-3 px-4 md:px-8 border-b">
        <Link to="/" className="flex items-center">
          <div className="h-12 w-40">
            <span className="text-2xl font-bold text-pharmacy-primary">Pharmacy Care</span>
          </div>
        </Link>

        <NavbarSearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isMobile={isMobile}
          isSearchOpen={isSearchOpen}
        />

        <div className="flex items-center gap-4">
          {isMobile && (
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-700"
            >
              {isSearchOpen ? <X size={24} /> : <Search size={24} />}
            </button>
          )}

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
              {cartCount}
            </span>
          </Link>

          <NavbarUserMenu
            currentUser={currentUser}
            userDetails={userDetails}
            onLogout={handleLogout}
          />
        </div>

        <button
          className="md:hidden text-gray-700 ml-4"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <NavbarDesktopNav />

      <NavbarMobileMenu
        isMenuOpen={isMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />
    </div>
  );
};

export default Navbar;
