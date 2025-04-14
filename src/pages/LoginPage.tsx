
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const [username, setUsername] = useState("JohnDoe");
  const [password, setPassword] = useState("password");
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      // Explicitly navigate after login
      navigate("/app");
    } catch (error) {
      // Error handled in AuthContext
      console.log("Login error:", error);
    }
  };
  
  if (isAuthenticated) {
    return <Navigate to="/app" />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mb-4">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-bold">SwiftMail</h1>
          <p className="text-muted-foreground">Sign in to access your inbox</p>
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <Link to="/landing" className="flex items-center text-primary hover:underline text-sm mt-2">
            <ArrowLeft size={16} className="mr-1" />
            Back to home
          </Link>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="JohnDoe"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              Demo credentials are pre-filled for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
