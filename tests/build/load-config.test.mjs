import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig } from "../../scripts/build/load-config.mjs";

const EMPTY = {
  siteUrl: "https://hn6pot.github.io/lison-site/",
  driveFolderUrl: null,
  waitlistFormUrl: null,
  contactEmail: null,
  dmg: { version: null, sizeMb: null },
};
const COMPLETE = {
  ...EMPTY,
  driveFolderUrl: "https://drive.google.com/drive/folders/1AbC-dEf_123",
  waitlistFormUrl: "https://tally.so/r/wAbC12",
  contactEmail: "contact@example.org",
  dmg: { version: "0.4.0", sizeMb: 155 },
};

function writeConfig(config) {
  const path = join(mkdtempSync(join(tmpdir(), "site-config-")), "site.config.json");
  writeFileSync(path, JSON.stringify(config));
  return path;
}

test("une config vide passe en local", () => {
  assert.deepEqual(loadConfig(writeConfig(EMPTY), { release: false }), EMPTY);
});

test("une config vide échoue en release en nommant les quatre champs requis", () => {
  assert.throws(
    () => loadConfig(writeConfig(EMPTY), { release: true }),
    (error) =>
      ["driveFolderUrl", "waitlistFormUrl", "dmg.version", "dmg.sizeMb"].every((field) => error.message.includes(field)) &&
      !error.message.includes("contactEmail"),
  );
});

test("l'adresse de contact est facultative, même en release", () => {
  assert.equal(loadConfig(writeConfig({ ...COMPLETE, contactEmail: null }), { release: true }).contactEmail, null);
});

test("une config complète passe en release", () => {
  assert.deepEqual(loadConfig(writeConfig(COMPLETE), { release: true }), COMPLETE);
});

test("un lien Drive vers un fichier est refusé, même en local", () => {
  const config = { ...EMPTY, driveFolderUrl: "https://drive.google.com/file/d/abc/view" };
  assert.throws(() => loadConfig(writeConfig(config), { release: false }), /driveFolderUrl/);
});

test("un formulaire hors de Tally est refusé", () => {
  const config = { ...EMPTY, waitlistFormUrl: "https://forms.example.org/r/abc" };
  assert.throws(() => loadConfig(writeConfig(config), { release: false }), /waitlistFormUrl/);
});

test("un ancien lien Google Form est refusé : la liste d'attente vit sur Tally", () => {
  const config = { ...EMPTY, waitlistFormUrl: "https://forms.gle/AbCdEf123" };
  assert.throws(() => loadConfig(writeConfig(config), { release: false }), /waitlistFormUrl/);
});

test("le lien d'édition d'un formulaire Tally est refusé : il faut le lien de partage", () => {
  const config = { ...EMPTY, waitlistFormUrl: "https://tally.so/forms/wAbC12/edit" };
  assert.throws(() => loadConfig(writeConfig(config), { release: false }), /waitlistFormUrl/);
});

test("une version qui n'est pas X.Y.Z est refusée", () => {
  const config = { ...EMPTY, dmg: { version: "v0.4", sizeMb: null } };
  assert.throws(() => loadConfig(writeConfig(config), { release: false }), /dmg\.version/);
});

test("un poids qui n'est pas un entier positif est refusé", () => {
  const config = { ...EMPTY, dmg: { version: null, sizeMb: "155 Mo" } };
  assert.throws(() => loadConfig(writeConfig(config), { release: false }), /dmg\.sizeMb/);
});

test("une adresse de contact sans @ est refusée", () => {
  const config = { ...EMPTY, contactEmail: "contact" };
  assert.throws(() => loadConfig(writeConfig(config), { release: false }), /contactEmail/);
});

test("une clé absente est refusée, même en local", () => {
  const { contactEmail, ...withoutContact } = EMPTY;
  assert.throws(() => loadConfig(writeConfig(withoutContact), { release: false }), /contactEmail/);
  assert.throws(() => loadConfig(writeConfig({ ...EMPTY, dmg: undefined }), { release: false }), /dmg/);
});

test("un lien Drive avec /u/N/ est refusé : il désigne un compte Google de celui qui l'a copié", () => {
  const config = { ...EMPTY, driveFolderUrl: "https://drive.google.com/drive/u/2/folders/1ZzMfgq9nVoR0F8YmXxJ6aAzhY1GfGhBv" };
  assert.throws(() => loadConfig(writeConfig(config), { release: false }), /\/u\/2\//);
});
