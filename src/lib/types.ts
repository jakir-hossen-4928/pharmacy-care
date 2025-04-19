
export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: Date;
}

export interface Medicine {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  stock: number;
  createdAt: Date;
  discount?: number;
}

export interface OrderItem {
  medicineId: string;
  quantity: number;
  price: number;
  medicineName?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  total: number;
  discount: number;
  status: "Pending" | "Completed" | "Cancelled";
  orderDate: Date;
}
