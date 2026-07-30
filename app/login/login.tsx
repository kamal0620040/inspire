"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const origin = siteUrl || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
    });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Check your email for the login link!");
    }
  };

  const handleGoogleLogin = async () => {
    const origin = siteUrl || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });
  };

  return (
    <>
      <motion.form className="flex flex-col gap-6" onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-medium">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance font-normal">
            Enter your email to receive a login link
          </p>
        </div>
        <div className="grid gap-6">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="rounded-sm p-4"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" className="cursor-pointer">Continue with Email</Button>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
          <Button variant="outline" className="cursor-pointer" onClick={handleGoogleLogin}>
            Continue with Google
          </Button>
        </div>
      </motion.form>
      {status && (
        <motion.p className="mt-4 text-red-600 text-sm text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {status}
        </motion.p>
      )}
    </>
  );
}
