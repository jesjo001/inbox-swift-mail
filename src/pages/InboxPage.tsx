import { useMail, formatEmailDate, EmailMessage } from "@/contexts/MailContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Filter, Star, Mail, MailOpen, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ComposeMessage } from "@/components/ComposeMessage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function MessageRow({ message, isActive, onSelect }: { 
  message: EmailMessage; 
  isActive: boolean;
  onSelect: () => void;
}) {
  const { toggleMessageExpanded } = useMail();
  
  return (
    <div 
      className={cn(
        "group flex items-start p-3 gap-3 border-b last:border-0 transition-colors cursor-pointer",
        !message.read && "bg-primary/5",
        isActive && "bg-muted/60"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-expanded={message.expanded}
    >
      {/* Left column: Avatar/Icon */}
      <div className="flex-shrink-0 pt-1">
        {!message.read ? (
          <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
        ) : (
          <div className="h-2 w-2 rounded-full border border-muted-foreground/30 mt-1.5" />
        )}
      </div>
      
      {/* Middle column: Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            "text-sm truncate mr-2", 
            !message.read ? "font-semibold" : "font-medium"
          )}>
            {message.sender.name}
          </h3>
          <div className="flex items-center gap-1">
            {!message.read && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                New
              </Badge>
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatEmailDate(message.date)}
            </span>
          </div>
        </div>
        <p className={cn(
          "text-sm truncate", 
          !message.read ? "font-medium" : ""
        )}>
          {message.subject}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-1">
          {message.content.substring(0, 100)}
        </p>
        
        {message.expanded && (
          <div className="message-content mt-4 pt-4 border-t">
            <div className="flex gap-3 items-start mb-4">
              <Avatar className="w-9 h-9">
                <div className="bg-primary text-primary-foreground w-full h-full rounded-full flex items-center justify-center text-sm font-medium">
                  {message.sender.name.charAt(0)}
                </div>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{message.sender.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {message.sender.email}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(message.date).toLocaleString()}
                  </p>
                </div>
                <h5 className="font-medium mt-3">{message.subject}</h5>
              </div>
            </div>
            <div className="prose prose-sm max-w-none pl-12">
              <p className="whitespace-pre-line">{message.content}</p>
              <div className="mt-6 text-sm text-muted-foreground">
                <p>Best regards,<br />{message.sender.name}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6 pl-12">
              <Button size="sm" variant="secondary">Reply</Button>
              <Button size="sm" variant="outline">Forward</Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Right column: Actions */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Star size={16} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const { 
    filteredMessages, 
    isLoading, 
    fetchMessages, 
    filter, 
    setFilter,
    searchTerm,
    setSearchTerm,
    toggleMessageExpanded,
  } = useMail();
  
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  useEffect(() => {
    document.title = "Inbox - Mail App";
  }, []);
  
  const handleMessageSelect = (id: string) => {
    setSelectedMessageId(id);
    toggleMessageExpanded(id);
  };
  
  const handleRefresh = () => {
    fetchMessages();
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Inbox</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-1">
            {filteredMessages.length} messages
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            className="h-8 w-8"
          >
            <RefreshCw size={16} className="text-muted-foreground" />
          </Button>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="border-b p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search emails..."
              className="pl-8 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "text-muted-foreground", 
                filter === 'all' && "bg-muted text-foreground"
              )}
              onClick={() => setFilter('all')}
            >
              <Mail size={16} className="mr-1" />
              All
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "text-muted-foreground", 
                filter === 'unread' && "bg-muted text-foreground"
              )}
              onClick={() => setFilter('unread')}
            >
              <MailOpen size={16} className="mr-1" />
              Unread
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Filter size={16} className="mr-1" />
                  Filter
                  <ChevronDown size={14} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter Messages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={filter} onValueChange={(value: "all" | "read" | "unread") => setFilter(value)}>
                  <DropdownMenuRadioItem value="all">All Messages</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="read">Read Messages</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="unread">Unread Messages</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Messages list */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Mail size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No messages found</h3>
              <p className="text-muted-foreground max-w-md mt-1">
                {searchTerm
                  ? "Try using different search terms or adjusting your filters"
                  : filter !== 'all'
                    ? `No ${filter} messages in your inbox`
                    : "Your inbox is empty"}
              </p>
              {filter !== 'all' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setFilter('all')}
                >
                  View all messages
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((message) => (
                <MessageRow 
                  key={message.id} 
                  message={message} 
                  isActive={selectedMessageId === message.id}
                  onSelect={() => handleMessageSelect(message.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Compose button - fixed position */}
      <div className="fixed bottom-6 right-6">
        <ComposeMessage />
      </div>
    </div>
  );
}