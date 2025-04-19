
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MedicineList from '@/components/medicines/MedicineList';
import { mockMedicines } from '@/lib/mockData';
import { toast } from "sonner";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(mockMedicines);

  useEffect(() => {
    if (query) {
      const filteredResults = mockMedicines.filter(medicine =>
        medicine.name.toLowerCase().includes(query.toLowerCase()) ||
        medicine.description.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(filteredResults);
      
      if (filteredResults.length === 0) {
        toast.error("No medicines found matching your search");
      } else {
        toast.success(`Found ${filteredResults.length} medicines matching "${query}"`);
      }
    }
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
      </h1>
      <MedicineList
        medicines={results}
        isLoading={false}
        error=""
        onAddToCart={(medicine) => {
          toast.success(`${medicine.name} added to cart`);
        }}
      />
    </div>
  );
};

export default SearchResults;
