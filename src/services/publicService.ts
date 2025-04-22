import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Medicine } from "@/lib/types";
import categoriesData from "@/lib/categories.json";

export const getAllMedicines = async (): Promise<Medicine[]> => {
  try {
    const medicinesSnapshot = await getDocs(collection(db, "medicines"));
    const medicines: Medicine[] = [];
    medicinesSnapshot.forEach((doc) => {
      const data = doc.data();
      medicines.push({
        id: doc.id,
        name: data.name,
        price: data.price,
        wholesalePrice: data.wholesalePrice ?? null, // Convert undefined to null
        minWholesaleQuantity: data.minWholesaleQuantity ?? null, // Convert undefined to null
        imageUrl: data.imageUrl,
        category: data.category,
        stock: data.stock,
        discount: data.discount || 0,
        description: data.description,
        createdAt: data.createdAt?.toDate().toISOString(),
      });
    });
    return medicines;
  } catch (error) {
    console.error("Error fetching medicines:", error);
    throw new Error("Failed to fetch medicines");
  }
};

export const searchMedicines = async (queryString: string): Promise<Medicine[]> => {
  try {
    const medicines = await getAllMedicines();
    if (!queryString.trim()) return medicines;

    return medicines.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(queryString.toLowerCase()) ||
        (medicine.description &&
          medicine.description.toLowerCase().includes(queryString.toLowerCase()))
    );
  } catch (error) {
    console.error("Error searching medicines:", error);
    throw new Error("Failed to search medicines");
  }
};

export const filterMedicinesByCategory = async (
  category?: string,
  subcategory?: string
): Promise<Medicine[]> => {
  try {
    const medicines = await getAllMedicines();
    if (!category) return medicines;

    return medicines.filter((medicine) => {
      const [medCategory, medSubcategory] = medicine.category.split(":");
      const matchesCategory = medCategory === category;
      if (!subcategory) return matchesCategory;
      return matchesCategory && medSubcategory === subcategory;
    });
  } catch (error) {
    console.error("Error filtering medicines:", error);
    throw new Error("Failed to filter medicines");
  }
};

export const getCategories = async () => {
  return categoriesData.categories;
};