import SignOutButton from "@/components/sign-out-button";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-foreground">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <SignOutButton />
    </main>
  );
}