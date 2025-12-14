"use client";

import { Download, Maximize2, Minimize2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "~/app/_components/ui/button";

export function PDFReader({
  title = "Materi Pembelajaran",
  pdfUrl = "https://cdn.simplepdf.com/simple-pdf/assets/sample.pdf",
  width = "100%",
  height = "600px",
  showControls = true,
  className = "",
  setIsLoading,
}: {
  title?: string;
  pdfUrl?: string;
  width?: string;
  height?: string;
  showControls?: boolean;
  className?: string;
  setIsLoading: (loading: boolean) => void;
}) {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate PDF viewer URL with parameters
  const getPdfViewerUrl = () => {
    if (!pdfUrl) return "";

    const baseUrl = "https://docs.google.com/viewer?url=";
    const encodedUrl = encodeURIComponent(pdfUrl);
    return `${baseUrl}${encodedUrl}&embedded=true`;
  };

  // Handle PDF load
  const handlePdfLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  // Handle PDF error
  const handlePdfError = () => {
    setIsLoading(false);
    setError("Failed to load PDF. Please check the URL and try again.");
  };

  // Download PDF
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "document.pdf";
      link.click();
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!pdfUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <div className="mb-2 text-4xl">📄</div>
          <p>No PDF URL provided</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg shadow-lg ${className} ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
      style={{
        width: isFullscreen ? "100vw" : width,
        height: isFullscreen ? "100vh" : height,
      }}
    >
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50">
          <div className="text-center text-red-600">
            <div className="mb-2 text-4xl">⚠️</div>
            <p>{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      {showControls && (
        <div className="absolute left-0 right-0 top-0 z-20 rounded-t-lg border-b border-gray-200 bg-white/95 p-3 backdrop-blur-sm">
          <div className="flex w-full items-center justify-between">
            {/* Left Title */}
            <h2 className="text-sm md:text-lg font-bold">{title}</h2>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownload}
                variant="ghost"
                title="Download PDF"
              >
                <Download size={18} />
              </Button>
              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 size={18} />
                ) : (
                  <Maximize2 size={18} />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div
        className={`overflow-hidden ${showControls ? "pt-16" : ""}`}
        style={{
          height: "100%",
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease",
        }}
      >
        <iframe
          ref={iframeRef}
          src={getPdfViewerUrl()}
          width="100%"
          height="100%"
          onLoad={handlePdfLoad}
          onError={handlePdfError}
          title="PDF Viewer"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}
