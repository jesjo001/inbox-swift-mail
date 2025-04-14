
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Inbox, LogOut, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMail } from "@/contexts/MailContext";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
  onNavItemClick?: () => void;
}

export default function Sidebar({ onNavItemClick }: SidebarProps) {
  const { user, logout } = useAuth();
  const { stats } = useMail();
  
  if (!user) return null;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="h-full w-64 bg-sidebar flex flex-col border-r border-border">
      {/* User Profile */}
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <Avatar>
          <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
          <AvatarFallback>{getInitials(`${user.firstName} ${user.lastName}`)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{user.firstName} {user.lastName}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
        <ThemeToggle />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3 px-2">
          Navigation
        </h2>
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onNavItemClick}
            >
              <Home size={18} />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/inbox" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onNavItemClick}
            >
              <Inbox size={18} />
              <span>Inbox</span>
              {stats.unread > 0 && (
                <span className="ml-auto bg-mail-unread text-white text-xs font-medium rounded-full px-2 py-0.5">
                  {stats.unread}
                </span>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onNavItemClick}
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          <LogOut size={18} className="mr-2" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
