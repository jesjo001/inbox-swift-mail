import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { messagesApi } from "@/lib/api";
import { useAuth } from "./AuthContext"; // Import useAuth to access authentication state

export interface EmailMessage {
  id: string;
  sender: {
    name: string;
    email: string;
  };
  subject: string;
  senderUserName?: string;
  content: string;
  date: string;
  read: boolean;
  flagged: boolean;
  expanded: boolean;
}

interface MailStats {
  total: number;
  unread: number;
  percentRead: number;
  dailyActivity?: { date: string; count: number }[];
  topSenders?: { name: string; count: number }[];
}

interface MailContextType {
  messages: EmailMessage[];
  isLoading: boolean;
  error: string | null;
  stats: MailStats;
  fetchMessages: () => Promise<void>;
  markAsRead: (id: string) => void;
  toggleMessageExpanded: (id: string) => void;
  getMessageById: (id: string) => EmailMessage | undefined;
  filter: 'all' | 'read' | 'unread';
  setFilter: (filter: 'all' | 'read' | 'unread') => void;
  filteredMessages: EmailMessage[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const MailContext = createContext<MailContextType | undefined>(undefined);

export function MailProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth(); // Get auth state

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await messagesApi.getAllMessages();
      const apiMessages = response.data;
      
      console.log("Fetched messages:", apiMessages); // Log the fetched messages
      interface ApiMessage {
        _id?: string;
        id?: string;
        sender: {
          firstName: string;
          lastName: string;
          username: string;
        };
        senderUserName: string;
        subject: string;
        recipient: string;
        content: string;
        createdAt: string;
        isRead: boolean;
      }

      const formattedMessages: EmailMessage[] = apiMessages.map((msg: ApiMessage) => ({
        id: msg._id,
        sender: {
          name: msg.senderUserName || `${msg.sender.firstName} ${msg.sender.lastName}`,
          email: msg.recipient
        },
        subject: msg.subject,
        content: msg.content,
        date: msg.createdAt,
        read: msg.isRead,
        flagged: false,
        expanded: false
      }));
      
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch messages. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // This effect runs when authentication state changes
  useEffect(() => {
    // Only fetch messages when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated, authLoading]);

  const markAsRead = async (id: string) => {
    try {
      await messagesApi.markAsRead(id);
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === id ? { ...message, read: true } : message
        )
      );
    } catch (err) {
      console.error("Error marking message as read:", err);
      toast({
        title: "Error",
        description: "Failed to mark message as read.",
        variant: "destructive"
      });
    }
  };

  const toggleMessageExpanded = (id: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => {
        if (message.id === id) {
          const newState = { ...message, expanded: !message.expanded };
          if (newState.expanded && !newState.read) {
            markAsRead(id);
          }
          return newState;
        }
        return message;
      })
    );
  };

  const getMessageById = (id: string) => {
    return messages.find(message => message.id === id);
  };

  // Process messages for analytics
  const processStats = (msgs: EmailMessage[]): MailStats => {
    if (!msgs.length) {
      return { total: 0, unread: 0, percentRead: 0 };
    }

    console.log("Processing stats for messages:", msgs);  
    
    const total = msgs.length;
    const unread = msgs.filter(msg => !msg.read).length;
    const percentRead = total > 0 
      ? Math.round(((total - unread) / total) * 100)
      : 0;
      
    // Calculate daily activity (messages per day)
    const msgsByDate: Record<string, number> = {};
    msgs.forEach(msg => {
      const date = format(new Date(msg.date), 'yyyy-MM-dd');
      msgsByDate[date] = (msgsByDate[date] || 0) + 1;
    });
    
    const dailyActivity = Object.entries(msgsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
      
    // Calculate top senders
    const senderCounts: Record<string, number> = {};
    msgs.forEach(msg => {
      const sender = msg.sender.name;
      senderCounts[sender] = (senderCounts[sender] || 0) + 1;
    });
    
    const topSenders = Object.entries(senderCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 senders
      
    return {
      total,
      unread,
      percentRead,
      dailyActivity,
      topSenders
    };
  };
  
  const stats = processStats(messages);

  const filteredMessages = messages
    .filter(message => {
      if (filter === 'read') return message.read;
      if (filter === 'unread') return !message.read;
      return true;
    })
    .filter(message => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        message.subject.toLowerCase().includes(term) ||
        message.sender.name.toLowerCase().includes(term) ||
        message.sender.email.toLowerCase().includes(term) ||
        message.content.toLowerCase().includes(term)
      );
    });

  return (
    <MailContext.Provider 
      value={{ 
        messages, 
        isLoading, 
        error, 
        stats, 
        fetchMessages, 
        markAsRead, 
        toggleMessageExpanded, 
        getMessageById,
        filter,
        setFilter,
        filteredMessages,
        searchTerm,
        setSearchTerm
      }}
    >
      {children}
    </MailContext.Provider>
  );
}

export function useMail() {
  const context = useContext(MailContext);
  if (context === undefined) {
    throw new Error("useMail must be used within a MailProvider");
  }
  return context;
}

export function formatEmailDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return format(date, "h:mm a"); // Today, show time
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return format(date, "EEEE"); // Day of week
  } else {
    return format(date, "MMM d"); // Month and day
  }
}