"use client";

import { Folder, FolderView as ViewType } from "@/lib/types";
import { useUIStore } from "@/store/ui-store";
import CanvasView from "@/components/folder/canvas/canvas-view";
import BoardView from "@/components/folder/board/board-view";
import FloatingToolbar from "@/components/toolbar/floating-toolbar";
import UploadZone from "@/components/upload/upload-zone";
import { ArrowLeft, Folder as FolderIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { updateFolderViewAction } from "@/app/actions/updateFolderView";
import { FolderActions } from "./folder-context-menu";

interface FolderViewProps {
  folderData: Folder;
}

export default function FolderView({ folderData }: FolderViewProps) {
  const [currentView, setCurrentView] = useState(() => folderData.view);
  const [, startTransition] = useTransition();
  const zoom = useUIStore((state) => state.camera.zoom);

  const handleViewChange = (view: ViewType) => {
    if (view === folderData.view) return;
    setCurrentView(view);
    startTransition(async () => {
      await updateFolderViewAction(folderData.id, view);
    });
  };

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="h-full w-full relative flex flex-col overflow-hidden">
      {/* Floating Top Nav (Glassmorphism Pills) */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30 select-none">
        {/* Left: Folder Back Button */}
        <div className="flex items-center gap-3 p-1 bg-glass/85 border border-dark/80 dark:border-white/30 backdrop-blur-xl rounded-full shadow-md">
          <Link
            href="/dashboard"
            className="px-1.5 py-1.5 text-shadow-muted-foreground rounded-full cursor-pointer hover:bg-white/30 transition-all shadow-md  hover:text-neutral-900 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 text-neutral-400 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div className="flex items-center gap-2 border-l border-neutral-300/60 -ml-1 pl-3">
            <FolderIcon className="h-4 w-4 text-neutral-500 fill-neutral-200" />
            <span className="text-sm font-semibold truncate max-w-30 md:max-w-50 text-muted-foreground">
              {folderData.name}
            </span>
            <FolderActions folder={folderData} />
          </div>
        </div>

        {/* Center: View Switcher Toggle */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center p-1 bg-glass/85 border border-white/35 backdrop-blur-xl rounded-full shadow-md pointer-events-auto select-none">
          <button
            type="button"
            onClick={() => handleViewChange("canvas")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all ${
              currentView === "canvas"
                ? "bg-neutral-800 dark:bg-neutral-700 text-white shadow-sm"
                : "text-muted-foreground hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            Canvas
          </button>
          <button
            type="button"
            onClick={() => handleViewChange("board")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all ${
              currentView === "board"
                ? "bg-neutral-800 dark:bg-neutral-700 text-white shadow-sm"
                : "text-muted-foreground hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            Board
          </button>
        </div>

        {/* Right: Zoom Indicator */}
        <div className="px-4 py-2.5 bg-glass/85 border border-white/35 backdrop-blur-xl rounded-full shadow-md pointer-events-auto text-xs font-semibold min-w-14 text-muted-foreground text-center">
          {currentView === "canvas" ? `${zoomPercentage}%` : "—"}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full h-full relative">
        <UploadZone folderId={folderData.id}>
          {currentView === "canvas" ? (
            <CanvasView folderId={folderData.id} />
          ) : (
            <BoardView folderId={folderData.id} />
          )}
        </UploadZone>
      </div>

      {/* Floating Bottom Toolbar */}
      <FloatingToolbar showToolBar={currentView === "canvas"} />
    </div>
  );
}
