import type { ReactNode } from "react";
import { LeftSidebar } from "./LeftSidebar";
import { TopBar } from "./TopBar";

interface NoteLayoutProps {
  mode: "view" | "create" | "edit";
  owner: string;
  workspace: string;
  children: ReactNode;
}

export function NoteLayout({
  mode,
  owner,
  workspace,
  children,
}: NoteLayoutProps) {
  return (
    <>
      <TopBar mode={mode} />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar mode={mode} owner={owner} workspace={workspace} />
        {children}
      </div>
    </>
  );
}
