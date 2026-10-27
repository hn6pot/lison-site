import { test } from "node:test";
import assert from "node:assert/strict";
import { versionFeed } from "../../scripts/build/version-feed.mjs";

const COMPLETE = {
  siteUrl: "https://hn6pot.github.io/lison-site/",
  driveFolderUrl: "https://drive.google.com/drive/folders/1AbC-dEf_123",
  waitlistFormUrl: "https://tally.so/r/wAbC12",
  contactEmail: "contact@example.org",
  dmg: { version: "0.4.0", sizeMb: 155 },
};

test("le flux reprend la version, le poids et le dossier Drive, et rien d'autre", () => {
  assert.deepEqual(versionFeed(COMPLETE), {
    version: "0.4.0",
    sizeMb: 155,
    downloadUrl: "https://drive.google.com/drive/folders/1AbC-dEf_123",
  });
});
test("pas de flux sans version", () => assert.equal(versionFeed({ ...COMPLETE, dmg: { version: null, sizeMb: 155 } }), null));
test("pas de flux sans poids", () => assert.equal(versionFeed({ ...COMPLETE, dmg: { version: "0.4.0", sizeMb: null } }), null));
test("pas de flux sans dossier Drive", () => assert.equal(versionFeed({ ...COMPLETE, driveFolderUrl: null }), null));
