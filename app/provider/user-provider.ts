"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user-store";

const RELEVANT_EVENTS = new Set([
  "INITIAL_SESSION",
  "SIGNED_IN",
  "SIGNED_OUT",
  "USER_UPDATED",
]);

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useUserStore((s) => s.setUser);
  const setLoading = useUserStore((s) => s.setLoading);
  const setInitialized = useUserStore((s) => s.setInitialized);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    const requestIdRef = { current: 0 };

    async function syncProfile(user: User | null) {
      const requestId = ++requestIdRef.current;

      if (!mounted) return;

      if (!user) {
        setUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // A newer call has since started — this response is stale, ignore it.
        if (!mounted || requestId !== requestIdRef.current) return;

        if (error || !profile) {
          setUser(null);
        } else {
          setUser({
            ...profile,
            metadata: user.user_metadata ?? {},
          });
        }
      } catch {
        if (mounted && requestId === requestIdRef.current) {
          setUser(null);
        }
      } finally {
        if (mounted && requestId === requestIdRef.current) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted || !RELEVANT_EVENTS.has(event)) return;

      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        setLoading(true);
      }

      syncProfile(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setInitialized, setLoading, setUser]);

  return children;
}