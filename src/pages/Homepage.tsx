import React, { useState } from 'react';
import { useMail } from "@/contexts/MailContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  RefreshCw, 
  Inbox, 
  Mail, 
  Calendar, 
  ChevronRight, 
  Users, 
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from "date-fns";
import { ComposeMessage } from "@/components/ComposeMessage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

// Custom tooltip formatter
const tooltipFormatter = (value) => {
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
};

// Chart colors with consistent theming
const COLORS = {
  primary: '#9b87f5',
  secondary: '#7E69AB',
  accent1: '#8B5CF6',
  accent2: '#F97316',
  read: '#9b87f5',
  unread: '#7E69AB'
};

export default function Dashboard() {
  const { stats, isLoading, fetchMessages, filteredMessages } = useMail();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setTimeout(() => setIsRefreshing(false), 500);
  };
  
  // Generate sample stats in case real ones aren't available
  const generatePlaceholderStats = () => {
    if (!stats || !stats.dailyActivity || stats.dailyActivity.length === 0) {
      const today = new Date();
      return {
        total: 0,
        unread: 0,
        percentRead: 0,
        dailyActivity: Array.from({ length: 7 }).map((_, i) => ({
          date: format(subDays(today, 6-i), 'yyyy-MM-dd'),
          count: 0
        })),
        topSenders: []
      };
    }
    return stats;
  };
  
  const currentStats = stats ? stats : generatePlaceholderStats();
  
  // Latest messages preview
  const latestMessages = filteredMessages?.slice(0, 3) || [];
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        {/* Loading state with structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Format data for charts
  const activityData = currentStats.dailyActivity?.map(item => ({
    name: format(new Date(item.date), 'MMM dd'),
    messages: item.count
  })) || [];

  const readData = [
    { name: 'Read', value: currentStats.total - currentStats.unread },
    { name: 'Unread', value: currentStats.unread }
  ];
  
  const senderData = currentStats.topSenders || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Header with refresh action */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {user?.firstName || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your mailbox activity
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="sm:self-start flex gap-2 items-center"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={cn("text-muted-foreground", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4" style={{ borderLeftColor: COLORS.primary }}>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <h3 className="text-2xl font-bold mt-1">{currentStats.total}</h3>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail size={20} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4" style={{ borderLeftColor: COLORS.accent1 }}>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                <h3 className="text-2xl font-bold mt-1">{currentStats.unread}</h3>
              </div>
              <div className="h-12 w-12 bg-accent1/10 rounded-full flex items-center justify-center">
                <Inbox size={20} className="text-accent1" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4" style={{ borderLeftColor: COLORS.accent2 }}>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Read Percentage</p>
                <h3 className="text-2xl font-bold mt-1">{currentStats.percentRead}%</h3>
              </div>
              <div className="h-12 w-12 bg-accent2/10 rounded-full flex items-center justify-center">
                <Users size={20} className="text-accent2" />
              </div>
            </div>
            <Progress value={currentStats.percentRead} className="h-1.5 mt-4" />
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LineChart className="h-5 w-5 text-primary" />
                  Message Activity
                </CardTitle>
                <CardDescription>Messages received over time</CardDescription>
              </div>
              
              <Tabs defaultValue="week" value={timeRange} onValueChange={(v) => setTimeRange(v as 'week' | 'month' | 'year')}>
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="text-xs px-2">Week</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-2">Month</TabsTrigger>
                  <TabsTrigger value="year" className="text-xs px-2">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-64" config={{}} id="activity-chart">
              <RechartsLineChart 
                data={activityData} 
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#888', strokeWidth: 0.5 }}
                  axisLine={{ stroke: '#888', strokeWidth: 0.5 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#888', strokeWidth: 0.5 }}
                  axisLine={{ stroke: '#888', strokeWidth: 0.5 }}
                />
                <Tooltip
                  formatter={tooltipFormatter}
                  content={({ payload, label }) => {
                    if (!payload || !payload.length) return null;
                    return (
                      <div className="bg-background border rounded-md shadow-md p-2 text-sm">
                        <p className="font-medium">{label}</p>
                        <p className="text-primary">Messages: {payload[0]?.value}</p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS.primary, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
                />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Top senders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart className="h-5 w-5 text-primary" />
              Top Senders
            </CardTitle>
            <CardDescription>Who sends you the most emails</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-64" config={{}} id="senders-chart">
              <RechartsBarChart
                data={senderData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 80, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  tickLine={{ stroke: '#888', strokeWidth: 0.5 }}
                  axisLine={{ stroke: '#888', strokeWidth: 0.5 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#888', strokeWidth: 0.5 }}
                  axisLine={{ stroke: '#888', strokeWidth: 0.5 }}
                />
                <Tooltip
                  formatter={tooltipFormatter}
                  content={({ payload, label }) => {
                    if (!payload || !payload.length) return null;
                    return (
                      <div className="bg-background border rounded-md shadow-md p-2 text-sm">
                        <p className="font-medium">{label}</p>
                        <p className="text-primary">Messages: {payload[0]?.value}</p>
                      </div>
                    );
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill={COLORS.primary}
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                  animationDuration={800}
                >
                  {senderData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS.primary} 
                      fillOpacity={0.75 + (0.25 * (index / senderData.length))}
                    />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
            {senderData.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full mt-4">
                <p className="text-muted-foreground text-sm">No sender data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent messages and read/unread distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Recent Messages</CardTitle>
              {latestMessages.length > 0 && (
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs" onClick={() => navigate('/inbox')}>
                  View all <ChevronRight size={14} />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {latestMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 p-6 text-center">
                <div className="bg-muted rounded-full p-3 mb-3">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No messages yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Your inbox is empty</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate('/app/inbox')}
                >
                  Check inbox
                </Button>
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                <div className="divide-y">
                  {latestMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/app/inbox?message=${message.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={cn("text-sm truncate", !message.read && "font-medium")}>
                              {message.sender.name}
                            </h3>
                            {!message.read && (
                              <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium truncate mt-1">{message.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {message.content.substring(0, 60)}...
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                          {format(new Date(message.date), 'MMM d')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          {latestMessages.length > 0 && (
            <CardFooter className="pt-2 pb-4 flex justify-center">
              <Button size="sm" onClick={() => navigate('/app/inbox')}>
                Go to Inbox
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" />
              Message Distribution
            </CardTitle>
            <CardDescription>Read vs unread messages</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStats.total > 0 ? (
              <>
                <ChartContainer className="h-48" config={{}} id="read-unread-chart">
                  <RechartsPieChart>
                    <Pie
                      data={readData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={800}
                      strokeWidth={2}
                      stroke="transparent"
                    >
                      {readData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? COLORS.read : COLORS.unread} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={tooltipFormatter}
                      content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        return (
                          <div className="bg-background border rounded-md shadow-md p-2 text-sm">
                            <p className="font-medium">{payload[0]?.name}</p>
                            <p>Messages: {payload[0]?.value}</p>
                            <p>Percentage: {Math.round((payload[0]?.value / currentStats.total) * 100)}%</p>
                          </div>
                        );
                      }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                  </RechartsPieChart>
                </ChartContainer>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xl font-medium">{stats.total - stats.unread}</div>
                    <div className="text-xs text-muted-foreground mt-1">Read Messages</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-xl font-medium">{stats.unread}</div>
                    <div className="text-xs text-muted-foreground mt-1">Unread Messages</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-muted rounded-full p-3 mb-3">
                  <PieChart className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No data to display</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start receiving messages to see statistics
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compose button */}
      <div className="fixed bottom-6 right-6">
        <ComposeMessage />
      </div>
    </div>
  );
}