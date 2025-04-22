import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Phone, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { getCategories } from "@/services/publicService";
import { Loader2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavbarMobileMenuProps {
  isMenuOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
}

interface Category {
  name: string;
  subcategories: string[];
}

const NavbarMobileMenu = ({
  isMenuOpen,
  searchQuery,
  setSearchQuery,
  handleSearch,
  setIsMenuOpen,
}: NavbarMobileMenuProps) => {
  const { cartCount } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
    // Removed setIsMenuOpen(false) to keep menu open on category click
  };

  const handleSubcategoryClick = () => {
    setIsMenuOpen(false); // Close menu on subcategory click
  };

  const handleSearchWithClose = (e: React.FormEvent) => {
    handleSearch(e); // Perform search
    setIsMenuOpen(false); // Close menu on search
  };

  if (!isMenuOpen) return null;

  return (
    <div
      className="md:hidden bg-white transform transition-all duration-300 ease-in-out"
      style={{
        opacity: isMenuOpen ? 1 : 0,
        maxHeight: isMenuOpen ? "100vh" : "0",
        overflow: "hidden",
      }}
    >
      {/* Search Form */}
      <form onSubmit={handleSearchWithClose} className="p-4 border-b">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search Products..."
            className="w-full pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <Search size={20} className="text-gray-500" />
          </button>
        </div>
      </form>

      {/* Contact and Cart */}
      {/* Contact and Cart */}
      <div className="flex justify-between items-center p-4 border-b">
        <a
          href="https://wa.me/8801842263370"
          target="_blank"
          rel="noopener noreferrer"

          className="flex items-center hover:underline cursor-pointer"
        >
          <Phone className="mr-2 h-5 w-5 text-pharmacy-primary" />
          <div>
            <div className="text-sm text-gray-600">Call Us Now:</div>
            <div className="font-medium">+8801842263370</div>
          </div>
        </a>

        <Link to="/cart" className="relative">
          <ShoppingCart className="h-6 w-6 text-gray-700" />
          <span className="absolute -top-2 -right-2 bg-pharmacy-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        </Link>
      </div>


      {/* Categories Navigation */}
      <nav className="p-4">
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin text-pharmacy-primary" size={24} />
          </div>
        ) : error ? (
          <div className="text-center text-red-700">{error}</div>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.name}>
                <Collapsible
                  open={openCategories.includes(category.name)}
                  onOpenChange={() => toggleCategory(category.name)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <span className="font-medium">{category.name}</span>
                      {openCategories.includes(category.name) ? (
                        <ChevronUp size={20} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-500" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="ml-4 mt-1 space-y-1">
                      {category.subcategories.map((sub) => (
                        <li
                          key={sub}
                          className="p-2 hover:bg-gray-50 rounded text-sm text-gray-600"
                        >
                          <Link
                            to={`/category/${category.name
                              .toLowerCase()
                              .replace(/\s+/g, "-")}/${sub
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            className="block hover:text-pharmacy-primary"
                            onClick={handleSubcategoryClick}
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
};

export default NavbarMobileMenu;