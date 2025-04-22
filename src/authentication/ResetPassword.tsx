
import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await resetPassword(values.email);
        setEmailSent(true);
        toast.success("Password reset email sent!");
      } catch (error: any) {
        console.error(error);
        let errorMessage = "Failed to send reset email";
        
        // Firebase error codes
        if (error.code === "auth/user-not-found") {
          errorMessage = "No account found with this email";
        }
        
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link to="/">
            <h1 className="text-3xl font-bold text-pharmacy-primary">Pharmacy Care</h1>
          </Link>
          <h2 className="mt-2 text-lg text-gray-600">Reset your password</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Password Reset</CardTitle>
            <CardDescription>
              {emailSent 
                ? "Check your email for a password reset link"
                : "Enter your email to receive a password reset link"
              }
            </CardDescription>
          </CardHeader>
          
          {!emailSent ? (
            <form onSubmit={formik.handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    {...formik.getFieldProps("email")}
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-sm text-red-500">{formik.errors.email}</div>
                  ) : null}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <Button
                  type="submit"
                  className="w-full bg-pharmacy-primary hover:bg-pharmacy-dark"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                
                <div className="mt-4 text-center text-sm text-gray-600">
                  <Link to="/login" className="text-pharmacy-primary hover:underline flex items-center justify-center">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-700 text-sm">
                <p><strong>Email sent!</strong> Check your inbox for the password reset link.</p>
                <p className="mt-2">If you don't see it, check your spam folder or try again.</p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEmailSent(false);
                    formik.resetForm();
                  }}
                >
                  Send again
                </Button>
                
                <Link to="/login">
                  <Button variant="link" className="w-full text-pharmacy-primary">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
