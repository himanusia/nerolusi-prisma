"use client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/app/_components/ui/dialog";
import { PDFReader } from "../../pdf-reader";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import LoadingPage from "~/app/loading";
import ErrorPage from "~/app/error";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import NoPackagePage from "~/app/no-package";
import NoClassPage from "~/app/no-class";

export default function PageContent() {
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const param = useParams();
  const subject = param?.subtest as string;
  const { data: session, status } = useSession();

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Close dialog when switching to desktop
      if (!mobile && isMobileDialogOpen) {
        setIsMobileDialogOpen(false);
      }
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isMobileDialogOpen]);
  // Mock data - replace with actual data fetching
  const {
    data: subjectData,
    isLoading: subjectLoading,
    isError: subjectError,
  } = api.modul.getSubjectById.useQuery({
    id: parseInt(subject) ?? 0,
  });

  const {
    data: modulesData,
    isLoading: modulesLoading,
    isError: modulesError,
  } = api.modul.getAllModules.useQuery({
    subjectId: parseInt(subject) ?? 0,
    type: "catatan",
  });

  const activeSessionData = modulesData?.find(
    (session) => session.id === activeSession,
  );

  const handleSessionClick = (sessionId: number) => {
    if (sessionId !== activeSession) {
      setIsLoading(true);
      setActiveSession(sessionId);
    }
  };

  const handleMobileSessionClick = (sessionId: number) => {
    setActiveSession(sessionId);
    setIsLoading(true);
    setIsMobileDialogOpen(true);
  };

  if (subjectLoading || modulesLoading) {
    return <LoadingPage />;
  }
  if (subjectError || modulesError) {
    return <ErrorPage />;
  }

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (subjectData.mode === "utbk") {
    if (!session?.user.enrolledUtbk) {
      return <NoPackagePage />;
    }
    if (!session.user.classid) {
      return <NoClassPage />;
    }
  }

  if (subjectData.mode === "tka" && !session?.user.enrolledTka) {
    return <NoPackagePage />;
  }

  if (!subjectData || modulesData?.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-6">
        Belum ada catatan untuk subjek ini.
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden p-6">
      <div
        className={`grid grid-cols-1 gap-6 ${activeSession && "lg:grid-cols-3"} min-h-0 flex-1`}
      >
        {/* Left Sidebar - Session List */}
        <div className="flex min-h-0 flex-col lg:col-span-1">
          {/* Back Button */}
          <Link href="/modul" className="mb-6 flex-shrink-0">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4" />
              <span>Kembali</span>
            </Button>
          </Link>
          <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[#ACAEBA] bg-white shadow-sm">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-[#ACAEBA] p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {subjectData?.name ?? ""}
              </h2>
            </div>

            {/* Session List */}
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 scrollbar-thin">
              {modulesData.map((session) => (
                <Button
                  key={session.id}
                  variant={
                    session.id === activeSession ? "default" : "secondary"
                  }
                  className="w-full"
                  onClick={() => {
                    // Desktop behavior
                    if (!isMobile) {
                      handleSessionClick(session.id);
                    } else {
                      // Mobile behavior - open dialog
                      handleMobileSessionClick(session.id);
                    }
                  }}
                >
                  {session.title}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div
          className={`hidden ${activeSession && "lg:col-span-2 lg:flex"} min-h-0`}
        >
          {activeSessionData && (
            <div className="relative w-full flex-1 rounded-lg bg-[#2B8057] px-8 py-4">
              {isLoading && (
                <div className="absolute bottom-4 left-8 right-8 top-4 z-10 flex items-center justify-center rounded-lg bg-white bg-opacity-90">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
                    <p className="text-gray-500">Memuat PDF...</p>
                  </div>
                </div>
              )}
              <PDFReader
                key={activeSession} // Force re-render when session changes
                title={activeSessionData.title ?? ""}
                pdfUrl={activeSessionData.url ?? ""}
                className="transition-opacity duration-200"
                setIsLoading={setIsLoading}
                height="100%"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dialog */}
      <Dialog
        open={isMobileDialogOpen && isMobile}
        onOpenChange={setIsMobileDialogOpen}
      >
        <DialogContent className="max-h-[95vh] max-w-[95vw] overflow-hidden bg-[#2B8057] p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="relative w-full rounded-lg bg-[#2B8057] px-8 py-4">
            {isLoading && (
              <div className="absolute left-8 top-4 z-10 flex items-center justify-center rounded-lg bg-white bg-opacity-90">
                <div className="text-center">
                  <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
                  <p className="text-gray-500">Memuat PDF...</p>
                </div>
              </div>
            )}
            {activeSessionData && (
              <PDFReader
                key={`mobile-${activeSession}`}
                title={activeSessionData.title ?? ""}
                pdfUrl={activeSessionData.url ?? ""}
                className="transition-opacity duration-200"
                setIsLoading={setIsLoading}
                height="70vh"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
