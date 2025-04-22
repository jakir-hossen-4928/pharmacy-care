import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminDashboardOverview } from "@/services/adminOverviewService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Loading from "@/components/common/Loading";

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

const AdminDashboardOverview = () => {
  const { userDetails } = useAuth();
  const [overviewData, setOverviewData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        const data = await getAdminDashboardOverview();
        setOverviewData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard overview data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  // Prevent non-admins
  if (userDetails?.role !== "admin") {
    return (
      <div className="text-center p-6 text-red-600">
        You do not have permission to access this page.
      </div>
    );
  }

  if (loading) {
    return (
     <Loading />
    );
  }

  if (!overviewData) {
    return (
      <div className="text-center text-gray-500 p-6">
        Unable to load dashboard overview.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Admin Dashboard Overview
      </h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base font-medium text-gray-600">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              {overviewData.totalProducts}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base font-medium text-gray-600">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              {overviewData.totalUsers}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base font-medium text-gray-600">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              {overviewData.totalOrders}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base font-medium text-gray-600">
              Total Revenue (Completed Orders)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">
              ৳{overviewData.totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-semibold p-4 sm:p-6 text-gray-800">
          Recent Orders
        </h2>
        {overviewData.recentOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No recent orders found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-semibold text-gray-700">Order ID</TableHead>
                <TableHead className="font-semibold text-gray-700">User ID</TableHead>
                <TableHead className="font-semibold text-gray-700">Total (৳)</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overviewData.recentOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.userId}</TableCell>
                  <TableCell>৳{order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs sm:text-sm ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardOverview;