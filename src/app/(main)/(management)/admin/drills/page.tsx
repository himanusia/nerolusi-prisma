"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Badge } from "~/app/_components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Zap,
  Timer,
  Trophy,
} from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import LoadingPage from "~/app/loading";
import ErrorPage from "~/app/error";
import {
  getSlugBySubjectName,
  getSubjectType,
} from "~/app/_components/constants";

export default function TKADrillsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const {
    data: drills,
    isLoading,
    isError,
    refetch,
  } = api.admin.getDrills.useQuery();

  const deleteDrillMutation = api.admin.deleteTKADrill.useMutation();

  const {
    data: subjects,
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = api.admin.getAllSubjects.useQuery();

  const filteredDrills = drills?.filter((drill) => {
    const matchesSearch = drill.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSubject =
      subjectFilter === "all" || drill.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const handleDeleteDrill = async (id: string) => {
    if (!confirm("Are you sure you want to delete this drill?")) return;

    try {
      await deleteDrillMutation.mutateAsync({ id });
      toast.success("Drill deleted successfully!");
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete drill");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (isLoading || subjectsLoading) {
    return <LoadingPage />;
  }

  if (isError || subjectsError) {
    return <ErrorPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Drills Management
          </h1>
          <p className="text-gray-600">Create and manage practice drills</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search drills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drills Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDrills?.map((drill) => {
          const subjectName =
            getSubjectType(drill.subject) === "utbk"
              ? getSlugBySubjectName(drill.subject).toUpperCase()
              : drill.subject;
          return (
            <Card key={drill.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{drill.title}</CardTitle>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary">
                      {subjectName}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      {formatTime(drill.timeLimit)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="h-4 w-4" />
                      {drill.questionCount} questions
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Link href={`/admin/quiz-edit/${drill.id}`}>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteDrill(drill.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDrills?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">
              <Zap className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">No TKA drills found</h3>
              <p>Create your first drill to get started.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
