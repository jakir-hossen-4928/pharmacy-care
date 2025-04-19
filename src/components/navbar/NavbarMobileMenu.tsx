
import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Phone, ShoppingCart } from "lucide-react";

interface NavbarMobileMenuProps {
  isMenuOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

const NavbarMobileMenu = ({
  isMenuOpen,
  searchQuery,
  setSearchQuery,
  handleSearch,
}: NavbarMobileMenuProps) => {
  if (!isMenuOpen) return null;

  return (
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
  );
};

export default NavbarMobileMenu;
