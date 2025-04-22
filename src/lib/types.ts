import { Timestamp } from "firebase/firestore";

export interface Address {
  id: string;
  type: "Home" | "Office" | "Shop";
  street: string;
  division: string;
  district: string;
  upazila: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: Date;
  addresses?: Address[];
}

export interface Medicine {
  id: string;
  name: string;
  price: number;
  wholesalePrice: number | null;
  minWholesaleQuantity: number | null;
  imageUrl: string;
  category: string;
  stock: number;
  discount?: number;
  description?: string;
}

export interface CartItem {
  id: string;
  medicine: Medicine;
  quantity: number;
  orderType: "retail" | "wholesale";
  addedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  deliveryCharge: number;
  status: "pending" | "completed" | "cancelled";
  orderType: "retail" | "wholesale";
  createdAt: Date | Timestamp;
  address: Address;
}