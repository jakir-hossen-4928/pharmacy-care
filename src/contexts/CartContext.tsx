import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Medicine, CartItem } from "@/lib/types";
import { addToCart as addToCartService, getCartItems, removeFromCart as removeFromCartService, updateCartItemQuantity } from "@/services/cartService";
import { useToast } from "@/components/ui/use-toast";
import { getUserProfile } from "@/services/userProfieService";

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (medicine: Medicine, quantity?: number, orderType?: CartItem["orderType"]) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalPrice: number;
  deliveryCharge: number;
  loading: boolean;
  operationLoading: { [key: string]: boolean };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<{ [key: string]: boolean }>({});
  const isFetching = useRef(false);

  useEffect(() => {
    if (currentUser && !isFetching.current) {
      fetchCartItems();
    } else if (!currentUser) {
      setCartItems([]);
      setDeliveryCharge(0);
      setLoading(false);
    }
  }, [currentUser?.uid]);

  async function fetchCartItems() {
    if (!currentUser || isFetching.current) return;
    isFetching.current = true;
    try {
      setLoading(true);
      const items = await getCartItems(currentUser.uid);
      setCartItems(items);
      // Calculate delivery charge based on cart contents and default address
      let charge = 0;
      if (items.some((item) => item.orderType === "retail")) {
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          const defaultAddress = userProfile.addresses?.find((addr) => addr.isDefault);
          charge = defaultAddress?.division?.toLowerCase() === "dhaka" ? 80 : 120;
        } catch (error) {
          console.warn("Could not fetch user profile for delivery charge:", error);
          charge = 120; // Fallback to outside Dhaka
        }
      }
      setDeliveryCharge(charge);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cart items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }

  async function addToCart(medicine: Medicine, quantity: number = 1, orderType: CartItem["orderType"] = "retail") {
    if (!currentUser) throw new Error("User must be logged in to add to cart");
    const operationKey = `add_${medicine.id}_${orderType}`;
    try {
      setOperationLoading((prev) => ({ ...prev, [operationKey]: true }));
      await addToCartService(currentUser.uid, medicine, quantity, orderType);
      await fetchCartItems();
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setOperationLoading((prev) => ({ ...prev, [operationKey]: false }));
    }
  }

  async function removeFromCart(cartItemId: string) {
    if (!currentUser) throw new Error("User must be logged in");
    const operationKey = `remove_${cartItemId}`;
    try {
      setOperationLoading((prev) => ({ ...prev, [operationKey]: true }));
      await removeFromCartService(currentUser.uid, cartItemId);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      // Recalculate delivery charge
      const remainingItems = cartItems.filter((item) => item.id !== cartItemId);
      let charge = 0;
      if (remainingItems.some((item) => item.orderType === "retail")) {
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          const defaultAddress = userProfile.addresses?.find((addr) => addr.isDefault);
          charge = defaultAddress?.division?.toLowerCase() === "dhaka" ? 80 : 120;
        } catch (error) {
          console.warn("Could not fetch user profile for delivery charge:", error);
          charge = 120;
        }
      }
      setDeliveryCharge(charge);
    } catch (error) {
      console.error("Error removing from cart:", error);
      await fetchCartItems();
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setOperationLoading((prev) => ({ ...prev, [operationKey]: false }));
    }
  }

  async function updateQuantity(cartItemId: string, quantity: number) {
    if (!currentUser) throw new Error("User must be logged in");
    const operationKey = `update_${cartItemId}`;
    try {
      setOperationLoading((prev) => ({ ...prev, [operationKey]: true }));
      await updateCartItemQuantity(currentUser.uid, cartItemId, quantity);
      await fetchCartItems();
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update cart quantity.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setOperationLoading((prev) => ({ ...prev, [operationKey]: false }));
    }
  }

  async function clearCart() {
    if (!currentUser) return;
    const operationKey = "clear_cart";
    try {
      setOperationLoading((prev) => ({ ...prev, [operationKey]: true }));
      setCartItems([]);
      setDeliveryCharge(0);
      await fetchCartItems();
    } catch (error) {
      console.error("Error clearing cart:", error);
      await fetchCartItems();
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    } finally {
      setOperationLoading((prev) => ({ ...prev, [operationKey]: false }));
    }
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.orderType === "wholesale" && item.medicine.wholesalePrice != null
      ? item.medicine.wholesalePrice
      : item.medicine.discount && item.medicine.discount > 0
        ? item.medicine.price * (1 - item.medicine.discount / 100)
        : item.medicine.price;
    return sum + price * item.quantity;
  }, 0);
  const totalPrice = subtotal + deliveryCharge;

  const value = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    deliveryCharge,
    loading,
    operationLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}