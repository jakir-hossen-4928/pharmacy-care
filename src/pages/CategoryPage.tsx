import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MedicineList from "@/components/medicines/MedicineList";
import CategoryFilter from "@/components/medicines/CategoryFilter";
import { getCategories, filterMedicinesByCategory } from "@/services/publicService";
import { Medicine } from "@/lib/types";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Category {
  name: string;
  subcategories: string[];
}

const CategoryPage = () => {
  const { categoryId, subcategory } = useParams();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load categories.",
          variant: "destructive",
        });
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      setIsLoading(true);
      try {
        // Find category information
        const categoryInfo = categories.find(
          (cat) => cat.name.toLowerCase().replace(/\s+/g, "-") === categoryId
        );

        if (!categoryInfo) {
          setError("Category not found");
          setIsLoading(false);
          return;
        }

        setCategoryName(categoryInfo.name);
        setSelectedCategory(categoryInfo.name);

        let subcategoryName: string | undefined;
        if (subcategory) {
          subcategoryName = categoryInfo.subcategories.find(
            (sub) => sub.toLowerCase().replace(/\s+/g, "-") === subcategory
          );
          if (!subcategoryName) {
            setError("Subcategory not found");
            setIsLoading(false);
            return;
          }
          setSelectedSubcategory(subcategoryName);
        }

        // Fetch medicines
        const filteredMedicines = await filterMedicinesByCategory(
          categoryInfo.name,
          subcategoryName
        );
        setMedicines(filteredMedicines);
      } catch (err) {
        setError("Failed to load medicines. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load medicines.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchMedicines();
    }
  }, [categoryId, subcategory, categories]);

  const handleFilterChange = async () => {
    setIsLoading(true);
    try {
      const filteredMedicines = await filterMedicinesByCategory(
        selectedCategory || undefined,
        selectedSubcategory || undefined
      );
      setMedicines(filteredMedicines);
    } catch (err) {
      setError("Failed to filter medicines.");
      toast({
        title: "Error",
        description: "Failed to filter medicines.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      handleFilterChange();
    }
  }, [selectedCategory, selectedSubcategory]);

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setMedicines([]);
  };

  if (isLoading && !medicines.length) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-pharmacy-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6 text-sm">
        <Link to="/" className="text-gray-500 hover:text-pharmacy-primary">
          Home
        </Link>
        <ChevronRight size={16} className="mx-2 text-gray-400" />
        {subcategory && selectedSubcategory ? (
          <>
            <Link
              to={`/category/${categoryId}`}
              className="text-gray-500 hover:text-pharmacy-primary"
            >
              {categoryName}
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="text-pharmacy-primary font-medium">
              {selectedSubcategory}
            </span>
          </>
        ) : (
          <span className="text-pharmacy-primary font-medium">{categoryName}</span>
        )}
      </div>



      {/* Filter and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CategoryFilter
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSelectCategory={setSelectedCategory}
            onSelectSubcategory={setSelectedSubcategory}
            onClearFilters={handleClearFilters}
          />
        </div>
        <div className="lg:col-span-3">
          <MedicineList medicines={medicines} isLoading={isLoading} error={error} />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;