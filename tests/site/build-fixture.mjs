import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "../../scripts/build/build.mjs";

export const COMPLETE_CONFIG = {
  siteUrl: "https://hn6pot.github.io/lison-site/",
  driveFolderUrl: "https://drive.google.com/drive/folders/1AbC-dEf_123",
  waitlistFormUrl: "https://tally.so/r/wAbC12",
  contactEmail: "contact@example.org",
  dmg: { version: "0.4.0", sizeMb: 155, driveFileId: "1AbCdEfGhIjKlMnOpQrStUvWxYz_-012" },
};

export const EMPTY_CONFIG = {
  siteUrl: COMPLETE_CONFIG.siteUrl,
  driveFolderUrl: null,
  waitlistFormUrl: null,
  contactEmail: null,
  dmg: { version: null, sizeMb: null, driveFileId: null },
};

/** Builds the site with this config into a fresh folder; returns the folder and a page reader. */
export function buildWith(config, { release }) {
  const dir = mkdtempSync(join(tmpdir(), "site-build-"));
  const configPath = join(dir, "site.config.json");
  writeFileSync(configPath, JSON.stringify(config));
  const outDir = join(dir, "dist");
  build({ outDir, release, configPath });
  return { outDir, read: (path) => readFileSync(join(outDir, path), "utf8") };
}
