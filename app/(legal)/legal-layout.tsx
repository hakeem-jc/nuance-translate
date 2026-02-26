import type { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return <main className="bg-(--background) min-h-dvh">{children}</main>;
}