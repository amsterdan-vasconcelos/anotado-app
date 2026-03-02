// ─── GitHub API Gateway ───────────────────────────────────────────────────────
//
// Ponto único de acesso às chamadas da GitHub REST API.
// O resto do projeto importa daqui — nunca do Octokit diretamente.
//
// Organização:
//   repos.ts  — operações em repositórios (conteúdo, arquivos, colaboradores)
//   git.ts    — plumbing do Git (refs, trees, commits)
//   users.ts  — usuário autenticado e instalações de GitHub Apps

export * from "./git";
export * from "./repos";
export * from "./users";
