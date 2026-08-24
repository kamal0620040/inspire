import AssetsContainer from "@/components/assets-container";
import { Dot } from "lucide-react";
import Link from "next/link";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function Home() {
  return (
      <div className="flex flex-col h-dvh w-dvw items-center pt-20 overflow-hidden relative origin-top-left" style={{ backgroundImage: `radial-gradient(circle, var(--grid) 1px, transparent 1.5px)`, backgroundSize: `32px 32px` }}>
        <div className="max-w-xl space-y-2 font-normal p-8" style={{ backgroundImage: `radial-gradient(ellipse, var(--background) 40%, transparent 80%)`, textRendering: "optimizeLegibility" }}>
            <div className="flex items-center justify-between mb-12">
              <Dot strokeWidth={8} className="text-destructive -ml-2" />
              <Link href="/login" className="underline text-muted-foreground font-normal">
                Login
              </Link>
            </div>

            <h1 className="text-foreground font-medium">inspire</h1>
            <p className="text-muted-foreground antialiased">Collect images and videos on an infinite canvas.</p>
            <p className="text-muted-foreground antialiased">Built for personal use. Fast loading, minimal interface, no onboarding, no tracking.</p>
        </div>
        <AssetsContainer />
      </div>
  );
}
