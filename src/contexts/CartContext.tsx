
import React, { createContext, useContext, useState, useEffect } from "react";
import { Medicine } from "@/lib/types";
import { 
  CartItem, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  calculateTotal, 
  getCartItemCount,
  loadCart,
  saveCart
} from "@/services/cartService";
import { toast } from "sonner";

interface CartContextType {
  cartItems: CartItem[];
  addItemToCart: (medicine: Medicine) => void;
  removeItemFromCart: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = loadCart();
    setCartItems(savedCart);
  }, []);

  // Update total and count when cart changes
  useEffect(() => {
    setCartTotal(calculateTotal(cartItems));
    setCartCount(getCartItemCount(cartItems));
  }, [cartItems]);

  const addItemToCart = (medicine: Medicine) => {
    setCartItems(prevItems => addToCart(prevItems, medicine));
    toast.success(`${medicine.name} added to cart`);
  };

  const removeItemFromCart = (id: string) => {
    setCartItems(prevItems => removeFromCart(prevItems, id));
    toast.info("Item removed from cart");
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setCartItems(prevItems => updateQuantity(prevItems, id, quantity));
  };

  const clearCart = () => {
    setCartItems([]);
    saveCart([]);
    toast.info("Cart cleared");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
