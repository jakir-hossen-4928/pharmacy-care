import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserOrders } from "@/services/userOrderService";
import { Order } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileWarning } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import Loading from "@/components/common/Loading";

const UserOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  async function fetchOrders() {
    if (!currentUser) return;
    try {
      setLoading(true);
      const userOrders = await getUserOrders(currentUser.uid);
      setOrders(userOrders);
    } catch (err) {
      setError("Failed to load orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Helper function to convert Firestore Timestamp to Date
  const convertToDate = (createdAt: Date | Timestamp): Date => {
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate();
    }
    return createdAt;
  };

  // Helper function to format products and quantities
  const formatProducts = (items: Order["items"]): string => {
    if (items.length === 0) return "No products";
    return items
      .map((item) => `${item.medicine.name} (x${item.quantity})`)
      .join(", ");
  };

  // Helper function to get the first product's image
  const getFirstProductImage = (items: Order["items"]): string => {
    if (items.length === 0) return "";
    return items[0].medicine.imageUrl || "/placeholder-medicine.jpg";
  };

  if (loading) {
    return (
    <Loading />
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <FileWarning size={32} className="mx-auto text-red-500 mb-4 sm:size-48" />
        <h3 className="text-lg sm:text-xl font-medium text-red-800 mb-2">Error Loading Orders</h3>
        <p className="text-red-700 text-sm sm:text-base">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-gray-50 p-6 sm:p-10 rounded-lg text-center">
        <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">No Orders Found</h3>
        <p className="text-gray-600 text-sm sm:text-base">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">My Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm sm:text-base">Image</TableHead>
                <TableHead className="text-sm sm:text-base">Order ID</TableHead>
                <TableHead className="text-sm sm:text-base">Date</TableHead>
                <TableHead className="text-sm sm:text-base">Total</TableHead>
                <TableHead className="hidden sm:table-cell text-sm sm:text-base">Products</TableHead>
                <TableHead className="text-sm sm:text-base">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="p-2 sm:p-4">
                    {getFirstProductImage(order.items) ? (
                      <img
                        src={getFirstProductImage(order.items)}
                        alt="Product"
                        className="h-12 w-12 sm:h-16 sm:w-16 rounded-md object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">No image</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm sm:text-base p-2 sm:p-4">{order.id}</TableCell>
                  <TableCell className="text-sm sm:text-base p-2 sm:p-4">
                    {convertToDate(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm sm:text-base p-2 sm:p-4">{order.total.toFixed(2)} TK</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm sm:text-base p-2 sm:p-4 max-w-xs truncate">
                    {formatProducts(order.items)}
                  </TableCell>
                  <TableCell className="p-2 sm:p-4">
                    <Badge
                      className={`text-xs sm:text-sm ${
                        order.status === "pending"
                          ? "bg-yellow-500"
                          : order.status === "completed"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserOrders;