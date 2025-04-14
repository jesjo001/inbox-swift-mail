import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Inbox, LogOut, Settings, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMail } from "@/contexts/MailContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { stats } = useMail();
  const { theme, setTheme } = useTheme();
  
  if (!user) return null;
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const navigationItems = [
    { to: "/app", label: "Home", icon: <Home size={18} /> },
    { 
      to: "/app/inbox", 
      label: "Inbox", 
      icon: <Inbox size={18} />,
      badge: stats.unread > 0 ? stats.unread : null 
    },
    { to: "/app/settings", label: "Settings", icon: <Settings size={18} /> }
  ];
  
  return (
    <div className="h-full flex flex-col bg-card" id="sidebar">
      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback>{getInitials(`${user.firstName} ${user.lastName}`)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3 px-2">
          Navigation
        </h2>
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/app"}
                className={({ isActive }) => `
                  flex items-center px-3 py-2 rounded-md text-sm
                  ${isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'}
                  transition-colors
                `}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs font-medium rounded-full px-2 py-0.5">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground">
            Theme
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label={`Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  className="h-8 w-8"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => logout()}
        >
          <LogOut size={18} className="mr-2" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}