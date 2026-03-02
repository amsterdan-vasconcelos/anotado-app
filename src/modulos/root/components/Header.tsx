import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const HeaderRoot = () => {
  return (
    <header className="flex items-center justify-between w-full max-w-300 mx-auto px-4 py-3 border-b border-border">
      <Link
        href="/"
        className="font-bold text-lg text-foreground tracking-tight"
      >
        Anotado
      </Link>

      <Link
        href="/workspaces"
        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
      >
        Entrar
      </Link>
    </header>
  );
};
