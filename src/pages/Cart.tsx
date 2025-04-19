
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Cart = () => {
  const { cartItems, removeItemFromCart, updateItemQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven't added any medicines to your cart yet.</p>
          <Button onClick={() => navigate("/")} className="bg-pharmacy-primary hover:bg-pharmacy-dark">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between">
              <h2 className="font-semibold">Cart Items ({cartCount})</h2>
              <span>Price</span>
            </div>
            
            <div className="divide-y">
              {cartItems.map((item) => {
                const discountedPrice = item.discount 
                  ? item.price - (item.price * item.discount / 100) 
                  : item.price;
                
                return (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row">
                    <div className="sm:w-24 h-24 mb-4 sm:mb-0">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    
                    <div className="flex-grow sm:ml-4">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-1">{item.category}</p>
                      
                      <div className="flex items-center mt-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="mx-3">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-auto text-red-500"
                          onClick={() => removeItemFromCart(item.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 text-right min-w-20">
                      {item.discount && item.discount > 0 ? (
                        <>
                          <div className="font-semibold">
                            {(discountedPrice * item.quantity).toFixed(2)} TK
                          </div>
                          <div className="text-sm text-gray-500 line-through">
                            {(item.price * item.quantity).toFixed(2)} TK
                          </div>
                        </>
                      ) : (
                        <div className="font-semibold">
                          {(item.price * item.quantity).toFixed(2)} TK
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
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
                className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout <ArrowRight size={16} className="ml-2" />
              </Button>
              
              <div className="mt-4 text-center">
                <Link to="/" className="text-pharmacy-primary hover:underline text-sm">
                  Continue Shopping
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
