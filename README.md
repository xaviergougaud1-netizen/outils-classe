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
| Portail « Outils de classe partagés » | https://xaviergougaud1-netizen.github.io/outils-classe/ | 1.0.0 |
| Ma classe (liste d'élèves commune) | https://xaviergougaud1-netizen.github.io/outils-classe/ma-classe/ | 1.0.0 |
| Correcteur de calcul posé (ceintures Charivari) | https://xaviergougaud1-netizen.github.io/outils-classe/correcteur/ | 2.6.0 |
| Ateliers de problèmes (corrigés Accès Maths CM1 et CM2) | https://xaviergougaud1-netizen.github.io/outils-classe/problemes/ | 2.1.0 |
| Orienter un élève (outil de Xavier, pas dans le portail) | https://xaviergougaud1-netizen.github.io/outils-classe/orienter/ | 1.1.0 |

## Organisation
- `commun/charte.css` : charte Repères v1 commune (couleur de chaque outil : `--outil-calcul`, `--outil-problemes`).
- `commun/eval.js` : évaluations A / AR / ECA / NA, Ctrl+Z, tableau PDF. Dans Classe : base `evals/<outil>`, élèves de `maths/core.students`. Dans le kit (`{local:true}`) : élèves de « Ma classe », évaluations dans localStorage `kit-evals-<outil>`, activées outil par outil (`kit-evals-on-<outil>`).
- `commun/ma-classe.js` : la liste d'élèves du kit (localStorage `kit-classe`), réglage « Évaluer mes élèves » de chaque outil. **Toutes les clés du kit commencent par `kit-`** (même adresse github.io que Thêta).
- `ma-classe/` : saisie un par un, coller une liste, export ONDE (on ne garde que prénom et niveau), export / import JSON.
- `index.html`, `sw.js`, `manifest.webmanifest` à la racine : le portail (installable), qui met aussi « Ma classe » hors ligne.
- `commun/fiches-calcul.js`, `commun/corriges-problemes.js` : les données (fiches et corrigés).
- Chaque page a **deux modes** : sur github.io (ou avec `?mode=app`) = kit (corrigés, évaluations au choix sur l'appareil) ; ailleurs (dans Classe) = corrigés + évaluations dans la base, fichiers communs dans `outils/`.
- **Un seul moteur** : on modifie toujours ici, puis on republie dans Classe. Un nouvel outil partagé reçoit une tuile dans `OUTILS` (index.html).

## Mettre à jour un outil
1. Modifier ici (c'est l'exemplaire de référence).
2. Changer `VERSION` dans `index.html` **et** `CACHE` dans `sw.js` (sinon les téléphones gardent l'ancienne version).
3. Republier aussi dans Classe : `correcteur/index.html` → `correcteur.html`, `problemes/index.html` → `problemes.html`, `commun/*` → `outils/*`.
4. Ajouter une ligne dans « Nouveautés ».

## Nouveautés
- 2026-11-21 · Kit 1.0.0 « Outils de classe partagés » : portail, Ma classe 1.0.0, Correcteur 2.6.0 et Ateliers 2.1.0 (plus de lien vers Classe sur github.io, évaluations au choix avec les élèves de Ma classe, sur l'appareil ; PDF en téléchargement classique ; mention Accès Maths).
- 2026-11-18 · Orienter un élève 1.1.0 : fiches à imprimer (familles, enseignants) en PDF et Word dans `orienter/fiches/`, en tête du Répertoire.
- 2026-11-18 · Orienter un élève 1.0.0 : répertoire de 27 professionnels, structures et dispositifs (ordonnance et prise en charge visibles), questions guidées, courrier de l'école pour le médecin (brouillon sur l'appareil, effacé après 30 jours), Se former, fiches pour les familles. Contenu modifiable dans `orienter/donnees.js`. Aucun prénom d'élève n'est enregistré dans le dépôt.
- 2026-11-15 · Correcteur 2.1.0 : dans Classe, un « A » sur une fiche valide aussi les ceintures d'avant pas encore validées (réglage « Ceintures d'avant : auto / non », annulable d'un coup) ; « auto » dans le tableau PDF.
- 2026-11-15 · 2.0.0 : charte Repères pour les deux outils ; Ateliers de problèmes devient une appli installable ; évaluations des élèves dans Classe pour les deux (synchronisées entre appareils, filtre par groupe, ceinture acquise, tableau PDF, Ctrl+Z) ; page d'accueil du dépôt.
- 2026-11-15 · Correcteur 1.0.0 : installation sur l'écran d'accueil, hors ligne, bouton Retour du téléphone, touche Échap = nouvelle fiche, numéro de version en bas de page.
