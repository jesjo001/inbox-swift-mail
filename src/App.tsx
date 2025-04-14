import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MailProvider } from "@/contexts/MailContext";

// Layouts
import MainLayout from "@/components/MainLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import Homepage from "@/pages/Homepage";
import InboxPage from "@/pages/InboxPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import LoadingSpinner from "@/components/LoadingSpinner"; // Create this component or use existing loading UI
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

// Protected route component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Auth route component - redirects to dashboard if already authenticated
const AuthRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    // Redirect to the page they came from or to the dashboard
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }
  
  return <>{children}</>;
};

// Root route handler to manage initial redirection
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
  <ThemeProvider> {/* Add ThemeProvider here */}
    <TooltipProvider>
      <AuthProvider>
        <MailProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>

            <Route path="/" element={<Navigate to="/landing" />} />
            <Route path="/landing" element={<LandingPage />} />
              {/* Initial redirect based on auth state */}
              <Route path="/index.html" element={<RootRedirect />} />
              
              {/* Auth routes - redirect to dashboard if logged in */}
              <Route path="/login" element={
                <AuthRoute>
                  <LoginPage />
                </AuthRoute>
              } />
              <Route path="/signup" element={
                <AuthRoute>
                  <SignupPage />
                </AuthRoute>
              } />
              
              {/* Protected routes - require authentication */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Homepage />} />
                <Route path="inbox" element={<InboxPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              {/* Root path redirect */}
              <Route path="" element={<RootRedirect />} />
              
              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </MailProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;