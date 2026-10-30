/**
 * Where "Download" leads: the current .dmg itself once its Drive id is known, otherwise the folder.
 * Both stay behind Drive's invitation check: an uninvited visitor gets Google's access request.
 * @param {{ driveFolderUrl: string | null, dmg: { driveFileId?: string | null } }} config
 */
export function downloadUrl(config) {
  const id = config.dmg.driveFileId;
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : config.driveFolderUrl;
}
