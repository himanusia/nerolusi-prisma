"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import Link from "next/link";
import { 
  RiUserFill, 
  RiFileList3Fill, 
  RiBookmarkFill, 
  RiVideoFill,
  RiCalendarEventFill,
  RiQuestionAnswerFill,
  RiCoinsLine
} from "react-icons/ri";
import { api } from "~/trpc/react";

const adminMenuItems = [
  {
    title: "User Management",
    description: "Manage users, roles, and permissions",
    href: "/user",
    icon: <RiUserFill className="h-8 w-8 text-blue-600" />,
    color: "border-blue-200 hover:border-blue-300"
  },
  {
    title: "Koin Management", 
    description: "View and modify user coin balances",
    href: "/coins",
    icon: <RiCoinsLine className="h-8 w-8 text-yellow-600" />,
    color: "border-yellow-200 hover:border-yellow-300"
  },
  {
    title: "Package Management",
    description: "Manage tryout packages and content",
    href: "/packageManagement",
    icon: <RiFileList3Fill className="h-8 w-8 text-green-600" />,
    color: "border-green-200 hover:border-green-300"
  },
  {
    title: "TKA Tryouts",
    description: "Manage TKA tryout packages",
    href: "/admin-tka/tryouts",
    icon: <RiBookmarkFill className="h-8 w-8 text-purple-600" />,
    color: "border-purple-200 hover:border-purple-300"
  },
  {
    title: "TKA Videos & Quiz",
    description: "Manage TKA videos and mentors",
    href: "/admin-tka/videos",
    icon: <RiVideoFill className="h-8 w-8 text-red-600" />,
    color: "border-red-200 hover:border-red-300"
  },
  {
    title: "Activity Schedule",
    description: "Manage upcoming events and activities",
    href: "/admin-tka/activities",
    icon: <RiCalendarEventFill className="h-8 w-8 text-indigo-600" />,
    color: "border-indigo-200 hover:border-indigo-300"
  },
  {
    title: "TKA Drill Questions",
    description: "Manage TKA practice questions",
    href: "/admin-tka/drills",
    icon: <RiQuestionAnswerFill className="h-8 w-8 text-teal-600" />,
    color: "border-teal-200 hover:border-teal-300"
  }
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = api.admin.getDashboardStats.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your application from here</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <RiUserFill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active registered users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <RiFileList3Fill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPackages || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tryout packages created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <RiBookmarkFill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing quiz sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TKA Content</CardTitle>
            <RiVideoFill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tkaContent || 0}</div>
            <p className="text-xs text-muted-foreground">
              Videos and materials
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Menu */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Management Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${item.color}`}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {item.icon}
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4">Loading recent activity...</div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No recent activity to display
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
