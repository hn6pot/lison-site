import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT } from "../support/repo-files.mjs";

const read = (lang) => JSON.parse(readFileSync(join(REPO_ROOT, "content", `${lang}.json`), "utf8"));

function leaves(node, prefix = "") {
  return Object.entries(node).flatMap(([key, value]) =>
    value !== null && typeof value === "object" ? leaves(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]],
  );
}

test("les deux langues ont exactement les mêmes clés", () => {
  const fr = new Set(leaves(read("fr")).map(([key]) => key));
  const en = new Set(leaves(read("en")).map(([key]) => key));
  assert.deepEqual([...fr].filter((key) => !en.has(key)), [], "clés absentes de en.json");
  assert.deepEqual([...en].filter((key) => !fr.has(key)), [], "clés absentes de fr.json");
});

test("aucun texte n'est vide", () => {
  for (const lang of ["fr", "en"]) {
    const empty = leaves(read(lang)).filter(([, value]) => typeof value !== "string" || value.trim() === "");
    assert.deepEqual(empty, [], `textes vides dans ${lang}.json`);
  }
});
