
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in on app load
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authApi.getCurrentUser();
          const userData = response.data;
          setUser({
            id: userData.id,
            email: userData.email,
            firstName: userData.first_name || 'User',
            lastName: userData.last_name || '',
            avatar: `https://ui-avatars.com/api/?name=${userData.first_name || 'U'}+${userData.last_name || 'A'}&background=9b87f5&color=fff`
          });
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await authApi.login(username, password);
      console.log("Login response:", response);
      const { token } = response.data;
      
      // Store tokens
      localStorage.setItem('token', token);
      
      // Get user info
      const userInfoResponse = await authApi.getCurrentUser();
      const userInfo = userInfoResponse.data;

      
      
      setUser({
        id: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.firstName || 'User',
        lastName: userInfo.lastName || '',
        avatar: `https://ui-avatars.com/api/?name=${userInfo.first_name || 'U'}+${userInfo.last_name || 'A'}&background=9b87f5&color=fff`
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userInfo.first_name || 'User'}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.response.data.message || "Invalid email or password. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
