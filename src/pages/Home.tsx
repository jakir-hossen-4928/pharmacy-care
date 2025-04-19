
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/common/HeroSection";
import MedicineList from "@/components/medicines/MedicineList";
import SearchBar from "@/components/medicines/SearchBar";
import Categories from "@/components/medicines/Categories";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { mockMedicines } from "@/lib/mockData";
import { Medicine } from "@/lib/types";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>(mockMedicines);

  const handleAddToCart = (medicine: Medicine) => {
    console.log("Added to cart:", medicine);
  };

  return (
    <div>
      <HeroSection />

      {/* Search Bar - Below Hero */}
      <div className="bg-white shadow-md py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="md:col-span-1">
            <Categories />
          </div>

          {/* Products Section */}
          <div className="md:col-span-3">
            {/* Featured Products */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Featured Products</h2>
                <Link to="/products">
                  <Button variant="outline" className="flex items-center">
                    View All <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>

              <MedicineList 
                medicines={filteredMedicines} 
                isLoading={false} 
                error=""
                onAddToCart={handleAddToCart}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
