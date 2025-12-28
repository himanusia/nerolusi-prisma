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

export interface ModulFormData {
  title: string;
  description: string;
  subjectId: number | null;
  url: string;
}

export const ModulForm = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  isEdit = false,
  subjects,
  error,
}: {
  formData: ModulFormData;
  setFormData: (data: ModulFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isEdit?: boolean;
  subjects?: any[];
  error?: string | null;
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {error && (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )}

    <div>
      <Label htmlFor="title">Judul Modul</Label>
      <Input
        id="title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Masukkan judul modul"
        required
        minLength={2}
        maxLength={100}
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
        placeholder="Masukkan deskripsi modul (opsional)"
        maxLength={1000}
      />
      <p className="mt-1 text-xs text-gray-500">
        Deskripsi bersifat opsional. Kosongkan jika tidak diperlukan.
      </p>
    </div>

    <div>
      <Label htmlFor="subject">Mata Pelajaran</Label>
      <Select
        value={formData.subjectId?.toString() || "none"}
        onValueChange={(value) =>
          setFormData({
            ...formData,
            subjectId: value === "none" ? null : parseInt(value),
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Pilih mata pelajaran" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Pilih mata pelajaran</SelectItem>
          {subjects?.map((subject) => (
            <SelectItem key={subject.id} value={subject.id.toString()}>
              {subject.name}
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
