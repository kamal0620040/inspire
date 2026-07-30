import { Dot } from "lucide-react";
import Link from "next/link";
import LoginForm from "./login";

const Login = async () => {
  return (
    <div className="grid min-h-svh max-h-svh lg:grid-cols-2 bg-background">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Dot strokeWidth={8} className="text-destructive mt-1" />
            inspire
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:flex overflow-hidden gap-4 max-h-svh justify-center" />
    </div>
  );
};

export default Login;
