import { useState, useEffect, memo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Category {
  name: string;
  subcategories: string[];
}

interface CategoryFilterProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onSelectSubcategory: (subcategory: string | null) => void;
  onClearFilters: () => void;
}

const CategoryFilter = ({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  onClearFilters,
}: CategoryFilterProps) => {
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { getCategories } = await import("@/services/publicService");
        const fetchedCategories = await getCategories();
        const categoryData = fetchedCategories.find(
          (cat: Category) => cat.name === selectedCategory
        );
        if (categoryData) {
          setSubcategories(categoryData.subcategories || []);
        } else {
          setError("Category not found.");
        }
      } catch (err) {
        setError("Failed to load subcategories.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubcategories();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 className="animate-spin text-pharmacy-primary" size={20} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 py-2 text-center text-sm">
        {error}
      </div>
    );
  }

  if (!selectedCategory || subcategories.length === 0) {
    return null;
  }

  return (
    <div className="py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1.5 whitespace-nowrap">
            {subcategories.map((sub) => (
              <Button
                key={sub}
                variant="default"
                size="sm"
                className={`text-xs font-medium uppercase py-1 px-2 h-7 rounded-md ${
                  selectedSubcategory === sub
                    ? "bg-pharmacy-dark"
                    : "bg-pharmacy-primary hover:bg-pharmacy-dark"
                } transition-colors duration-200 flex items-center gap-1 flex-shrink-0`}
                onClick={() => {
                  if (selectedSubcategory === sub) {
                    onSelectSubcategory(null);
                  } else {
                    onSelectSubcategory(sub);
                  }
                }}
              >
                {sub}
                {selectedSubcategory === sub && (
                  <X
                    size={12}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSubcategory(null);
                    }}
                  />
                )}
              </Button>
            ))}
          </div>
          {selectedSubcategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectSubcategory(null)} // Only clear subcategory
              className="text-xs text-gray-500 hover:text-gray-700 h-7 px-2 flex-shrink-0"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
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

export default memo(CategoryFilter);