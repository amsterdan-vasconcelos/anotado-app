import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInButton } from "@/modulos/auth/components/SignInButton";
import type { CustomSession } from "@/types/auth";

export default async function LoginPage() {
  const session = (await auth()) as CustomSession;
  if (session?.accessToken) redirect("/workspace-collection");

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center p-8">
      <main className="w-full max-w-sm bg-card text-card-foreground p-8 border border-border rounded-xl shadow-sm text-center flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">Acesso aos Workspaces</h1>

        <p className="mb-8 text-muted-foreground">
          Conecte-se para gerenciar suas anotações diretamente nos seus
          repositórios.
        </p>

        <SignInButton />
      </main>
    </div>
  );
}
