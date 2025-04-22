import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Medicine } from "@/lib/types";

export async function getMedicines(): Promise<Medicine[]> {
  const medicinesRef = collection(db, "products");
  const querySnapshot = await getDocs(medicinesRef);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Medicine));
}

export async function searchMedicines(searchQuery: string): Promise<Medicine[]> {
  const medicinesRef = collection(db, "products");
  const querySnapshot = await getDocs(medicinesRef);
  return querySnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Medicine))
    .filter((medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
}

export async function getMedicinesByCategory(category: string): Promise<Medicine[]> {
  const medicinesRef = collection(db, "products");
  const q = query(medicinesRef, where("category", "==", category));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Medicine));
}