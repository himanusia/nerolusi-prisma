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
import { api } from "~/trpc/react";
import {
  RiAddFill,
  RiEditFill,
  RiDeleteBinFill,
  RiCalendarEventFill,
} from "react-icons/ri";

interface KegiatanFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  url: string;
  classId: number | null;
}

const KegiatanForm = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  error,
  classes,
}: {
  formData: KegiatanFormData;
  setFormData: (data: KegiatanFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string | null;
  classes?: any[];
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {error && (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )}

    <div>
      <Label htmlFor="title">Judul Kegiatan</Label>
      <Input
        id="title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Masukkan judul kegiatan"
        required
      />
    </div>

    <div>
      <Label htmlFor="description">Deskripsi</Label>
      <Input
        id="description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Masukkan deskripsi kegiatan"
      />
    </div>

    <div>
      <Label htmlFor="startTime">Waktu Mulai</Label>
      <Input
        id="startTime"
        type="datetime-local"
        value={formData.startTime}
        onChange={(e) =>
          setFormData({ ...formData, startTime: e.target.value })
        }
      />
    </div>

    <div>
      <Label htmlFor="endTime">Waktu Selesai</Label>
      <Input
        id="endTime"
        type="datetime-local"
        value={formData.endTime}
        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
      />
    </div>

    <div>
      <Label htmlFor="classId">Kelas</Label>
      <Select
        value={formData.classId?.toString() || ""}
        onValueChange={(value) =>
          setFormData({ ...formData, classId: value ? parseInt(value) : null })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Pilih kelas (opsional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Semua kelas</SelectItem>
          {classes?.map((cls) => (
            <SelectItem key={cls.id} value={cls.id.toString()}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label htmlFor="url">URL</Label>
      <Input
        id="url"
        type="url"
        value={formData.url}
        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
        placeholder="https://example.com"
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

export default function KegiatanManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<KegiatanFormData>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    url: "",
    classId: null,
  });

  const utils = api.useUtils();

  // Get all kegiatan
  const { data: kegiatan, isLoading } = api.user.getAllKegiatan.useQuery();

  // Get all classes for dropdown
  const { data: classes } = api.admin.getClasses.useQuery();

  // Mutations
  const createKegiatanMutation = api.admin.createKegiatan.useMutation({
    onSuccess: () => {
      utils.user.getAllKegiatan.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const updateKegiatanMutation = api.admin.updateKegiatan.useMutation({
    onSuccess: () => {
      utils.user.getAllKegiatan.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      setEditingKegiatan(null);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const deleteKegiatanMutation = api.admin.deleteKegiatan.useMutation({
    onSuccess: () => {
      utils.user.getAllKegiatan.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      url: "",
      classId: null,
    });
    setError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    createKegiatanMutation.mutate({
      title: formData.title,
      description: formData.description,
      startTime: formData.startTime ? new Date(formData.startTime) : undefined,
      endTime: formData.endTime ? new Date(formData.endTime) : undefined,
      url: formData.url,
      classId:
        formData.classId && formData.classId > 0 ? formData.classId : undefined,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingKegiatan) return;

    updateKegiatanMutation.mutate({
      id: editingKegiatan.id,
      title: formData.title,
      description: formData.description,
      startTime: formData.startTime ? new Date(formData.startTime) : undefined,
      endTime: formData.endTime ? new Date(formData.endTime) : undefined,
      url: formData.url,
      classId:
        formData.classId && formData.classId > 0 ? formData.classId : undefined,
    });
  };

  const handleEdit = (item: any) => {
    setEditingKegiatan(item);

    // Format datetime for datetime-local input (preserving local timezone)
    const formatDateTimeLocal = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setFormData({
      title: item.title || "",
      description: item.description || "",
      startTime: item.startTime ? formatDateTimeLocal(item.startTime) : "",
      endTime: item.endTime ? formatDateTimeLocal(item.endTime) : "",
      url: item.url || "",
      classId: item.classId || null,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      deleteKegiatanMutation.mutate({ id });
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
          <h1 className="text-3xl font-bold text-gray-900">
            Manajemen Kegiatan
          </h1>
          <p className="text-gray-600">Kelola kegiatan dan event</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <RiAddFill className="mr-2 h-4 w-4" />
              Tambah Kegiatan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Kegiatan Baru</DialogTitle>
            </DialogHeader>
            <KegiatanForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateSubmit}
              isLoading={createKegiatanMutation.isPending}
              error={error}
              classes={classes}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Kegiatan</CardTitle>
          <RiCalendarEventFill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kegiatan?.length || 0}</div>
          <p className="text-xs text-muted-foreground">Kegiatan terdaftar</p>
        </CardContent>
      </Card>

      {/* Kegiatan List */}
      <div className="grid gap-4">
        {kegiatan?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {item.description}
                    </p>
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
                {item.startTime && (
                  <p>
                    <strong>Mulai:</strong>{" "}
                    {new Date(item.startTime).toLocaleString("id-ID")}
                  </p>
                )}
                {item.endTime && (
                  <p>
                    <strong>Selesai:</strong>{" "}
                    {new Date(item.endTime).toLocaleString("id-ID")}
                  </p>
                )}
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
              </div>
            </CardContent>
          </Card>
        ))}

        {kegiatan?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <RiCalendarEventFill className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Belum ada kegiatan yang dibuat</p>
              <p className="text-sm text-gray-500">
                Klik "Tambah Kegiatan" untuk membuat kegiatan baru
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kegiatan</DialogTitle>
          </DialogHeader>
          <KegiatanForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditSubmit}
            isLoading={updateKegiatanMutation.isPending}
            error={error}
            classes={classes}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
