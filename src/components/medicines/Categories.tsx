
import { Link } from "react-router-dom";
import { categories } from "@/lib/mockData";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Categories = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-8">
      <h2 className="text-xl font-bold mb-4 text-pharmacy-primary">Categories</h2>
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-b border-gray-200">
            <AccordionTrigger className="py-3 hover:no-underline">
              <span className="font-medium text-left">{category.name}</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-2 space-y-2">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub}
                    to={`/category/${category.id}/${sub.toLowerCase().replace(/\s+/g, '-')}`}
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
