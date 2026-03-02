import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { SignInButton } from "@/modules/auth/components/SignInButton";
import type { CustomSession } from "@/types/auth";

export default async function LoginPage() {
  const session = (await auth()) as CustomSession;
  if (session?.accessToken) redirect("/workspaces");

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center p-8">
      <Card className="w-full max-w-sm text-center">
        <CardContent className="flex flex-col items-center gap-6 py-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Acesso aos Workspaces</h1>
            <p className="text-muted-foreground text-sm">
              Conecte-se para gerenciar suas anotações diretamente nos seus
              repositórios.
            </p>
          </div>

          <SignInButton className="w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
