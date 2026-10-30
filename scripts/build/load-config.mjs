import { readFileSync } from "node:fs";

// Each field: the shape it must have once filled in. A wrong shape is refused even locally;
// an empty field is fine locally (the button reads "bientôt") and refused for release,
// except the contact address, which may stay empty for now.
const FIELDS = [
  ["driveFolderUrl", (c) => c.driveFolderUrl, (v) => /^https:\/\/drive\.google\.com\/drive\/folders\/[\w-]+/.test(v), "un lien de dossier Drive sans /u/N/, qui désigne un compte de celui qui l'a copié (https://drive.google.com/drive/folders/…)"],
  ["waitlistFormUrl", (c) => c.waitlistFormUrl, (v) => /^https:\/\/tally\.so\/r\/[\w-]+$/.test(v), "le lien de partage d'un formulaire Tally (https://tally.so/r/…)"],
  ["contactEmail", (c) => c.contactEmail, (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "une adresse e-mail", "optional"],
  ["dmg.version", (c) => c.dmg?.version, (v) => /^\d+\.\d+\.\d+$/.test(v), "un numéro de version X.Y.Z"],
  ["dmg.sizeMb", (c) => c.dmg?.sizeMb, (v) => Number.isInteger(v) && v > 0, "un poids en Mo, nombre entier"],
  // Without it, "Download" falls back to the folder.
  ["dmg.driveFileId", (c) => c.dmg?.driveFileId, (v) => typeof v === "string" && /^[\w-]{20,}$/.test(v), "l'identifiant Drive du .dmg (lettres, chiffres, - et _), jamais un lien", "optional"],
];

/**
 * Reads site.config.json and checks it. Throws one Error naming every field at fault.
 * @param {string} path
 * @param {{ release: boolean }} options
 */
export function loadConfig(path, { release }) {
  const config = JSON.parse(readFileSync(path, "utf8"));
  const problems = [];
  if (typeof config.siteUrl !== "string" || !config.siteUrl.endsWith("/")) {
    problems.push("siteUrl : une adresse qui finit par /");
  }
  for (const [name, read, isValid, expected, optional] of FIELDS) {
    const value = read(config);
    if (value === undefined) {
      problems.push(`${name} : la clé est absente (mettre null tant qu'il n'y a rien)`);
    } else if (value === null) {
      if (release && optional !== "optional") problems.push(`${name} : manquant, il faut ${expected}`);
    } else if (!isValid(value)) {
      problems.push(`${name} : « ${value} » n'est pas ${expected}`);
    }
  }
  if (problems.length > 0) {
    throw new Error(`Configuration du site invalide (${path}) :\n- ${problems.join("\n- ")}`);
  }
  return config;
}
