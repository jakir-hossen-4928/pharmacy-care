import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User, Address } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function getUserProfile(userId: string): Promise<User | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      uid: userSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      addresses: data.addresses || [],
    } as User;
  }
  return null;
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, updates, { merge: true });
}

export async function addUserAddress(userId: string, address: Omit<Address, "id">): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const addresses = userData.addresses || [];
    const newAddress = { ...address, id: uuidv4() };
    await setDoc(userRef, { addresses: [...addresses, newAddress] }, { merge: true });
  }
}

export async function updateUserAddress(userId: string, address: Address): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const addresses = userData.addresses || [];
    const updatedAddresses = addresses.map((addr: Address) =>
      addr.id === address.id ? address : addr
    );
    await setDoc(userRef, { addresses: updatedAddresses }, { merge: true });
  }
}

export async function deleteUserAddress(userId: string, addressId: string): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const addresses = userData.addresses || [];
    const updatedAddresses = addresses.filter((addr: Address) => addr.id !== addressId);
    await setDoc(userRef, { addresses: updatedAddresses }, { merge: true });
  }
}