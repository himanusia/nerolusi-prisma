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
import { PDFReader } from "./pdf-reader";
import { useState, useEffect } from "react";
// interface PageContentProps {
//   subtest: string;
// }

export default function PageContent() {
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

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
  const subtestData = {
    title: `Daftar Catatan`,
    sessions: [
      {
        id: 1,
        title: "Matematika Wajib",
        pdfUrl:
          "https://test2.nerolusi.com/modul_matwa.pdf",
      },
      {
        id: 2,
        title: "Bahasa Indonesia",
        pdfUrl:
          "https://test2.nerolusi.com/modul_bindo.pdf",
      },
      {
        id: 3,
        title: "Bahasa Inggris",
        pdfUrl:
          "https://test2.nerolusi.com/modul_bing.pdf",
      },
    ],
  };

  const activeSessionData = subtestData.sessions.find(
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

  return (
    <div className="flex h-screen flex-col overflow-hidden p-6">
      <div
        className={`grid grid-cols-1 gap-6 ${activeSession && "lg:grid-cols-3"} min-h-0 flex-1`}
      >
        {/* Left Sidebar - Session List */}
        <div className="flex min-h-0 flex-col lg:col-span-1">
          {/* Back Button */}
          {/* <Link href="/modul" className="mb-6 flex-shrink-0">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4" />
              <span>Kembali</span>
            </Button>
          </Link> */}
          <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[#ACAEBA] bg-white shadow-sm">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-[#ACAEBA] p-4">
              <h2 className="text-lg font-semibold text-[#2b8057]">
                {subtestData.title}
              </h2>
            </div>

            {/* Session List */}
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 scrollbar-thin">
              {subtestData.sessions.map((session) => (
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
                title={activeSessionData.title}
                pdfUrl={activeSessionData.pdfUrl}
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
        <DialogContent className="max-h-[95vh] max-w-[95vw] overflow-hidden bg-[#2B8057] p-0 rounded-xl">
          <DialogHeader className="px-0 py-2">
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
                title={activeSessionData.title}
                pdfUrl={activeSessionData.pdfUrl}
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
