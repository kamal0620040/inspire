import React from "react";

export default function FolderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh w-dvw overflow-hidden bg-background relative flex flex-col">
      {children}
    </div>
  );
}
