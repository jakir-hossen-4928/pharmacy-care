import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Medicine } from "@/lib/types";

// Helper function to generate a unique 5-character product code
function generateProductCode(medicine: Omit<Medicine, "id">): string {
  const namePrefix = (medicine.name || "MED").slice(0, 2).toUpperCase();
  const pricePart = Math.round(medicine.price || 0).toString().slice(-2).padStart(2, "0");
  const categoryChar = (medicine.category || "GEN").charAt(0).toUpperCase();
  let baseCode = `${namePrefix}${pricePart}${categoryChar}`;
  baseCode = baseCode.slice(0, 5).padStart(5, "X");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomChar = chars[Math.floor(Math.random() * chars.length)];
  return baseCode.slice(0, 4) + randomChar;
}

// Helper function to sanitize document data by removing undefined values
function sanitizeDocumentData<T>(data: T): Partial<T> {
  const sanitized: Partial<T> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      sanitized[key as keyof T] = value;
    }
  }
  return sanitized;
}

// Fetch all medicines from Firestore with retry, sorted by createdAt descending
export const getAllMedicines = async (retries = 3, delay = 1000): Promise<Medicine[]> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const medicinesSnapshot = await getDocs(collection(db, "medicines"));
      const medicines: Medicine[] = [];
      medicinesSnapshot.forEach((doc) => {
        const medicineData = doc.data();
        medicines.push({
          id: doc.id,
          ...medicineData,
          createdAt: medicineData.createdAt || Timestamp.fromDate(new Date(0)), // Fallback for missing createdAt
        } as Medicine);
      });
      // Sort by createdAt in descending order (newest first)
      medicines.sort((a, b) => {
        const timeA = a.createdAt.toMillis();
        const timeB = b.createdAt.toMillis();
        return timeB - timeA;
      });
      return medicines;
    } catch (error) {
      console.error(`Attempt ${attempt} failed to fetch medicines:`, error);
      if (attempt === retries) {
        throw new Error("Failed to fetch medicines after multiple attempts. Please try again later.");
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Failed to fetch medicines.");
};

// Add a new medicine
export const addMedicine = async (medicine: Omit<Medicine, "id">): Promise<string> => {
  try {
    let productCode = generateProductCode(medicine);
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const medicineRef = doc(db, "medicines", productCode);
      const existingDoc = await getDocs(collection(db, "medicines"));
      if (!existingDoc.docs.some((d) => d.id === productCode)) {
        const sanitizedMedicine = sanitizeDocumentData({
          ...medicine,
          createdAt: Timestamp.fromDate(new Date()),
        });
        await setDoc(medicineRef, sanitizedMedicine);
        return productCode;
      }
      productCode = generateProductCode(medicine);
      attempts++;
    }
    throw new Error("Failed to generate unique product code after retries.");
  } catch (error) {
    console.error("Error adding medicine:", error);
    throw new Error("Failed to add medicine. Please try again.");
  }
};

// Update a medicine
export const updateMedicine = async (medicineId: string, updatedData: Partial<Medicine>): Promise<void> => {
  try {
    const medicineRef = doc(db, "medicines", medicineId);
    const sanitizedData = sanitizeDocumentData(updatedData);
    await updateDoc(medicineRef, sanitizedData);
  } catch (error) {
    console.error("Error updating medicine:", error);
    throw new Error("Failed to update medicine. Please try again.");
  }
};

// Delete a medicine
export const deleteMedicine = async (medicineId: string): Promise<void> => {
  try {
    const medicineRef = doc(db, "medicines", medicineId);
    await deleteDoc(medicineRef);
  } catch (error) {
    console.error("Error deleting medicine:", error);
    throw new Error("Failed to delete medicine. Please try again.");
  }
};

// Update medicine stock (used internally by orderService)
export const updateMedicineStock = async (medicineId: string, quantityChange: number): Promise<void> => {
  try {
    const medicineRef = doc(db, "medicines", medicineId);
    await runTransaction(db, async (transaction) => {
      const medicineSnap = await transaction.get(medicineRef);
      if (!medicineSnap.exists()) {
        throw new Error(`Medicine ${medicineId} does not exist`);
      }
      const medicineData = medicineSnap.data() as Medicine;
      const newStock = medicineData.stock + quantityChange;
      if (newStock < 0) {
        throw new Error(`Insufficient stock for ${medicineData.name}: ${medicineData.stock} available`);
      }
      transaction.update(medicineRef, { stock: newStock });
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    throw error;
  }
};