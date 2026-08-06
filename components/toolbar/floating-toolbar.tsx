"use client";

import { useUIStore } from "@/store/ui-store";
import { MousePointer2, Hand, Plus } from "lucide-react";
import { motion } from "framer-motion";
import UserProfile from "../user-profile";
import { CreateFolderModal } from "../create-folder-modal";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
    showToolBar?: boolean;
}

type ToolbarButtonProps = React.ComponentPropsWithoutRef<"button">;

const ToolbarButton = forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "cursor-pointer h-10 w-10 rounded-full flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-all hover:scale-105 active:scale-95 border border-neutral-200 shadow-sm",
        className
      )}
      {...props}
    >
      <Plus className="h-5 w-5 stroke-[2.5]" />
    </button>
  );
});

ToolbarButton.displayName = "ToolbarButton";

export default function FloatingToolbar({ showToolBar = true }: FloatingToolbarProps) {
  const { currentTool, setCurrentTool } = useUIStore();
  const triggerUploadDialog = useUIStore(
    (s) => s.triggerUploadDialog
  );

  const clearUploadDialog = useUIStore(
    (s) => s.clearUploadDialog
  );
  
  const pathname = usePathname();
  const isFolderPage = pathname.startsWith("/folder");

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-1.5 p-2 bg-glass/85 border border-dark/80 dark:border-white/30 shadow-xl rounded-full"
      >
        <UserProfile />
        {/* Separator */}
        <div className="h-6 w-px liquid-glass-divider mx-0.5" />

        {
          showToolBar && (
            <>
            {/* Select Tool */}
            <button
              type="button"
              onClick={() => setCurrentTool("select")}
              className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                currentTool === "select"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Select Tool (V)"
            >
              <MousePointer2 className="h-4 w-4 fill-current stroke-2" />
            </button>
    
            {/* Pan Tool */}
            <button
              type="button"
              onClick={() => setCurrentTool("pan")}
              className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                currentTool === "pan"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Pan Tool (H)"
            >
              <motion.div
                animate={{ rotate: currentTool === "pan" ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Hand className="h-4 w-4 fill-current stroke-2" />
              </motion.div>
            </button>
    
            {/* Separator */}
            <div className="h-6 w-px liquid-glass-divider mx-0.5" />
            </>
          )
        }

        {/* Create / Add Button */}
        {
          isFolderPage ? (
            <ToolbarButton onClick={triggerUploadDialog} />
          ) : (
            <CreateFolderModal>
             <ToolbarButton />
            </CreateFolderModal>
          )
        }
      </motion.div>
        </div>
  );
}
