import Link from "next/link";

export const FooterRoot = () => {
  return (
    <footer className="w-full border-t border-border mt-auto">
      <div className="w-full max-w-300 mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground tracking-tight">
            Ônix
          </span>
          <span className="text-[10px] text-muted-foreground border border-border rounded-full px-2 py-0.5 leading-none">
            sabor obsidian
          </span>
        </div>

        {/* Center note */}
        <p className="text-xs text-muted-foreground text-center">
          Suas notas ficam no seu GitHub.{" "}
          <span className="text-foreground/60">Grátis, pra sempre.</span>
        </p>

        {/* Links */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/workspaces"
            className="hover:text-foreground transition-colors"
          >
            Entrar
          </Link>
        </div>
      </div>
    </footer>
  );
};
