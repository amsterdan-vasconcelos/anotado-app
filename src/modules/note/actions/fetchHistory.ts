"use server";

import type { ActionResult } from "@/lib/action-result";
import { listFileCommits } from "@/lib/github/api/repos";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";

export type { CommitSummary as CommitRecord } from "@/lib/github/api/repos";

export async function fetchHistory(
  owner: string,
  workspace: string,
  path: string,
): Promise<ActionResult<import("@/lib/github/api/repos").CommitSummary[]>> {
  const session = await getRequiredSession();

  try {
    const octokit = getOctokit(session.accessToken || "");
    const repo = `anotado-${workspace}`;

    const commits = await listFileCommits(octokit, { owner, repo, path });

    return { success: true, data: commits };
  } catch (error) {
    console.error("[fetchHistory]", error);
    return { success: false, error: "Erro ao buscar histórico." };
  }
}
