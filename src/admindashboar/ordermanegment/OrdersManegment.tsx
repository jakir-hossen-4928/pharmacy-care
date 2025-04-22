import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOrdersRealTime, updateOrderStatus, generateAndStoreInvoiceNumber } from "@/services/orderManegmentService";
import { Order, User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Eye, Save, FileText } from "lucide-react";
import Loading from "@/components/common/Loading";

const OrdersManegment = () => {
  const { userDetails } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersMap, setUsersMap] = useState<{ [key: string]: User }>({});
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [statusChanges, setStatusChanges] = useState<{ [key: string]: Order["status"] }>({});

  // Fetch orders in real-time
  useEffect(() => {
    const unsubscribe = fetchOrdersRealTime((ordersData, usersData) => {
      setOrders(ordersData);
      setUsersMap(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((order) => {
        const user = usersMap[order.userId];
        return (
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user && user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders, usersMap]);

  // Handle status change
  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setStatusChanges((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  // Save status change
  const saveStatusChange = async (orderId: string) => {
    const newStatus = statusChanges[orderId];
    if (!newStatus) return;

    try {
      await updateOrderStatus(orderId, newStatus);
      setStatusChanges((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  // Generate invoice PDF
  const generateInvoice = async (order: Order) => {
    try {
      const invoiceNumber = await generateAndStoreInvoiceNumber(order.id);
      const user = usersMap[order.userId];
      const exportDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Pharmacy Care - Invoice</title>
              <style>
                @media print { @page { margin: 1cm; } }
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                .container { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
                .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 24px; }
                .details table { width: 100%; border-collapse: collapse; font-size: 14px; }
                .details td { padding: 8px; border: 1px solid #ddd; }
                .details td:first-child { font-weight: bold; width: 30%; }
                .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .items-table th { background-color: #f5f5f5; font-weight: bold; }
                .items-table img { max-width: 50px; height: auto; }
                .signature { margin-top: 40px; text-align: right; }
                .signature-line { border-top: 1px solid #000; width: 200px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
                @media (max-width: 768px) {
                  .container { padding: 10px; }
                  .header h1 { font-size: 20px; }
                  .details td, .items-table td, .items-table th { font-size: 12px; padding: 5px; }
                  .items-table img { max-width: 40px; }
                  .signature-line { width: 150px; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Pharmacy Care</h1>
                  <p>Order Invoice</p>
                </div>
                <div class="details">
                  <table>
                    <tr><td>Invoice Number:</td><td>${invoiceNumber}</td></tr>
                    <tr><td>Order ID:</td><td>${order.id}</td></tr>
                    <tr><td>User:</td><td>${user ? `${user.name} (${user.email})` : "Unknown User"}</td></tr>
                    <tr><td>Total:</td><td>৳${order.total.toFixed(2)}</td></tr>
                    <tr><td>Status:</td><td>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</td></tr>
                    <tr><td>Created At:</td><td>${order.createdAt instanceof Date ? order.createdAt.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }) : "N/A"}</td></tr>
                    <tr><td>Generated on:</td><td>${exportDate}</td></tr>
                  </table>
                  <table class="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Image</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${order.items.map(item => `
                        <tr>
                          <td>${item.medicine.name}</td>
                          <td><img src="${item.medicine.imageUrl || 'https://via.placeholder.com/50'}" alt="${item.medicine.name}" /></td>
                          <td>${item.quantity}</td>
                          <td>৳${item.medicine.price.toFixed(2)}</td>
                          <td>৳${(item.medicine.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                <div class="signature">
                  <p>Prepared by: Jakir Hossen</p>
                  <p>Pharmacy Care Manager</p>
                  <div class="signature-line"></div>
                </div>
                <div class="footer">
                  Generated by Pharmacy Care Official System • https://pharmacy-care.netlify.app
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice.",
        variant: "destructive",
      });
    }
  };

  // Prevent non-admins from accessing this page
  if (userDetails?.role !== "admin") {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Order Management</h1>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by Order ID or User Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] border-gray-300">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      {loading ? (
       <Loading />
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-semibold text-gray-700">Order ID</TableHead>
                <TableHead className="font-semibold text-gray-700">User</TableHead>
                <TableHead className="font-semibold text-gray-700">Total</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Created At</TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const user = usersMap[order.userId];
                  return (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{user ? user.email : "User Not Found"}</TableCell>
                      <TableCell>৳{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={statusChanges[order.id] || order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                        >
                          <SelectTrigger className="w-[140px] border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {order.createdAt instanceof Date && !isNaN(order.createdAt.getTime())
                          ? order.createdAt.toLocaleString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Dhaka",
                            })
                          : "N/A"}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye size={16} className="mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold">User:</h4>
                                <p>{user ? `${user.name} (${user.email})` : "User Not Found"}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Items:</h4>
                                <ul className="space-y-2">
                                  {order.items.map((item) => (
                                    <li key={item.id} className="flex items-center space-x-2">
                                      <img
                                        src={item.medicine.imageUrl || "https://via.placeholder.com/50"}
                                        alt={item.medicine.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                      <div>
                                        <p>{item.medicine.name}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Price: ৳{(item.medicine.price * item.quantity).toFixed(2)}</p>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold">Total:</h4>
                                <p>৳{order.total.toFixed(2)}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Status:</h4>
                                <p>{order.status}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {statusChanges[order.id] && (
                          <Button
                            size="sm"
                            onClick={() => saveStatusChange(order.id)}
                          >
                            <Save size={16} className="mr-1" />
                            Save
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateInvoice(order)}
                        >
                          <FileText size={16} className="mr-1" />
                          Generate Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default OrdersManegment;