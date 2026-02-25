import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";

export function SignInButton() {
  return (
    <form
      className="w-fit"
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/workspaces" });
      }}
    >
      <Button type="submit" className="flex gap-2">
        Entrar com GitHub
      </Button>
    </form>
  );
}
