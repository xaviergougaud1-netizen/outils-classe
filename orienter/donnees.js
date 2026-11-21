/* Orienter un élève : données (contenu du répertoire, constats, aides, formation).
   Modifier ici le contenu, sans toucher au code de index.html.
   Dernière vérification des prises en charge : novembre 2026. */

// Catégories du répertoire
const CATEGORIES = [
  { id: "ecole", nom: "À l'école", couleur: "#2453C7", picto: "ecole" },
  { id: "sante", nom: "Santé", couleur: "#0F8F6C", picto: "sante" },
  { id: "structure", nom: "Structures", couleur: "#7C3AED", picto: "structure" },
  { id: "dispositif", nom: "Dispositifs", couleur: "#D97706", picto: "fichier" },
  { id: "parents", nom: "Soutien aux parents (avec leur accord)", couleur: "#0E7490", picto: "coeur" },
  { id: "justice", nom: "Mesures du juge des enfants", couleur: "#B42318", picto: "alerte" }
];

// Niveaux de coût : texte court affiché en pastille
const COUTS = {
  gratuit: { txt: "Gratuit", cls: "ok" },
  rembourse: { txt: "Remboursé", cls: "info" },
  partiel: { txt: "Remboursé en partie", cls: "warn" },
  payant: { txt: "Non remboursé hors dispositif", cls: "bad" },
  revenus: { txt: "Participation selon les revenus", cls: "warn" }
};

// Répertoire : professionnels, structures, dispositifs
// ordo : ce qu'il faut pour y aller ; cout : clé de COUTS + précision
const PROS = [
  // ---------- À l'école ----------
  { id: "psyen", cat: "ecole", nom: "Psychologue de l'Éducation nationale", court: "La psychologue scolaire",
    sert: "Observe l'élève en classe, fait des bilans psychologiques, reçoit l'enfant et sa famille, conseille l'équipe. Elle aide à comprendre ce qui bloque et prépare, si besoin, une orientation ou un dossier MDPH.",
    quand: ["Difficultés qui durent malgré les aides de la classe", "Comportement ou émotions qui inquiètent", "Avant une équipe éducative ou une demande MDPH", "Doute sur ce qui relève de l'école ou du soin"],
    acces: ["L'enseignant remplit la demande d'aide au RASED", "La psychologue rencontre l'enseignant puis la famille", "Un bilan ne se fait qu'avec l'accord écrit des parents"],
    ordo: "Via l'école, accord des parents", cout: "gratuit", coutTxt: "Gratuit pour la famille.", delai: "Variable selon le secteur",
    famille: "La psychologue de l'école peut rencontrer votre enfant et vous-même pour mieux comprendre ses difficultés. C'est gratuit et confidentiel.",
    parler: "Présenter la psychologue comme une personne de l'école qui aide à comprendre, pas comme un « psy » qui soigne." },
  { id: "rasede", cat: "ecole", nom: "Enseignant spécialisé (aide pédagogique)", court: "RASED, maître E",
    sert: "Aide en petit groupe les élèves qui ont des difficultés d'apprentissage persistantes (lecture, écriture, numération), en lien avec l'enseignant.",
    quand: ["Écart qui se creuse en lecture ou en mathématiques", "Les aides en classe et les APC ne suffisent pas"],
    acces: ["Demande d'aide au RASED par l'enseignant", "Les parents sont informés"],
    ordo: "Via l'école", cout: "gratuit", coutTxt: "Gratuit.", delai: "Selon les priorités du RASED",
    famille: "Un enseignant spécialisé peut prendre votre enfant en petit groupe pour l'aider dans ses apprentissages.",
    parler: "C'est une aide de l'école, en plus de la classe." },
  { id: "rasedg", cat: "ecole", nom: "Enseignant spécialisé (aide relationnelle)", court: "RASED, maître G",
    sert: "Aide l'élève qui a du mal à trouver sa place d'élève : entrer dans les apprentissages, respecter le cadre, gérer ses émotions face au travail. Ce poste n'existe pas dans tous les secteurs.",
    quand: ["Difficulté à se mettre au travail ou à accepter le cadre", "Manque de confiance, peur de l'erreur"],
    acces: ["Demande d'aide au RASED par l'enseignant", "Les parents sont informés"],
    ordo: "Via l'école", cout: "gratuit", coutTxt: "Gratuit.", delai: "Selon les priorités du RASED",
    famille: "Un enseignant spécialisé peut aider votre enfant à se sentir mieux à l'école et à entrer dans le travail.",
    parler: "Insister sur la confiance et le plaisir d'apprendre." },
  { id: "medscol", cat: "ecole", nom: "Médecin de l'Éducation nationale", court: "Le médecin scolaire",
    sert: "Fait la visite médicale de la 6e année, donne son avis pour un PAP ou un PAI, fait le lien avec les médecins de la famille et peut orienter vers un bilan ou vers la PCO.",
    quand: ["Suspicion de trouble des apprentissages (avant un PAP)", "Problème de santé qui gêne la scolarité", "Famille sans médecin traitant"],
    acces: ["Demande par la direction de l'école", "La famille est informée et peut être reçue"],
    ordo: "Via la direction", cout: "gratuit", coutTxt: "Gratuit.", delai: "Souvent long : peu de médecins scolaires",
    famille: "Le médecin de l'Éducation nationale peut recevoir votre enfant à l'école. C'est gratuit.",
    parler: "Utile quand la famille n'a pas de médecin traitant." },
  { id: "infscol", cat: "ecole", nom: "Infirmier ou infirmière scolaire", court: "Infirmerie scolaire",
    sert: "Écoute, fait des dépistages (vue, audition), conseille les familles. En primaire, il ou elle est souvent rattaché(e) au collège du secteur.",
    quand: ["Dépistage de la vue ou de l'audition", "Questions de santé, d'hygiène, de sommeil"],
    acces: ["Demande par la direction de l'école"],
    ordo: "Via la direction", cout: "gratuit", coutTxt: "Gratuit.", delai: "Variable",
    famille: "L'infirmier ou l'infirmière scolaire peut faire un dépistage et vous conseiller. C'est gratuit.",
    parler: "" },

  // ---------- Santé ----------
  { id: "medecin", cat: "sante", nom: "Médecin traitant ou pédiatre", court: "La porte d'entrée",
    sert: "Examine l'enfant, cherche une cause médicale, prescrit les bilans (orthophonie, orthoptie, examens des yeux et des oreilles) et oriente vers les spécialistes ou la PCO. C'est presque toujours la première étape.",
    quand: ["Toute inquiétude sur le développement", "Avant tout bilan qui demande une ordonnance"],
    acces: ["La famille prend rendez-vous", "Elle apporte le courrier de l'école"],
    ordo: "Accès direct", cout: "rembourse", coutTxt: "Remboursé par l'Assurance maladie et la mutuelle.", delai: "Quelques jours à quelques semaines",
    famille: "Le médecin de votre enfant est la première personne à voir. Apportez-lui le courrier de l'école : il pourra prescrire les bilans utiles.",
    parler: "Toujours passer par le médecin : c'est lui qui oriente, pas l'école." },
  { id: "pmi", cat: "sante", nom: "PMI (protection maternelle et infantile)", court: "Enfants de 0 à 6 ans",
    sert: "Service du Département pour les enfants de moins de 6 ans : bilan de santé en maternelle (vers 3-4 ans) à l'école, consultations gratuites, dépistages, orientation.",
    quand: ["Inquiétude en maternelle", "Famille sans médecin traitant", "Bilan de santé de moyenne section"],
    acces: ["La famille appelle le centre médico-social de son secteur", "Ou l'école en parle au médecin de PMI lors du bilan en maternelle"],
    ordo: "Accès direct", cout: "gratuit", coutTxt: "Gratuit.", delai: "Variable",
    famille: "La PMI accueille gratuitement les enfants de moins de 6 ans pour des consultations et des bilans.",
    parler: "" },
  { id: "ortho", cat: "sante", nom: "Orthophoniste", court: "Langage oral et écrit",
    sert: "Évalue et rééduque la compréhension, la parole, le langage oral, puis la lecture, l'orthographe et le raisonnement mathématique (dyscalculie).",
    quand: ["Langage difficile à comprendre ou très pauvre pour l'âge", "Lecture qui ne se met pas en place", "Orthographe très éloignée du niveau de la classe", "Grandes difficultés avec les nombres"],
    acces: ["Le médecin prescrit un bilan orthophonique", "La famille inscrit l'enfant sur Allo-Ortho et appelle plusieurs cabinets", "Elle rappelle chaque mois pour rester sur les listes"],
    ordo: "Ordonnance du médecin", cout: "rembourse", coutTxt: "Remboursé à 60 % par l'Assurance maladie, le reste par la mutuelle.", delai: "Souvent plusieurs mois, parfois plus d'un an",
    famille: "L'orthophoniste aide l'enfant à mieux comprendre, parler et prononcer, puis à lire et à écrire. Il faut une ordonnance du médecin. Les séances sont remboursées.",
    parler: "Conseiller d'agir vite à cause des délais, et de faire les démarches en parallèle.",
    lien: { url: "https://app.allo-ortho.com/", txt: "Allo-Ortho : liste d'attente commune" } },
  { id: "orthoptiste", cat: "sante", nom: "Orthoptiste", court: "Utilisation des yeux",
    sert: "Évalue et rééduque la façon dont les yeux travaillent ensemble : suivre une ligne, passer du tableau au cahier, garder la vision nette sans fatigue. Ne remplace pas l'ophtalmologiste pour les lunettes.",
    quand: ["Saute des lignes, se perd dans le texte", "Copie difficile", "Fatigue ou maux de tête à la lecture"],
    acces: ["Le médecin ou l'ophtalmologiste prescrit un bilan orthoptique"],
    ordo: "Ordonnance du médecin", cout: "rembourse", coutTxt: "Remboursé à 60 % par l'Assurance maladie, le reste par la mutuelle.", delai: "Quelques semaines",
    famille: "L'orthoptiste vérifie comment les yeux de votre enfant travaillent ensemble pour lire et copier. Il faut une ordonnance. C'est remboursé.",
    parler: "" },
  { id: "ophtalmo", cat: "sante", nom: "Ophtalmologiste", court: "La vue",
    sert: "Médecin des yeux : mesure la vue, prescrit des lunettes, soigne un strabisme ou une maladie de l'œil.",
    quand: ["Se rapproche de la feuille, plisse les yeux", "Œil qui dévie", "Lunettes jamais contrôlées"],
    acces: ["La famille prend rendez-vous directement, sans passer par le médecin traitant", "Délais souvent longs : le demander tôt"],
    ordo: "Accès direct", cout: "rembourse", coutTxt: "Remboursé (dépassements d'honoraires possibles selon le médecin).", delai: "Souvent plusieurs mois",
    famille: "L'ophtalmologiste contrôle la vue de votre enfant. Vous pouvez prendre rendez-vous directement. C'est remboursé.",
    parler: "" },
  { id: "orl", cat: "sante", nom: "ORL et bilan d'audition", court: "Les oreilles",
    sert: "Médecin des oreilles, du nez et de la gorge : vérifie l'audition, soigne les otites à répétition, pose si besoin des aérateurs (yoyos).",
    quand: ["Fait répéter, ne réagit pas quand on l'appelle de dos", "Otites fréquentes", "Retard de langage : toujours vérifier l'audition"],
    acces: ["Passer d'abord par le médecin, qui regarde les oreilles et adresse à l'ORL"],
    ordo: "Sur conseil du médecin", cout: "rembourse", coutTxt: "Remboursé (dépassements possibles).", delai: "Quelques semaines à quelques mois",
    famille: "L'ORL vérifie que votre enfant entend bien. Parlez-en d'abord à son médecin. C'est remboursé.",
    parler: "Avant tout bilan de langage, vérifier l'audition." },
  { id: "psychomot", cat: "sante", nom: "Psychomotricien", court: "Le corps et les gestes",
    sert: "Travaille la coordination, l'équilibre, le schéma corporel, le tonus, le graphisme, les repères dans l'espace et le temps, et la gestion de l'agitation et des émotions par le corps.",
    quand: ["Maladresse, gestes raides ou mal coordonnés", "Graphisme très difficile", "Agitation, difficulté à se poser", "Repères dans l'espace ou le temps fragiles"],
    acces: ["Le médecin rédige une ordonnance", "Pris en charge si l'enfant passe par la PCO, le CMP, le CAMSP ou le CMPP", "En libéral, la famille paie les séances"],
    ordo: "Ordonnance du médecin", cout: "payant", coutTxt: "Non remboursé en libéral (environ 40 à 60 € la séance). Gratuit via la PCO, le CMP, le CAMSP ou le CMPP. Certaines mutuelles et l'AEEH (MDPH) peuvent aider.", delai: "Variable",
    famille: "Le psychomotricien aide l'enfant à mieux maîtriser son corps et ses gestes. En cabinet, ce n'est pas remboursé. C'est gratuit en passant par la PCO ou le CMP.",
    parler: "Expliquer tout de suite les voies gratuites, sinon la famille renonce." },
  { id: "ergo", cat: "sante", nom: "Ergothérapeute", court: "Autonomie et écriture",
    sert: "Aide l'enfant à être plus autonome dans les gestes du quotidien et de l'école : tenir un crayon, écrire, découper, s'habiller, s'organiser. Propose des outils (ordinateur, matériel adapté) et des aménagements.",
    quand: ["Écriture lente, illisible ou douloureuse", "Difficulté avec ciseaux, règle, compas", "Habillage, repas difficiles pour l'âge", "Besoin d'un outil de compensation (ordinateur)"],
    acces: ["Le médecin rédige une ordonnance", "Pris en charge via la PCO, certains CMP, CAMSP ou SESSAD", "En libéral, la famille paie les séances"],
    ordo: "Ordonnance du médecin", cout: "payant", coutTxt: "Non remboursé en libéral (bilan souvent 150 à 250 €). Gratuit via la PCO. Certaines mutuelles et l'AEEH (MDPH) peuvent aider.", delai: "Variable",
    famille: "L'ergothérapeute aide l'enfant dans les gestes du quotidien et de l'école, comme écrire ou s'habiller. En cabinet, ce n'est pas remboursé. C'est gratuit en passant par la PCO.",
    parler: "" },
  { id: "psychologue", cat: "sante", nom: "Psychologue en cabinet", court: "Émotions et comportement",
    sert: "Écoute l'enfant et sa famille, aide à exprimer et gérer les émotions (peurs, colères, tristesse), accompagne après un événement difficile.",
    quand: ["Anxiété, peurs, pleurs fréquents", "Colères, opposition", "Événement familial difficile"],
    acces: ["Accès direct, sans ordonnance, chez un psychologue du dispositif Mon soutien psy", "Annuaire sur ameli.fr"],
    ordo: "Sans ordonnance", cout: "rembourse", coutTxt: "Mon soutien psy, dès 3 ans : 12 séances par an, 60 % payés directement par l'Assurance maladie, le reste par la mutuelle.", delai: "Quelques semaines",
    famille: "Un psychologue peut aider votre enfant à mieux vivre ses émotions. Avec le dispositif Mon soutien psy, 12 séances par an sont remboursées, sans ordonnance.",
    parler: "Ne pas confondre avec la psychologue de l'Éducation nationale, gratuite.",
    lien: { url: "https://monsoutienpsy.ameli.fr/", txt: "Mon soutien psy (ameli.fr)" } },
  { id: "neuropsy", cat: "sante", nom: "Neuropsychologue", court: "Attention, mémoire, raisonnement",
    sert: "Fait un bilan détaillé du fonctionnement de la pensée : attention, mémoire, organisation, raisonnement. Utile quand on soupçonne un trouble de l'attention, un trouble dys ou un haut potentiel.",
    quand: ["Attention très fragile", "Grand écart entre l'oral et l'écrit", "Profil qui interroge, sur avis du médecin"],
    acces: ["Sur conseil du médecin ou de la PCO"],
    ordo: "Sur conseil du médecin", cout: "payant", coutTxt: "Non remboursé (bilan souvent 300 à 500 €). Pris en charge via la PCO.", delai: "Variable",
    famille: "Le neuropsychologue fait un bilan de l'attention, de la mémoire et du raisonnement. Ce n'est pas remboursé en cabinet, mais c'est gratuit via la PCO.",
    parler: "" },
  { id: "pedopsy", cat: "sante", nom: "Pédopsychiatre", court: "Médecin du psychisme de l'enfant",
    sert: "Médecin spécialiste : évalue les troubles du comportement, de l'attention (TDAH), de l'humeur ou de la relation (TSA), pose un diagnostic et peut prescrire un traitement.",
    quand: ["Comportement très difficile ou souffrance importante", "Suspicion de TDAH ou de trouble du spectre autistique, sur avis du médecin"],
    acces: ["Le plus souvent par le CMP", "En cabinet, sur orientation du médecin"],
    ordo: "Sur conseil du médecin", cout: "rembourse", coutTxt: "Remboursé (gratuit au CMP).", delai: "Souvent long",
    famille: "Le pédopsychiatre est un médecin qui aide les enfants dont le comportement ou les émotions posent problème. Au CMP, c'est gratuit.",
    parler: "Mot qui peut faire peur : parler plutôt du CMP et de son équipe." },
  { id: "crtla", cat: "sante", nom: "Centre référent des troubles du langage et des apprentissages", court: "Cas complexes (CHU)",
    sert: "Équipe hospitalière qui fait des bilans complets quand les troubles sont sévères, multiples ou que le diagnostic reste incertain.",
    quand: ["Troubles sévères ou associés", "Bilans de ville contradictoires"],
    acces: ["Uniquement sur demande d'un médecin"],
    ordo: "Sur demande du médecin", cout: "rembourse", coutTxt: "Pris en charge par l'Assurance maladie.", delai: "Long",
    famille: "", parler: "" },

  // ---------- Structures ----------
  { id: "pco", cat: "structure", nom: "PCO (plateforme de coordination et d'orientation)", court: "Troubles du développement, 0 à 12 ans",
    sert: "Organise et finance pendant un an des bilans et des séances (psychomotricien, ergothérapeute, psychologue, neuropsychologue) quand le développement inquiète, sans attendre un diagnostic. Coordonne les professionnels.",
    quand: ["Plusieurs domaines touchés (langage, motricité, attention, relations)", "Suspicion de trouble du neurodéveloppement (TSA, TDAH, troubles dys, retard global)"],
    acces: ["Le médecin (traitant, pédiatre, PMI, scolaire) remplit le formulaire d'adressage", "L'enseignant peut remplir le questionnaire de l'école, joint au dossier", "La PCO contacte la famille"],
    ordo: "Sur demande écrite du médecin", cout: "gratuit", coutTxt: "Gratuit : aucune avance de frais. Les professionnels sont payés directement par l'Assurance maladie.", delai: "Quelques semaines à quelques mois",
    famille: "La PCO aide les enfants dont le développement inquiète, sans attendre un diagnostic. Elle organise des bilans et des séances, gratuitement. C'est le médecin qui fait la demande.",
    parler: "Présenter la PCO comme une aide pour avancer vite, pas comme un diagnostic." },
  { id: "cmp", cat: "structure", nom: "CMP (centre médico-psychologique)", court: "Soins publics, enfants et adolescents",
    sert: "Lieu de consultation public : une équipe (médecin, psychologue, psychomotricien, orthophoniste, ergothérapeute…) reçoit l'enfant et ses parents pour des difficultés de développement, de langage, de motricité, de comportement ou d'adaptation à l'école, puis propose un suivi.",
    quand: ["Comportement ou émotions qui inquiètent", "Besoin de psychomotricité sans moyen de payer", "Difficultés qui touchent plusieurs domaines"],
    acces: ["La famille appelle elle-même le secrétariat", "Elle peut dire que la démarche fait suite à une demande de l'équipe éducative", "Un courrier du médecin appuie la demande, sans être obligatoire"],
    ordo: "Sans ordonnance", cout: "gratuit", coutTxt: "Gratuit : pris en charge à 100 %, sans avance de frais.", delai: "Souvent plusieurs mois : appeler tôt",
    famille: "Le CMP accueille gratuitement les enfants qui ont des difficultés de développement, de comportement ou à l'école. Une équipe rencontre votre enfant et vous propose un suivi. Vous appelez vous-même, sans ordonnance.",
    parler: "Rassurer : ce n'est pas un hôpital, c'est un lieu de consultation." },
  { id: "cmpp", cat: "structure", nom: "CMPP (centre médico-psycho-pédagogique)", court: "Difficultés d'apprentissage et de comportement",
    sert: "Équipe (médecin, psychologue, orthophoniste, psychomotricien, éducateur) qui reçoit les enfants en difficulté d'apprentissage, de comportement ou d'adaptation scolaire. Proche du CMP, mais géré par une association.",
    quand: ["Difficultés d'apprentissage associées à des difficultés de comportement", "Besoin de plusieurs rééducations"],
    acces: ["La famille appelle directement", "Premier rendez-vous avec un médecin ou un psychologue"],
    ordo: "Sans ordonnance", cout: "gratuit", coutTxt: "Gratuit : pris en charge à 100 % par l'Assurance maladie.", delai: "Souvent plusieurs mois",
    famille: "Le CMPP accueille gratuitement les enfants qui ont des difficultés à l'école. Vous appelez vous-même, sans ordonnance.",
    parler: "" },
  { id: "camsp", cat: "structure", nom: "CAMSP (centre d'action médico-sociale précoce)", court: "Enfants de 0 à 6 ans",
    sert: "Dépiste et accompagne les tout-petits qui ont un retard ou un trouble du développement : bilans et rééducations (psychomotricité, orthophonie, kinésithérapie…).",
    quand: ["Inquiétude en maternelle sur plusieurs domaines", "Retard global de développement"],
    acces: ["La famille appelle directement, ou sur conseil du médecin ou de la PMI"],
    ordo: "Sans ordonnance", cout: "gratuit", coutTxt: "Gratuit : pris en charge à 100 % par l'Assurance maladie.", delai: "Souvent plusieurs mois",
    famille: "Le CAMSP accompagne gratuitement les enfants de moins de 6 ans dont le développement inquiète.",
    parler: "" },
  { id: "mdph", cat: "structure", nom: "MDPH (maison départementale des personnes handicapées)", court: "AESH, matériel, aides financières",
    sert: "Examine les demandes liées à un handicap : AESH, matériel pédagogique adapté (ordinateur), orientation (ULIS, SESSAD), AEEH (aide financière qui peut payer des séances non remboursées). Met en place le PPS.",
    quand: ["Difficultés durables et importantes malgré les aides", "Besoin d'une aide humaine ou d'un ordinateur", "Besoin de rééducations coûteuses"],
    acces: ["La famille remplit le dossier", "Le médecin remplit le certificat médical", "L'école remplit le GEVA-Sco, souvent lors d'une équipe éducative"],
    ordo: "Certificat médical obligatoire", cout: "gratuit", coutTxt: "Gratuit.", delai: "Plusieurs mois de traitement",
    famille: "La MDPH peut accorder des aides pour la scolarité (accompagnant, matériel) et une aide financière. C'est la famille qui fait la demande.",
    parler: "Le mot « handicap » fait peur : expliquer que c'est l'accès à des aides." },

  // ---------- Dispositifs ----------
  { id: "ppre", cat: "dispositif", nom: "PPRE (programme personnalisé de réussite éducative)", court: "Aide pédagogique de l'école",
    sert: "Plan écrit par l'école pour un élève en difficulté : objectifs précis, aides en classe, durée courte, bilan. Sans démarche médicale.",
    quand: ["Difficulté scolaire repérée", "Risque de ne pas atteindre les attendus"],
    acces: ["Rédigé par l'enseignant, présenté à la famille"],
    ordo: "Via l'école", cout: "gratuit", coutTxt: "Gratuit.", delai: "Immédiat",
    famille: "", parler: "" },
  { id: "pap", cat: "dispositif", nom: "PAP (plan d'accompagnement personnalisé)", court: "Troubles des apprentissages",
    sert: "Liste des aménagements pédagogiques pour un élève qui a un trouble des apprentissages (dyslexie, dyspraxie, TDAH…). Il suit l'élève d'une année sur l'autre. Sans passer par la MDPH.",
    quand: ["Trouble des apprentissages confirmé par des bilans"],
    acces: ["Demandé par l'école ou la famille", "Le médecin scolaire donne son avis à partir des bilans", "Le directeur le met en place avec l'équipe"],
    ordo: "Avis du médecin scolaire", cout: "gratuit", coutTxt: "Gratuit.", delai: "Quelques semaines",
    famille: "", parler: "" },
  { id: "pps", cat: "dispositif", nom: "PPS (projet personnalisé de scolarisation)", court: "Décision de la MDPH",
    sert: "Projet décidé par la MDPH pour un élève en situation de handicap : AESH, matériel, aménagements, orientation. Suivi chaque année en équipe de suivi de la scolarisation (ESS).",
    quand: ["Après une décision de la MDPH"],
    acces: ["Demande de la famille à la MDPH"],
    ordo: "Décision MDPH", cout: "gratuit", coutTxt: "Gratuit.", delai: "Plusieurs mois",
    famille: "", parler: "" },
  { id: "pai", cat: "dispositif", nom: "PAI (projet d'accueil individualisé)", court: "Maladie, allergie, traitement",
    sert: "Organise l'accueil d'un élève malade ou allergique : traitement, régime, conduite à tenir en cas d'urgence.",
    quand: ["Maladie chronique, allergie, traitement à l'école"],
    acces: ["Demandé par la famille, avec le médecin qui suit l'enfant et le médecin scolaire"],
    ordo: "Avis médical", cout: "gratuit", coutTxt: "Gratuit.", delai: "Quelques semaines",
    famille: "", parler: "" },
  { id: "ee", cat: "dispositif", nom: "Équipe éducative", court: "Réunion école, famille, professionnels",
    sert: "Réunion organisée par le directeur avec la famille, les enseignants, la psychologue scolaire, le médecin scolaire et les professionnels qui suivent l'enfant, pour faire le point et décider des suites.",
    quand: ["Difficultés qui durent", "Avant une demande MDPH (GEVA-Sco)", "Besoin de coordonner école, famille et soins"],
    acces: ["Le directeur invite par écrit", "Un compte rendu est rédigé"],
    ordo: "Via la direction", cout: "gratuit", coutTxt: "Gratuit.", delai: "Quelques semaines",
    famille: "", parler: "" },

  // ---------- Soutien aux parents : aides administratives, toujours avec l'accord des parents ----------
  { id: "laep", cat: "parents", nom: "Lieu d'accueil enfants-parents (LAEP)", court: "Jouer et échanger, enfants de 0 à 6 ans",
    sert: "Lieu de jeu et de parole où le parent vient avec son enfant de moins de 6 ans. Des accueillants formés sont présents. Les parents y rencontrent d'autres parents, posent leurs questions et soufflent un peu. Ce n'est ni un soin ni un contrôle.",
    quand: ["Parents qui se sentent seuls ou démunis avec un jeune enfant", "Enfant de maternelle qui a du mal avec les règles, la séparation, les autres", "Famille qui ne demande rien de plus formel"],
    acces: ["La famille y va quand elle veut, aux heures d'ouverture", "Sans inscription, sans rendez-vous, sans dossier"],
    ordo: "Accès direct", cout: "gratuit", coutTxt: "Gratuit et anonyme (parfois une petite participation symbolique).", delai: "Aucun",
    famille: "Un lieu d'accueil enfants-parents vous accueille avec votre enfant pour jouer et parler avec d'autres parents et des professionnels. C'est gratuit, sans inscription.",
    parler: "Le présenter comme un lieu pour souffler et échanger entre parents, pas comme une aide pour « mauvais parents »." },
  { id: "eds", cat: "parents", nom: "Espace départemental des solidarités (travailleur social)", court: "La porte d'entrée des aides aux familles",
    sert: "Service du Département près de chez la famille. Un ou une assistant(e) social(e) écoute les parents, les conseille et les oriente : difficultés éducatives, fatigue, séparation, logement, argent. C'est lui ou elle qui peut proposer une TISF ou une aide éducative à domicile.",
    quand: ["Parents en difficulté dans l'éducation de leur enfant, qui se sentent démunis", "Famille épuisée ou isolée", "Difficultés matérielles qui pèsent sur l'enfant"],
    acces: ["La famille appelle elle-même pour un rendez-vous", "Elle peut dire que l'école lui a conseillé cette démarche"],
    ordo: "Accès direct", cout: "gratuit", coutTxt: "Gratuit.", delai: "Quelques jours à quelques semaines",
    famille: "Une assistante sociale du Département peut vous écouter et vous conseiller, par exemple quand l'éducation de votre enfant devient difficile ou fatigante. C'est gratuit. Vous prenez rendez-vous vous-même.",
    parler: "Insister : c'est un service pour toutes les familles, et c'est la famille qui décide de ce qu'elle accepte." },
  { id: "tisf", cat: "parents", nom: "TISF (technicien de l'intervention sociale et familiale)", court: "Un professionnel qui vient à la maison",
    sert: "Vient au domicile quelques heures par semaine pour aider les parents dans le quotidien et l'éducation : rythmes, repas, coucher, devoirs, sorties. Il ou elle fait avec les parents, pas à leur place.",
    quand: ["Quotidien très difficile à tenir (fatigue, naissance, maladie, séparation)", "Besoin de repères sur les rythmes de l'enfant (sommeil, écrans, repas)"],
    acces: ["Demande auprès de la CAF ou d'une association d'aide à domicile, pour certains événements (naissance, maladie, séparation…)", "Ou proposée par le travailleur social de l'espace départemental des solidarités", "Toujours avec l'accord des parents"],
    ordo: "Accord des parents", cout: "revenus", coutTxt: "Participation de la famille selon ses revenus (CAF) ; gratuit quand c'est le Département qui le propose.", delai: "Quelques semaines",
    famille: "Un ou une professionnel(le) peut venir chez vous quelques heures par semaine pour vous aider dans le quotidien avec vos enfants.",
    parler: "" },
  { id: "aed", cat: "parents", nom: "AED (aide éducative à domicile)", court: "Mesure administrative, avec l'accord écrit des parents",
    sert: "Un éducateur ou une éducatrice de l'aide sociale à l'enfance accompagne les parents et l'enfant, à la maison et à l'extérieur, quand l'éducation devient difficile. Les parents gardent l'autorité parentale. Les objectifs sont fixés avec eux, pour une durée limitée (souvent 6 mois à 1 an, renouvelable).",
    quand: ["Parents démunis face au comportement de l'enfant, qui veulent de l'aide", "Difficultés éducatives qui durent, sans danger grave pour l'enfant"],
    acces: ["La famille en fait la demande à l'espace départemental des solidarités, ou le travailleur social la lui propose", "Le Département évalue la situation", "Les parents signent leur accord : ils peuvent refuser ou arrêter"],
    ordo: "Accord écrit des parents", cout: "gratuit", coutTxt: "Gratuit.", delai: "Quelques semaines à quelques mois",
    famille: "Un éducateur peut vous accompagner pendant quelques mois pour vous aider dans l'éducation de votre enfant. C'est vous qui le demandez et qui donnez votre accord. C'est gratuit.",
    parler: "Ne pas la confondre avec l'AEMO : l'AED est une aide demandée et acceptée par les parents, sans juge." },

  // ---------- Mesures du juge des enfants : judiciaires, sans l'accord des parents ----------
  { id: "aemo", cat: "justice", nom: "AEMO (assistance éducative en milieu ouvert)", court: "Décidée par le juge des enfants",
    sert: "Le juge des enfants confie à un service éducatif le suivi de l'enfant, qui reste chez lui. Un éducateur rencontre régulièrement l'enfant et sa famille et rend compte au juge. Les parents gardent l'autorité parentale, mais la mesure s'impose à eux.",
    quand: ["L'enfant est en danger ou risque de l'être", "Les aides avec l'accord des parents (AED) ont échoué ou sont refusées"],
    acces: ["Ce n'est pas l'école qui oriente : elle transmet une information préoccupante (CRIP) ou un signalement", "Le juge des enfants entend la famille puis décide"],
    ordo: "Décision du juge des enfants", cout: "gratuit", coutTxt: "Gratuit pour la famille.", delai: "Selon la décision du juge",
    famille: "",
    parler: "L'école ne propose pas une AEMO à une famille. Si un enfant est peut-être en danger, voir « Si l'enfant est peut-être en danger » dans Se former." },
  { id: "mjie", cat: "justice", nom: "MJIE (mesure judiciaire d'investigation éducative)", court: "Évaluation demandée par le juge",
    sert: "Le juge des enfants demande à une équipe (éducateur, psychologue, assistant social) d'évaluer la situation de l'enfant et de sa famille pendant quelques mois, avant de décider s'il faut une mesure.",
    quand: ["Après une information préoccupante ou un signalement, quand le juge a besoin d'en savoir plus"],
    acces: ["Décidée par le juge des enfants", "L'équipe peut contacter l'école pour avoir son avis"],
    ordo: "Décision du juge des enfants", cout: "gratuit", coutTxt: "Gratuit pour la famille.", delai: "Selon la décision du juge",
    famille: "",
    parler: "Si l'équipe de la MJIE contacte l'école : répondre avec des faits observés en classe, datés." }
];

// Domaines et constats. q : question posée dans « Questions » ; c : phrase du courrier ;
// sp : professionnels ou structures liés ; niv : "mat" (maternelle), "elem" (élémentaire) ou les deux ;
// alerte : constat qui demande une action rapide (texte affiché)
const DOMAINES = [
  { id: "lang", nom: "Langage oral", picto: "bulle", couleur: "#C2417A", items: [
    { id: "lang-comp", q: "A-t-il du mal à comprendre les consignes orales simples ?", c: "Comprend difficilement les consignes orales, même simples.", sp: ["medecin", "orl", "ortho"] },
    { id: "lang-pron", q: "Est-il difficile à comprendre quand il parle (sons déformés ou absents) ?", c: "Est souvent difficile à comprendre : certains sons sont déformés ou absents.", sp: ["medecin", "ortho"] },
    { id: "lang-phr", q: "Fait-il des phrases très courtes ou mal construites pour son âge ?", c: "S'exprime avec des phrases courtes ou mal construites pour son âge.", sp: ["medecin", "ortho"] },
    { id: "lang-voc", q: "Manque-t-il de mots, cherche-t-il souvent ses mots ?", c: "Dispose d'un vocabulaire réduit et cherche souvent ses mots.", sp: ["ortho"] },
    { id: "lang-beg", q: "Bégaie-t-il ?", c: "Bégaie régulièrement.", sp: ["medecin", "ortho"] },
    { id: "lang-regr", q: "A-t-il perdu des mots ou des capacités qu'il avait ?", c: "Semble avoir perdu des mots ou des capacités qu'il avait acquis.", sp: ["medecin"], alerte: "Une perte d'acquis est un signe d'alerte : la famille doit voir le médecin sans attendre." }
  ]},
  { id: "aud", nom: "Audition", picto: "oreille", couleur: "#0E7490", items: [
    { id: "aud-rep", q: "Fait-il souvent répéter, ou ne réagit-il pas quand on l'appelle de dos ?", c: "Fait souvent répéter et ne réagit pas toujours quand on l'appelle de dos.", sp: ["medecin", "orl"] },
    { id: "aud-otit", q: "La famille parle-t-elle d'otites à répétition ?", c: "La famille signale des otites à répétition.", sp: ["medecin", "orl"] },
    { id: "aud-fort", q: "Parle-t-il très fort, ou se rapproche-t-il pour entendre ?", c: "Parle très fort ou se rapproche pour entendre.", sp: ["medecin", "orl"] }
  ]},
  { id: "vis", nom: "Vision", picto: "oeil", couleur: "#2F6FD6", items: [
    { id: "vis-pres", q: "Se rapproche-t-il beaucoup de la feuille ou plisse-t-il les yeux ?", c: "Se rapproche beaucoup de la feuille ou plisse les yeux.", sp: ["ophtalmo"] },
    { id: "vis-tab", q: "A-t-il du mal à lire ou copier au tableau ?", c: "A du mal à lire ou à copier au tableau.", sp: ["ophtalmo", "orthoptiste"] },
    { id: "vis-lign", q: "Saute-t-il des lignes ou se perd-il dans un texte ?", c: "Saute des lignes ou se perd dans un texte.", sp: ["orthoptiste", "ophtalmo"], niv: "elem" },
    { id: "vis-fat", q: "Se frotte-t-il les yeux ou a-t-il mal à la tête après la lecture ?", c: "Se frotte les yeux ou se plaint de maux de tête après un travail de lecture.", sp: ["ophtalmo", "orthoptiste"] },
    { id: "vis-dev", q: "Un œil semble-t-il dévier ?", c: "Un œil semble parfois dévier.", sp: ["ophtalmo"] }
  ]},
  { id: "lect", nom: "Lecture et écrit", picto: "livre", couleur: "#9A4FC9", items: [
    { id: "lect-phon", q: "A-t-il du mal à repérer les syllabes ou les sons dans les mots ?", c: "A du mal à repérer les syllabes et les sons dans les mots.", sp: ["ortho", "rasede"] },
    { id: "lect-dech", q: "Le déchiffrage reste-t-il très lent ou laborieux malgré l'entraînement ?", c: "Déchiffre encore très lentement, malgré un entraînement régulier.", sp: ["ortho", "rasede"], niv: "elem" },
    { id: "lect-conf", q: "Confond-il des sons proches (f/v, p/b, ch/j) ou des lettres (b/d) ?", c: "Confond des sons proches ou des lettres qui se ressemblent.", sp: ["ortho"], niv: "elem" },
    { id: "lect-comp", q: "Comprend-il mal ce qu'il lit, alors qu'il comprend bien à l'oral ?", c: "Comprend mal ce qu'il lit, alors qu'il comprend bien à l'oral.", sp: ["ortho"], niv: "elem" },
    { id: "lect-orth", q: "Son orthographe est-elle très éloignée de celle de la classe (mots difficiles à reconnaître) ?", c: "A une orthographe très éloignée de celle de la classe, avec des mots parfois difficiles à reconnaître.", sp: ["ortho"], niv: "elem" },
    { id: "lect-copie", q: "La copie est-elle très lente ou pleine d'erreurs ?", c: "Copie très lentement et avec beaucoup d'erreurs.", sp: ["ergo", "orthoptiste", "ortho"], niv: "elem" }
  ]},
  { id: "math", nom: "Nombres et calcul", picto: "calcul", couleur: "#23914A", items: [
    { id: "math-qte", q: "A-t-il du mal à comparer des quantités ou à dénombrer ?", c: "A du mal à comparer des quantités et à dénombrer.", sp: ["ortho", "rasede"] },
    { id: "math-calc", q: "Le calcul reste-t-il très difficile malgré les aides (compte toujours sur ses doigts) ?", c: "Reste en grande difficulté en calcul malgré les aides proposées.", sp: ["ortho", "rasede", "psyen"], niv: "elem" },
    { id: "math-prob", q: "Comprend-il mal les problèmes, même lus à voix haute ?", c: "Comprend difficilement les problèmes, même lus à voix haute.", sp: ["ortho", "psyen"], niv: "elem" }
  ]},
  { id: "motf", nom: "Motricité fine et graphisme", picto: "crayon", couleur: "#E05A2B", items: [
    { id: "motf-cray", q: "Tient-il son crayon de façon très inhabituelle ou crispée ?", c: "Tient son crayon de façon inhabituelle ou crispée.", sp: ["ergo", "psychomot"] },
    { id: "motf-ecr", q: "Écrire ou dessiner lui demande-t-il beaucoup d'effort (lent, peu lisible, douleur) ?", c: "Écrit ou dessine avec beaucoup d'effort : tracé lent, peu lisible ou douloureux.", sp: ["ergo", "psychomot"] },
    { id: "motf-out", q: "A-t-il du mal avec les ciseaux, la colle, la règle ou le compas ?", c: "A du mal à utiliser les ciseaux, la colle, la règle ou le compas.", sp: ["ergo", "psychomot"] },
    { id: "motf-aut", q: "A-t-il du mal à s'habiller, se chausser ou utiliser ses couverts ?", c: "A du mal à s'habiller, à se chausser ou à utiliser ses couverts.", sp: ["ergo", "psychomot"] }
  ]},
  { id: "motg", nom: "Corps, espace et temps", picto: "corps", couleur: "#7C8A12", items: [
    { id: "motg-mal", q: "Est-il maladroit, tombe-t-il ou se cogne-t-il souvent ?", c: "Est souvent maladroit, tombe ou se cogne.", sp: ["psychomot", "medecin"] },
    { id: "motg-coord", q: "A-t-il du mal à courir, sauter, attraper un ballon ?", c: "A du mal à courir, sauter ou attraper un ballon.", sp: ["psychomot"] },
    { id: "motg-esp", q: "A-t-il du mal à se repérer dans l'espace ou sur la feuille ?", c: "A du mal à se repérer dans l'espace et sur la feuille.", sp: ["psychomot", "ergo", "orthoptiste"] },
    { id: "motg-tps", q: "A-t-il du mal à se repérer dans le temps (moments de la journée, jours) ?", c: "A du mal à se repérer dans le temps.", sp: ["psychomot"] }
  ]},
  { id: "att", nom: "Attention et organisation", picto: "eclair", couleur: "#D97706", items: [
    { id: "att-conc", q: "Décroche-t-il très vite, même pendant une activité courte ?", c: "Décroche très vite, même lors d'une activité courte.", sp: ["medecin", "psyen", "neuropsy"] },
    { id: "att-bouge", q: "Bouge-t-il sans arrêt, a-t-il du mal à rester assis ?", c: "Bouge beaucoup et a du mal à rester assis.", sp: ["medecin", "psychomot", "pedopsy"] },
    { id: "att-imp", q: "Agit-il ou répond-il avant la fin des consignes, coupe-t-il souvent la parole ?", c: "Agit ou répond souvent avant la fin des consignes et coupe la parole.", sp: ["medecin", "pedopsy"] },
    { id: "att-orga", q: "Perd-il souvent ses affaires, a-t-il du mal à s'organiser ?", c: "Perd souvent ses affaires et a du mal à s'organiser.", sp: ["ergo", "neuropsy"], niv: "elem" },
    { id: "att-fat", q: "Est-il très fatigable, s'endort-il en classe ?", c: "Est très fatigable et s'endort parfois en classe.", sp: ["medecin"] }
  ]},
  { id: "emo", nom: "Émotions et comportement", picto: "coeur", couleur: "#B4418E", items: [
    { id: "emo-col", q: "A-t-il des colères fréquentes ou très fortes, difficiles à apaiser ?", c: "A des colères fréquentes ou très fortes, difficiles à apaiser.", sp: ["psyen", "cmp", "psychologue"] },
    { id: "emo-opp", q: "S'oppose-t-il souvent aux adultes ou aux règles ?", c: "S'oppose souvent aux adultes et aux règles.", sp: ["psyen", "cmp", "psychologue"] },
    { id: "emo-anx", q: "Paraît-il très anxieux (peur de l'erreur, maux de ventre, pleurs) ?", c: "Paraît très anxieux : peur de l'erreur, maux de ventre, pleurs.", sp: ["psychologue", "psyen", "cmp"] },
    { id: "emo-rep", q: "Est-il souvent isolé, triste ou en retrait ?", c: "Est souvent isolé, triste ou en retrait.", sp: ["psyen", "psychologue", "cmp"] },
    { id: "emo-agr", q: "Est-il agressif envers les autres (coups, morsures) ?", c: "Se montre parfois agressif envers les autres.", sp: ["psyen", "cmp", "pedopsy"] },
    { id: "emo-ref", q: "Refuse-t-il de venir à l'école ou pleure-t-il beaucoup en arrivant ?", c: "Refuse parfois de venir à l'école ou pleure beaucoup en arrivant.", sp: ["medecin", "psychologue", "cmp"] }
  ]},
  { id: "soc", nom: "Relations et communication", picto: "groupe", couleur: "#4F5BD5", items: [
    { id: "soc-reg", q: "Regarde-t-il peu les autres, réagit-il peu à son prénom ?", c: "Regarde peu les autres et réagit peu à son prénom.", sp: ["medecin", "pco", "camsp"] },
    { id: "soc-jeu", q: "A-t-il du mal à jouer avec les autres ou à partager un jeu ?", c: "A du mal à jouer avec les autres et à partager un jeu.", sp: ["psyen", "pco"] },
    { id: "soc-rig", q: "Supporte-t-il très mal les changements, ou a-t-il des intérêts très restreints ?", c: "Supporte très mal les changements ou a des centres d'intérêt très restreints.", sp: ["medecin", "pco"] },
    { id: "soc-sens", q: "Réagit-il très fortement aux bruits, aux textures ou au toucher ?", c: "Réagit très fortement aux bruits, aux textures ou au toucher.", sp: ["medecin", "psychomot", "ergo", "pco"] }
  ]},
  { id: "sante", nom: "Santé et vie quotidienne", picto: "lune", couleur: "#64748B", items: [
    { id: "sante-fam", q: "La famille dit-elle se sentir démunie ou épuisée face à son comportement à la maison ?", c: null, sp: ["eds", "laep", "pmi"] },
    { id: "sante-som", q: "Semble-t-il manquer de sommeil ?", c: "Semble souvent fatigué, comme s'il manquait de sommeil.", sp: ["medecin"] },
    { id: "sante-prop", q: "A-t-il encore des accidents de propreté pour son âge ?", c: "A encore des accidents de propreté pour son âge.", sp: ["medecin"] },
    { id: "sante-mal", q: "Se plaint-il souvent d'avoir mal (tête, ventre) ?", c: "Se plaint souvent d'avoir mal à la tête ou au ventre.", sp: ["medecin"] },
    { id: "sante-dang", q: "Avez-vous des inquiétudes pour sa sécurité ou son bien-être à la maison ?", c: null, sp: [], alerte: "Ce n'est pas un courrier au médecin qu'il faut : parles-en tout de suite au directeur. Si l'enfant est en danger ou risque de l'être, l'école transmet une information préoccupante à la cellule départementale (CRIP). En cas de danger immédiat : 17 ou 119." }
  ]}
];

// Ce que l'école a déjà mis en place (courrier)
const AIDES = [
  "Différenciation en classe (consignes reformulées, supports adaptés)",
  "Place adaptée dans la classe",
  "Outils d'aide (guide-lecture, minuteur, objet à manipuler…)",
  "Temps supplémentaire ou travail allégé",
  "Activités pédagogiques complémentaires (APC)",
  "Tutorat par un camarade",
  "PPRE (programme personnalisé de réussite éducative)",
  "Aide de l'enseignant spécialisé du RASED",
  "Observation ou bilan par la psychologue de l'Éducation nationale",
  "Rencontre avec la famille",
  "Équipe éducative",
  "PAP (plan d'accompagnement personnalisé)",
  "Bilan de santé de la PMI ou visite du médecin scolaire"
];

// Coordonnées locales par défaut (modifiables dans Réglages)
const CONTACTS_DEFAUT = [
  { pro: "cmp", nom: "CMPEA Blain (EPSYLAN)", adresse: "15, rue Pierre Morin, 44130 Blain", tel: "02 40 79 86 80", mail: "" },
  { pro: "laep", nom: "LAEP Les P'tites Graines", adresse: "6, rue du Moulin, 44130 Blain", tel: "", mail: "laep.lesptitesgraines@gmail.com" },
  { pro: "pco", nom: "PCO TND 44 Ouest (APAJH 44)", adresse: "51, rue François-René de Chateaubriand, 44600 Saint-Nazaire", tel: "02 40 70 98 08", mail: "pcotndouest@apajh44.org" },
  { pro: "camsp", nom: "CAMSP Kerbrun (APAJH 44)", adresse: "51, rue François-René de Chateaubriand, 44600 Saint-Nazaire", tel: "", mail: "contact-kerbrun@apajh44.org" },
  { pro: "cmpp", nom: "CMPP Kerbrun (APAJH 44)", adresse: "51, rue François-René de Chateaubriand, 44600 Saint-Nazaire", tel: "", mail: "contact-kerbrun@apajh44.org" }
];

// Se former : sections (titre, couleur, contenu HTML simple)
const FORMATION = [
  { id: "parcours", titre: "Le parcours, étape par étape", couleur: "#2453C7", html: `
    <ol class="etapes">
      <li><b>Observer et noter.</b> Des faits datés, des exemples précis, des travaux. Comparer avec les autres élèves du même âge.</li>
      <li><b>En parler en équipe.</b> Conseil de cycle, collègue de l'an dernier, RASED et psychologue scolaire.</li>
      <li><b>Adapter en classe.</b> Différenciation, APC, PPRE, outils. Laisser du temps (quelques semaines) et noter ce qui change.</li>
      <li><b>Rencontrer la famille.</b> Écouter ce qu'elle observe à la maison. Décrire, sans diagnostiquer. Proposer de consulter le médecin et remettre le courrier de l'école.</li>
      <li><b>Réunir une équipe éducative</b> si les difficultés durent ou si plusieurs professionnels sont concernés.</li>
      <li><b>Suivre.</b> Noter les démarches de la famille, les bilans reçus, les aménagements décidés. Refaire le point régulièrement.</li>
    </ol>` },
  { id: "dire", titre: "Ce que l'on peut dire, ce que l'on évite", couleur: "#0F8F6C", html: `
    <div class="deuxcol">
      <div><h4>On peut</h4><ul>
        <li>Décrire ce que l'on voit en classe, avec des exemples.</li>
        <li>Dire ce qui va bien, avant ce qui inquiète.</li>
        <li>Conseiller de consulter le médecin, qui seul peut orienter.</li>
        <li>Expliquer à l'oral à quoi servent les professionnels et les structures.</li>
        <li>Donner les informations pratiques : gratuité, ordonnance, délais.</li>
      </ul></div>
      <div><h4>On évite</h4><ul>
        <li>Poser un diagnostic (« il est dyslexique », « hyperactif », « autiste »).</li>
        <li>Écrire le nom d'un spécialiste à consulter dans un document remis à la famille.</li>
        <li>Promettre un résultat ou un délai.</li>
        <li>Parler d'un élève devant d'autres familles.</li>
        <li>Garder des notes sur l'élève plus longtemps que nécessaire.</li>
      </ul></div>
    </div>` },
  { id: "famille", titre: "En parler avec la famille", couleur: "#C2417A", html: `
    <ul>
      <li><b>Préparer :</b> deux ou trois exemples concrets, un travail de l'élève, ce que l'école a déjà essayé.</li>
      <li><b>Commencer par l'enfant :</b> ses réussites, ce qu'il aime, ses efforts.</li>
      <li><b>Demander ce que voient les parents</b> à la maison, avant de conclure. Leurs observations rejoignent souvent les nôtres.</li>
      <li><b>Parler de besoins,</b> pas de défauts : « il a besoin de plus de temps pour… ».</li>
      <li><b>Rassurer sur le but :</b> comprendre pour mieux aider, le plus tôt possible.</li>
      <li><b>Laisser un écrit simple :</b> le courrier pour le médecin, les fiches pratiques des structures en accès direct.</li>
      <li><b>Fixer un prochain point</b> avant de se quitter.</li>
    </ul>` },
  { id: "alerte", titre: "Signes d'alerte selon l'âge", couleur: "#D97706", html: `
    <p>Un signe isolé ne suffit pas. Ce qui alerte, c'est un écart <b>net</b> avec les enfants du même âge, qui <b>dure</b> malgré les aides, ou une <b>perte</b> de ce qui était acquis (toujours urgent).</p>
    <h4>Petite et moyenne section</h4><ul>
      <li>Parle très peu, ou n'est pas compris par les adultes de l'école.</li>
      <li>Ne réagit pas à son prénom, joue peu avec les autres, supporte mal les changements.</li>
      <li>Grande maladresse, tombe souvent, gestes très raides.</li>
      <li>Ne tient pas en place, même lors d'une activité qui lui plaît.</li></ul>
    <h4>Grande section</h4><ul>
      <li>Phrases encore très simples ou mal construites, sons déformés.</li>
      <li>N'arrive pas à repérer les syllabes ou les rimes.</li>
      <li>Ne peut pas écrire son prénom, tenue du crayon très inhabituelle.</li>
      <li>Ne dénombre pas une petite collection.</li></ul>
    <h4>CP et CE1</h4><ul>
      <li>Le déchiffrage ne se met pas en place après plusieurs mois de CP.</li>
      <li>Confusions de sons qui persistent, lecture très lente au CE1.</li>
      <li>Écriture très lente, illisible ou douloureuse.</li>
      <li>Les nombres et le calcul restent très difficiles malgré la manipulation.</li></ul>
    <h4>CE2 au CM2</h4><ul>
      <li>Lecture encore laborieuse, compréhension écrite très inférieure à l'oral.</li>
      <li>Orthographe très éloignée de la classe, copie très coûteuse.</li>
      <li>Oublis et désorganisation qui empêchent de travailler.</li>
      <li>Anxiété, repli ou colères qui augmentent.</li></ul>` },
  { id: "cout", titre: "Qui paie quoi ?", couleur: "#23914A", html: `
    <table class="tab"><thead><tr><th>Pour la famille</th><th>Exemples</th></tr></thead><tbody>
      <tr><td><span class="badge ok">Gratuit</span></td><td>Aides de l'école (RASED, psychologue scolaire, médecin scolaire), PMI, CMP, CMPP, CAMSP, PCO, MDPH. Soutien aux parents : LAEP, espace départemental des solidarités, AED.</td></tr>
      <tr><td><span class="badge info">Remboursé</span></td><td>Médecin, ophtalmologiste, ORL, pédopsychiatre. Orthophoniste et orthoptiste avec ordonnance (60 % + mutuelle). Psychologue avec Mon soutien psy (12 séances par an).</td></tr>
      <tr><td><span class="badge bad">Non remboursé hors dispositif</span></td><td>Psychomotricien, ergothérapeute, neuropsychologue en cabinet. Pris en charge via la PCO, le CMP, le CAMSP ou le CMPP, parfois par la mutuelle ou l'AEEH (MDPH).</td></tr>
    </tbody></table>
    <p>Quand une famille ne peut pas payer, orienter vers les <b>voies gratuites</b> plutôt que de renoncer au soin.</p>` },
  { id: "delais", titre: "Les délais : agir tôt et en parallèle", couleur: "#7C3AED", html: `
    <ul>
      <li>Les délais se comptent souvent en <b>mois</b> (orthophonie, CMP, ophtalmologie, MDPH).</li>
      <li>Conseiller de lancer <b>plusieurs démarches en même temps</b> : s'inscrire sur plusieurs listes ne fait rien perdre.</li>
      <li>Orthophonie : liste commune Allo-Ortho, et rappeler les cabinets chaque mois.</li>
      <li>Pendant l'attente, l'école continue d'adapter : les aides en classe n'attendent pas le bilan.</li>
    </ul>` },
  { id: "aides-educ", titre: "Aider les parents : avec leur accord ou par le juge", couleur: "#0E7490", html: `
    <p>Quand des parents se sentent démunis face au comportement de leur enfant, il existe des aides. Elles sont de deux sortes, à ne pas confondre.</p>
    <div class="deuxcol">
      <div><h4>Aides administratives : les parents décident</h4><ul>
        <li><b>Lieu d'accueil enfants-parents (LAEP)</b> : accès libre, gratuit, enfants de 0 à 6 ans.</li>
        <li><b>PMI</b> : médecin et puéricultrice conseillent sur le quotidien (sommeil, colères, limites), enfants de 0 à 6 ans.</li>
        <li><b>Espace départemental des solidarités</b> : un travailleur social écoute et oriente. C'est la porte d'entrée.</li>
        <li><b>TISF</b> : un professionnel vient à la maison aider dans le quotidien.</li>
        <li><b>AED (aide éducative à domicile)</b> : un éducateur de l'aide sociale à l'enfance, avec l'<b>accord écrit</b> des parents. Ils peuvent refuser ou arrêter.</li>
      </ul><p>L'école peut <b>les conseiller</b> à la famille, à l'oral ou dans un compte rendu (« s'ils le souhaitent »).</p></div>
      <div><h4>Mesures judiciaires : le juge décide</h4><ul>
        <li><b>MJIE</b> : le juge fait évaluer la situation de l'enfant et de sa famille.</li>
        <li><b>AEMO (assistance éducative en milieu ouvert)</b> : l'enfant reste chez lui, un éducateur suit la famille et rend compte au juge. La mesure s'impose aux parents.</li>
        <li>Elles concernent un enfant <b>en danger ou en risque de l'être</b>, quand l'aide acceptée ne suffit pas ou est refusée.</li>
      </ul><p>L'école ne les <b>propose jamais</b> à une famille : elle transmet une information préoccupante (voir la section suivante).</p></div>
    </div>
    <p>Une famille fatiguée ou démunie n'est pas une famille en danger. Commencer par les aides administratives, en les présentant comme des services pour toutes les familles.</p>` },
  { id: "danger", titre: "Si l'enfant est peut-être en danger", couleur: "#B42318", html: `
    <ul>
      <li>Ce n'est plus une question d'orientation vers un soin : en parler <b>tout de suite</b> au directeur.</li>
      <li>L'école transmet une <b>information préoccupante</b> à la cellule départementale (CRIP), ou un signalement au procureur si le danger est grave.</li>
      <li>On ne mène pas d'enquête, on n'interroge pas l'enfant : on note ses paroles exactes et ce que l'on a vu.</li>
      <li>Danger immédiat : <b>17</b>. Conseil et écoute : <b>119</b> (Allô Enfance en danger), jour et nuit.</li>
    </ul>` },
  { id: "glossaire", titre: "Les sigles", couleur: "#64748B", html: `
    <dl class="gloss">
      <dt>AESH</dt><dd>Accompagnant d'élève en situation de handicap.</dd>
      <dt>AEEH</dt><dd>Allocation d'éducation de l'enfant handicapé (aide financière, MDPH).</dd>
      <dt>APC</dt><dd>Activités pédagogiques complémentaires.</dd>
      <dt>CAMSP</dt><dd>Centre d'action médico-sociale précoce (0 à 6 ans).</dd>
      <dt>CMP</dt><dd>Centre médico-psychologique (public, gratuit).</dd>
      <dt>CMPP</dt><dd>Centre médico-psycho-pédagogique (gratuit).</dd>
      <dt>CRIP</dt><dd>Cellule de recueil des informations préoccupantes (Département).</dd>
      <dt>ESS</dt><dd>Équipe de suivi de la scolarisation (élèves avec un PPS).</dd>
      <dt>GEVA-Sco</dt><dd>Document rempli par l'école pour la MDPH.</dd>
      <dt>MDPH</dt><dd>Maison départementale des personnes handicapées.</dd>
      <dt>PAI</dt><dd>Projet d'accueil individualisé (santé).</dd>
      <dt>PAP</dt><dd>Plan d'accompagnement personnalisé (troubles des apprentissages).</dd>
      <dt>PCO</dt><dd>Plateforme de coordination et d'orientation (troubles du neurodéveloppement, 0 à 12 ans).</dd>
      <dt>PMI</dt><dd>Protection maternelle et infantile (0 à 6 ans).</dd>
      <dt>PPRE</dt><dd>Programme personnalisé de réussite éducative.</dd>
      <dt>PPS</dt><dd>Projet personnalisé de scolarisation (MDPH).</dd>
      <dt>PsyEN</dt><dd>Psychologue de l'Éducation nationale.</dd>
      <dt>RASED</dt><dd>Réseau d'aides spécialisées aux élèves en difficulté.</dd>
      <dt>SESSAD</dt><dd>Service d'éducation spéciale et de soins à domicile (sur décision MDPH).</dd>
      <dt>TDAH</dt><dd>Trouble du déficit de l'attention avec ou sans hyperactivité.</dd>
      <dt>TND</dt><dd>Troubles du neurodéveloppement (TSA, TDAH, troubles dys, troubles du développement intellectuel).</dd>
      <dt>TSA</dt><dd>Trouble du spectre de l'autisme.</dd>
    </dl>` }
];
