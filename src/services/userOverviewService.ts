import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Order } from "@/lib/types";

interface UserDashboardStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
}

export async function getUserDashboardStats(userId: string): Promise<UserDashboardStats> {
  try {
    const ordersRef = collection(db, "orders");

    // Query orders for the user
    const userOrdersQuery = query(ordersRef, where("userId", "==", userId));

    // Query for pending and completed orders (totalOrders)
    const validOrdersQuery = query(userOrdersQuery, where("status", "in", ["pending", "completed"]));
    const validOrdersSnapshot = await getDocs(validOrdersQuery);
    const totalOrders = validOrdersSnapshot.size;

    // Query for completed orders (completedOrders and totalSpent)
    const completedOrdersQuery = query(userOrdersQuery, where("status", "==", "completed"));
    const completedOrdersSnapshot = await getDocs(completedOrdersQuery);
    const completedOrders = completedOrdersSnapshot.size;
    const totalSpent = completedOrdersSnapshot.docs.reduce((sum, doc) => {
      const order = doc.data() as Order;
      return sum + order.total;
    }, 0);

    // Query for pending orders (pendingOrders)
    const pendingOrdersQuery = query(userOrdersQuery, where("status", "==", "pending"));
    const pendingOrdersSnapshot = await getDocs(pendingOrdersQuery);
    const pendingOrders = pendingOrdersSnapshot.size;

    return { totalOrders, completedOrders, pendingOrders, totalSpent };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
}