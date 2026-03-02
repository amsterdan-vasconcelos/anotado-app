import {
  ArrowRight,
  FileText,
  FolderOpen,
  GitCommit,
  Github,
  Shield,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

// ─── Static data ──────────────────────────────────────────────────────────────

const features = [
  {
    icon: FileText,
    title: "Editor rico em Markdown",
    description:
      "Slash commands (/), syntax highlight em blocos de código, citações, listas e um menu de formatação flutuante. Tudo vira Markdown puro que você pode abrir em qualquer editor.",
  },
  {
    icon: FolderOpen,
    title: "Workspaces como repositórios",
    description:
      "Cada workspace é um repositório real no seu GitHub. Crie quantos quiser — um para projetos, um para o diário, um para estudos.",
  },
  {
    icon: Tag,
    title: "Categorias",
    description:
      "Organize suas notas em categorias dentro de cada workspace. Crie, renomeie e exclua categorias quando quiser.",
  },
  {
    icon: GitCommit,
    title: "Histórico de versões",
    description:
      "Todo salvamento vira um commit no Git. Visualize, leia e restaure qualquer versão anterior de uma nota sem precisar de backup manual.",
  },
  {
    icon: Users,
    title: "Colaboração",
    description:
      "Convide outros usuários do GitHub para um workspace. Conflitos de edição simultânea são detectados e resolvidos com uma interface dedicada.",
  },
  {
    icon: Shield,
    title: "Seus dados, seu GitHub",
    description:
      "O Ônix não armazena nada em servidor próprio. Seus arquivos ficam em .md no seu repositório. Saia quando quiser — os dados continuam lá.",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Entre com GitHub",
    description:
      "Autentique com sua conta do GitHub. Sem senha extra, sem formulário de cadastro.",
  },
  {
    number: "02",
    title: "Crie um workspace",
    description:
      'Um repositório chamado "anotado-{nome}" é criado automaticamente no seu GitHub.',
  },
  {
    number: "03",
    title: "Escreva suas notas",
    description:
      "Use o editor com slash commands. Cada salvamento gera um commit com histórico automático.",
  },
  {
    number: "04",
    title: "Compartilhe, se quiser",
    description:
      "Convide colaboradores pelo username do GitHub. Ou fique com as notas só para você.",
  },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center px-4 pt-20 pb-24 max-w-3xl mx-auto w-full">
        {/* Identity badge */}
        <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground border border-border rounded-full px-3.5 py-1.5 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0" />
          sabor obsidian
        </div>

        {/* Name */}
        <h1 className="text-6xl sm:text-7xl font-bold text-foreground tracking-tight leading-none mb-6">
          Ônix
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl text-muted-foreground font-light max-w-xl mb-4">
          Suas notas no GitHub.{" "}
          <span className="text-foreground font-medium">
            Grátis, pra sempre.
          </span>
        </p>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mb-10 leading-relaxed">
          Um editor de notas em Markdown que usa repositórios do GitHub como
          banco de dados. Sem servidor próprio, sem cobrança, sem surpresas.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/workspaces"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "gap-2 px-7",
            )}
          >
            <Github size={16} />
            Começar com GitHub
          </Link>
          <a
            href="#como-funciona"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "gap-2",
            )}
          >
            Como funciona
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Trust line */}
        <p className="mt-8 text-xs text-muted-foreground/60">
          Se o Ônix fechar amanhã, seus arquivos continuam no seu GitHub.
        </p>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-300 mx-auto px-4">
        <div className="border-t border-border" />
      </div>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-300 mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Tudo o que você precisa
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Sem feature bloat. Só o que importa para escrever, organizar e
            compartilhar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Icon size={17} className="text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section
        id="como-funciona"
        className="py-20 px-4 bg-muted/30 border-y border-border"
      >
        <div className="max-w-300 mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Como funciona
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Quatro passos. Nenhum cartão de crédito.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ number, title, description }, index) => (
              <div key={number} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-primary/20 leading-none font-mono select-none">
                    {number}
                  </span>
                  {/* connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block flex-1 h-px bg-border mt-1" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The joke ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-300 mx-auto w-full">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 flex flex-col sm:flex-row gap-8 items-start">
          {/* Headline col */}
          <div className="sm:w-64 shrink-0">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
              Por que "Ônix"?
            </p>
            <h2 className="text-2xl font-bold text-foreground leading-snug">
              Não é Obsidian.
              <br />
              <span className="text-primary">Sabor obsidian.</span>
            </h2>
          </div>

          {/* Divider vertical */}
          <div className="hidden sm:block w-px self-stretch bg-border shrink-0" />
          <div className="sm:hidden w-full h-px bg-border" />

          {/* Body col */}
          <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Ônix é uma rocha preta que muita gente confunde com{" "}
              <strong className="text-foreground">obsidiana</strong> — outra
              rocha preta.{" "}
              <a
                href="https://obsidian.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors"
              >
                Obsidian
              </a>{" "}
              é um app de notas muito popular entre devs. Este app claramente se
              parece com ele.
            </p>
            <p>
              No Brasil, quando algo imita ou lembra outra coisa sem ser essa
              coisa, a gente brinca:{" "}
              <em className="text-foreground not-italic font-medium">
                "é a versão sabor X"
              </em>
              . Tipo, refrigerante sabor cola que não é Coca-Cola. Bolacha sabor
              Oreo que não é Oreo.
            </p>
            <p>
              Então: Ônix. Sabor obsidian. O app é completamente consciente da
              piada — e não tem problema nenhum com isso.
            </p>
            <p className="text-foreground/50 text-xs">
              A diferença real: o Obsidian guarda tudo local. O Ônix guarda no
              GitHub. São propostas diferentes. A piada é só uma piada.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-muted/30 border-t border-border">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground border border-border rounded-full px-3.5 py-1.5 text-xs font-medium">
            <Github size={12} />
            Login com GitHub
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Comece agora, de graça
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Nenhuma instalação, nenhum plano pago, nenhum limite artificial.
            Basta ter uma conta no GitHub.
          </p>
          <Link
            href="/workspaces"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "gap-2 px-8",
            )}
          >
            <Github size={16} />
            Entrar com GitHub
          </Link>
        </div>
      </section>
    </div>
  );
}
