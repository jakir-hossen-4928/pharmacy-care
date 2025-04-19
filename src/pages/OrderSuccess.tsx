
import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrderSuccess = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
        <p className="text-gray-500 mb-8">
          Your order has been placed successfully. We have sent you an email with the order details.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild className="bg-pharmacy-primary hover:bg-pharmacy-dark">
            <Link to="/">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard/orders">View My Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
