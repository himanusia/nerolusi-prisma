"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import Link from "next/link";
import { ArrowLeft, BookOpen, Video, Calendar, HelpCircle } from "lucide-react";

const tkaManagementItems = [
  // {
  //   title: "TKA Tryouts",
  //   description: "Manage TKA tryout packages and exams",
  //   href: "/admin-tka/tryouts",
  //   icon: <BookOpen className="h-8 w-8 text-purple-600" />,
  //   color: "border-purple-200 hover:border-purple-300"
  // },
  // {
  //   title: "Videos & Quiz Management",
  //   description: "Manage TKA videos, quizzes and mentors",
  //   href: "/admin-tka/videos",
  //   icon: <Video className="h-8 w-8 text-red-600" />,
  //   color: "border-red-200 hover:border-red-300"
  // },
  {
    title: "Materi Management",
    description: "Manage material and topics",
    href: "/admin-tka/materi",
    icon: <Calendar className="h-8 w-8 text-indigo-600" />,
    color: "border-indigo-200 hover:border-indigo-300"
  },
  {
    title: "Drill Questions (Latsol)",
    description: "Manage TKA practice questions and answers",
    href: "/admin-tka/drills",
    icon: <HelpCircle className="h-8 w-8 text-teal-600" />,
    color: "border-teal-200 hover:border-teal-300"
  }
];

export default function TKAManagementPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TKA Management</h1>
          <p className="text-gray-600">Manage all TKA-related content and activities</p>
        </div>
      </div>

      {/* TKA Management Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tkaManagementItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${item.color}`}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  {item.icon}
                  <div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>TKA Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Active Tryouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Video Content</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">0</div>
              <div className="text-sm text-gray-600">Scheduled Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">0</div>
              <div className="text-sm text-gray-600">Drill Questions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
