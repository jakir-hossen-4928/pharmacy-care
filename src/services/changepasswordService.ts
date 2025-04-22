import { auth } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, User } from "firebase/auth";

export async function changeUserPassword(
  user: User,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    // Re-authenticate the user
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update the password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    // Map Firebase errors to user-friendly messages
    switch (error.code) {
      case "auth/wrong-password":
        throw new Error("Incorrect current password");
      case "auth/requires-recent-login":
        throw new Error("Session expired. Please log out and log in again.");
      case "auth/weak-password":
        throw new Error("New password must be at least 6 characters long");
      default:
        throw new Error("Failed to change password. Please try again.");
    }
  }
}