import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  logout: (redirectTo?: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Function to fetch current user data
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    
    try {
      const response = await authApi.getCurrentUser();
      const userData = response.data;
      
      // Format user data
      setUser({
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name || 'User',
        lastName: userData.last_name || '',
        avatar: `https://ui-avatars.com/api/?name=${userData.first_name || 'U'}+${userData.last_name || 'A'}&background=9b87f5&color=fff`
      });
      return userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      // Token might be invalid, clear it
      localStorage.removeItem('token');
      setUser(null);
      return null;
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await authApi.login(username, password);
      const { token } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Get user info
      const userInfo = await refreshUser();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userInfo?.first_name || 'User'}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid email or password. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (redirectTo?: string) => {
    setIsLoading(true);
    
    try {
      // Try to call logout API if available
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('token');
      setUser(null);
      setIsLoading(false);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Handle redirect if provided
      if (redirectTo && window) {
        window.location.href = redirectTo;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}