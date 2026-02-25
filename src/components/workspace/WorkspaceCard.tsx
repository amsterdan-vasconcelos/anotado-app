import { Folder, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type WorkspaceCardProps = {
  name: string;
  owner: string;
  isCollaborator: boolean;
  url: string;
};

const WorkspaceCard = ({
  name,
  owner,
  isCollaborator,
  url,
}: WorkspaceCardProps) => {
  const prettyOwner = owner
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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
        <h3 className="font-bold text-lg text-foreground mb-1">{name}</h3>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <User size={16} />
          <span>{prettyOwner}</span>
        </div>
      </div>
    </Link>
  );
};

export { WorkspaceCard };
