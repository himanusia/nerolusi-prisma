import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "~/app/_components/ui/button";

interface SubtestPageProps {
  params: {
    subtest: string;
  };
}

export default function SubtestPage({ params }: SubtestPageProps) {
  // Mock data - replace with actual data fetching
  const subtestData = {
    title: `Daftar Catatan (${params.subtest})`,
    sessions: [
      { id: 1, title: "Catatan LiveClass #1", isActive: true },
      { id: 2, title: "Catatan LiveClass #2", isActive: false },
      { id: 3, title: "Catatan LiveClass #2", isActive: false },
      { id: 4, title: "Catatan LiveClass #2", isActive: false },
      { id: 5, title: "Catatan LiveClass #2", isActive: false },
      { id: 6, title: "Catatan LiveClass #2", isActive: false },
      { id: 7, title: "Catatan LiveClass #2", isActive: false },
      { id: 8, title: "Catatan LiveClass #2", isActive: false },
      { id: 9, title: "Catatan LiveClass #2", isActive: false },
      { id: 10, title: "Catatan LiveClass #2", isActive: false },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <Link
          href="/modul"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Button>
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Sidebar - Session List */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-white shadow-sm">
              {/* Header */}
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {subtestData.title}
                </h2>
              </div>

              {/* Session List */}
              <div className="flex flex-col gap-2 p-4 h-96 overflow-y-auto">
                {subtestData.sessions.map((session) => (
                  <Button
                    key={session.id}
                    variant={session.isActive ? "default" : "secondary"}
                    className="w-full"
                  >
                    {session.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="flex h-[600px] items-center justify-center rounded-lg border bg-white shadow-sm">
              <p className="text-gray-500">Konten akan ditampilkan di sini</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
