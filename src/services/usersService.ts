import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import { User } from "@/lib/types";

// Fetch all users from Firestore
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users: User[] = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      // Convert createdAt Timestamp to Date
      const createdAt = userData.createdAt instanceof Timestamp
        ? userData.createdAt.toDate()
        : userData.createdAt;
      users.push({
        uid: doc.id,
        ...userData,
        createdAt
      } as User);
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (uid: string, newRole: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role: newRole });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Delete user and associated data
export const deleteUserAndAssociatedData = async (uid: string): Promise<void> => {
  try {
    // Delete user document
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);

    // Delete user's orders
    const ordersQuery = query(collection(db, "orders"), where("userId", "==", uid));
    const ordersSnapshot = await getDocs(ordersQuery);
    const deleteOrderPromises = ordersSnapshot.docs.map((orderDoc) =>
      deleteDoc(doc(db, "orders", orderDoc.id))
    );
    await Promise.all(deleteOrderPromises);

    // Note: Deleting the Firebase Auth account requires Firebase Admin SDK.
    // This should be handled via a backend API (e.g., Cloud Function).
    // For client-side simulation, we'll log a message.
    console.log(
      `Simulating deletion of Firebase Auth account for UID: ${uid}. ` +
      `In production, use a Cloud Function with Firebase Admin SDK to delete the auth account.`
    );
  } catch (error) {
    console.error("Error deleting user and associated data:", error);
    throw error;
  }
};