
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MedicineList from "@/components/medicines/MedicineList";
import { categories, mockMedicines } from "@/lib/mockData";
import { Medicine } from "@/lib/types";
import { ChevronRight } from "lucide-react";

const CategoryPage = () => {
  const { categoryId, subcategory } = useParams();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    setIsLoading(true);
    try {
      // Find category information
      const categoryInfo = categories.find(cat => cat.id === categoryId);
      
      if (!categoryInfo) {
        setError("Category not found");
        setIsLoading(false);
        return;
      }

      setCategoryName(categoryInfo.name);
      
      // Filter medicines based on category and subcategory
      let filteredMedicines: Medicine[];
      
      if (subcategory) {
        // Check if subcategory exists for this category
        const subcategoryExists = categoryInfo.subcategories.some(
          sub => sub.toLowerCase().replace(/\s+/g, '-') === subcategory
        );
        
        if (!subcategoryExists) {
          setError("Subcategory not found");
          setIsLoading(false);
          return;
        }
        
        // Convert subcategory from URL format to display format
        const subcategoryName = categoryInfo.subcategories.find(
          sub => sub.toLowerCase().replace(/\s+/g, '-') === subcategory
        );
        
        // Filter medicines by category and potentially by subcategory in the future
        // For now, we'll just filter by category since our mockData doesn't have subcategory field
        filteredMedicines = mockMedicines.filter(med => med.category === categoryInfo.name);
      } else {
        // Filter medicines by category only
        filteredMedicines = mockMedicines.filter(med => med.category === categoryInfo.name);
      }

      setMedicines(filteredMedicines);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading category data:", err);
      setError("Failed to load medicines. Please try again later.");
      setIsLoading(false);
    }
  }, [categoryId, subcategory]);

  const handleAddToCart = (medicine: Medicine) => {
    console.log("Added to cart:", medicine);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6 text-sm">
        <Link to="/" className="text-gray-500 hover:text-pharmacy-primary">Home</Link>
        <ChevronRight size={16} className="mx-2 text-gray-400" />
        {subcategory ? (
          <>
            <Link to={`/category/${categoryId}`} className="text-gray-500 hover:text-pharmacy-primary">
              {categoryName}
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="text-pharmacy-primary font-medium">
              {subcategory.replace(/-/g, ' ').toUpperCase()}
            </span>
          </>
        ) : (
          <span className="text-pharmacy-primary font-medium">{categoryName}</span>
        )}
      </div>

      {/* Category Title */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-pharmacy-primary">
        {subcategory 
          ? `${categoryName} / ${subcategory.replace(/-/g, ' ').toUpperCase()}`
          : categoryName
        }
      </h1>

      {/* Products */}
      <MedicineList
        medicines={medicines}
        isLoading={isLoading}
        error={error}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default CategoryPage;
