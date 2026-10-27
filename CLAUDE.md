# Lison, le site des testeurs : les règles

S'applique à toute session qui touche ce dépôt. La conception et le plan sont hors de Git, dans `~/claude-outputs/lison/docs/` (`specs/2026-10-26-le-site-des-testeurs-design.md`, `plans/2026-10-26-le-site-des-testeurs.md`).

## Ce que c'est

Un site statique, en français et en anglais, qui présente Lison à ses premiers testeurs. Le .dmg n'est pas ici : il vit dans un dossier Google Drive en accès restreint, et c'est Google qui vérifie qui télécharge. La liste d'attente est un formulaire Tally. Le site ne sait pas qui est validé.

## Langues

- Le code est en anglais (fichiers, fonctions, variables, commentaires).
- Les textes du site sont dans `content/fr.json` et `content/en.json` ; le français vouvoie, comme l'app.
- Le README, cette page et les descriptions de commit sont en français. Commits en Conventional Commits : `feat(site): …`.

## Le code

- Un fichier, une responsabilité, 300 lignes au plus (`tests/lint/file-length.test.mjs`).
- Tous les tests dans `tests/`, même arborescence que le code (`tests/lint/tests-location.test.mjs`). `npm test` les lance tous.
- Node 24, sans dépendance de construction. Seules dépendances : les polices `@fontsource`, copiées dans `dist/`.

## La page

- **Aucune ressource tierce et aucun script** : ni Google Fonts, ni mesure d'audience, ni iframe. Les tests de `tests/site/` le vérifient.
- **Le site ne nomme personne** : aucun nom de personne ; « l'équipe Lison », « nous ». Un test le vérifie.
- **Aucune vraie donnée** : pas de capture de la vraie app, pas de vraie réunion ni de vraie personne, aucune donnée d'entreprise. Les illustrations sont dessinées, avec des exemples inventés.
- **Le site ne promet que ce qui est dans le .dmg déposé.** Avant chaque nouvelle version, relire les textes.
- `noindex` sur chaque page : le site n'est envoyé qu'aux testeurs.

## Publier

- `npm run build -- --release` refuse une configuration incomplète (`site.config.json`).
- Une PR par changement, fusion en squash par le propriétaire du dépôt seulement, après sa relecture. La fusion sur `main` publie sur GitHub Pages.
- On ne pousse rien et on ne rend rien public sans l'accord écrit du propriétaire du dépôt.
