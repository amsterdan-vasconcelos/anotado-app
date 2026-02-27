import { getRequiredSession } from "@/lib/session";
import { CreateWorkspaceClient } from "../../../../modulos/workspace/create/components/workspace-create-client";

const WorkspaceCreatePage = async () => {
  await getRequiredSession();

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen p-8">
      <main className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Novo Workspace</h1>
          <p className="text-gray-500">
            Crie uma nova área para organizar suas anotações.
          </p>
        </header>

        <CreateWorkspaceClient />
      </main>
    </div>
  );
};

export default WorkspaceCreatePage;
