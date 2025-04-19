
import { Link } from "react-router-dom";
import MedicineList from "@/components/medicines/MedicineList";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { categories, mockMedicines } from "@/lib/mockData";
import Hero from "@/components/common/Hero";
import { useCart } from "@/contexts/CartContext";
import { Medicine } from "@/lib/types";

const Home = () => {
  const { addItemToCart } = useCart();

  const handleAddToCart = (medicine: Medicine) => {
    addItemToCart(medicine);
  };

  const getCategoryMedicines = (categoryId: string, limit = 4) => {
    return mockMedicines
      .filter(med => {
        const category = categories.find(cat => cat.id === categoryId);
        return category && med.category === category.name;
      })
      .slice(0, limit);
  };

  return (
    <div>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        {categories.map((category) => {
          const categoryMedicines = getCategoryMedicines(category.id);
          
          if (categoryMedicines.length === 0) return null;
          
          return (
            <section key={category.id} className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-pharmacy-primary">{category.name}</h2>
                <Link to={`/category/${category.id}`}>
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
