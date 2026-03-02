"use server";

import type { ActionResult } from "@/lib/action-result";
import { getOctokit } from "@/lib/octokit";
import { getRequiredSession } from "@/lib/session";

export interface CommitRecord {
  sha: string;
  message: string;
  date: string;
  authorName: string;
  authorAvatar?: string;
}

export async function fetchHistory(
  owner: string,
  workspace: string,
  path: string,
): Promise<ActionResult<CommitRecord[]>> {
  const session = await getRequiredSession();

  try {
    const octokit = getOctokit(session.accessToken || "");
    const repo = `anotado-${workspace}`;

    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      path,
    });

    const data: CommitRecord[] = commits.map((item) => ({
      sha: item.sha,
      message: item.commit.message,
      date: item.commit.author?.date ?? "",
      authorName: item.commit.author?.name ?? "",
      authorAvatar: item.author?.avatar_url,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[fetchHistory]", error);
    return { success: false, error: "Erro ao buscar histórico." };
  }
}
