import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "@/services/publicService";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";

interface Category {
  name: string;
  subcategories: string[];
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 mb-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-pharmacy-primary" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 shadow-md rounded-lg p-4 mb-8 text-center text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-8">
      <h2 className="text-xl font-bold mb-4 text-pharmacy-primary">Categories</h2>
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem
            key={category.name}
            value={category.name}
            className="border-b border-gray-200"
          >
            <AccordionTrigger className="py-3 hover:no-underline">
              <span className="font-medium text-left">{category.name}</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 space-y-2">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub}
                    to={`/category/${category.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}/${sub
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="block text-sm text-gray-600 hover:text-pharmacy-primary py-1.5 px-2 rounded hover:bg-gray-50"
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Categories;