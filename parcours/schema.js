/* Parcours élève : structure du document Grist (tables, colonnes, listes) et réglages de départ.
   Modifier ici la structure, sans toucher au code de index.html.
   Les identifiants (id) n'ont ni accent ni espace ; les étiquettes (label) s'affichent dans Grist.
   Les listes (choices) pourront être modifiées dans les Réglages du widget. */

const LISTES = {
  oui_non: ["OK", "N"],
  notes: ["1", "2", "3", "4"],
  orientation: ["ULIS", "SEGPA"],
  etat_suivi: ["Préconisé", "En cours", "Terminé", "Arrêté"],
  frequence: ["1 fois par semaine", "2 fois par semaine", "1 fois tous les 15 jours"],
  types_suivi_base: ["Orthophoniste", "Orthoptiste", "Ergothérapeute", "Psychomotricien", "Psychologue", "Neuropsychologue", "CMP", "CMPP"],
  type_rencontre: ["Entretien avec les parents", "Équipe éducative", "ESS", "Autre"],
  nature_mdph: ["AESH individuelle", "AESH mutualisée", "Matériel pédagogique adapté", "ULIS", "SESSAD", "Transport", "Autre"],
  amenagements: ["Temps majoré", "Police adaptée", "Ordinateur", "Lecture des consignes", "Place près du tableau", "Fiche à compléter", "Pauses", "Secrétaire / scripteur"],
  statut: ["Présent", "Archivé"]
};

const SCHEMA = [
  { id: "Eleves", cols: [
    { id: "Nom", type: "Text", label: "Nom" },
    { id: "Prenom", type: "Text", label: "Prénom" },
    { id: "Naissance", type: "Date", label: "Date de naissance" },
    { id: "Classe", type: "Text", label: "Classe" },
    { id: "Statut", type: "Choice", label: "Statut", choices: "statut" },
    { id: "Depart", type: "Date", label: "Date de départ" }
  ]},
  { id: "Professionnels", cols: [
    { id: "Type", type: "Text", label: "Type" },
    { id: "Nom", type: "Text", label: "Nom" },
    { id: "Adresse", type: "Text", label: "Adresse" },
    { id: "Telephone", type: "Text", label: "Téléphone" },
    { id: "Mail", type: "Text", label: "Mail" },
    { id: "Verifie", type: "Text", label: "Vérifié le" }
  ]},
  { id: "Parcours", cols: [
    { id: "Eleve", type: "Ref:Eleves", label: "Élève", visible: "Nom" },
    { id: "Annee", type: "Text", label: "Année scolaire" },
    { id: "Classe", type: "Text", label: "Classe" },
    { id: "Enseignant", type: "Text", label: "Enseignant" },
    { id: "Travail", type: "Choice", label: "Travail (1 à 4)", choices: "notes" },
    { id: "Comportement", type: "Choice", label: "Comportement (1 à 4)", choices: "notes" },
    { id: "Points_appui", type: "Text", label: "Points d'appui, réussites" },
    { id: "Rased_demande", type: "Bool", label: "RASED demandé" },
    { id: "Rased_suivi", type: "Bool", label: "RASED suivi" },
    { id: "Psy_EN", type: "Bool", label: "Psychologue scolaire" },
    { id: "PPRE", type: "Bool", label: "PPRE" },
    { id: "PAP", type: "Bool", label: "PAP" },
    { id: "PAI", type: "Bool", label: "PAI" },
    { id: "PPS", type: "Bool", label: "PPS" },
    { id: "Aide_perso_proposee", type: "Bool", label: "Aide personnalisée proposée" },
    { id: "Aide_perso_acceptee", type: "Bool", label: "Aide personnalisée acceptée" },
    { id: "Stage_RAN_propose", type: "Bool", label: "Stage RAN proposé" },
    { id: "Stage_RAN_accepte", type: "Bool", label: "Stage RAN accepté" },
    { id: "Bilan_ortho_preconise", type: "Bool", label: "Bilan ortho préconisé" },
    { id: "Bilan_ortho_realise", type: "Bool", label: "Bilan ortho réalisé" },
    { id: "UPE2A", type: "Bool", label: "Élève allophone (UPE2A)" },
    { id: "Amenagements", type: "ChoiceList", label: "Aménagements en classe", choices: "amenagements" },
    { id: "Redoublement_preconise", type: "Bool", label: "Redoublement préconisé" },
    { id: "Redoublement_avis_parents", type: "Choice", label: "Redoublement : avis des parents", choices: "oui_non" },
    { id: "Redoublement_avis_IEN", type: "Choice", label: "Redoublement : avis de l'IEN", choices: "oui_non" },
    { id: "Orientation_proposee", type: "Choice", label: "Orientation proposée", choices: "orientation" },
    { id: "Orientation_avis_parents", type: "Choice", label: "Orientation : avis des parents", choices: "oui_non" },
    { id: "Orientation_avis_commission", type: "Choice", label: "Orientation : avis de la commission", choices: "oui_non" },
    { id: "Abs_P1", type: "Numeric", label: "Absences P1 (jours)" },
    { id: "Abs_P2", type: "Numeric", label: "Absences P2 (jours)" },
    { id: "Abs_P3", type: "Numeric", label: "Absences P3 (jours)" },
    { id: "Abs_P4", type: "Numeric", label: "Absences P4 (jours)" },
    { id: "Abs_P5", type: "Numeric", label: "Absences P5 (jours)" },
    { id: "Commentaire", type: "Text", label: "Commentaire" }
  ]},
  { id: "Suivis", cols: [
    { id: "Eleve", type: "Ref:Eleves", label: "Élève", visible: "Nom" },
    { id: "Professionnel", type: "Ref:Professionnels", label: "Professionnel", visible: "Nom" },
    { id: "Type", type: "Text", label: "Type de suivi" },
    { id: "Nom_libre", type: "Text", label: "Nom (hors annuaire)" },
    { id: "Etat", type: "Choice", label: "État", choices: "etat_suivi" },
    { id: "Date_preconisation", type: "Date", label: "Date de préconisation" },
    { id: "Debut", type: "Date", label: "Début" },
    { id: "Fin", type: "Date", label: "Fin" },
    { id: "Frequence", type: "Text", label: "Fréquence" },
    { id: "Note", type: "Text", label: "Note" }
  ]},
  { id: "Rencontres", cols: [
    { id: "Eleve", type: "Ref:Eleves", label: "Élève", visible: "Nom" },
    { id: "Date", type: "Date", label: "Date" },
    { id: "Type", type: "Choice", label: "Type", choices: "type_rencontre" },
    { id: "Presents", type: "Text", label: "Présents" },
    { id: "Dit", type: "Text", label: "Ce qui a été dit" },
    { id: "Important", type: "Text", label: "À retenir (information importante)" },
    { id: "Decisions", type: "Text", label: "Décisions et préconisations" },
    { id: "Resume", type: "Text", label: "Résumé du bilan" },
    { id: "CR", type: "Attachments", label: "Compte rendu joint" },
    { id: "Auteur", type: "Text", label: "Auteur" }
  ]},
  { id: "MDPH", cols: [
    { id: "Eleve", type: "Ref:Eleves", label: "Élève", visible: "Nom" },
    { id: "Nature", type: "ChoiceList", label: "Nature de la notification", choices: "nature_mdph" },
    { id: "Date_notification", type: "Date", label: "Date de la notification" },
    { id: "Debut", type: "Date", label: "Début" },
    { id: "Fin", type: "Date", label: "Fin" },
    { id: "Quotite_AESH", type: "Numeric", label: "Quotité AESH (h/semaine)" },
    { id: "Nom_AESH", type: "Text", label: "Nom de l'AESH" },
    { id: "Enseignant_referent", type: "Ref:Professionnels", label: "Enseignant référent", visible: "Nom" },
    { id: "Note", type: "Text", label: "Note" }
  ]},
  { id: "PAI", cols: [
    { id: "Eleve", type: "Ref:Eleves", label: "Élève", visible: "Nom" },
    { id: "Date", type: "Date", label: "Date" },
    { id: "Renouvellement", type: "Date", label: "À renouveler le" },
    { id: "Note", type: "Text", label: "Note" }
  ]},
  { id: "Reglages", cols: [
    { id: "Cle", type: "Text", label: "Réglage" },
    { id: "Valeur", type: "Text", label: "Valeur" }
  ]}
];

// Valeurs de départ de la table Reglages (délais en mois). Modifiables ensuite.
const REGLAGES_DEFAUT = [
  ["alerte_mdph_mois", "6"],
  ["alerte_ess_mois", "12"],
  ["alerte_pai_mois", "2"],
  ["alerte_suivi_mois", "3"],
  ["archivage_mois", "12"]
];

// Retouches de colonnes déjà installées : appliquées une seule fois, seulement si l'ancien réglage est encore là.
const MIGRATIONS = [
  { table: "Suivis", col: "Etat", si: "Demandé", choices: "etat_suivi" }
];
