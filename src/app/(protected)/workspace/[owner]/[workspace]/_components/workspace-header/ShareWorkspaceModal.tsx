"use client";

import { Loader2, UserPlus, Users, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Collaborator } from "@/lib/api-client";
import { apiFetchCollaborators, apiInviteCollaborator } from "@/lib/api-client";

interface ShareWorkspaceModalProps {
  owner: string;
  workspace: string;
  onClose: () => void;
}

export function ShareWorkspaceModal({
  owner,
  workspace,
  onClose,
}: ShareWorkspaceModalProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    async function fetchCollaborators() {
      const result = await apiFetchCollaborators(owner, workspace);

      if (result.success) {
        setCollaborators(result.data);
      } else {
        setFetchError(result.error);
      }

      setIsLoading(false);
    }

    fetchCollaborators();
  }, [owner, workspace]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(false);

    const result = await apiInviteCollaborator(owner, workspace, username);

    if (result.success) {
      setUsername("");
      setInviteSuccess(true);
    } else {
      setInviteError(result.error);
    }

    setIsInviting(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Compartilhar Workspace
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <form onSubmit={handleInvite} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nome de usuário do GitHub..."
              />
              <Button type="submit" disabled={isInviting || !username.trim()}>
                {isInviting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserPlus size={14} />
                )}
                Convidar
              </Button>
            </div>

            {inviteError && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {inviteError}
              </p>
            )}

            {inviteSuccess && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                Convite enviado! O usuário precisa aceitar na tela inicial dele.
              </p>
            )}
          </form>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Pessoas com acesso
            </h3>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : fetchError ? (
              <p className="text-sm text-destructive">{fetchError}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {collaborators.map((collab) => (
                  <CollaboratorCard key={collab.id} collaborator={collab} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type CollaboratorCardProps = {
  collaborator: Collaborator;
  owner: string;
};

const CollaboratorCard = ({ collaborator, owner }: CollaboratorCardProps) => {
  console.log(collaborator.avatar_url);

  return (
    <li className="flex items-center gap-3">
      <Image
        src={collaborator.avatar_url}
        alt={collaborator.login}
        width={32}
        height={32}
        className="rounded-full bg-muted"
      />
      <span className="text-sm font-medium text-foreground">
        {collaborator.login}
      </span>
      {collaborator.login === owner && (
        <span className="ml-auto bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs font-medium">
          Proprietário
        </span>
      )}
    </li>
  );
};
