
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    document.title = "SwiftMail - Modern Email Client";
  }, []);
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Redirect based on authentication status
  return isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />;
}
