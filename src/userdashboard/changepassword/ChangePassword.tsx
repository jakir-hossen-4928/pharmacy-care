import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { changeUserPassword } from "@/services/changePasswordService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileWarning, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { z } from "zod";

// Zod schema for form validation
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New password must contain at least one lowercase letter")
      .regex(/[0-9]/, "New password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "New password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof passwordSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

const ChangePassword = () => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (score <= 4) return { label: "Medium", color: "bg-yellow-500", width: "w-2/3" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const passwordStrength = getPasswordStrength(form.newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    // Validate with Zod
    const result = passwordSchema.safeParse(form);
    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as keyof FormData] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    if (!currentUser) return;

    setLoading(true);
    try {
      await changeUserPassword(currentUser, form.currentPassword, form.newPassword);
      toast.success("Password changed successfully! You’re all set.", {
        position: "top-right",
        autoClose: 3000,
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setCurrentPasswordVisible(false);
      setNewPasswordVisible(false);
      setConfirmPasswordVisible(false);
    } catch (err: any) {
      let errorMessage = "Failed to change password. Please try again.";
      if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect current password.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }
      setFormError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setFormError(null);
    setCurrentPasswordVisible(false);
    setNewPasswordVisible(false);
    setConfirmPasswordVisible(false);
  };

  if (!currentUser) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center max-w-md mx-auto">
        <FileWarning size={32} className="mx-auto text-red-500 mb-4 sm:size-48" />
        <h3 className="text-lg sm:text-xl font-medium text-red-800 mb-2">Access Denied</h3>
        <p className="text-red-700 text-sm sm:text-base">Please log in to change your password.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-pharmacy-primary">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm sm:text-base font-medium">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={currentPasswordVisible ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  className={`pr-10 text-sm sm:text-base ${
                    errors.currentPassword ? "border-red-500" : ""
                  } focus:ring-2 focus:ring-pharmacy-primary transition-colors`}
                  aria-invalid={!!errors.currentPassword}
                  aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setCurrentPasswordVisible(!currentPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  aria-label={currentPasswordVisible ? "Hide current password" : "Show current password"}
                >
                  {currentPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p id="currentPassword-error" className="text-red-500 text-xs sm:text-sm mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm sm:text-base font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={newPasswordVisible ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  className={`pr-10 text-sm sm:text-base ${
                    errors.newPassword ? "border-red-500" : ""
                  } focus:ring-2 focus:ring-pharmacy-primary transition-colors`}
                  aria-invalid={!!errors.newPassword}
                  aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  aria-label={newPasswordVisible ? "Hide new password" : "Show new password"}
                >
                  {newPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p id="newPassword-error" className="text-red-500 text-xs sm:text-sm mt-1">
                  {errors.newPassword}
                </p>
              )}
              {form.newPassword && (
                <div className="mt-2">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Password Strength: <span className={`font-semibold ${passwordStrength.color.replace("bg-", "text-")}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full mt-1">
                    <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} rounded-full transition-all`} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm sm:text-base font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`pr-10 text-sm sm:text-base ${
                    errors.confirmPassword ? "border-red-500" : ""
                  } focus:ring-2 focus:ring-pharmacy-primary transition-colors`}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  aria-label={confirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
                >
                  {confirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-red-500 text-xs sm:text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {formError && (
              <div className="bg-red-100 p-3 rounded text-red-700 text-sm sm:text-base">
                {formError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark transition-colors duration-200 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="w-full border-gray-300 hover:bg-gray-100 transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;