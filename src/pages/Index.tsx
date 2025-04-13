
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function Index() {
  useEffect(() => {
    document.title = "SwiftMail - Modern Email Client";
  }, []);
  
  // Redirect to the main application
  return <Navigate to="/" />;
}
