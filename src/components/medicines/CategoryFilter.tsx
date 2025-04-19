
import { useState } from "react";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onSelectCategory: (category: string) => void;
  onClearCategories: () => void;
}

const CategoryFilter = ({
  categories,
  selectedCategories,
  onSelectCategory,
  onClearCategories,
}: CategoryFilterProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-lg border p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center cursor-pointer">
            <h3 className="text-lg font-medium">Categories</h3>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </Button>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          {selectedCategories.length > 0 && (
            <div className="mb-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <Badge key={category} className="bg-pharmacy-primary">
                    {category}
                    <X 
                      size={14} 
                      className="ml-1 cursor-pointer" 
                      onClick={() => onSelectCategory(category)}
                    />
                  </Badge>
                ))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearCategories}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            {categories.map((category) => (
              <div 
                key={category}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelectCategory(category)}
              >
                <span className="text-sm">{category}</span>
                {selectedCategories.includes(category) && (
                  <Check size={16} className="text-pharmacy-primary" />
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CategoryFilter;
