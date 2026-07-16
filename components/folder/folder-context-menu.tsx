"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { Edit2, Trash2, MoreVertical, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder } from "@/lib/types";
import { RenameFolderModal } from "../remane-folder-modal";
import { useAnchorPosition } from "@/hooks/use-anchor-position";
import { useClickOutside } from "@/hooks/use-click-outside";
import { deleteFolderAction } from "@/app/actions/deleteFolder";
import { toast } from "sonner";

interface FolderActionsProps {
  folder: Folder;
}

export function FolderActions({ folder }: FolderActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const { anchorRef, position } = useAnchorPosition<HTMLButtonElement>(isOpen);
  const [isFolderDeleting, startTransition] = useTransition();

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteFolderAction(folder.id);
      if (!result.success) {
        toast("Failed to delete folder", { position: "top-right" });
        return;
      }
    });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={anchorRef}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="px-1.5 py-1.5 text-shadow-muted-foreground rounded-full cursor-pointer hover:bg-white/30 transition-all shadow-md hover:text-neutral-900 active:scale-95"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* Dropdown Menu  */}
      {createPortal(
        <AnimatePresence>
          {isOpen && position && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              style={{ top: position.top, left: position.left }}
              className="fixed z-50 w-48 rounded-2xl p-1.5 flex flex-col gap-0.5 border border-dark/80 dark:border-white/30 bg-glass/85 backdrop-blur-xl shadow-md"
            >
              <button
                onClick={() => setIsRenaming(true)}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left rounded-xl text-muted-foreground hover:bg-white/10 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Rename Folder
              </button>
              <div className="h-px bg-black/10 dark:bg-white/20 my-1" />
              <button
                onClick={handleDelete}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left rounded-xl text-destructive hover:bg-accent transition-colors"
              >
                {isFolderDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Folder
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <RenameFolderModal
        open={isRenaming}
        setOpen={setIsRenaming}
        folder={folder}
      />
    </div>
  );
}
