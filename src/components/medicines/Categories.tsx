
import { Link } from "react-router-dom";
import { categories } from "@/lib/mockData";

const Categories = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-8">
      <h2 className="text-xl font-bold mb-4 text-pharmacy-primary">Categories</h2>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="space-y-2">
            <Link 
              to={`/category/${category.id}`}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <span className="font-medium">{category.name}</span>
              <span className="text-sm text-gray-500">({category.subcategories.length})</span>
            </Link>
            <div className="pl-4 space-y-1">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub}
                  to={`/category/${category.id}/${sub.toLowerCase()}`}
                  className="block text-sm text-gray-600 hover:text-pharmacy-primary p-1 rounded"
                >
                  {sub}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
