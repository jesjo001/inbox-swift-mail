
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    inAppNotifications: true,
    soundEnabled: true
  });
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };
  
  if (!user) return null;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Tabs defaultValue="account">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Avatar</Button>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={user.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={user.lastName} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, emailNotifications: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, pushNotifications: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications inside the application
                  </p>
                </div>
                <Switch
                  id="inAppNotifications"
                  checked={notificationSettings.inAppNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, inAppNotifications: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="soundEnabled">Sound Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound when new messages arrive
                  </p>
                </div>
                <Switch
                  id="soundEnabled"
                  checked={notificationSettings.soundEnabled}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, soundEnabled: checked})
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">Light</Button>
                  <Button variant="outline" className="flex-1">Dark</Button>
                  <Button variant="default" className="flex-1">System</Button>
                </div>
              </div> */}
              
              <div className="space-y-2">
                <Label htmlFor="messageDisplay">Message Display Density</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">Comfortable</Button>
                  <Button variant="default" className="flex-1">Default</Button>
                  <Button variant="outline" className="flex-1">Compact</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
