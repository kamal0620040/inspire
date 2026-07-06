import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Dot } from "lucide-react";
import Link from "next/link";

const Login = () => {
  return (
    <div className="grid min-h-svh max-h-svh lg:grid-cols-2 bg-background">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Dot strokeWidth={8} className="text-destructive mt-1" />
            canvas
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className="flex flex-col gap-6">
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
                  />
                </Field>
                <Button type="submit">Continue with Email</Button>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-background text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <Button variant="outline">Continue with Google</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:flex overflow-hidden gap-4 max-h-svh justify-center" />
    </div>
  );
};

export default Login;
