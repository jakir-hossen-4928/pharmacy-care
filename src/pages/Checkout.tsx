
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const formSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
});

type CheckoutFormValues = z.infer<typeof formSchema>;

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
    },
  });

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  const onSubmit = (values: CheckoutFormValues) => {
    // In a real app, we would submit the order to the backend here
    console.log("Order submitted:", { ...values, paymentMethod, cartItems, total: cartTotal });
    
    // Simulate successful order
    setTimeout(() => {
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/order-success");
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="cash"
                          name="paymentMethod"
                          value="cash"
                          checked={paymentMethod === "cash"}
                          onChange={() => setPaymentMethod("cash")}
                          className="mr-2"
                        />
                        <label htmlFor="cash">Cash on Delivery</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="bkash"
                          name="paymentMethod"
                          value="bkash"
                          checked={paymentMethod === "bkash"}
                          onChange={() => setPaymentMethod("bkash")}
                          className="mr-2"
                        />
                        <label htmlFor="bkash">bKash</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="nagad"
                          name="paymentMethod"
                          value="nagad"
                          checked={paymentMethod === "nagad"}
                          onChange={() => setPaymentMethod("nagad")}
                          className="mr-2"
                        />
                        <label htmlFor="nagad">Nagad</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 hidden md:block">
                    <Button 
                      type="submit" 
                      className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark"
                    >
                      Place Order
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="max-h-60 overflow-y-auto mb-4">
                {cartItems.map((item) => {
                  const discountedPrice = item.discount 
                    ? item.price - (item.price * item.discount / 100) 
                    : item.price;
                  
                  return (
                    <div key={item.id} className="flex justify-between py-2 border-b">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 block text-sm">Qty: {item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">
                          {(discountedPrice * item.quantity).toFixed(2)} TK
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{cartTotal.toFixed(2)} TK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span>{cartTotal.toFixed(2)} TK</span>
              </div>
              
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark"
              >
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
