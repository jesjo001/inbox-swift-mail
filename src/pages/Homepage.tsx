
import { useMail } from "@/contexts/MailContext";
import { useAuth } from "@/contexts/AuthContext";
import { Inbox, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Homepage() {
  const { stats, isLoading } = useMail();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-3/4" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-10 w-40 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">
        Welcome back, {user?.firstName}!
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Message Statistics
            </CardTitle>
            <CardDescription>Your current mailbox status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Messages</span>
                <span className="text-xl font-semibold">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Unread Messages</span>
                <span className="text-xl font-semibold text-mail-unread">{stats.unread}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-primary" />
              Reading Progress
            </CardTitle>
            <CardDescription>Your message read progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={stats.percentRead} className="h-2" />
              <div className="text-center">
                <span className="text-xl font-semibold">{stats.percentRead}%</span>
                <p className="text-sm text-muted-foreground">of your messages have been read</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button size="lg" onClick={() => navigate('/inbox')}>
          Go to Inbox
        </Button>
      </div>
    </div>
  );
}
