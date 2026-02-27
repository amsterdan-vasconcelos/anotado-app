import type { User, WorkspaceRepo } from "@/types/github";
import { WorkspaceCard } from "./WorkspaceCard";

type WorkspaceGridProps = {
  workspaces: WorkspaceRepo[];
  user: User;
};

export function WorkspaceGrid({ workspaces, user }: WorkspaceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map((ws) => {
        return <WorkspaceCard key={ws.id} workspace={ws} user={user} />;
      })}
    </div>
  );
}
