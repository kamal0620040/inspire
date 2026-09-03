"use client";

import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/store/ui-store";

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: "pending" | "uploading" | "completed" | "failed" | "cancelled";
  progress: number;
}

interface UseUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  uploadFiles: (files: File[]) => Promise<void>;
  cancelUpload: () => void;
  uploads: UploadFile[];
}

export function useUpload(folderId: string): UseUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const updateUpload = useCallback((id: string, updates: Partial<UploadFile>) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  }, []);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const uploadItems: UploadFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      status: "pending" as const,
      progress: 0,
    }));

    setUploads(uploadItems);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthenticated");

      const camera = useUIStore.getState().camera;
      const centerX = (window.innerWidth / 2 - camera.x) / camera.zoom;
      const centerY = (window.innerHeight / 2 - camera.y) / camera.zoom;

      const siblingAssets = queryClient.getQueryData<any[]>(["assets", folderId]) || [];
      const highestZ = siblingAssets.reduce((max, a) => Math.max(max, a.z_index || 0), 0);

      let completedCount = 0;

      for (let i = 0; i < uploadItems.length; i++) {
        if (signal.aborted) {
          setUploads((prev) =>
            prev.map((u) =>
              u.status === "pending" || u.status === "uploading"
                ? { ...u, status: "cancelled" }
                : u
            )
          );
          break;
        }

        const uploadItem = uploadItems[i];
        updateUpload(uploadItem.id, { status: "uploading", progress: 0 });

        const file = uploadItem.file;
        const isVideo = file.type.startsWith("video/");
        const fileExt = file.name.split(".").pop();
        const uuid = crypto.randomUUID();
        const fileId = `${uuid}.${fileExt}`;
        const thumbId = `${uuid}-thumb.jpg`;

        const storagePath = `${user.id}/${folderId}/${fileId}`;
        const thumbnailPath = `${user.id}/${folderId}/${thumbId}`;

        if (signal.aborted) {
          updateUpload(uploadItem.id, { status: "cancelled" });
          break;
        }

        try {
          const { error: uploadError } = await uploadWithAbort(
            supabase,
            storagePath,
            file,
            signal
          );

          if (signal.aborted) {
            updateUpload(uploadItem.id, { status: "cancelled" });
            break;
          }

          if (uploadError) throw uploadError;

          updateUpload(uploadItem.id, { progress: 50 });

          const { data: { publicUrl: url } } = supabase.storage
            .from("assets")
            .getPublicUrl(storagePath);

          let thumbnailUrl = null;
          let naturalWidth = 280;
          let naturalHeight = 210;

          try {
            if (isVideo) {
              const dims = await getVideoDimensions(file);
              naturalWidth = dims.width;
              naturalHeight = dims.height;
              const thumbBlob = await generateVideoThumbnail(file);
              if (thumbBlob) {
                const { error: thumbUploadError } = await uploadWithAbort(
                  supabase,
                  thumbnailPath,
                  thumbBlob,
                  signal,
                  "image/jpeg"
                );

                if (!thumbUploadError) {
                  const { data: { publicUrl } } = supabase.storage
                    .from("assets")
                    .getPublicUrl(thumbnailPath);
                  thumbnailUrl = publicUrl;
                }
              }
            } else {
              const result = await getImageWithDimensions(file);
              naturalWidth = result.width;
              naturalHeight = result.height;
              const thumbBlob = result.thumbnailBlob;
              if (thumbBlob) {
                const { error: thumbUploadError } = await uploadWithAbort(
                  supabase,
                  thumbnailPath,
                  thumbBlob,
                  signal,
                  "image/jpeg"
                );

                if (!thumbUploadError) {
                  const { data: { publicUrl } } = supabase.storage
                    .from("assets")
                    .getPublicUrl(thumbnailPath);
                  thumbnailUrl = publicUrl;
                }
              }
            }
          } catch (thumbErr) {
            console.warn("Failed to process media, skipping...", thumbErr);
          }

          updateUpload(uploadItem.id, { progress: 75 });

          if (signal.aborted) {
            await supabase.storage.from("assets").remove([storagePath]);
            updateUpload(uploadItem.id, { status: "cancelled" });
            break;
          }

          const { error: dbError } = await supabase
            .from("assets")
            .insert({
              folder_id: folderId,
              user_id: user.id,
              type: isVideo ? "video" : "image",
              storage_path: storagePath,
              thumbnail_path: thumbnailUrl ? thumbnailPath : null,
              url,
              thumbnail_url: thumbnailUrl,
              file_name: file.name,
              file_size: file.size,
              width: naturalWidth,
              height: naturalHeight,
              x: centerX + completedCount * 30 - (naturalWidth / 2),
              y: centerY + completedCount * 30 - (naturalHeight / 2),
              z_index: highestZ + completedCount + 1,
              rotation: 0,
              scale: 1,
            });

          if (dbError) throw dbError;

          updateUpload(uploadItem.id, { status: "completed", progress: 100 });
          completedCount++;
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          updateUpload(uploadItem.id, { status: "failed", progress: 0 });
        }

        setUploadProgress(((i + 1) / uploadItems.length) * 100);
      }

      queryClient.invalidateQueries({ queryKey: ["assets", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-preview", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder-previews"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });

    } catch (err) {
      if (signal.aborted) {
        setUploads((prev) =>
          prev.map((u) =>
            u.status === "pending" || u.status === "uploading"
              ? { ...u, status: "cancelled" }
              : u
          )
        );
      } else {
        console.error("Upload process encountered error:", err);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;

      setTimeout(() => {
        setUploads([]);
      }, 3000);
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadFiles,
    cancelUpload,
    uploads,
  };
}

class AbortError extends Error {
  constructor() {
    super("Upload cancelled");
    this.name = "AbortError";
  }
}

function uploadWithAbort(
  supabase: ReturnType<typeof createClient>,
  path: string,
  file: File | Blob,
  signal: AbortSignal,
  contentType?: string
): Promise<{ data: { path: string } | null; error: Error | null }> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve({ data: null, error: new AbortError() });
      return;
    }

    const options: Record<string, unknown> = {
      cacheControl: "3600",
      upsert: false,
    };
    if (contentType) {
      options.contentType = contentType;
    }

    const uploadPromise = supabase.storage
      .from("assets")
      .upload(path, file, options);

    signal.addEventListener("abort", () => {
      resolve({ data: null, error: new AbortError() });
    }, { once: true });

    uploadPromise.then(resolve).catch((err) => {
      resolve({ data: null, error: err });
    });
  });
}

function getImageWithDimensions(file: File): Promise<{ width: number; height: number; thumbnailBlob: Blob | null }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const naturalWidth = img.width;
        const naturalHeight = img.height;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        const maxDim = 320;
        let w = naturalWidth;
        let h = naturalHeight;
        
        if (w > h) {
          if (w > maxDim) {
            h = Math.round(h * (maxDim / w));
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round(w * (maxDim / h));
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx?.drawImage(img, 0, 0, w, h);
        
        canvas.toBlob((blob) => {
          resolve({ width: naturalWidth, height: naturalHeight, thumbnailBlob: blob });
        }, "image/jpeg", 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.autoplay = false;
    video.muted = true;
    video.playsInline = true;

    const fileURL = URL.createObjectURL(file);
    video.src = fileURL;

    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
      URL.revokeObjectURL(fileURL);
    };

    video.onerror = () => {
      URL.revokeObjectURL(fileURL);
      reject(new Error("Failed to load video metadata"));
    };
  });
}

function generateVideoThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.autoplay = false;
    video.muted = true;
    video.playsInline = true;

    const fileURL = URL.createObjectURL(file);
    video.src = fileURL;

    video.onloadedmetadata = () => {
      video.currentTime = 1;
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      const maxDim = 320;
      let w = video.videoWidth;
      let h = video.videoHeight;
      
      if (w > h) {
        if (w > maxDim) {
          h = Math.round(h * (maxDim / w));
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round(w * (maxDim / h));
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      ctx?.drawImage(video, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(fileURL);
          resolve(blob);
        },
        "image/jpeg",
        0.8
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(fileURL);
      resolve(null);
    };
  });
}
