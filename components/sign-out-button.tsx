"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      setErrorMessage(error.message);
      setIsSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={handleSignOut} disabled={isSigningOut}>
        {isSigningOut ? "Signing out..." : "Sign out"}
      </Button>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}
