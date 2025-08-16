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
  Calendar,
  Users,
} from "lucide-react";
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

export default function TKATryoutPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    duration: 120,
    maxParticipants: 100,
  });

  const { data: tryouts, refetch } = api.admin.getTKATryouts.useQuery();
  const createTryoutMutation = api.admin.createTKATryout.useMutation();
  const deleteTryoutMutation = api.admin.deleteTKATryout.useMutation();

  const filteredTryouts = tryouts?.filter((tryout) =>
    tryout.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateTryout = async () => {
    // Validate form
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.startDate ||
      !formData.endDate ||
      formData.duration <= 0 ||
      formData.maxParticipants <= 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      await createTryoutMutation.mutateAsync(formData);
      toast.success("TKA Tryout created successfully!");
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        duration: 120,
        maxParticipants: 100,
      });
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to create tryout");
    }
  };

  const handleDeleteTryout = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tryout?")) return;

    try {
      await deleteTryoutMutation.mutateAsync({ id });
      toast.success("Tryout deleted successfully!");
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tryout");
    }
  };

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
            TKA Tryout Management
          </h1>
          <p className="text-gray-600">Create and manage TKA tryout packages</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Tryout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New TKA Tryout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tryout Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter tryout name"
                  required
                  className={
                    formData.name.trim() === "" ? "border-red-500" : ""
                  }
                />
                {formData.name.trim() === "" && (
                  <p className="mt-1 text-sm text-red-500">
                    Tryout name is required
                  </p>
                )}
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description"
                  rows={3}
                  required
                  className={
                    formData.description.trim() === "" ? "border-red-500" : ""
                  }
                />
                {formData.description.trim() === "" && (
                  <p className="mt-1 text-sm text-red-500">
                    Description is required
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                    className={
                      formData.startDate === "" ? "border-red-500" : ""
                    }
                  />
                  {formData.startDate === "" && (
                    <p className="mt-1 text-sm text-red-500">
                      Start date is required
                    </p>
                  )}
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                    className={
                      formData.endDate === "" ||
                      (formData.startDate &&
                        formData.endDate &&
                        new Date(formData.startDate) >=
                          new Date(formData.endDate))
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formData.endDate === "" && (
                    <p className="mt-1 text-sm text-red-500">
                      End date is required
                    </p>
                  )}
                  {formData.startDate &&
                    formData.endDate &&
                    new Date(formData.startDate) >=
                      new Date(formData.endDate) && (
                      <p className="mt-1 text-sm text-red-500">
                        End date must be after start date
                      </p>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes) *</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    min="1"
                    className={formData.duration <= 0 ? "border-red-500" : ""}
                  />
                  {formData.duration <= 0 && (
                    <p className="mt-1 text-sm text-red-500">
                      Duration must be greater than 0
                    </p>
                  )}
                </div>
                <div>
                  <Label>Max Participants *</Label>
                  <Input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxParticipants: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    min="1"
                    className={
                      formData.maxParticipants <= 0 ? "border-red-500" : ""
                    }
                  />
                  {formData.maxParticipants <= 0 && (
                    <p className="mt-1 text-sm text-red-500">
                      Max participants must be greater than 0
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateTryout}
                disabled={
                  createTryoutMutation.isPending ||
                  !formData.name.trim() ||
                  !formData.description.trim() ||
                  !formData.startDate ||
                  !formData.endDate ||
                  formData.duration <= 0 ||
                  formData.maxParticipants <= 0 ||
                  (formData.startDate &&
                    formData.endDate &&
                    new Date(formData.startDate) >= new Date(formData.endDate))
                }
              >
                {createTryoutMutation.isPending
                  ? "Creating..."
                  : "Create Tryout"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search tryouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tryouts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTryouts?.map((tryout) => (
          <Card key={tryout.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{tryout.name}</CardTitle>
                  <p className="mt-1 text-sm text-gray-600">
                    {tryout.description}
                  </p>
                </div>
                <Badge variant={tryout.isActive ? "default" : "secondary"}>
                  {tryout.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {new Date(tryout.startDate).toLocaleDateString()} -{" "}
                  {new Date(tryout.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {tryout.participants}/{tryout.maxParticipants} participants
                </div>
                <div className="text-sm text-gray-600">
                  Duration: {tryout.duration} minutes
                </div>

                <div className="flex gap-2 pt-3">
                  <Link href={`/admin/tryout/${tryout.id}`}>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTryout(tryout.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTryouts?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">
              <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">No TKA tryouts found</h3>
              <p>Create your first tryout to get started.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
