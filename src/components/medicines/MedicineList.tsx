import { useState } from "react";
import { Medicine } from "@/lib/types";
import MedicineCard from "./MedicineCard";
import { FileWarning } from "lucide-react";
import { toast } from "sonner";

interface MedicineListProps {
  medicines: Medicine[];
  isLoading?: boolean;
  error?: string;
  onAddToCart: (medicine: Medicine) => void;
}

const MedicineList = ({ 
  medicines, 
  isLoading = false, 
  error,
  onAddToCart
}: MedicineListProps) => {
  const [cartItems, setCartItems] = useState<Medicine[]>([]);

  const handleAddToCart = (medicine: Medicine) => {
    setCartItems([...cartItems, medicine]);
    onAddToCart(medicine);
    toast.success(`${medicine.name} added to cart`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm h-[350px] animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-9 bg-gray-200 rounded w-full mt-6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <FileWarning size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-medium text-red-800 mb-2">Error Loading Medicines</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (medicines.length === 0) {
    return (
      <div className="bg-gray-50 p-10 rounded-lg text-center">
        <h3 className="text-xl font-medium text-gray-800 mb-2">No Medicines Found</h3>
        <p className="text-gray-600">
          Try adjusting your search or filter criteria to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {medicines.map((medicine) => (
        <MedicineCard
          key={medicine.id}
          medicine={medicine}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
};

export default MedicineList;
