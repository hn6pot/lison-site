/**
 * What the installed app reads to announce a new version: only the three keys it needs.
 * Returns null while the configuration cannot name a version, its size and where to get it.
 * Never rename or remove a key: apps already installed read this shape.
 * @param {{ driveFolderUrl: string | null, dmg: { version: string | null, sizeMb: number | null } }} config
 */
export function versionFeed(config) {
  const { version, sizeMb } = config.dmg;
  if (!version || sizeMb == null || !config.driveFolderUrl) return null;
  return { version, sizeMb, downloadUrl: config.driveFolderUrl };
}
