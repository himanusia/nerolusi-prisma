"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Badge } from "~/app/_components/ui/badge";
import { Label } from "~/app/_components/ui/label";
import { Textarea } from "~/app/_components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Save,
  AlertCircle,
} from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/app/_components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import ErrorPage from "~/app/error";
import LoadingPage from "~/app/loading";
import { getAllSubjects } from "~/app/_components/constants";

const SUBTEST_TYPES = [
  { value: "pu", label: "Kemampuan Penalaran Umum" },
  { value: "ppu", label: "Pengetahuan dan Pemahaman Umum" },
  { value: "pbm", label: "Kemampuan Memahami Bacaan dan Menulis" },
  { value: "pk", label: "Pengetahuan Kuantitatif" },
  { value: "pm", label: "Penalaran Matematika" },
  { value: "lbe", label: "Literasi Bahasa Inggris" },
  { value: "lbi", label: "Literasi Bahasa Indonesia" },
];

type SubtestFormData = {
  type: string;
  duration: number;
};

function toDatetimeLocalStringLocal(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function TryoutEditPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.packageId as string;

  const [isEditing, setIsEditing] = useState(false);
  const [isCreateSubtestDialogOpen, setIsCreateSubtestDialogOpen] =
    useState(false);
  const [packageForm, setPackageForm] = useState({
    name: "",
    type: "tryout" as const,
    classId: null,
    TOstart: "",
    TOend: "",
    tokenPrice: 0,
  });
  const [subtestForm, setSubtestForm] = useState<SubtestFormData>({
    type: "",
    duration: 0,
  });

  // API Queries
  const {
    data: packageData,
    isLoading,
    isError,
    refetch: refetchPackage,
  } = api.admin.getPackageById.useQuery(
    { id: packageId },
    { enabled: !!packageId },
  );

  const { data: classes } = api.admin.getClasses.useQuery();

  // API Mutations
  const updatePackageMutation = api.admin.updatePackage.useMutation();
  const createSubtestMutation = api.admin.createSubtest.useMutation();
  const deleteSubtestMutation = api.admin.deleteSubtest.useMutation();

  // Initialize form data when package data loads
  useEffect(() => {
    if (packageData) {
      setPackageForm({
        name: packageData.name || "",
        type: "tryout",
        classId: packageData.classId,
        TOstart: packageData.TOstart
          ? toDatetimeLocalStringLocal(new Date(packageData.TOstart))
          : "",
        TOend: packageData.TOend
          ? toDatetimeLocalStringLocal(new Date(packageData.TOend))
          : "",
        tokenPrice: packageData.tokenPrice || 0,
      });
    }
  }, [packageData]);

  // Form validation
  const isPackageFormValid = () => {
    return (
      packageForm.name.trim() !== "" &&
      packageForm.TOstart !== "" &&
      packageForm.TOend !== "" &&
      packageForm.tokenPrice >= 0 &&
      new Date(packageForm.TOstart) < new Date(packageForm.TOend)
    );
  };

  const isSubtestFormValid = () => {
    return subtestForm.type !== "" && subtestForm.duration > 0;
  };

  // Handlers
  const handleUpdatePackage = async () => {
    if (!isPackageFormValid()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      await updatePackageMutation.mutateAsync({
        id: packageId,
        name: packageForm.name,
        classId: packageForm.classId,
        TOstart: new Date(packageForm.TOstart).toISOString(),
        TOend: new Date(packageForm.TOend).toISOString(),
        tokenPrice: packageForm.tokenPrice,
      });
      toast.success("Package updated successfully!");
      setIsEditing(false);
      await refetchPackage();
    } catch (error: any) {
      toast.error(error.message || "Failed to update package");
    }
  };

  const handleCreateSubtest = async () => {
    if (!isSubtestFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createSubtestMutation.mutateAsync({
        type: subtestForm.type as any,
        packageId: packageId,
        duration: subtestForm.duration,
      });
      toast.success("Subtest created successfully!");
      setIsCreateSubtestDialogOpen(false);
      setSubtestForm({ type: "", duration: 0 });
      await refetchPackage();
    } catch (error: any) {
      toast.error(error.message || "Failed to create subtest");
    }
  };

  const handleDeleteSubtest = async (subtestId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this subtest? This will also delete all associated questions.",
      )
    ) {
      return;
    }

    try {
      await deleteSubtestMutation.mutateAsync({ id: subtestId });
      toast.success("Subtest deleted successfully!");
      await refetchPackage();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete subtest");
    }
  };

  const getSubtestTypeLabel = (type: string) => {
    return (
      SUBTEST_TYPES.find((t) => t.value === type)?.label ||
      type
        .replace("_", " ")
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ")
    );
  };

  if (isLoading) return <LoadingPage />;
  if (isError || !packageData) return <ErrorPage />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/tryout">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tryouts
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Tryout Package
          </h1>
          <p className="text-gray-600">Manage package details and subtests</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                // Reset form to original data
                if (packageData) {
                  setPackageForm({
                    name: packageData.name || "",
                    type: "tryout",
                    classId: packageData.classId,
                    TOstart: packageData.TOstart
                      ? new Date(packageData.TOstart).toISOString().slice(0, 16)
                      : "",
                    TOend: packageData.TOend
                      ? new Date(packageData.TOend).toISOString().slice(0, 16)
                      : "",
                    tokenPrice: packageData.tokenPrice || 0,
                  });
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePackage}
              disabled={
                updatePackageMutation.isPending || !isPackageFormValid()
              }
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {updatePackageMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Package
          </Button>
        )}
      </div>

      {/* Package Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Package Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={packageForm.name}
                onChange={(e) =>
                  setPackageForm({ ...packageForm, name: e.target.value })
                }
                placeholder="Enter package name"
                disabled={!isEditing}
                required
                className={
                  !isEditing || packageForm.name.trim() !== ""
                    ? ""
                    : "border-red-500"
                }
              />
              {isEditing && packageForm.name.trim() === "" && (
                <p className="mt-1 text-sm text-red-500">
                  Package name is required
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select
                value={packageForm.classId?.toString() || ""}
                onValueChange={(value) =>
                  setPackageForm({
                    ...packageForm,
                    classId: value ? parseInt(value) : null,
                  })
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={packageForm.TOstart}
                onChange={(e) =>
                  setPackageForm({ ...packageForm, TOstart: e.target.value })
                }
                disabled={!isEditing}
                required
                className={
                  !isEditing || packageForm.TOstart !== ""
                    ? ""
                    : "border-red-500"
                }
              />
              {isEditing && packageForm.TOstart === "" && (
                <p className="mt-1 text-sm text-red-500">
                  Start date is required
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={packageForm.TOend}
                onChange={(e) =>
                  setPackageForm({ ...packageForm, TOend: e.target.value })
                }
                disabled={!isEditing}
                required
                className={
                  !isEditing ||
                  (packageForm.TOend !== "" &&
                    new Date(packageForm.TOstart) < new Date(packageForm.TOend))
                    ? ""
                    : "border-red-500"
                }
              />
              {isEditing && packageForm.TOend === "" && (
                <p className="mt-1 text-sm text-red-500">
                  End date is required
                </p>
              )}
              {isEditing &&
                packageForm.TOstart &&
                packageForm.TOend &&
                new Date(packageForm.TOstart) >=
                  new Date(packageForm.TOend) && (
                  <p className="mt-1 text-sm text-red-500">
                    End date must be after start date
                  </p>
                )}
            </div>

            <div>
              <Label htmlFor="tokenPrice">Token Price *</Label>
              <Input
                id="tokenPrice"
                type="number"
                value={packageForm.tokenPrice}
                onChange={(e) =>
                  setPackageForm({
                    ...packageForm,
                    tokenPrice: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter token price"
                disabled={!isEditing}
                required
                min="0"
                className={
                  !isEditing || packageForm.tokenPrice >= 0
                    ? ""
                    : "border-red-500"
                }
              />
              {isEditing && packageForm.tokenPrice < 0 && (
                <p className="mt-1 text-sm text-red-500">
                  Token price must be 0 or greater
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Subtests ({packageData.subtests?.length || 0})
            </CardTitle>
            <Dialog
              open={isCreateSubtestDialogOpen}
              onOpenChange={setIsCreateSubtestDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subtest
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Subtest</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Subtest Type *</Label>
                    <Select
                      value={subtestForm.type}
                      onValueChange={(value) =>
                        setSubtestForm({ ...subtestForm, type: value })
                      }
                    >
                      <SelectTrigger
                        className={
                          subtestForm.type !== "" ? "" : "border-red-500"
                        }
                      >
                        <SelectValue placeholder="Select subtest type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBTEST_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                        {getAllSubjects().map((subject) => (
                          <SelectItem
                            key={subject.slug.replace("-", "_")}
                            value={subject.slug.replace("-", "_")}
                          >
                            {subject.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {subtestForm.type === "" && (
                      <p className="mt-1 text-sm text-red-500">
                        Subtest type is required
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Duration (minutes) *</Label>
                    <Input
                      type="number"
                      value={subtestForm.duration}
                      onChange={(e) =>
                        setSubtestForm({
                          ...subtestForm,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter duration in minutes"
                      required
                      min="1"
                      className={
                        subtestForm.duration > 0 ? "" : "border-red-500"
                      }
                    />
                    {subtestForm.duration <= 0 && (
                      <p className="mt-1 text-sm text-red-500">
                        Duration must be greater than 0
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateSubtest}
                    disabled={
                      createSubtestMutation.isPending || !isSubtestFormValid()
                    }
                  >
                    {createSubtestMutation.isPending
                      ? "Creating..."
                      : "Create Subtest"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {packageData.subtests && packageData.subtests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packageData.subtests.map((subtest) => (
                <Card
                  key={subtest.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {getSubtestTypeLabel(subtest.type)}
                          </h3>
                          <Badge variant="outline" className="mt-1">
                            {subtest.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {subtest.duration} minutes
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {subtest.questions?.length || 0} questions
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Link
                          href={`/admin/quiz-edit/${subtest.id}`}
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            Edit Questions
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSubtest(subtest.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          disabled={deleteSubtestMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">No subtests yet</h3>
              <p>Add your first subtest to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
