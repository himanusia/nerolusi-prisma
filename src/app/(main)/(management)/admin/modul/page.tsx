"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/app/_components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "~/app/_components/ui/tabs";
import { api } from "~/trpc/react";
import {
  RiAddFill,
  RiEditFill,
  RiDeleteBinFill,
  RiBookOpenFill,
  RiFilterFill,
} from "react-icons/ri";
import { ModulForm, ModulFormData } from "./modul-form";

type ModuleType = "bahan_materi" | "catatan";

export default function ModulManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingModul, setEditingModul] = useState<any>(null);
  const [filterSubjectId, setFilterSubjectId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<ModuleType>("bahan_materi");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ModulFormData>({
    title: "",
    description: "",
    subjectId: null,
    url: "",
    classId: null,
  });

  const utils = api.useUtils();

  // Get all modules with filter
  const { data: modules, isLoading } = api.modul.getModulesWithFilter.useQuery({
    subjectId: filterSubjectId,
    type: filterType,
  });

  // Get all subjects for dropdown
  const { data: subjects } = api.admin.getAllSubjects.useQuery();

  // Get all classes for dropdown
  const { data: classes } = api.admin.getClasses.useQuery();

  // Mutations
  const createModulMutation = api.modul.createModule.useMutation({
    onSuccess: () => {
      utils.modul.getModulesWithFilter.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const updateModulMutation = api.modul.editModule.useMutation({
    onSuccess: () => {
      utils.modul.getModulesWithFilter.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      setEditingModul(null);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const deleteModulMutation = api.modul.deleteModule.useMutation({
    onSuccess: () => {
      utils.modul.getModulesWithFilter.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      subjectId: null,
      url: "",
      classId: null,
    });
    setError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.subjectId) {
      setError("Mohon pilih mata pelajaran");
      return;
    }

    createModulMutation.mutate({
      title: formData.title,
      description: formData.description.trim() || undefined,
      subjectId: formData.subjectId,
      url: formData.url,
      type: filterType,
      classId: formData.classId ? formData.classId : null,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingModul) return;

    if (!formData.subjectId) {
      setError("Mohon pilih mata pelajaran");
      return;
    }

    updateModulMutation.mutate({
      id: editingModul.id,
      title: formData.title,
      description: formData.description.trim() || undefined,
      subjectId: formData.subjectId,
      type: editingModul.type,
      url: formData.url,
      classId: formData.classId ? formData.classId : null,
    });
  };

  const handleEdit = (item: any) => {
    setEditingModul(item);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      subjectId: item.subjectId || null,
      url: item.url || "",
      classId: item.classId || null,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus modul ini?")) {
      deleteModulMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Modul</h1>
          <p className="text-gray-600">Kelola modul pembelajaran</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <RiAddFill className="mr-2 h-4 w-4" />
              Tambah Modul
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Modul Baru</DialogTitle>
            </DialogHeader>
            <ModulForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateSubmit}
              isLoading={createModulMutation.isPending}
              subjects={subjects}
              classes={classes}
              error={error}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Type Tabs */}
      <Tabs
        value={filterType}
        onValueChange={(value) => setFilterType(value as ModuleType)}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="bahan_materi">Bahan Materi</TabsTrigger>
          <TabsTrigger value="catatan">Catatan</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filter and Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modul</CardTitle>
            <RiBookOpenFill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {filterType === "bahan_materi" ? "Bahan materi" : "Catatan"}{" "}
              terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm font-medium">
              <RiFilterFill className="mr-2 h-4 w-4" />
              Filter Mata Pelajaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={filterSubjectId?.toString() || "all"}
              onValueChange={(value) =>
                setFilterSubjectId(value === "all" ? null : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua mata pelajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua mata pelajaran</SelectItem>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={() => setFilterSubjectId(null)}
              className="w-full"
            >
              Reset Filter
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modules List */}
      <div className="grid gap-4">
        {modules?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {item.description}
                    </p>
                  )}
                  {item.subject && (
                    <div className="mt-2">
                      <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                        {item.subject.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <RiEditFill className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <RiDeleteBinFill className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>URL:</strong>{" "}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {item.url}
                  </a>
                </p>
                <p className="text-gray-500">
                  <strong>Dibuat:</strong>{" "}
                  {new Date(item.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {modules?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <RiBookOpenFill className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                {filterSubjectId
                  ? `Tidak ada ${filterType === "bahan_materi" ? "bahan materi" : "catatan"} untuk mata pelajaran ini`
                  : `Belum ada ${filterType === "bahan_materi" ? "bahan materi" : "catatan"} yang dibuat`}
              </p>
              <p className="text-sm text-gray-500">
                Klik "Tambah Modul" untuk membuat{" "}
                {filterType === "bahan_materi" ? "bahan materi" : "catatan"}{" "}
                baru
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Modul</DialogTitle>
          </DialogHeader>
          <ModulForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditSubmit}
            isLoading={updateModulMutation.isPending}
            isEdit={true}
            subjects={subjects}
            classes={classes}
            error={error}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
