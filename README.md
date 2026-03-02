# Ônix — _sabor obsidian_ 🖤

> Ônix é um app de anotações gratuito que usa o **GitHub como banco de dados**.
> Parece Obsidian. Não é. _Sabor obsidian._

---

## O que é isso?

Ônix é um editor de notas em Markdown que roda no navegador. Em vez de um banco de dados próprio, ele usa repositórios do GitHub para guardar tudo. Cada **workspace** é um repositório, cada **nota** é um arquivo `.md` e cada **salvamento** é um commit.

Você não paga nada. Você não perde seus dados se o app fechar. Seus arquivos ficam no GitHub, em texto simples, pra sempre.

---

## De onde vem o nome?

Ônix é uma rocha preta que muita gente confunde com **obsidiana** — outra rocha preta.

[Obsidian](https://obsidian.md) é um aplicativo de notas muito popular entre devs e escritores. Ônix claramente se parece com ele. No Brasil, quando algo imita ou lembra outra coisa, a gente brinca:

> _"É a versão sabor obsidian."_

Daí veio o slogan. O app é auto-consciente da piada.

---

## Funcionalidades

| Feature                     | Descrição                                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Editor rico**             | Editor TipTap com suporte a Markdown, slash commands (`/`), código com syntax highlight, citações, listas e mais                 |
| **Workspaces**              | Cada workspace é um repositório GitHub. Crie quantos quiser                                                                      |
| **Categorias**              | Organize suas notas em categorias (pastas) dentro de cada workspace                                                              |
| **Histórico de versões**    | Todo salvamento vira um commit. Visualize e restaure qualquer versão anterior da nota                                            |
| **Colaboração**             | Convide outros usuários do GitHub para colaborar em um workspace                                                                 |
| **Resolução de conflitos**  | Se duas pessoas editarem a mesma nota ao mesmo tempo, o app detecta o conflito e oferece uma interface para resolver manualmente |
| **Grátis pra sempre**       | Sem banco de dados próprio, sem cobrança. O GitHub guarda tudo                                                                   |
| **Seus dados, suas regras** | Os arquivos ficam no seu GitHub em Markdown puro. Você pode ler, editar e migrar sem depender do Ônix                            |

---

## Como funciona

```
GitHub OAuth → autenticação do usuário
     ↓
Workspace criado = repositório "anotado-{nome}" no GitHub
     ↓
Nota criada = arquivo "{categoria}/{slug}.md" no repositório
     ↓
Salvamento = commit via GitHub API
     ↓
Histórico = git log do arquivo
```

O app nunca armazena o conteúdo das suas notas em nenhum servidor próprio. Tudo vai direto para o GitHub via API.

---

## Stack técnica

| Camada           | Tecnologia                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org) — App Router, Server Actions                                           |
| UI               | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com)                         |
| Editor           | [TipTap](https://tiptap.dev) com extensão Markdown                                                      |
| Auth             | [NextAuth.js v5](https://authjs.dev) — provider GitHub OAuth                                            |
| Storage          | [GitHub REST API](https://docs.github.com/en/rest) via [Octokit](https://github.com/octokit/octokit.js) |
| Syntax highlight | [lowlight](https://github.com/wooorm/lowlight) + [highlight.js](https://highlightjs.org)                |
| Runtime          | [Bun](https://bun.sh)                                                                                   |

---

## Arquitetura do código

```
src/
├── app/                    # Rotas Next.js (App Router)
│   ├── (auth)/             # Páginas de autenticação
│   ├── (protected)/        # Páginas que exigem login
│   │   ├── note/           # Visualizar nota
│   │   ├── note/create/    # Criar nota
│   │   └── note/edit/      # Editar nota
│   └── (root)/             # Página pública (landing)
│
├── modulos/                # Lógica de negócio por feature
│   ├── auth/
│   ├── category/actions/   # Server actions de categorias
│   ├── collaborator/actions/
│   ├── editor/             # TipTap: componentes e utilitários
│   ├── note/               # Viewer, form, actions de nota
│   ├── workspace/          # Workspace individual
│   └── workspaces/         # Lista de workspaces
│
├── components/ui/          # Componentes shadcn
└── lib/                    # Utilitários, session, octokit
```

Todas as mutações (criar, editar, deletar) usam **Server Actions** do Next.js — sem endpoints de API REST próprios.

---

## Rodando localmente

### Pré-requisitos

- [Bun](https://bun.sh) instalado
- Uma conta no GitHub
- Um **OAuth App** no GitHub ([criar aqui](https://github.com/settings/developers))
- Um **GitHub App** instalado (para criar repositórios automaticamente)

### 1. Clone e instale

```bash
git clone https://github.com/seu-usuario/onix.git
cd onix
bun install
```

### 2. Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com:

```env
# NextAuth
AUTH_SECRET=uma-string-aleatoria-longa-e-segura

# GitHub OAuth App (para login)
AUTH_GITHUB_ID=seu_client_id
AUTH_GITHUB_SECRET=seu_client_secret

# GitHub App (para criar repositórios)
GITHUB_APP_SLUG=nome-do-seu-github-app
```

**Callback URL** do OAuth App: `http://localhost:3000/api/auth/callback/github`

### 3. Rode

```bash
bun dev
```

Abra [http://localhost:3000](http://localhost:3000).

---

## Como o GitHub App é usado

Para criar workspaces (repositórios) na conta do usuário, o app precisa de permissão de **Contents: Read & Write**. Essa permissão é concedida via GitHub App Installation.

Na primeira vez, o usuário que ainda não instalou o GitHub App verá um botão **"Instalar para Criar"** na tela de workspaces, que redireciona para a página de instalação do app no GitHub.

---

## Estrutura de um workspace no GitHub

```
repositório: anotado-{nome-do-workspace}/
│
├── workspace-index.json        # Metadados: lista de categorias
│
├── geral/
│   ├── minha-primeira-nota.md
│   └── outra-nota.md
│
└── estudos/
    └── algoritmos.md
```

Cada nota `.md` começa com um frontmatter:

```markdown
---
title: "Minha nota"
date: "2025-01-01"
---

Conteúdo da nota aqui...
```

---

## Licença

MIT — use, modifique e distribua à vontade. Só não diga que é Obsidian.
