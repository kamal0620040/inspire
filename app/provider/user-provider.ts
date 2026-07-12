"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; 
import { useUserStore } from "@/store/user-store";

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

    async function loadUser() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      if (error || !profile) {
        setUser(null);
      } else {
        setUser({
          ...profile,
          metadata: user.user_metadata ?? {},
        });
      }

      setLoading(false);
      setInitialized(true);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!mounted) return;

      if (profile) {
        setUser({
          ...profile,
          metadata: session.user.user_metadata ?? {},
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setInitialized, setLoading, setUser]);

  return children;
}