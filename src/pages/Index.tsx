import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    document.title = "SwiftMail - Modern Email Client";
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Get intended destination from router state, if available
  const from = location.state?.from?.pathname || "/";
  
  // If authenticated, go to intended destination or dashboard
  // If not authenticated, go to login
  return isAuthenticated ? <Navigate to={from} replace /> : <Navigate to="/login" replace />;
}