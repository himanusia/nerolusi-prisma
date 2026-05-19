"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/app/_components/ui/dialog";
import { api } from "~/trpc/react";
import {
  RiAddFill,
  RiEditFill,
  RiDeleteBinFill,
  RiFileList3Fill,
  RiUserFill,
  RiVideoFill,
  RiBookOpenFill,
  RiCalendarEventFill,
} from "react-icons/ri";
import Link from "next/link";

interface ClassFormData {
  name: string;
}

const ClassForm = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  error,
}: {
  formData: ClassFormData;
  setFormData: (data: ClassFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string | null;
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {error && (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )}

    <div>
      <Label htmlFor="name">Nama Kelas</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Masukkan nama kelas"
        required
      />
    </div>

    <div className="flex justify-end space-x-2">
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : "Simpan"}
      </Button>
    </div>
  </form>
);

export default function ClassManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({
    name: "",
  });

  const utils = api.useUtils();

  // Get all classes
  const { data: classes, isLoading } = api.admin.getClasses.useQuery();

  // Mutations
  const createClassMutation = api.admin.createClass.useMutation({
    onSuccess: () => {
      utils.admin.getClasses.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const updateClassMutation = api.admin.updateClass.useMutation({
    onSuccess: () => {
      utils.admin.getClasses.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      setEditingClass(null);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const deleteClassMutation = api.admin.deleteClass.useMutation({
    onSuccess: () => {
      utils.admin.getClasses.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
    });
    setError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    createClassMutation.mutate({
      name: formData.name,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingClass) return;

    updateClassMutation.mutate({
      id: editingClass.id,
      name: formData.name,
    });
  };

  const handleEdit = (item: any) => {
    setEditingClass(item);
    setFormData({
      name: item.name || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
      deleteClassMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Kelas</h1>
          <p className="text-gray-600">Kelola kelas dan konten per kelas</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <RiAddFill className="mr-2 h-4 w-4" />
              Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Kelas Baru</DialogTitle>
            </DialogHeader>
            <ClassForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateSubmit}
              isLoading={createClassMutation.isPending}
              error={error}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
          <RiFileList3Fill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{classes?.length || 0}</div>
          <p className="text-xs text-muted-foreground">Kelas terdaftar</p>
        </CardContent>
      </Card>

      {/* Classes List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes?.map((item) => (
          <Card key={item.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
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
            <CardContent className="space-y-2">
              <Link href={`/admin/classes/${item.id}/users`}>
                <Button variant="outline" className="w-full justify-start">
                  <RiUserFill className="mr-2 h-4 w-4" />
                  Lihat Users
                </Button>
              </Link>
              <Link href={`/admin/classes/${item.id}/videos`}>
                <Button variant="outline" className="w-full justify-start">
                  <RiVideoFill className="mr-2 h-4 w-4" />
                  Kelola Rekaman
                </Button>
              </Link>
              <Link href={`/admin/classes/${item.id}/modul`}>
                <Button variant="outline" className="w-full justify-start">
                  <RiBookOpenFill className="mr-2 h-4 w-4" />
                  Kelola Catatan
                </Button>
              </Link>
              <Link href={`/admin/classes/${item.id}/kegiatan`}>
                <Button variant="outline" className="w-full justify-start">
                  <RiCalendarEventFill className="mr-2 h-4 w-4" />
                  Kelola Kegiatan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}

        {classes?.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center">
              <RiFileList3Fill className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Belum ada kelas yang dibuat</p>
              <p className="text-sm text-gray-500">
                Klik "Tambah Kelas" untuk membuat kelas baru
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kelas</DialogTitle>
          </DialogHeader>
          <ClassForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditSubmit}
            isLoading={updateClassMutation.isPending}
            error={error}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
