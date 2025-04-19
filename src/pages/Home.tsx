
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, limit, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Medicine } from "@/lib/types";
import HeroSection from "@/components/common/HeroSection";
import MedicineList from "@/components/medicines/MedicineList";
import SearchBar from "@/components/medicines/SearchBar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package, Truck, CreditCard, Clock } from "lucide-react";

const Home = () => {
  const [featuredMedicines, setFeaturedMedicines] = useState<Medicine[]>([]);
  const [discountedMedicines, setDiscountedMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleAddToCart = (medicine: Medicine) => {
    // This will be replaced with actual cart functionality
    console.log("Added to cart:", medicine);
  };

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        // Fetch featured medicines
        const featuredQuery = query(
          collection(db, "medicines"),
          orderBy("createdAt", "desc"),
          limit(8)
        );
        
        // Fetch discounted medicines
        const discountQuery = query(
          collection(db, "medicines"),
          where("discount", ">", 0),
          orderBy("discount", "desc"),
          limit(4)
        );

        const [featuredSnapshot, discountSnapshot] = await Promise.all([
          getDocs(featuredQuery),
          getDocs(discountQuery)
        ]);

        const featuredDocs = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Medicine));

        const discountedDocs = discountSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Medicine));

        setFeaturedMedicines(featuredDocs);
        setDiscountedMedicines(discountedDocs);
      } catch (err) {
        console.error("Error fetching medicines:", err);
        setError("Failed to load medicines. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Search Bar - Below Hero */}
      <div className="bg-white shadow-md py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/products">
              <Button variant="outline" className="flex items-center">
                View All <ChevronRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>

          <MedicineList 
            medicines={featuredMedicines} 
            isLoading={loading} 
            error={error}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      {/* Discount / Special Offers */}
      <section className="py-12 bg-pharmacy-light">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Special Offers</h2>
            <Link to="/products?discount=true">
              <Button variant="outline" className="flex items-center">
                View All <ChevronRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>

          <MedicineList 
            medicines={discountedMedicines} 
            isLoading={loading} 
            error={error}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Why Choose Pharmacy Care</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <div className="bg-pharmacy-light p-3 rounded-full mb-4">
                <Package size={32} className="text-pharmacy-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600">All our medicines are sourced from trusted manufacturers and suppliers.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <div className="bg-pharmacy-light p-3 rounded-full mb-4">
                <Truck size={32} className="text-pharmacy-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your medicines delivered to your doorstep within 24-48 hours.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <div className="bg-pharmacy-light p-3 rounded-full mb-4">
                <CreditCard size={32} className="text-pharmacy-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Multiple secure payment options for your convenience.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <div className="bg-pharmacy-light p-3 rounded-full mb-4">
                <Clock size={32} className="text-pharmacy-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our customer support team is available round the clock to assist you.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
