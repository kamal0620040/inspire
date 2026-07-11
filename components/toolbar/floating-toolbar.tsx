"use client";

import { useUIStore } from "@/store/ui-store";
import { MousePointer2, Hand, Plus, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../theme-toggle";
import { useClickOutside } from "@/hooks/use-click-outside";

interface FloatingToolbarProps {
  onAddClick?: () => void;
}

export default function FloatingToolbar({ onAddClick }: FloatingToolbarProps) {
  const router = useRouter();
  const { currentTool, setCurrentTool } = useUIStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const supabase = createClient();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserEmail(data.user.email ?? null);
      }
    });
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/login");
    router.refresh();
  };

  const closeUserMenu = useCallback(() => {
      setShowUserMenu(false);
  }, []);

  useClickOutside(wrapperRef, closeUserMenu, showUserMenu);


  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* User Menu Popover */}
      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            ref={wrapperRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 p-3 bg-glass/90 border border-white/30 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col gap-2 min-w-[200px]"
          >
            <div className="px-2 py-1 text-muted-foreground truncate">
              <span className="font-medium text-xs text-muted-foreground">Signed in as: </span>
              <br />
              <span className="-mt-2 font-normal text-xs text-muted-foreground  ">
                {userEmail}
              </span>
            </div>
            <div className="h-px bg-black/10 dark:bg-white/20" />
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground truncate">
              <div>Theme toggle</div>
              <ThemeToggle />
            </div>
            <div className="h-px bg-black/10 dark:bg-white/20" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-red-100/30 cursor-pointer rounded-xl text-left transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toolbar Container */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-1.5 p-2 bg-glass/85 border border-white/40 shadow-xl backdrop-blur-2xl rounded-full"
      >
        {/* Profile Avatar Trigger */}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`h-10 w-10 rounded-full flex items-center justify-center bg-neutral-200 overflow-hidden cursor-pointer transition-all hover:scale-105 active:scale-95 border border-neutral-300 select-none ${
            showUserMenu ? "ring-2 ring-neutral-400" : ""
          }`}
        >
          <div className="h-full w-full bg-gradient-to-tr from-neutral-400 to-neutral-200 flex items-center justify-center">
            <User className="h-5 w-5 text-neutral-600" />
          </div>
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-neutral-300/60 mx-0.5" />

        {/* Select Tool */}
        <button
          onClick={() => setCurrentTool("select")}
          className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
            currentTool === "select"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-neutral-600 hover:bg-black/5"
          }`}
          title="Select Tool (V)"
        >
          <MousePointer2 className="h-4 w-4 fill-current stroke-2" />
        </button>

        {/* Pan Tool */}
        <button
          onClick={() => setCurrentTool("pan")}
          className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
            currentTool === "pan"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-neutral-600 hover:bg-black/5"
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
        <div className="h-6 w-px bg-neutral-300/60 mx-0.5" />

        {/* Create / Add Button */}
        <button
          onClick={onAddClick}
          className="h-10 w-10 rounded-full flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-neutral-200 shadow-sm"
          title="Add Item"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>
      </motion.div>
    </div>
  );
}
