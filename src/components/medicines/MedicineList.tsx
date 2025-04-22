import { useState, useEffect, useRef, memo } from "react";
import { Medicine } from "@/lib/types";
import MedicineCard from "./MedicineCard";
import { FileWarning } from "lucide-react";

interface MedicineListProps {
  medicines: Medicine[];
  isLoading?: boolean;
  error?: string;
}

const MedicineList = ({ medicines, isLoading = false, error }: MedicineListProps) => {
  const [visibleCount, setVisibleCount] = useState(8);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreCount = 8;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < medicines.length) {
          setVisibleCount((prev) => Math.min(prev + loadMoreCount, medicines.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [visibleCount, medicines.length]);

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
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {medicines.slice(0, visibleCount).map((medicine, index) => (
          <div
            key={medicine.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index % loadMoreCount * 50}ms` }}
          >
            <MedicineCard medicine={medicine} />
          </div>
        ))}
      </div>
      {visibleCount < medicines.length && (
        <div
          ref={observerRef}
          className="flex justify-center py-6"
        >
          <div className="animate-pulse flex items-center space-x-2">
            <Loader2 className="animate-spin text-pharmacy-primary" size={20} />
            <span className="text-sm text-gray-600">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline CSS for fade-in animation
const style = document.createElement("style");
style.textContent = `
  .animate-fade-in {
    animation: fadeIn 300ms ease-in forwards;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

export default memo(MedicineList);