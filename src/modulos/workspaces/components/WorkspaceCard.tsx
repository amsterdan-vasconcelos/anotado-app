import { Folder, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { User, WorkspaceRepo } from "@/types/github";

const makeWorkspacePrettyName = (
  workspaceName: WorkspaceRepo["name"],
  workspaceDescription: WorkspaceRepo["description"],
) => {
  const workspaceSlug = workspaceName.replace("anotado-", "");

  let displayName = workspaceSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const prefix = "Workspace gerado pelo app de anotações: ";

  if (workspaceDescription && workspaceDescription.startsWith(prefix)) {
    displayName = workspaceDescription.replace(prefix, "");
  }

  return displayName;
};

const makeWorkspacePrettyOwner = (
  ownerLogin: WorkspaceRepo["owner"]["login"],
) => {
  const prettyOwner = ownerLogin
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return prettyOwner;
};

type WorkspaceCardProps = {
  workspace: WorkspaceRepo;
  user: User;
};

const WorkspaceCard = ({ workspace, user }: WorkspaceCardProps) => {
  const prettyName = makeWorkspacePrettyName(
    workspace.name,
    workspace.description,
  );

  const prettyOwner = makeWorkspacePrettyOwner(workspace.owner.login);
  const isCollaborator = workspace.owner.login !== user.login;
  const url = `/workspaces/unit?owner=${workspace.owner.login}&name=${workspace.name.replace("anotado-", "")}`;

  return (
    <Link
      href={url}
      className="flex flex-col gap-4 bg-card text-card-foreground p-6 border border-border rounded-xl shadow-xs hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between">
        <div className="bg-secondary text-secondary-foreground p-3 rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Folder size={24} />
        </div>
        {isCollaborator && <Badge variant="secondary">Colaborador</Badge>}
      </div>

      <div>
        <h3 className="font-bold text-lg text-foreground mb-1">{prettyName}</h3>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <UserIcon size={16} />
          <span>{prettyOwner}</span>
        </div>
      </div>
    </Link>
  );
};

export { WorkspaceCard };
