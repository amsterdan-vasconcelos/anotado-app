import type { Octokit } from "octokit";

export type WorkspaceRepo = Awaited<
  ReturnType<Octokit["rest"]["repos"]["listForAuthenticatedUser"]>
>["data"][0];

export type User = Awaited<
  ReturnType<Octokit["rest"]["users"]["getAuthenticated"]>
>["data"];
