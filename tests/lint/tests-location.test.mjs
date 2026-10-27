import { test } from "node:test";
import assert from "node:assert/strict";
import { listRepoFiles } from "../support/repo-files.mjs";

test("aucun test ne vit hors de tests/", () => {
  const misplaced = listRepoFiles().filter((path) => path.endsWith(".test.mjs") && !path.startsWith("tests/"));
  assert.deepEqual(misplaced, []);
});
