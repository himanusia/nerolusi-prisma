"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { uploadFiles } from "~/utils/uploadthing"; // sesuaikan path ke file uploadthing kamu
import { Button } from "~/app/_components/ui/button";
import { toast } from "sonner";

interface UploadSoalFieldProps {
  packageId: string;
  onDone: () => void;
}

export function UploadSoalField({ packageId, onDone }: UploadSoalFieldProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing">(
    "idle",
  );
  const [fileName, setFileName] = useState<string | null>(null);

  const importMutation = api.admin.importTryoutQuestions.useMutation();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrors([]);

    try {
      // Step 1: upload file excel MENTAH ke UploadThing (tidak diparsing di browser)
      setStatus("uploading");
      const uploadRes = await uploadFiles("excelUploader", { files: [file] });
      const excelUrl = uploadRes[0]?.url;
      if (!excelUrl) {
        setErrors(["Gagal upload file ke server. Coba lagi."]);
        setStatus("idle");
        return;
      }

      // Step 2: server yang parsing + upload gambar + simpan ke DB
      setStatus("processing");
      const result = await importMutation.mutateAsync({ packageId, excelUrl });

      if (!result.success) {
        setErrors(result.errors);
        setStatus("idle");
        return;
      }

      toast.success(
        `Berhasil! ${result.subtestsCreated} subtest, ${result.questionsCreated} soal ditambahkan.`,
      );
      onDone();
    } catch (err: any) {
      setErrors([err?.message ?? "Terjadi kesalahan saat memproses file."]);
      setStatus("idle");
    }
  }

  const isBusy = status !== "idle";

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Tryout berhasil dibuat. Upload file Excel soal sekarang, atau lewati
        untuk isi soal secara manual nanti.
      </p>

      <div className="rounded-md border border-dashed border-gray-300 p-4">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          disabled={isBusy}
          className="text-sm"
        />
        {fileName && (
          <p className="mt-1 text-xs text-gray-500">File: {fileName}</p>
        )}
        {status === "uploading" && (
          <p className="mt-2 text-sm text-gray-500">Mengupload file...</p>
        )}
        {status === "processing" && (
          <p className="mt-2 text-sm text-gray-500">
            Memproses soal &amp; gambar (bisa beberapa menit kalau soalnya banyak)...
          </p>
        )}
      </div>

      {errors.length > 0 && (
        <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-red-600">
          {errors.map((err, i) => (
            <li key={i}>⚠ {err}</li>
          ))}
        </ul>
      )}

      <Button variant="outline" onClick={onDone} disabled={isBusy}>
        Lewati, isi soal manual nanti
      </Button>
    </div>
  );
}