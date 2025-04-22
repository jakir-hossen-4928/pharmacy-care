import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  name: string;
  subcategories: string[];
}

const NavbarDesktopNav = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { getCategories } = await import("@/services/publicService");
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    setOpenDropdown(categoryName);
  };

  if (loading) {
    return (
      <nav className="bg-pharmacy-primary text-white px-4 py-3 hidden md:block">
        <div className="flex justify-center">
          <Loader2 className="animate-spin" size={24} />
        </div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="bg-red-50 text-red-700 px-4 py-3 hidden md:block text-center">
        {error}
      </nav>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <nav className="bg-gray-50 text-gray-600 px-4 py-3 hidden md:block text-center">
        No categories available.
      </nav>
    );
  }

  return (
    <nav className="bg-pharmacy-primary text-white px-4 py-3 hidden md:block">
      <div className="max-w-6xl mx-auto overflow-x-auto scrollbar-hide">
        <ul className="flex space-x-4 whitespace-nowrap">
          {categories.map((category) => (
            <li key={category.name} className="flex-shrink-0">
              <DropdownMenu
                open={openDropdown === category.name}
                onOpenChange={(open) =>
                  setOpenDropdown(open ? category.name : null)
                }
              >
                <DropdownMenuTrigger asChild>
                  <div
                    className="flex items-center cursor-pointer px-3 py-1 rounded transition"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <span className="text-sm font-medium uppercase">
                      {category.name}
                    </span>
                    <ChevronDown size={16} className="ml-1" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-white text-gray-800 shadow-md rounded-md mt-1 min-w-[200px]"
                  align="start"
                >
                  <DropdownMenuItem className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link
                      to={`/category/${category.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className="block w-full"
                    >
                      All {category.name}
                    </Link>
                  </DropdownMenuItem>
                  {category.subcategories.map((sub) => (
                    <DropdownMenuItem
                      key={sub}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <Link
                        to={`/category/${category.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}/${sub
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="block w-full"
                      >
                        {sub}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

// Inline CSS to hide scrollbar but allow scrolling
const style = document.createElement("style");
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style);

export default NavbarDesktopNav;