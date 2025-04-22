import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MedicineList from "@/components/medicines/MedicineList";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { getCategories, filterMedicinesByCategory } from "@/services/publicService";
import Hero from "@/components/common/Hero";
import { useCart } from "@/contexts/CartContext";
import { Medicine } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import Loading from "@/components/common/Loading";

interface Category {
  name: string;
  subcategories: string[];
}

const Home = () => {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryMedicinesMap, setCategoryMedicinesMap] = useState<
    Record<string, Medicine[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);

        // Fetch medicines for each category
        const medicinesMap: Record<string, Medicine[]> = {};
        for (const category of fetchedCategories) {
          const medicines = await filterMedicinesByCategory(category.name);
          medicinesMap[category.name] = medicines.slice(0, 4); // Limit to 4 medicines per category
        }
        setCategoryMedicinesMap(medicinesMap);
      } catch (err) {
        setError("Failed to load categories or medicines.");
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
     <Loading />
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        {categories.map((category) => {
          const categoryMedicines = categoryMedicinesMap[category.name] || [];

          if (categoryMedicines.length === 0) return null;

          return (
            <section key={category.name} className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-pharmacy-primary">
                  {category.name}
                </h2>
                <Link
                  to={`/category/${category.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  <Button variant="outline" className="flex items-center">
                    See All <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>

              <MedicineList
                medicines={categoryMedicines}
                isLoading={false}
                error=""
                onAddToCart={handleAddToCart}
              />
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Home;