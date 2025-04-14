
import React from 'react';
import { useMail } from "@/contexts/MailContext";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, LineChart, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ComposeMessage } from "@/components/ComposeMessage";
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
} from "recharts";

// Custom tooltip formatter to return string values to fix TS errors
const tooltipFormatter = (value: any) => {
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
};

export default function Homepage() {
  const { stats, isLoading } = useMail();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-3/4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80 hidden lg:block" />
        </div>
        <Skeleton className="h-10 w-40 mx-auto" />
      </div>
    );
  }

  const COLORS = ['#9b87f5', '#7E69AB', '#1EAEDB', '#8B5CF6', '#F97316'];
  
  const activityData = stats.dailyActivity?.map(item => ({
    name: format(new Date(item.date), 'MMM dd'),
    messages: item.count
  })) || [];

  const readData = [
    { name: 'Read', value: stats.total - stats.unread },
    { name: 'Unread', value: stats.unread }
  ];
  
  const senderData = stats.topSenders || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your mailbox activity
        </p>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" />
              Message Overview
            </CardTitle>
            <CardDescription>Your current mailbox status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <span>Total Messages</span>
                <span className="text-2xl font-semibold">{stats.total}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Unread Messages</span>
                <span className="text-2xl font-semibold text-mail-unread">{stats.unread}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Read Progress</span>
                  <span>{stats.percentRead}%</span>
                </div>
                <Progress value={stats.percentRead} className="h-2" />
              </div>
              
              <ChartContainer className="h-32" config={{}} id="read-unread-chart">
                <RechartsPieChart>
                  <Pie
                    data={readData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {readData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={tooltipFormatter}
                    content={({ payload, label }) => {
                      if (!payload || !payload.length) return null;
                      return (
                        <ChartTooltipContent className="border-none">
                          <div>{payload[0]?.name}: {payload[0]?.value}</div>
                        </ChartTooltipContent>
                      );
                    }}
                  />
                </RechartsPieChart>
              </ChartContainer>
              
              <div className="flex justify-center gap-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[0] }}></div>
                  <span className="text-sm">Read</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[1] }}></div>
                  <span className="text-sm">Unread</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LineChart className="h-5 w-5 text-primary" />
              Daily Activity
            </CardTitle>
            <CardDescription>Messages received per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-64" config={{}} id="activity-chart">
              <RechartsLineChart data={activityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={tooltipFormatter}
                  content={({ payload, label }) => {
                    if (!payload || !payload.length) return null;
                    return (
                      <ChartTooltipContent className="border-none">
                        <div>{label}</div>
                        <div>Messages: {payload[0]?.value}</div>
                      </ChartTooltipContent>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#9b87f5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
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
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={tooltipFormatter}
                  content={({ payload, label }) => {
                    if (!payload || !payload.length) return null;
                    return (
                      <ChartTooltipContent className="border-none">
                        <div>{label}</div>
                        <div>Messages: {payload[0]?.value}</div>
                      </ChartTooltipContent>
                    );
                  }}
                />
                <Bar dataKey="count" fill="#9b87f5" radius={[0, 4, 4, 0]} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button size="lg" onClick={() => navigate('/inbox')}>
          Go to Inbox
        </Button>
      </div>

      {/* Compose Message Button */}
      <ComposeMessage />
    </div>
  );
}
