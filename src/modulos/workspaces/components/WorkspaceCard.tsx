import { Folder, User as UserIcon } from "lucide-react";
import { AppCard } from "@/components/app-card";
import { Badge } from "@/components/ui/badge";
import type { User, WorkspaceRepo } from "@/types/github";

function makeDisplayName(
  name: WorkspaceRepo["name"],
  description: WorkspaceRepo["description"],
): string {
  const slug = name.replace("anotado-", "");
  const fromSlug = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const prefix = "Workspace gerado pelo app de anotações: ";
  return description?.startsWith(prefix)
    ? description.replace(prefix, "")
    : fromSlug;
}

function makeDisplayOwner(login: string): string {
  return login
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type WorkspaceCardProps = {
  workspace: WorkspaceRepo;
  user: User;
};

export function WorkspaceCard({ workspace, user }: WorkspaceCardProps) {
  const displayName = makeDisplayName(workspace.name, workspace.description);
  const displayOwner = makeDisplayOwner(workspace.owner.login);
  const isCollaborator = workspace.owner.login !== user.login;
  const slug = workspace.name.replace("anotado-", "");
  const href = `/workspaces/unit?owner=${workspace.owner.login}&workspace=${slug}`;

  return (
    <AppCard variant="workspace" href={href}>
      <AppCard.Header>
        <AppCard.Icon>
          <Folder size={24} />
        </AppCard.Icon>
        {isCollaborator && <Badge variant="secondary">Colaborador</Badge>}
      </AppCard.Header>

      <AppCard.Body>
        <AppCard.Title>{displayName}</AppCard.Title>
        <AppCard.Meta icon={<UserIcon size={16} />}>
          {displayOwner}
        </AppCard.Meta>
      </AppCard.Body>
    </AppCard>
  );
}
