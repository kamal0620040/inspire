"use client";

import { useClickOutside } from "@/hooks/use-click-outside";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, LogOut, User } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import Image from "next/image";

const UserProfile = () => {
  const router = useRouter();
  const { initialized, loading, user } = useUserStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = createClient();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setShowUserMenu(false);
    useUserStore.getState().clearUser();
    router.replace("/login");
    router.refresh();
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Local session is already cleared; revoking server-side is best-effort.
    } finally {
      setIsSigningOut(false);
    }
  };

  const closeUserMenu = useCallback(() => {
    setShowUserMenu(false);
  }, []);

  useClickOutside(wrapperRef, closeUserMenu, showUserMenu);

  // Close transient menu when the route is hidden by Activity preservation.
  useLayoutEffect(() => {
    return () => {
      setShowUserMenu(false);
      setIsSigningOut(false);
    };
  }, []);

  return (
    <>
      {/* User Menu Popover */}
      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            ref={wrapperRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-4/6 mb-3 p-3 bg-glass/90 border border-dark/80 dark:border-white/30 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col gap-2 min-w-50 max-w-60"
          >
            <div className="px-2 py-1 text-muted-foreground truncate">
              <span className="font-medium text-xs text-muted-foreground">
                Signed in as:{" "}
              </span>
              <br />
              <span className="-mt-2 font-normal truncate max-w-2 text-xs text-muted-foreground  ">
                {user?.email}
              </span>
            </div>
            <div className="h-px bg-black/10 dark:bg-white/20" />
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground truncate">
              <div>Theme toggle</div>
              <ThemeToggle />
            </div>
            <div className="h-px bg-black/10 dark:bg-white/20" />
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-accent cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-left"
            >
              {isSigningOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Profile Avatar Trigger */}
        <button
          type="button"
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`h-10 w-10 rounded-full flex items-center justify-center bg-neutral-200 overflow-hidden cursor-pointer transition-all hover:scale-105 active:scale-95 border border-neutral-300 select-none ${
            showUserMenu ? "ring-2 ring-neutral-400" : ""
          }`}
        >
          <div className="h-full w-full bg-linear-to-tr from-neutral-400 to-neutral-200 flex items-center justify-center">
            {loading || !initialized ? (
              <div className="h-5 w-5 rounded-full border-2 border-neutral-400 border-t-transparent animate-spin" />
            ) : user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt="Profile"
                className="object-cover"
                height={40}
                width={40}
              />
            ) : (
              <User className="h-5 w-5 text-neutral-600" />
            )}
          </div>
        </button>
    </>
  );
};

export default UserProfile;
