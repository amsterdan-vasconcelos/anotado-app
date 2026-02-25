import { LogOut } from "lucide-react";
import type { ComponentProps } from "react";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

type SignOutButtonProps = ComponentProps<"button">;

export function SignOutForm({
  type = "submit",
  className,
  ...props
}: SignOutButtonProps) {
  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <form action={signOutAction}>
      <button
        type={type}
        className={cn(
          "flex items-center gap-2 bg-white text-red-600 border border-red-200",
          "px-4 py-2 rounded-md hover:bg-red-50 transition-colors font-medium",
          className,
        )}
        {...props}
      >
        <LogOut size={20} />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </form>
  );
}
