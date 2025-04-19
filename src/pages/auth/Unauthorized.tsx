
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="flex justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mt-6">Access Denied</h1>
        
        <p className="text-gray-600 mt-4">
          You don't have permission to access this page. If you believe this is an error,
          please contact the administrator.
        </p>
        
        <div className="mt-8 space-y-3">
          <Button 
            className="w-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </Button>
          
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            <Home size={18} className="mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
