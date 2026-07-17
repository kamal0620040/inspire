"use client";

import { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, UploadCloud, X, Check, AlertCircle, Film, Image } from "lucide-react";

import { useUpload } from "@/hooks/use-upload";
import { useUIStore } from "@/store/ui-store";

interface UploadZoneProps {
  folderId: string;
  children: React.ReactNode;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName: string) {
  if (fileName.match(/\.(mp4|mov|avi|webm|mkv)$/i)) {
    return <Film className="h-3.5 w-3.5" />;
  }
  return <Image className="h-3.5 w-3.5" />;
}

export default function UploadZone({
  folderId,
  children,
}: UploadZoneProps) {
  const { isUploading, uploadProgress, uploadFiles, cancelUpload, uploads } =
    useUpload(folderId);

  const uploadDialogOpen = useUIStore(
    (s) => s.uploadDialogOpen
  );

  const clearUploadDialog = useUIStore(
    (s) => s.clearUploadDialog
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open,
  } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: true,
    accept: {
      "image/*": [],
      "video/*": [],
    },
    onDrop: async (files) => {
      if (files.length) {
        await uploadFiles(files);
      }
    },
  });

  useEffect(() => {
    if (!uploadDialogOpen) return;

    open();
    clearUploadDialog();
  }, [uploadDialogOpen, open, clearUploadDialog]);

  const completedCount = uploads.filter((u) => u.status === "completed").length;
  const failedCount = uploads.filter((u) => u.status === "failed").length;
  const cancelledCount = uploads.filter((u) => u.status === "cancelled").length;
  const activeUploads = uploads.filter(
    (u) => u.status === "uploading" || u.status === "pending"
  );

  const totalFiles = uploads.length;

  return (
    <div
      {...getRootProps()}
      className="relative h-full w-full"
    >
      <input {...getInputProps()} />

      {children}

      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-4 z-50 flex items-center justify-center rounded-[36px] border-4 border-dashed border-blue-500/60 bg-background/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="pointer-events-none max-w-sm rounded-3xl border border-white/30 bg-background/80 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-5 flex justify-center">
                <div className="rounded-full bg-blue-500/10 p-4">
                  <UploadCloud className="h-10 w-10 text-blue-500" />
                </div>
              </div>

              <h3 className="text-center text-xl font-bold">
                Drop files here
              </h3>

              <p className="mt-2 text-center text-sm text-muted-foreground">
                Images and videos will be uploaded automatically.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[100] w-[340px] rounded-2xl border bg-background/95 p-4 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : cancelledCount > 0 ? (
                  <X className="h-4 w-4 text-orange-500" />
                ) : failedCount > 0 ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-semibold">
                  {isUploading
                    ? `Uploading ${totalFiles} file${totalFiles !== 1 ? "s" : ""}...`
                    : cancelledCount > 0
                    ? `Cancelled (${completedCount} completed, ${cancelledCount} cancelled)`
                    : failedCount > 0
                    ? `${failedCount} failed, ${completedCount} completed`
                    : `${completedCount} file${completedCount !== 1 ? "s" : ""} uploaded`}
                </span>
              </div>

              {isUploading && (
                <button
                  onClick={cancelUpload}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="mb-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-blue-500"
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground text-right">
                  {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            {/* File List */}
            <div className="max-h-[200px] overflow-y-auto space-y-1.5 scrollbar-thin">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${
                    upload.status === "uploading"
                      ? "bg-blue-500/5"
                      : upload.status === "completed"
                      ? "bg-green-500/5"
                      : upload.status === "failed"
                      ? "bg-red-500/5"
                      : ""
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-1.5 rounded-md ${
                    upload.status === "completed"
                      ? "bg-green-500/10 text-green-500"
                      : upload.status === "failed"
                      ? "bg-red-500/10 text-red-500"
                      : upload.status === "uploading"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {upload.status === "completed" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : upload.status === "failed" ? (
                      <AlertCircle className="h-3.5 w-3.5" />
                    ) : upload.status === "uploading" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      getFileIcon(upload.name)
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {upload.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(upload.size)}
                    </p>
                  </div>

                  {/* Status */}
                  {upload.status === "uploading" && (
                    <div className="flex-shrink-0 w-16">
                      <div className="h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
