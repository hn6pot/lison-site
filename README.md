# Lison, le site des testeurs

La page qui présente Lison à ses premiers testeurs, en français et en anglais. Les testeurs validés y trouvent le lien de téléchargement ; les autres s'inscrivent sur la liste d'attente.

Le .dmg n'est pas dans ce dépôt. Il vit dans un dossier Google Drive en **accès restreint** : c'est Google qui vérifie qui télécharge. Le site ne sait pas qui est validé, il montre les deux chemins à tout le monde.

Adresse : https://hn6pot.github.io/lison-site/ (français) et `…/en/` (anglais). Les pages portent `noindex` : elles ne sont pas faites pour être trouvées, seulement envoyées.

## Construire et regarder

Il faut Node 24 ou plus.

    npm install
    npm test
    npm run build
    python3 -m http.server 4173 --directory dist

Puis http://localhost:4173/. Tant que `site.config.json` n'a pas ses liens, les boutons affichent « bientôt ». `npm run build -- --release` refuse une configuration incomplète, et nomme ce qui manque.

## La configuration

`site.config.json` :

| Champ | Ce qu'on y met |
|---|---|
| `driveFolderUrl` | Le lien du **dossier** Drive (`https://drive.google.com/drive/folders/…`), jamais celui d'un fichier. |
| `waitlistFormUrl` | Le lien de partage du formulaire Tally (`https://tally.so/r/…`). |
| `contactEmail` | Facultative pour l'instant (la note dit alors de répondre à l'un de nos e-mails). L'adresse affichée dans la note de confidentialité. Une adresse dédiée au projet (par exemple une adresse Gmail « lison »), jamais une adresse perso ni d'entreprise : le site ne nomme personne. |
| `dmg.version`, `dmg.sizeMb` | La version du .dmg déposé (`0.4.0`) et son poids en Mo (`155`). |

## Une fois : le dossier Drive

1. Dans Google Drive (compte perso, jamais un compte d'entreprise) : Nouveau › Dossier, « Lison ».
2. Partager › Accès général : **Limité** (« Seules les personnes ajoutées peuvent ouvrir avec ce lien »). Jamais « Tous les utilisateurs disposant du lien ».
3. Y déposer `Lison-X.Y.Z.dmg`, et créer un sous-dossier « Anciennes versions ».
4. Copier l'adresse du dossier (dans la barre du navigateur) dans `driveFolderUrl`, **en retirant `/u/2/`** (ou tout `/u/N/`) : ce morceau désigne un de vos comptes Google, et chez un testeur il en ouvrirait un autre. La construction le refuse.

## Une fois : la liste d'attente sur Tally

Tally (tally.so) : une société belge, données hébergées en Europe, formulaires et réponses illimités en gratuit (avec un petit « Made with Tally », retiré par l'offre Pro). Le compte se crée avec une adresse dédiée au projet.

1. Nouveau formulaire, titre « Lison », puis un texte d'accueil : « Accès anticipé, sur invitation. Laissez votre prénom et votre adresse Google : nous vous écrivons dès qu'une place se libère. / Early access, by invitation. Leave your first name and Google address: we will write to you as soon as a spot opens up. »
2. Les questions :
   - « Prénom / First name » : bloc *Short answer*, obligatoire.
   - « Adresse Google / Google address » : bloc *Email*, obligatoire. Texte d'aide : « Celle que vous utiliserez pour l'agenda et le téléchargement. / The one you will use for your calendar and the download. »
   - « Comment avez-vous connu Lison ? / How did you hear about Lison? » : bloc *Short answer*, facultatif.
   - Un bloc *Checkbox*, obligatoire, une seule case : « J'accepte que mon prénom et mon adresse soient conservés pour être invité à tester Lison. / I agree that my first name and address are kept to invite me to test Lison. »
3. Page de fin (*Thank you page*) : « Merci ! Nous vous écrivons dès qu'une place se libère. / Thanks! We will write to you as soon as a spot opens up. »
4. Le style : le logo (`src/brand/app-icon.png`), la couleur d'accent violette `#6B3FC4`, si l'offre le permet.
5. Publier, puis Settings › *Self email notifications* : un e-mail à chaque inscription. Les réponses se lisent dans l'onglet *Submissions* (export CSV, ou Integrations › Google Sheets si besoin) ; y suivre à la main qui a été invité.
6. Share › copier le lien `https://tally.so/r/…` dans `waitlistFormUrl` (jamais le lien d'édition : la construction le refuse).

## Valider un testeur

Une seule adresse, deux endroits, la même que celle laissée dans Tally :

1. **Google Cloud Console** › le projet Google Cloud de l'app › Google Auth Platform › Audience › Utilisateurs de test › « Add users » : coller l'adresse. (100 testeurs au plus, en mode test.)
2. **Google Drive** › dossier « Lison » › Partager › coller la même adresse, rôle **Lecteur**, « Envoyer une notification » coché, avec ce message :

   > Bonjour ! Votre invitation à Lison est prête. Le dossier ci-dessous contient l'app ; la page https://hn6pot.github.io/lison-site/#acces explique comment l'installer en trois gestes. Connectez-vous avec cette adresse Google, c'est elle qui ouvre le dossier et qui relie votre agenda.
   >
   > Hi! Your Lison invitation is ready. The folder below holds the app; https://hn6pot.github.io/lison-site/en/#acces explains how to install it in three moves. Sign in with this Google address: it opens the folder and connects your calendar.

3. Noter dans Tally (ou la feuille exportée) qu'elle est invitée.

**Retirer un testeur** : les mêmes étapes à l'envers (retirer l'adresse du partage, puis des utilisateurs de test), et supprimer sa réponse dans Tally s'il le demande.

## Publier une nouvelle version

1. Déposer le nouveau `Lison-X.Y.Z.dmg` à la racine du dossier, déplacer l'ancien dans « Anciennes versions ». Les testeurs voient le nouveau tout de suite (le partage est sur le dossier).
2. Mettre à jour `dmg.version` et `dmg.sizeMb`, relire les textes de `content/` contre ce que fait vraiment cette version, et ouvrir une PR.

## Ce que lit l'app

L'app installée lit `version.json` (à la racine du site) à l'ouverture, puis toutes les 6 h, pour annoncer une nouvelle version. Le fichier est construit depuis `site.config.json` : version, poids et dossier Drive. Changer sa forme casse les apps déjà installées : on ajoute des clés, on n'en retire ni n'en renomme jamais.

## La mise en ligne

GitHub Actions (`.github/workflows/site.yml`) lance les tests et la construction `--release` sur chaque PR : une PR dont la configuration est incomplète reste rouge, et rien d'incomplet n'arrive sur `main`. La configuration se remplit donc avant le premier push (il faut le dossier Drive, le formulaire, l'adresse de contact et un .dmg déposé). Une fusion sur `main` publie sur GitHub Pages (source « GitHub Actions » dans Settings › Pages).

## Le code

`content/` les textes par langue · `src/page.html` et `src/partials/` le gabarit · `src/styles/` la CSS · `src/brand/` l'icône de l'app · `scripts/build/` la construction · `tests/` tous les tests. Les règles sont dans `CLAUDE.md`.
