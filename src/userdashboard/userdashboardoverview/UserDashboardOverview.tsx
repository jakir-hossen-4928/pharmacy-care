import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/services/userProfieService";
import { getUserOrders } from "@/services/userOrderService";
import { getUserDashboardStats } from "@/services/userOverviewService";
import { User, Order } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileWarning, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Timestamp } from "firebase/firestore";
import Loading from "@/components/common/Loading";

const UserDashboardOverview = () => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalSpent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  async function fetchDashboardData() {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [userData, userOrders, userStats] = await Promise.all([
        getUserProfile(currentUser.uid),
        getUserOrders(currentUser.uid),
        getUserDashboardStats(currentUser.uid),
      ]);
      if (!userData) {
        throw new Error("User profile not found");
      }
      setUser(userData);
      setOrders(userOrders.slice(0, 2)); // Limit to 2 recent orders
      setStats(userStats);
    } catch (err) {
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
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

  if (!currentUser) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <FileWarning size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-medium text-red-800 mb-2">Access Denied</h3>
        <p className="text-red-700">Please log in to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <Loading />
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <FileWarning size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-700">{error || "User data not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone}
              </p>
              <Button
                asChild
                className="mt-4 bg-pharmacy-primary hover:bg-pharmacy-dark"
              >
                <Link to="/dashboard/profile">Update Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Total Orders:</strong> {stats?.totalOrders || 0}
              </p>
              <p>
                <strong>Completed Orders:</strong> {stats?.completedOrders || 0}
              </p>
              <p>
                <strong>Pending Orders:</strong> {stats?.pendingOrders || 0}
              </p>
              <p>
                <strong>Total Spent:</strong> {stats?.totalSpent.toFixed(2) || "0.00"} TK
              </p>
              <Button
                asChild
                className="mt-4 bg-pharmacy-primary hover:bg-pharmacy-dark"
              >
                <Link to="/dashboard/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-gray-600">No recent orders found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      {convertToDate(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.total.toFixed(2)} TK</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          order.status === "pending"
                            ? "bg-yellow-500"
                            : order.status === "completed"
                              ? "bg-green-500"
                              : "bg-red-500"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Button
            asChild
            className="mt-4 bg-pharmacy-primary hover:bg-pharmacy-dark"
          >
            <Link to="/dashboard/orders">View All Orders</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              className="bg-pharmacy-primary hover:bg-pharmacy-dark"
            >
              <Link to="/dashboard/orders">View Orders</Link>
            </Button>
            <Button
              asChild
              className="bg-pharmacy-primary hover:bg-pharmacy-dark"
            >
              <Link to="/dashboard/profile">Update Profile</Link>
            </Button>
            <Button
              asChild
              className="bg-pharmacy-primary hover:bg-pharmacy-dark"
            >
              <Link to="/dashboard/change-password">Change Password</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboardOverview;