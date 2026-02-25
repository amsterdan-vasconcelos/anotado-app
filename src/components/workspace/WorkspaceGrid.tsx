import type { User, WorkspaceRepo } from "@/types/github";
import { WorkspaceCard } from "./WorkspaceCard";

type WorkspaceGridProps = {
  workspaces: WorkspaceRepo[];
  user: User;
};

export function WorkspaceGrid({ workspaces, user }: WorkspaceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map((repo) => {
        const workspaceSlug = repo.name.replace("anotado-", "");

        let displayName = workspaceSlug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const prefix = "Workspace gerado pelo app de anotações: ";

        if (repo.description && repo.description.startsWith(prefix)) {
          displayName = repo.description.replace(prefix, "");
        }

        return (
          <WorkspaceCard
            key={repo.id}
            name={displayName}
            owner={repo.owner.login}
            isCollaborator={repo.owner.login !== user.login}
            url={`/workspace/${repo.owner.login}/${workspaceSlug}`}
          />
        );
      })}
    </div>
  );
}
