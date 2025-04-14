
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, X } from "lucide-react";
import { messagesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ComposeMessage() {
  const [open, setOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setRecipientEmail("");
    setSubject("");
    setContent("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const recipient = recipientEmail.trim().toLowerCase();
      const response = await messagesApi.sendMessage(recipient, subject, content);
      console.log("Message sent:", response.data);
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      setOpen(false);
      resetForm();

      window.location.reload(); // Refresh the page to see the new message
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error.response?.data?.message || "An error occurred while sending the message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-lg fixed bottom-8 right-8 z-10"
        >
          <Send size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Compose and send a new message to another user.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="recipient">To</Label>
            <Input
              id="recipient"
              placeholder="recipient@example.com"
              value={recipientEmail}
              type="email"
              required
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Message subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              placeholder="Write your message here..."
              className="min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
