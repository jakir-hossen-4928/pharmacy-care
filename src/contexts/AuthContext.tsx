import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "@/lib/types";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userDetails: User | null;
  signup: (email: string, password: string, name: string, phone: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define caching functions only once
const getCachedUserDetails = (uid: string): User | null => {
  const cached = localStorage.getItem(`userDetails_${uid}`);
  return cached ? JSON.parse(cached) : null;
};

const setCachedUserDetails = (uid: string, user: User) => {
  localStorage.setItem(`userDetails_${uid}`, JSON.stringify(user));
};

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

      const newUser: User = {
        uid: result.user.uid,
        name,
        email,
        phone,
        role: "user",
        createdAt: new Date(),
      };

      await setDoc(doc(db, "users", result.user.uid), newUser);
      setUserDetails(newUser);
      setCachedUserDetails(result.user.uid, newUser);
    } catch (error: any) {
      console.error("Error during signup:", error);
      let errorMessage = "Failed to create account";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }
      throw new Error(errorMessage);
    }
  }

  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Error during login:", error);
      let errorMessage = "Failed to login";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password";
      }
      throw new Error(errorMessage);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setUserDetails(null);
    } catch (error) {
      console.error("Error during logout:", error);
      throw new Error("Failed to log out");
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      let errorMessage = "Failed to send password reset email";
      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      }
      throw new Error(errorMessage);
    }
  }

  async function changePassword(newPassword: string) {
    if (!currentUser) throw new Error("No user logged in");
    try {
      await updatePassword(currentUser, newPassword);
    } catch (error: any) {
      console.error("Error changing password:", error);
      let errorMessage = "Failed to change password";
      if (error.code === "auth/weak-password") {
        errorMessage = "New password is too weak";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log in again to change your password";
      }
      throw new Error(errorMessage);
    }
  }

  async function updateUserProfile(data: Partial<User>) {
    if (!currentUser || !userDetails) throw new Error("No user logged in");
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, { ...data }, { merge: true });

      const updatedUser = {
        ...userDetails,
        ...data,
      };
      setUserDetails(updatedUser);
      setCachedUserDetails(currentUser.uid, updatedUser);

      if (data.name && data.name !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: data.name });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Failed to update profile");
    }
  }

  async function fetchUserDetails(user: FirebaseUser) {
    let cachedUser: User | null = null; // Initialize cachedUser
    try {
      cachedUser = getCachedUserDetails(user.uid);
      if (cachedUser) {
        setUserDetails(cachedUser);
        setLoading(false);
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUserDetails(userData);
        setCachedUserDetails(user.uid, userData);
      } else {
        const defaultUser: User = {
          uid: user.uid,
          name: user.displayName || "User",
          email: user.email || "",
          phone: "",
          role: "user",
          createdAt: new Date(),
        };
        await setDoc(doc(db, "users", user.uid), defaultUser);
        setUserDetails(defaultUser);
        setCachedUserDetails(user.uid, defaultUser);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserDetails(null);
    } finally {
      if (!cachedUser) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserDetails(user);
      } else {
        setUserDetails(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}