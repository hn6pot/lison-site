import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

const SKIPPED = new Set(["node_modules", "dist", ".git", ".worktrees"]);

/** Every file of the repository, as paths relative to its root. */
export function listRepoFiles(dir = REPO_ROOT) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIPPED.has(entry.name)) return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listRepoFiles(path) : [relative(REPO_ROOT, path)];
  });
}
