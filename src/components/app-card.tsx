import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// ── Variants ──────────────────────────────────────────────────────────────────

const appCardVariants = cva(
  [
    "group/card flex flex-col overflow-hidden rounded-xl",
    "border border-border bg-card text-card-foreground",
    "shadow-xs transition-all",
  ].join(" "),
  {
    variants: {
      variant: {
        workspace: "gap-4 p-6 hover:shadow-md hover:border-primary/40",
        note: "gap-3 p-5 hover:shadow-md hover:border-primary/40",
      },
    },
    defaultVariants: { variant: "workspace" },
  },
);

// ── Types ─────────────────────────────────────────────────────────────────────

type AppCardVariants = VariantProps<typeof appCardVariants>;

type AppCardRootProps = AppCardVariants & {
  href?: string;
  className?: string;
  children: ReactNode;
};

type SlotProps = {
  children: ReactNode;
  className?: string;
};

// ── Root ──────────────────────────────────────────────────────────────────────

function AppCardRoot({ variant, href, className, children }: AppCardRootProps) {
  const cls = cn(appCardVariants({ variant }), className);

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return <div className={cls}>{children}</div>;
}

// ── Header — row with main content and optional action/badge ──────────────────

function AppCardHeader({ children, className }: SlotProps) {
  return (
    <div className={cn("flex items-start justify-between gap-2", className)}>
      {children}
    </div>
  );
}

// ── Icon — colored icon block (workspace variant) ─────────────────────────────

function AppCardIcon({ children, className }: SlotProps) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-md p-3",
        "bg-secondary text-secondary-foreground",
        "group-hover/card:bg-primary group-hover/card:text-primary-foreground",
        "transition-colors",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── Body — stacked content block ──────────────────────────────────────────────

function AppCardBody({ children, className }: SlotProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>{children}</div>
  );
}

// ── Title ─────────────────────────────────────────────────────────────────────

function AppCardTitle({ children, className }: SlotProps) {
  return (
    <h3
      className={cn(
        "font-bold text-base text-foreground leading-snug line-clamp-2",
        className,
      )}
    >
      {children}
    </h3>
  );
}

// ── Meta — small row with optional leading icon ───────────────────────────────

type AppCardMetaProps = SlotProps & {
  icon?: ReactNode;
};

function AppCardMeta({ children, icon, className }: AppCardMetaProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm text-muted-foreground",
        className,
      )}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}

// ── Footer — spaced row for badges, dates, etc. ───────────────────────────────

function AppCardFooter({ children, className }: SlotProps) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-wrap items-center justify-between gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── Compound export ───────────────────────────────────────────────────────────

export const AppCard = Object.assign(AppCardRoot, {
  Header: AppCardHeader,
  Icon: AppCardIcon,
  Body: AppCardBody,
  Title: AppCardTitle,
  Meta: AppCardMeta,
  Footer: AppCardFooter,
});
