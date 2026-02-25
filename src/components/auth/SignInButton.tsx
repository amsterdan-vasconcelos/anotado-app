import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";
import { cn } from "@/lib/utils";

type SignInButtonProps = ComponentProps<"button">;

export function SignInButton({
  type = "submit",
  className,
  ...props
}: SignInButtonProps) {
  const signInAction = async () => {
    "use server";
    await signIn("github", { redirectTo: "/workspaces" });
  };

  return (
    <form className="w-fit" action={signInAction}>
      <Button type={type} className={cn("flex gap-2", className)} {...props}>
        Entrar com GitHub
      </Button>
    </form>
  );
}
