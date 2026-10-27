import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT, listRepoFiles } from "../support/repo-files.mjs";

const MAX_LINES = 300;
const CHECKED = /\.(mjs|js|html|css|json|md|yml)$/;

test("aucun fichier du dépôt ne dépasse 300 lignes", () => {
  const tooLong = listRepoFiles()
    .filter((path) => CHECKED.test(path) && path !== "package-lock.json")
    .map((path) => [path, readFileSync(join(REPO_ROOT, path), "utf8").split("\n").length])
    .filter(([, lines]) => lines > MAX_LINES);
  assert.deepEqual(tooLong, [], `Fichiers trop longs : ${tooLong.map(([p, n]) => `${p} (${n})`).join(", ")}`);
});
