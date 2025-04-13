
import { useMail, formatEmailDate, EmailMessage } from "@/contexts/MailContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Filter } from "lucide-react";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function MessageRow({ message }: { message: EmailMessage }) {
  const { toggleMessageExpanded } = useMail();
  
  return (
    <div
      className={`message-row ${!message.read ? 'unread' : ''} ${message.expanded ? 'expanded' : ''}`}
      onClick={() => toggleMessageExpanded(message.id)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <h3 className={`text-sm font-medium mr-2 truncate ${!message.read ? 'font-semibold' : ''}`}>
            {message.sender.name}
          </h3>
          <span className="text-xs text-muted-foreground">
            {formatEmailDate(message.date)}
          </span>
        </div>
        <p className={`text-sm truncate ${!message.read ? 'font-medium' : ''}`}>
          {message.subject}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {message.content.substring(0, 80)}...
        </p>
        
        {message.expanded && (
          <div className="message-content">
            <h4 className="text-lg font-medium mb-2">{message.subject}</h4>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">{message.sender.name}</p>
                <p className="text-sm text-muted-foreground">{message.sender.email}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(message.date).toLocaleString()}
              </p>
            </div>
            <div className="prose prose-sm max-w-none">
              <p>{message.content}</p>
              <p>{message.content}</p>
              <p>Best regards,<br />{message.sender.name}</p>
            </div>
          </div>
        )}
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
    setSearchTerm
  } = useMail();
  
  useEffect(() => {
    document.title = "Inbox - Mail App";
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <Button variant="outline" size="icon" onClick={() => fetchMessages()}>
          <RefreshCw size={16} />
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search emails..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              <span>
                {filter === 'all' ? 'All Messages' : 
                 filter === 'read' ? 'Read Messages' : 'Unread Messages'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={filter} onValueChange={(value) => setFilter(value as any)}>
              <DropdownMenuRadioItem value="all">All Messages</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="read">Read Messages</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="unread">Unread Messages</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No messages found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Try using different search terms"
              : filter !== 'all'
                ? `No ${filter} messages in your inbox`
                : "Your inbox is empty"}
          </p>
        </div>
      ) : (
        <div className="border rounded-md divide-y">
          {filteredMessages.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
