"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Badge } from "~/app/_components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Edit, Trash2, Zap, Timer, Trophy } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/app/_components/ui/dialog";
import { Label } from "~/app/_components/ui/label";
import { Textarea } from "~/app/_components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/app/_components/ui/select";
import { Switch } from "~/app/_components/ui/switch";

export default function TKADrillsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    difficulty: "easy",
    timeLimit: 600, // 10 minutes in seconds
    questionCount: 20,
    isActive: true
  });

  const { data: drills, refetch } = api.admin.getTKADrills.useQuery();
  const createDrillMutation = api.admin.createTKADrill.useMutation();
  const deleteDrillMutation = api.admin.deleteTKADrill.useMutation();

  const subjects = ["Matematika", "Fisika", "Kimia", "Biologi"];
  const difficultyLevels = [
    { value: "easy", label: "Easy", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "hard", label: "Hard", color: "bg-red-100 text-red-800" }
  ];

  const filteredDrills = drills?.filter(drill => {
    const matchesSearch = drill.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "all" || drill.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const handleCreateDrill = async () => {
    try {
      await createDrillMutation.mutateAsync(formData);
      toast.success("TKA Drill created successfully!");
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        subject: "",
        difficulty: "easy",
        timeLimit: 600,
        questionCount: 20,
        isActive: true
      });
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to create drill");
    }
  };

  const handleDeleteDrill = async (id: number) => {
    if (!confirm("Are you sure you want to delete this drill?")) return;
    
    try {
      await deleteDrillMutation.mutateAsync({ id });
      toast.success("Drill deleted successfully!");
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete drill");
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const level = difficultyLevels.find(l => l.value === difficulty);
    return level ? { label: level.label, className: level.color } : { label: difficulty, className: "bg-gray-100 text-gray-800" };
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin-tka">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to TKA
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">TKA Drills Management</h1>
          <p className="text-gray-600">Create and manage TKA practice drills</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Drill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New TKA Drill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Drill Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter drill title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subject</Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => setFormData({...formData, subject: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => setFormData({...formData, difficulty: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={Math.floor(formData.timeLimit / 60)}
                    onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value) * 60})}
                  />
                </div>
                <div>
                  <Label>Question Count</Label>
                  <Input
                    type="number"
                    value={formData.questionCount}
                    onChange={(e) => setFormData({...formData, questionCount: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateDrill} disabled={createDrillMutation.isPending}>
                Create Drill
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
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
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrills?.map((drill) => {
          const difficultyBadge = getDifficultyBadge(drill.difficulty);
          return (
            <Card key={drill.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{drill.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{drill.description}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary">{drill.subject}</Badge>
                    <Badge variant={drill.isActive ? "default" : "secondary"}>
                      {drill.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyBadge.className}`}>
                      {difficultyBadge.label}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="h-4 w-4" />
                      {drill.questionCount} questions
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      {formatTime(drill.timeLimit)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      {drill.attempts || 0} attempts
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div>Average Score: {drill.averageScore || 0}%</div>
                    <div>Completion Rate: {drill.completionRate || 0}%</div>
                  </div>
                  
                  <div className="flex gap-2 pt-3">
                    <Link href={`/admin-tka/drills/${drill.id}/edit`}>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin-tka/drills/${drill.id}/questions`}>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Zap className="h-4 w-4" />
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
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No TKA drills found</h3>
              <p>Create your first drill to get started.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
