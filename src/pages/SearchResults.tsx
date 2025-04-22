import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MedicineList from "@/components/medicines/MedicineList";
import CategoryFilter from "@/components/medicines/CategoryFilter";
import { searchMedicines, filterMedicinesByCategory } from "@/services/publicService";
import { Medicine } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const medicines = await searchMedicines(query);
        setResults(medicines);

        if (medicines.length === 0 && query) {
          toast({
            title: "No Results",
            description: `No medicines found matching "${query}"`,
            variant: "destructive",
          });
        } else if (query) {
          toast({
            title: "Success",
            description: `Found ${medicines.length} medicines matching "${query}"`,
          });
        }
      } catch (err) {
        setError("Failed to load search results.");
        toast({
          title: "Error",
          description: "Failed to load search results.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const handleFilterChange = async () => {
    setIsLoading(true);
    try {
      let filteredResults = await searchMedicines(query);
      if (selectedCategory) {
        filteredResults = await filterMedicinesByCategory(
          selectedCategory,
          selectedSubcategory || undefined
        );
        filteredResults = filteredResults.filter(
          (medicine) =>
            medicine.name.toLowerCase().includes(query.toLowerCase()) ||
            (medicine.description &&
              medicine.description.toLowerCase().includes(query.toLowerCase()))
        );
      }
      setResults(filteredResults);
    } catch (err) {
      setError("Failed to filter search results.");
      toast({
        title: "Error",
        description: "Failed to filter search results.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFilterChange();
  }, [selectedCategory, selectedSubcategory]);

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    handleFilterChange();
  };

  const handleAddToCart = async (medicine: Medicine) => {
    try {
      await addToCart(medicine);
      toast({
        title: "Success",
        description: `${medicine.name} added to cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  if (isLoading && !results.length) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-pharmacy-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
      </h1>
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
          <MedicineList
            medicines={results}
            isLoading={isLoading}
            error={error}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchResults;