import type { ReactNode } from "react";

export default async function NoteRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {children}
    </div>
  );
}
