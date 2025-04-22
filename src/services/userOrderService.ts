import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, doc, setDoc } from "firebase/firestore";
import { CartItem, Address, Order } from "@/lib/types";

// Helper function to generate a unique short order ID
function generateOrderId(cartItems: CartItem[], total: number, createdAt: Date): string {
  // Product prefix: First 3 letters of the first item's name (uppercase)
  const productName = cartItems[0]?.medicine.name || "ORDER";
  const productPrefix = productName.slice(0, 3).toUpperCase();

  // Total amount: Round to nearest integer
  const amount = Math.round(total);

  // Date: YYMMDD format (e.g., 250520 for 2025-05-20)
  const year = createdAt.getFullYear().toString().slice(-2);
  const month = (createdAt.getMonth() + 1).toString().padStart(2, "0");
  const day = createdAt.getDate().toString().padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Random suffix: 2 random alphanumeric characters
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomSuffix = Array(2)
    .fill(null)
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");

  // Combine: e.g., PAR276250520X7
  return `${productPrefix}${amount}${dateStr}${randomSuffix}`;
}

export async function createOrder(
  userId: string,
  cartItems: CartItem[],
  total: number,
  orderType: CartItem["orderType"],
  address: Address,
  deliveryCharge: number
): Promise<string> {
  if (!cartItems.length) {
    throw new Error("Cart is empty");
  }

  if (orderType === "wholesale") {
    for (const item of cartItems) {
      if (!item.medicine.wholesalePrice || !item.medicine.minWholesaleQuantity) {
        throw new Error(`Medicine ${item.medicine.name} is not available for wholesale`);
      }
      if (item.quantity < item.medicine.minWholesaleQuantity) {
        throw new Error(
          `Quantity for ${item.medicine.name} must be at least ${item.medicine.minWholesaleQuantity} for wholesale`
        );
      }
    }
  }

  const createdAt = new Date();
  const orderId = generateOrderId(cartItems, total, createdAt);

  // Use setDoc with a specific document ID instead of addDoc
  const orderRef = doc(db, "orders", orderId);
  await setDoc(orderRef, {
    userId,
    items: cartItems,
    total,
    deliveryCharge,
    status: "pending",
    orderType,
    address,
    createdAt,
  });

  return orderId;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // Use the custom document ID
        userId: data.userId,
        items: data.items,
        total: data.total,
        deliveryCharge: data.deliveryCharge,
        status: data.status,
        orderType: data.orderType,
        address: data.address,
        createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to JS Date
      } as Order;
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw new Error("Failed to fetch your orders. Please try again later.");
  }
}