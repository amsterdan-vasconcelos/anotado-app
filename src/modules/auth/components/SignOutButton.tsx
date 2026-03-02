import { LogOut } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

type SignOutButtonProps = ComponentProps<"button"> & {
  className?: string;
};

export function SignOutForm({ className, ...props }: SignOutButtonProps) {
  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/signin" });
  };

  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant="destructive"
        className={cn("gap-2", className)}
        {...props}
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Sair</span>
      </Button>
    </form>
  );
}
