import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where, getDoc } from "firebase/firestore";
import { Medicine, CartItem } from "@/lib/types";

export async function addToCart(
  userId: string,
  medicine: Medicine,
  quantity: number = 1,
  orderType: CartItem["orderType"] = "retail"
): Promise<void> {
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");
  if (orderType === "wholesale") {
    if (medicine.wholesalePrice == null || medicine.minWholesaleQuantity == null) {
      throw new Error(`${medicine.name} is not available for wholesale`);
    }
    if (quantity < medicine.minWholesaleQuantity) {
      throw new Error(
        `Wholesale order for ${medicine.name} requires at least ${medicine.minWholesaleQuantity} units`
      );
    }
  }
  if (quantity > medicine.stock) {
    throw new Error(`Only ${medicine.stock} units of ${medicine.name} are available`);
  }

  // Sanitize medicine object to ensure no undefined values
  const sanitizedMedicine: Medicine = {
    ...medicine,
    wholesalePrice: medicine.wholesalePrice ?? null,
    minWholesaleQuantity: medicine.minWholesaleQuantity ?? null,
  };

  const cartRef = collection(db, "carts", userId, "items");
  const q = query(cartRef, where("medicine.id", "==", medicine.id), where("orderType", "==", orderType));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Update existing cart item
    const cartItemDoc = querySnapshot.docs[0];
    const newQuantity = cartItemDoc.data().quantity + quantity;
    if (newQuantity > medicine.stock) {
      throw new Error(`Only ${medicine.stock} units of ${medicine.name} are available`);
    }
    if (orderType === "wholesale" && newQuantity < medicine.minWholesaleQuantity!) {
      throw new Error(
        `Wholesale order for ${medicine.name} requires at least ${medicine.minWholesaleQuantity} units`
      );
    }
    await updateDoc(cartItemDoc.ref, { quantity: newQuantity });
  } else {
    // Add new cart item
    await addDoc(cartRef, {
      medicine: sanitizedMedicine,
      quantity,
      orderType,
      addedAt: new Date(),
    });
  }
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const cartRef = collection(db, "carts", userId, "items");
  const querySnapshot = await getDocs(cartRef);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    addedAt: doc.data().addedAt.toDate(),
  } as CartItem));
}

export async function removeFromCart(userId: string, cartItemId: string): Promise<void> {
  const cartItemRef = doc(db, "carts", userId, "items", cartItemId);
  await deleteDoc(cartItemRef);
}

export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<void> {
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");
  const cartItemRef = doc(db, "carts", userId, "items", cartItemId);
  const cartItemSnap = await getDoc(cartItemRef);
  if (!cartItemSnap.exists()) throw new Error("Cart item not found");

  const cartItem = cartItemSnap.data() as CartItem;
  if (quantity > cartItem.medicine.stock) {
    throw new Error(`Only ${cartItem.medicine.stock} units of ${cartItem.medicine.name} are available`);
  }
  if (cartItem.orderType === "wholesale" && cartItem.medicine.minWholesaleQuantity) {
    if (quantity < cartItem.medicine.minWholesaleQuantity) {
      throw new Error(
        `Wholesale order for ${cartItem.medicine.name} requires at least ${cartItem.medicine.minWholesaleQuantity} units`
      );
    }
  }

  await updateDoc(cartItemRef, { quantity });
}

export async function clearCart(userId: string): Promise<void> {
  const cartRef = collection(db, "carts", userId, "items");
  const querySnapshot = await getDocs(cartRef);
  const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}