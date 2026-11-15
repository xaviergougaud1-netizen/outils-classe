# Outils de classe

Petits outils de classe de Xavier, installables sur téléphone et utilisables hors ligne (PWA publiées avec GitHub Pages).
**Dépôt public : aucun prénom d'élève ici.** Les évaluations se font dans « Classe », qui publie les mêmes pages.

| Outil | Adresse | Version |
|---|---|---|
| Accueil (liste des outils) | https://xaviergougaud1-netizen.github.io/outils-classe/ | |
| Correcteur de calcul posé (ceintures Charivari) | https://xaviergougaud1-netizen.github.io/outils-classe/correcteur/ | 2.1.0 |
| Ateliers de problèmes (corrigés CM1 et CM2) | https://xaviergougaud1-netizen.github.io/outils-classe/problemes/ | 2.0.0 |

## Organisation
- `commun/charte.css` : charte Repères v1 commune (couleur de chaque outil : `--outil-calcul`, `--outil-problemes`).
- `commun/eval.js` : évaluations A / AR / ECA / NA (base de Classe `evals/<outil>`, élèves lus dans `maths/core.students`), Ctrl+Z, tableau PDF. Chargé seulement dans Classe.
- `commun/fiches-calcul.js`, `commun/corriges-problemes.js` : les données (fiches et corrigés).
- Chaque page a **deux modes** : sur github.io (ou avec `?mode=app`) = corrigés seuls ; ailleurs (dans Classe) = corrigés + évaluations, fichiers communs dans `outils/`.

## Mettre à jour un outil
1. Modifier ici (c'est l'exemplaire de référence).
2. Changer `VERSION` dans `index.html` **et** `CACHE` dans `sw.js` (sinon les téléphones gardent l'ancienne version).
3. Republier aussi dans Classe : `correcteur/index.html` → `correcteur.html`, `problemes/index.html` → `problemes.html`, `commun/*` → `outils/*`.
4. Ajouter une ligne dans « Nouveautés ».

## Nouveautés
- 2026-11-15 · Correcteur 2.1.0 : dans Classe, un « A » sur une fiche valide aussi les ceintures d'avant pas encore validées (réglage « Ceintures d'avant : auto / non », annulable d'un coup) ; « auto » dans le tableau PDF.
- 2026-11-15 · 2.0.0 : charte Repères pour les deux outils ; Ateliers de problèmes devient une appli installable ; évaluations des élèves dans Classe pour les deux (synchronisées entre appareils, filtre par groupe, ceinture acquise, tableau PDF, Ctrl+Z) ; page d'accueil du dépôt.
- 2026-11-15 · Correcteur 1.0.0 : installation sur l'écran d'accueil, hors ligne, bouton Retour du téléphone, touche Échap = nouvelle fiche, numéro de version en bas de page.
