import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Cart = () => {
  const { cartItems, cartCount, removeFromCart, updateQuantity, totalPrice, deliveryCharge, loading, operationLoading } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAnyOperationLoading = Object.values(operationLoading).some(Boolean);

  const handleRemoveFromCart = async (cartItemId: string, itemName: string) => {
    try {
      await removeFromCart(cartItemId);
      toast({
        title: "Removed from Cart",
        description: `${itemName} has been removed from your cart.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, itemName: string, quantity: number) => {
    try {
      await updateQuantity(cartItemId, quantity);
      toast({
        title: "Quantity Updated",
        description: `Updated ${itemName} quantity to ${quantity}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <Loader2 className="animate-spin mx-auto text-pharmacy-primary" size={24} />
        <p className="mt-2 text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="bg-gray-50 p-10 rounded-lg text-center">
        <h3 className="text-xl font-medium text-gray-800 mb-2">Your Cart is Empty</h3>
        <p className="text-gray-600">Add some medicines to your cart to proceed.</p>
        <Button className="mt-4 bg-pharmacy-primary hover:bg-pharmacy-dark" onClick={() => navigate("/")}>
          Shop Now
        </Button>
      </div>
    );
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Shopping Cart ({cartCount} items)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 sm:w-20">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => {
                const price = item.orderType === "wholesale" && item.medicine.wholesalePrice != null
                  ? item.medicine.wholesalePrice
                  : item.medicine.discount && item.medicine.discount > 0
                    ? item.medicine.price * (1 - item.medicine.discount / 100)
                    : item.medicine.price;
                const isRemoving = operationLoading[`remove_${item.id}`];
                const isUpdating = operationLoading[`update_${item.id}`];
                const minQuantity = item.orderType === "wholesale" && item.medicine.minWholesaleQuantity
                  ? item.medicine.minWholesaleQuantity
                  : 1;
                const itemTotal = price * item.quantity;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img
                        src={item.medicine.imageUrl}
                        alt={item.medicine.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.medicine.name}</TableCell>
                    <TableCell>{item.orderType.charAt(0).toUpperCase() + item.orderType.slice(1)}</TableCell>
                    <TableCell>{price.toFixed(2)} TK</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.medicine.name, Math.max(minQuantity, item.quantity - 1))}
                          disabled={item.quantity <= minQuantity || isUpdating || isRemoving || isAnyOperationLoading}
                          aria-label={`Decrease quantity of ${item.medicine.name}`}
                        >
                          {isUpdating && item.quantity - 1 === item.quantity ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.medicine.name, item.quantity + 1)}
                          disabled={item.quantity >= item.medicine.stock || isUpdating || isRemoving || isAnyOperationLoading}
                          aria-label={`Increase quantity of ${item.medicine.name}`}
                        >
                          {isUpdating && item.quantity + 1 === item.quantity ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {item.orderType === "wholesale" && item.medicine.minWholesaleQuantity && (
                        <p className="text-xs text-gray-600 mt-1">Min: {item.medicine.minWholesaleQuantity} units</p>
                      )}
                    </TableCell>
                    <TableCell>{itemTotal.toFixed(2)} TK</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveFromCart(item.id, item.medicine.name)}
                        disabled={isRemoving || isUpdating || isAnyOperationLoading}
                        aria-label={`Remove ${item.medicine.name} from cart`}
                      >
                        {isRemoving ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Subtotal: {(totalPrice - deliveryCharge).toFixed(2)} TK</h3>
            <h3 className="text-lg font-medium">Delivery Charge: {deliveryCharge.toFixed(2)} TK</h3>
            <h3 className="text-lg font-medium">Total: {totalPrice.toFixed(2)} TK</h3>
          </div>
          <Button
            className="bg-pharmacy-primary hover:bg-pharmacy-dark"
            onClick={() => navigate("/checkout")}
            disabled={isAnyOperationLoading}
            aria-label="Proceed to checkout"
          >
            Proceed to Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Cart;