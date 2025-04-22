import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

interface Order {
  id: string;
  userId: string;
  total: number;
  createdAt: string;
  status: string; // e.g., "pending", "completed", "cancelled"
}

interface DashboardOverview {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

// Fetch admin dashboard overview data
export const getAdminDashboardOverview = async (): Promise<DashboardOverview> => {
  try {
    // Fetch total products
    const productsSnapshot = await getDocs(collection(db, "medicines"));
    const totalProducts = productsSnapshot.size;

    // Fetch total users
    const usersSnapshot = await getDocs(collection(db, "users"));
    const totalUsers = usersSnapshot.size;

    // Fetch total orders and calculate total revenue (only for completed orders)
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    const totalOrders = ordersSnapshot.size;
    let totalRevenue = 0;
    const recentOrders: Order[] = [];

    ordersSnapshot.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.status === "completed") {
        totalRevenue += orderData.total || 0;
      }
    });

    // Fetch recent orders (last 5, sorted by createdAt descending)
    const recentOrdersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
    recentOrdersSnapshot.forEach((doc) => {
      const orderData = doc.data();
      recentOrders.push({
        id: doc.id,
        userId: orderData.userId,
        total: orderData.total,
        createdAt: orderData.createdAt.toDate().toISOString(),
        status: orderData.status,
      });
    });

    return {
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard overview:", error);
    throw error;
  }
};