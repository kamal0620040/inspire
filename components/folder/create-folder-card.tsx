"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, PlusIcon, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { createFolderAction } from "@/app/actions/createFolder";
import { Input } from "../ui/input";
import { useClickOutside } from "@/hooks/use-click-outside";
import { Button } from "../ui/button";

export default function CreateFolderCard() {
  const [isCreating, setIsCreating] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setIsCreating(false);
    setFolderName("");
    setError("");
  }, []);

  useClickOutside(wrapperRef, reset, isCreating);

  useEffect(() => {
    if (isCreating) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isCreating]);

  function handleCreate() {
    setError("");

    const name = folderName.trim();

    if (!name) {
      setError("Folder name is required.");
      return;
    }

    startTransition(async () => {
      const result = await createFolderAction(name);

      if (!result.success) {
        setError(result.message);
        return;
      }

      reset();
    });
  }

  return (
    <motion.div
      layout
      ref={wrapperRef}
      title="Create Folder"
      className="relative cursor-pointer h-72 w-80 flex items-end justify-center pb-6"
    >
      <motion.div
        layout
        className="absolute bottom-6 left-1/2 h-60 w-72 -translate-x-1/2"
      >
        <motion.div
          layout
          className="absolute inset-0 rounded-[28px] border border-folder-stroke bg-folder-top backdrop-blur-3xl p-6"
        >
          <AnimatePresence mode="wait">
            {!isCreating ? (
              <motion.button
                key="create"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.18,
                }}
                onClick={() => setIsCreating(true)}
                className="flex h-full w-full cursor-pointer items-center justify-center"
              >
                <PlusIcon
                  size={46}
                  className="text-muted-foreground dark:text-muted-foreground"
                />
              </motion.button>
            ) : (
              <motion.div
                key="form"
                layout
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 12,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="flex h-full flex-col justify-center gap-4"
              >
                <Input
                  ref={inputRef}
                  value={folderName}
                  disabled={isPending}
                  placeholder="Folder name..."
                  autoFocus
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreate();
                    }

                    if (e.key === "Escape") {
                      reset();
                    }
                  }}
                  className="rounded-lg px-3 py-2 outline-none transition focus:border-white/30"
                />

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -4,
                      }}
                      className="text-sm text-destructive dark:text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex justify-end gap-2">
                  <button
                    type="reset"
                    disabled={isPending}
                    onClick={reset}
                    aria-label="Cancel"
                    className="cursor-pointer rounded-lg p-2 hover:bg-white/10 transition"
                  >
                    <X size={18} />
                  </button>

                  <Button
                    disabled={isPending || !folderName.trim()}
                    onClick={handleCreate}
                    className="cursor-pointer flex items-center justify-center rounded-lg bg-white px-4 text-black transition disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
