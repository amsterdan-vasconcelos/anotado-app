import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const HeaderRoot = () => {
  return (
    <header className="flex items-center justify-between w-full max-w-300 mx-auto px-4 py-3 border-b border-border">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="font-bold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">
          Ônix
        </span>
        <span className="hidden sm:inline text-[11px] text-muted-foreground font-medium border border-border rounded-full px-2 py-0.5 leading-none">
          sabor obsidian
        </span>
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
