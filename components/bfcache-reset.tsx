"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";

export default function BfcacheReset({
  children,
}: {
  children: React.ReactNode;
}) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
