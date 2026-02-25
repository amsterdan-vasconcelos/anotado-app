import { Octokit } from "octokit";

export function getOctokit(token: string) {
  return new Octokit({
    auth: token,
  });
}
