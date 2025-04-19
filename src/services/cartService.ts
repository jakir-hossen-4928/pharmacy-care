
import { Medicine } from "@/lib/types";

// Define cart item type with quantity
export interface CartItem extends Medicine {
  quantity: number;
}

// Save cart to localStorage
export const saveCart = (items: CartItem[]) => {
  localStorage.setItem('cart', JSON.stringify(items));
};

// Load cart from localStorage
export const loadCart = (): CartItem[] => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

// Add item to cart
export const addToCart = (items: CartItem[], medicine: Medicine): CartItem[] => {
  const existingItemIndex = items.findIndex(item => item.id === medicine.id);
  
  if (existingItemIndex !== -1) {
    // Item already exists, increment quantity
    const updatedItems = [...items];
    updatedItems[existingItemIndex] = {
      ...updatedItems[existingItemIndex],
      quantity: updatedItems[existingItemIndex].quantity + 1
    };
    saveCart(updatedItems);
    return updatedItems;
  } else {
    // Item doesn't exist, add new item with quantity 1
    const newItems = [...items, { ...medicine, quantity: 1 }];
    saveCart(newItems);
    return newItems;
  }
};

// Remove item from cart
export const removeFromCart = (items: CartItem[], id: string): CartItem[] => {
  const updatedItems = items.filter(item => item.id !== id);
  saveCart(updatedItems);
  return updatedItems;
};

// Update item quantity in cart
export const updateQuantity = (items: CartItem[], id: string, quantity: number): CartItem[] => {
  const updatedItems = items.map(item => 
    item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
  );
  saveCart(updatedItems);
  return updatedItems;
};

// Calculate cart total
export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const itemPrice = item.discount 
      ? item.price - (item.price * item.discount / 100) 
      : item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
};

// Get cart item count
export const getCartItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};
