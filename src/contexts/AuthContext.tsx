
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  updatePassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "@/lib/types";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userDetails: User | null;
  signup: (email: string, password: string, name: string, phone: string) => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, name: string, phone: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      
      // Create user document in Firestore
      const newUser: User = {
        uid: result.user.uid,
        name,
        email,
        phone,
        role: "user",
        createdAt: new Date(),
      };
      
      await setDoc(doc(db, "users", result.user.uid), newUser);
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  function changePassword(newPassword: string) {
    if (!currentUser) throw new Error("No user logged in");
    return updatePassword(currentUser, newPassword);
  }

  async function updateUserProfile(data: Partial<User>) {
    if (!currentUser || !userDetails) throw new Error("No user logged in");
    
    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(userRef, { ...data }, { merge: true });
    
    // Update local state
    setUserDetails({
      ...userDetails,
      ...data,
    });
    
    // Update display name if changed
    if (data.name && data.name !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: data.name });
    }
  }

  async function fetchUserDetails(user: FirebaseUser) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUserDetails(userData);
      } else {
        console.error("No user document found for this user");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserDetails(user);
      } else {
        setUserDetails(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userDetails,
    signup,
    login,
    logout,
    resetPassword,
    changePassword,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
