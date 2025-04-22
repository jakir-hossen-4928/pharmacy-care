import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, Timestamp, query, orderBy, getDoc, setDoc, getDocs } from "firebase/firestore";
import { Order, User } from "@/lib/types";

// Fetch user details by UID
const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: userDoc.id,
        ...userData,
        createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : userData.createdAt
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Fetch orders in real-time and return an unsubscribe function
export const fetchOrdersRealTime = (
  callback: (orders: Order[], usersMap: { [key: string]: User }) => void
) => {
  const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(ordersQuery, async (snapshot) => {
    const orders: Order[] = [];
    const userIds = new Set<string>();

    // Collect orders and user IDs
    snapshot.forEach((doc) => {
      const orderData = doc.data();
      orders.push({
        id: doc.id,
        ...orderData,
        createdAt: orderData.createdAt instanceof Timestamp ? orderData.createdAt.toDate() : orderData.createdAt,
      } as Order);
      userIds.add(orderData.userId);
    });

    // Fetch user details for all user IDs
    const usersMap: { [key: string]: User } = {};
    await Promise.all(
      Array.from(userIds).map(async (uid) => {
        const user = await getUserById(uid);
        if (user) {
          usersMap[uid] = user;
        }
      })
    );

    callback(orders, usersMap);
  }, (error) => {
    console.error("Error fetching orders in real-time:", error);
  });

  return unsubscribe;
};

// Update order status
export const updateOrderStatus = async (orderId: string, newStatus: Order["status"]): Promise<void> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Generate and store invoice number
export const generateAndStoreInvoiceNumber = async (orderId: string): Promise<string> => {
  try {
    // Generate a unique invoice number (e.g., INV-YYYYMMDD-XXXX)
    const date = new Date();
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const randomString = Math.random().toString(36).substr(2, 4).toUpperCase(); // 4-character random string
    const invoiceNumber = `INV-${dateString}-${randomString}`;

    // Store invoice number in Firestore
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { invoiceNumber });

    // Also store in a separate invoices collection for record-keeping
    await setDoc(doc(db, "invoices", invoiceNumber), {
      orderId,
      invoiceNumber,
      generatedAt: Timestamp.fromDate(date),
    });

    return invoiceNumber;
  } catch (error) {
    console.error("Error generating and storing invoice number:", error);
    throw error;
  }
};