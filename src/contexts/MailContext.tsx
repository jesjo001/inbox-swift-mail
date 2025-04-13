
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

// Mock data for emails (in a real app, these would come from an API)
const generateMockEmails = () => {
  const senders = [
    { name: "Alex Johnson", email: "alex@example.com" },
    { name: "Emma Williams", email: "emma@example.com" },
    { name: "Michael Brown", email: "michael@example.com" },
    { name: "Sophia Davis", email: "sophia@example.com" },
    { name: "Daniel Wilson", email: "daniel@example.com" },
    { name: "Olivia Martinez", email: "olivia@example.com" },
    { name: "James Taylor", email: "james@example.com" },
    { name: "Ava Anderson", email: "ava@example.com" }
  ];

  const subjects = [
    "Project Update: Q2 Progress Report",
    "Meeting Invitation: Team Sync Tomorrow",
    "Important: Policy Changes Effective Next Month",
    "Your Subscription Renewal Notice",
    "Feedback Requested: Recent Product Launch",
    "Monthly Newsletter: Industry Trends",
    "Action Required: Document Approval",
    "Your Account Security Alert"
  ];

  const contentParts = [
    "I wanted to reach out regarding our ongoing project. The team has made significant progress, and we're ahead of schedule on the main deliverables.",
    "I hope this email finds you well. I'm writing to provide an update on the current status of our work together.",
    "Thank you for your recent input on the design proposal. Your feedback has been invaluable, and we've incorporated many of your suggestions.",
    "Just a quick reminder about our upcoming deadline. All materials need to be submitted by Friday to ensure we stay on track.",
    "We're excited to announce a new feature that will be available next week. This enhancement addresses many of the requests we've received from users like you.",
    "Following up on our conversation last week, I've prepared the documents you requested and attached them to this email for your review.",
    "I noticed you haven't responded to our previous message. Is there any additional information you need from us to proceed with the next steps?",
    "We'd like to invite you to participate in our user research study. Your insights would be extremely valuable as we develop our roadmap for the coming year."
  ];

  return Array.from({ length: 15 }, (_, i) => {
    const sender = senders[Math.floor(Math.random() * senders.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const content = contentParts[Math.floor(Math.random() * contentParts.length)];
    const daysAgo = Math.floor(Math.random() * 14);
    const hoursAgo = Math.floor(Math.random() * 24);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo);
    
    return {
      id: `msg-${i + 1}`,
      sender,
      subject,
      content,
      date: date.toISOString(),
      read: Math.random() > 0.4, // 40% chance of being unread
      flagged: Math.random() > 0.8, // 20% chance of being flagged
      expanded: false
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, newest first
};

export interface EmailMessage {
  id: string;
  sender: {
    name: string;
    email: string;
  };
  subject: string;
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

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockEmails = generateMockEmails();
      setMessages(mockEmails);
    } catch (err) {
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

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = (id: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === id ? { ...message, read: true } : message
      )
    );
  };

  const toggleMessageExpanded = (id: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => {
        if (message.id === id) {
          const newState = { ...message, expanded: !message.expanded };
          if (newState.expanded && !newState.read) {
            newState.read = true;
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

  const stats: MailStats = {
    total: messages.length,
    unread: messages.filter(message => !message.read).length,
    percentRead: messages.length > 0 
      ? Math.round((messages.filter(message => message.read).length / messages.length) * 100) 
      : 0
  };

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
