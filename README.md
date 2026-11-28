# Outils de classe partagés

Outils de classe de Xavier Gougaud, partagés avec les collègues de la circonscription : gratuits, sans compte, installables et utilisables hors ligne (PWA publiées avec GitHub Pages).
**Dépôt public : aucun prénom d'élève ici.** Chaque collègue saisit ses élèves dans « Ma classe » : ils restent dans le navigateur de son appareil.
Les mêmes pages servent aussi dans « Classe » (cahier journal privé de Xavier, jamais partagé), avec ses données à lui.
Licence : CC BY-NC-SA 4.0.

## Fiche d'identité du kit
- **Rôle** : mettre à disposition certains outils, sans les données de Xavier ; chacun y met les siennes et règle les outils.
- **Quand** : préparer (liste d'élèves, contenus) et en classe (correction, plan, groupes…).
- **Où** : ordinateur de classe / TBI et téléphone ; un seul appareil par défaut, export / import pour en changer.
- **Écran n° 1** : le portail, une tuile par outil ; « Ma classe » mise en avant tant que la liste est vide.
- **Ce qu'il ne fait pas** : aucun stockage en ligne ; pas de contenus de manuels dans les éditions libres.

| Outil | Adresse | Version |
|---|---|---|
| Portail « Outils de classe partagés » | https://xaviergougaud1-netizen.github.io/outils-classe/ | 1.4.0 |
| Ma classe (liste d'élèves commune, sauvegarde complète) | https://xaviergougaud1-netizen.github.io/outils-classe/ma-classe/ | 1.1.0 |
| Correcteur de calcul posé (ceintures Charivari) | https://xaviergougaud1-netizen.github.io/outils-classe/correcteur/ | 2.6.0 |
| Ateliers de problèmes (corrigés Accès Maths CM1 et CM2) | https://xaviergougaud1-netizen.github.io/outils-classe/problemes/ | 2.2.0 |
| Mes problèmes (édition libre des Ateliers) | https://xaviergougaud1-netizen.github.io/outils-classe/problemes/?libre | 2.2.0 |
| Flash maths (exercices en photo du collègue) | https://xaviergougaud1-netizen.github.io/outils-classe/flash/ | 4.8 |
| Fiches Claires | https://xaviergougaud1-netizen.github.io/outils-classe/fiches-claires/ | 1.11 |
| Groupes (groupes de travail, rôles, minuteur) | https://xaviergougaud1-netizen.github.io/outils-classe/groupes/ | 1.10.0 |
| Dictées adaptées (édition libre, cycle, devoirs, import PDF) | https://xaviergougaud1-netizen.github.io/outils-classe/dictees/ | 2.6.1 |
| Plan de classe | https://xaviergougaud1-netizen.github.io/outils-classe/plan/ | 1.6 |
| Boussole élève, ex-« Orienter un élève » (outil de Xavier, pas dans le portail) | https://xaviergougaud1-netizen.github.io/outils-classe/orienter/ | 1.3.1 |
| Parcours élève (widget Grist, suivi des élèves de l'école ; **aucune donnée ici**, elles sont dans Grist) | https://xaviergougaud1-netizen.github.io/outils-classe/parcours/ | 0.2.0 |

## Organisation
- `commun/charte.css` : charte Repères v1 commune (couleur de chaque outil : `--outil-calcul`, `--outil-problemes`).
- `commun/eval.js` : évaluations A / AR / ECA / NA, Ctrl+Z, tableau PDF. Dans Classe : base `evals/<outil>`, élèves de `maths/core.students`. Dans le kit (`{local:true}`) : élèves de « Ma classe », évaluations dans localStorage `kit-evals-<outil>`, activées outil par outil (`kit-evals-on-<outil>`).
- `commun/ma-classe.js` : la liste d'élèves du kit (localStorage `kit-classe`), réglage « Évaluer mes élèves » de chaque outil. **Toutes les clés du kit commencent par `kit-`** (même adresse github.io que Thêta).
- `commun/kit-db.js` : dans le kit seulement, imite la base de Classe (`window.claude.use('db')` et `use('downloads')`) avec le stockage de l'appareil (`kit-db:<chemin>`) ; `lecture/main` (élèves) est fabriqué à partir de « Ma classe ». C'est ce qui permet à Groupes et Plan de classe de tourner sans modification dans les deux endroits. Exception au préfixe `kit-` : leurs copies locales gardent leurs noms d'origine (`classe-groupes-v1`, `classe-plan-v1`).
- `commun/kit-images.js` : images du kit sur l'appareil (IndexedDB `kit-images`), adresses `kit:<id>` affichées automatiquement, imitation de la capacité « assets ». Les photos sont incluses dans « Tout exporter ».
- `commun/mes-problemes.js` : édition libre des Ateliers (`problemes/?libre`, localStorage `kit-problemes`) : énoncé en photo ou PDF découpé en pages (pdf.js chargé à la demande), corrigé facultatif, partage par fichier (images comprises).
- `flash/` : même fichier que l'artéfact Flash maths (https://claude.ai/artifact/JNHQ7NdEYa62AXXM4uSviF, `index.html`). Les images de base (fichier édité, `img/cm1|cm2`) restent dans l'artéfact, **jamais dans ce dépôt** ; dans le kit, la liste de base est vide et le collègue ajoute ses photos.
- `fiches-claires/` : même fichier que `fiches-claires/index.html` de Classe. La bibliothèque Ta Mallette (`fiches-claires/tm-lib.js`) et les réglages personnels de Xavier (`fiches-claires/perso.js` : résumés de ses leçons, liens vers son livret et son index) sont dans Classe seulement (**jamais dans ce dépôt**), chargés hors du kit. Dans le kit : pas de base (fiches dans localStorage `fc.*`, comprises dans « Tout exporter »), pas de Coups de pouce.
- `dictees/` : même fichier que `dictees-adaptees.html` de Classe. Dans Classe : dictées Retz (dictees-adaptees.json, jamais dans ce dépôt). Dans le kit : « Mes dictées » (textes du collègue dans ses réglages), cycle réglable, devoirs (copier, projeter, étiquettes), partage par fichier.
- Sauvegarde complète (Ma classe › « Tout exporter ») : toutes les clés `kit-*`, `classe-groupes-v1*`, `classe-plan-v1*` dans un fichier (format 2) ; rappel 30 jours après le dernier export.
- `groupes/`, `plan/` : mêmes fichiers que `groupes.html` et `plan.html` de Classe (barre de navigation et mentions de la fluence adaptées dans le kit).
- `ma-classe/` : saisie un par un, coller une liste, export ONDE (on ne garde que prénom et niveau), export / import JSON.
- `index.html`, `sw.js`, `manifest.webmanifest` à la racine : le portail (installable), qui met aussi « Ma classe » hors ligne.
- `commun/fiches-calcul.js`, `commun/corriges-problemes.js` : les données (fiches et corrigés).
- Chaque page a **deux modes** : sur github.io (ou avec `?mode=app`) = kit (corrigés, évaluations au choix sur l'appareil) ; ailleurs (dans Classe) = corrigés + évaluations dans la base, fichiers communs dans `outils/`.
- **Un seul moteur** : on modifie toujours ici, puis on republie dans Classe. Un nouvel outil partagé reçoit une tuile dans `OUTILS` (index.html).

## Mettre à jour un outil
1. Modifier ici (c'est l'exemplaire de référence).
2. Changer `VERSION` dans `index.html` **et** `CACHE` dans `sw.js` (sinon les téléphones gardent l'ancienne version).
3. Republier aussi dans Classe : `correcteur/index.html` → `correcteur.html`, `problemes/index.html` → `problemes.html`, `groupes/index.html` → `groupes.html`, `plan/index.html` → `plan.html`, `dictees/index.html` → `dictees-adaptees.html`, `fiches-claires/index.html` → `fiches-claires/index.html`, (et `flash/index.html` → `index.html` de l'artéfact Flash maths), `commun/*` → `outils/*` (sauf `ma-classe.js` et `kit-db.js`, inutiles dans Classe).
4. Ajouter une ligne dans « Nouveautés ».

## Nouveautés
- 2026-11-28 · Parcours élève 0.2.0 : accueil (recherche, alertes, classes, archivés), fiche élève (résumé, parcours, suivis avec contacts, rencontres avec pièces jointes, MDPH et PAI), réglages repliables, Ctrl+Z.
- 2026-11-28 · Parcours élève 0.1.0 : widget pour Grist (pas dans le portail), installation des tables et listes du suivi des élèves, annuaire repris de Boussole élève.
- 2026-11-21 · Dictées adaptées 2.6.0 : « Importer un PDF » qui contient plusieurs dictées (découpage selon les titres, par page ou en un bloc ; mots et règle reconnus ; OCR si scanné ; aperçu modifiable).
- 2026-11-21 · Kit 1.4.0 : Fiches Claires 1.11 dans le kit (bibliothèque Ta Mallette sortie dans tm-lib.js, Classe seulement).
- 2026-11-21 · Kit 1.3.0 : Mes problèmes (Ateliers 2.2.0, édition libre), Flash maths 4.8 dans le kit, images sur l'appareil (kit-images.js) et dans la sauvegarde complète.
- 2026-11-21 · Kit 1.2.0 : Dictées adaptées 2.5.0 dans le kit (édition libre, cycle réglable, devoirs) ; Ma classe 1.1.0 : « Tout exporter » (sauvegarde complète) et rappel mensuel.
- 2026-11-21 · Kit 1.1.0 : Groupes 1.10.0 et Plan de classe 1.6 dans le kit (élèves de Ma classe, données sur l'appareil via commun/kit-db.js), même fichier que dans Classe.
- 2026-11-21 · Kit 1.0.0 « Outils de classe partagés » : portail, Ma classe 1.0.0, Correcteur 2.6.0 et Ateliers 2.1.0 (plus de lien vers Classe sur github.io, évaluations au choix avec les élèves de Ma classe, sur l'appareil ; PDF en téléchargement classique ; mention Accès Maths).
- 2026-11-21 · Boussole élève 1.3.0 (ex-« Orienter un élève ») : onglet Protéger (que faire, comparer rencontre/IP/signalement, recueillir la parole, aide à rédiger une IP sans rien enregistrer, contacts CRIP 44 et parquet de Nantes, textes et sources), date de vérification sur les fiches et les contacts, orthophonistes et neuropsychologues du secteur, fiche « Enfant en danger : que faire » (PDF, Word).
- 2026-11-18 · Orienter un élève 1.1.0 : fiches à imprimer (familles, enseignants) en PDF et Word dans `orienter/fiches/`, en tête du Répertoire.
- 2026-11-18 · Orienter un élève 1.0.0 : répertoire de 27 professionnels, structures et dispositifs (ordonnance et prise en charge visibles), questions guidées, courrier de l'école pour le médecin (brouillon sur l'appareil, effacé après 30 jours), Se former, fiches pour les familles. Contenu modifiable dans `orienter/donnees.js`. Aucun prénom d'élève n'est enregistré dans le dépôt.
- 2026-11-15 · Correcteur 2.1.0 : dans Classe, un « A » sur une fiche valide aussi les ceintures d'avant pas encore validées (réglage « Ceintures d'avant : auto / non », annulable d'un coup) ; « auto » dans le tableau PDF.
- 2026-11-15 · 2.0.0 : charte Repères pour les deux outils ; Ateliers de problèmes devient une appli installable ; évaluations des élèves dans Classe pour les deux (synchronisées entre appareils, filtre par groupe, ceinture acquise, tableau PDF, Ctrl+Z) ; page d'accueil du dépôt.
- 2026-11-15 · Correcteur 1.0.0 : installation sur l'écran d'accueil, hors ligne, bouton Retour du téléphone, touche Échap = nouvelle fiche, numéro de version en bas de page.
