/* Parcours élève : écrans (accueil, fiche élève, réglages) et saisie. */
const S={vue:"accueil",id:null,onglet:"resume",annee:null,recherche:"",edit:false,nouveau:false};
const OUT={ouverts:{}};
const nomEleve=e=>e?`${e.Prenom||""} ${(e.Nom||"").toUpperCase()}`.trim()||"(sans nom)":"";
const present=e=>e&&e.Statut!=="Archivé";
let tTimer;function toast(t){const el=$("toast");el.textContent=t;el.style.opacity=1;clearTimeout(tTimer);tTimer=setTimeout(()=>el.style.opacity=0,2200)}
function majBoutonAnnuler(){const b=$("btn-annuler");if(!b)return;const a=PILE[PILE.length-1];b.disabled=!a;b.title=a?"Annuler : "+a.label+" (Ctrl+Z)":"Rien à annuler"}

/* ---------- Champs de saisie génériques ---------- */
const NOTE=LISTES.notes,OKN=LISTES.oui_non;
function options(choix,v,vide){return (vide===false?"":`<option value=""></option>`)+choix.map(c=>`<option ${c===v?"selected":""}>${esc(c)}</option>`).join("")}
function optionsRef(table,v){
  const L=T[table].slice();
  if(table==="Professionnels"){
    const types=[...new Set(L.map(r=>r.Type||"Autres"))].sort((a,b)=>a.localeCompare(b,"fr"));
    return `<option value="0"></option>`+types.map(ty=>`<optgroup label="${esc(ty)}">`+L.filter(r=>(r.Type||"Autres")===ty).sort((a,b)=>(a.Nom||"").localeCompare(b.Nom||"","fr")).map(r=>`<option value="${r.id}" ${r.id===v?"selected":""}>${esc(r.Nom)}</option>`).join("")+`</optgroup>`).join("");
  }
  return `<option value="0"></option>`+L.map(r=>`<option value="${r.id}" ${r.id===v?"selected":""}>${esc(nomEleve(r))}</option>`).join("");
}
function champ(table,row,d){
  const v=row[d.c],a=`data-t="${table}" data-id="${row.id}" data-c="${d.c}" data-k="${d.kind}"`,lab=`<span class="lab">${esc(d.label)}</span>`;
  switch(d.kind){
    case"text":return `<label class="ch">${lab}<input ${a} type="${d.type||"text"}" value="${esc(v)}" ${d.liste?`list="${d.liste}"`:""}></label>`;
    case"area":return `<label class="ch large">${lab}<textarea ${a} rows="${d.rows||3}">${esc(v)}</textarea></label>`;
    case"date":return `<label class="ch">${lab}<input ${a} type="date" value="${jour(versDate(v))}"></label>`;
    case"num":return `<label class="ch">${lab}<input ${a} type="number" step="any" inputmode="decimal" value="${v==null?"":esc(v)}"></label>`;
    case"choice":return `<label class="ch">${lab}<select ${a}>${options(d.choices,v)}</select></label>`;
    case"ref":return `<label class="ch">${lab}<select ${a}>${optionsRef(d.refTable,v)}</select></label>`;
    case"bool":return `<button type="button" class="chip" ${a} data-tog aria-pressed="${!!v}">${esc(d.label)}</button>`;
    case"seg":return `<div class="ch"><span class="lab">${esc(d.label)}</span><div class="seg">${d.choices.map(c=>`<button type="button" ${a} data-seg data-val="${esc(c)}" aria-pressed="${v===c}">${esc(c)}</button>`).join("")}</div></div>`;
    case"chips":{const l=liste(v);return `<div class="ch large"><span class="lab">${esc(d.label)}</span><div class="chips">${d.choices.map(c=>`<button type="button" class="chip" ${a} data-chip data-val="${esc(c)}" aria-pressed="${l.includes(c)}">${esc(c)}</button>`).join("")}</div></div>`}
  }
  return "";
}
const champs=(table,row,defs)=>`<div class="grille">${defs.map(d=>champ(table,row,d)).join("")}</div>`;
const SUP=(table,id,txt)=>`<button type="button" class="btn petit danger" data-sup="${table}:${id}">${txt||"Supprimer"}</button>`;

/* ---------- Définitions des champs ---------- */
const bool=(c,label)=>({c,kind:"bool",label});
const GROUPES=[
 {t:"Travail et comportement",f:[{c:"Travail",kind:"seg",label:"Travail",choices:NOTE},{c:"Comportement",kind:"seg",label:"Comportement",choices:NOTE}],aide:"De 1 (faible, difficile) à 4 (très bien)."},
 {t:"Aides et dispositifs",f:[bool("Rased_demande","RASED demandé"),bool("Rased_suivi","RASED suivi"),bool("Psy_EN","Psychologue scolaire"),bool("PPRE","PPRE"),bool("PAP","PAP"),bool("PAI","PAI"),bool("PPS","PPS"),bool("UPE2A","Élève allophone (UPE2A)")],chips:true},
 {t:"Propositions",f:[bool("Aide_perso_proposee","Aide perso proposée"),bool("Aide_perso_acceptee","Aide perso acceptée"),bool("Stage_RAN_propose","Stage RAN proposé"),bool("Stage_RAN_accepte","Stage RAN accepté"),bool("Bilan_ortho_preconise","Bilan ortho préconisé"),bool("Bilan_ortho_realise","Bilan ortho réalisé")],chips:true},
 {t:"Aménagements en classe",f:[{c:"Amenagements",kind:"chips",label:"Coche ce qui est en place",choices:LISTES.amenagements}]},
 {t:"Redoublement",f:[bool("Redoublement_preconise","Redoublement préconisé"),{c:"Redoublement_avis_parents",kind:"seg",label:"Avis des parents",choices:OKN},{c:"Redoublement_avis_IEN",kind:"seg",label:"Avis de l'IEN",choices:OKN}],aide:"OK : avis favorable. N : avis défavorable."},
 {t:"Orientation ULIS / SEGPA",f:[{c:"Orientation_proposee",kind:"seg",label:"Proposée",choices:LISTES.orientation},{c:"Orientation_avis_parents",kind:"seg",label:"Avis des parents",choices:OKN},{c:"Orientation_avis_commission",kind:"seg",label:"Avis de la commission",choices:OKN}]},
 {t:"Absences hors vacances (jours)",f:["P1","P2","P3","P4","P5"].map(p=>({c:"Abs_"+p,kind:"num",label:p}))},
 {t:"Points d'appui et commentaires",f:[{c:"Points_appui",kind:"area",label:"Points d'appui, réussites"},{c:"Commentaire",kind:"area",label:"Commentaire"},{c:"Classe",kind:"text",label:"Classe cette année-là"},{c:"Enseignant",kind:"text",label:"Enseignant"}]}
];
const F_ELEVE=[{c:"Prenom",kind:"text",label:"Prénom"},{c:"Nom",kind:"text",label:"Nom"},{c:"Naissance",kind:"date",label:"Date de naissance"},{c:"Classe",kind:"text",label:"Classe",liste:"classes"}];
const F_SUIVI=[{c:"Professionnel",kind:"ref",refTable:"Professionnels",label:"Professionnel"},{c:"Etat",kind:"choice",label:"État",choices:LISTES.etat_suivi},{c:"Date_preconisation",kind:"date",label:"Préconisé le"},{c:"Debut",kind:"date",label:"Début"},{c:"Fin",kind:"date",label:"Fin"},{c:"Frequence",kind:"text",label:"Fréquence"},{c:"Note",kind:"area",label:"Note",rows:2}];
const F_RENC=[{c:"Date",kind:"date",label:"Date"},{c:"Type",kind:"choice",label:"Type",choices:LISTES.type_rencontre},{c:"Auteur",kind:"text",label:"Auteur"},{c:"Presents",kind:"text",label:"Présents"},{c:"Dit",kind:"area",label:"Ce qui a été dit",rows:5},{c:"Decisions",kind:"area",label:"Décisions",rows:3},{c:"Resume",kind:"area",label:"Résumé du bilan (quelques lignes)",rows:4}];
const F_MDPH=[{c:"Nature",kind:"chips",label:"Nature de la notification",choices:LISTES.nature_mdph},{c:"Date_notification",kind:"date",label:"Notifiée le"},{c:"Debut",kind:"date",label:"Début"},{c:"Fin",kind:"date",label:"Jusqu'au"},{c:"Quotite_AESH",kind:"num",label:"Quotité AESH (h/semaine)"},{c:"Nom_AESH",kind:"text",label:"Nom de l'AESH"},{c:"Enseignant_referent",kind:"ref",refTable:"Professionnels",label:"Enseignant référent"},{c:"Note",kind:"area",label:"Note",rows:2}];
const F_PAI=[{c:"Date",kind:"date",label:"Date du PAI"},{c:"Renouvellement",kind:"date",label:"À renouveler le"},{c:"Note",kind:"area",label:"Note",rows:2}];

/* ---------- Calculs : situation d'un élève, alertes ---------- */
function mdphActif(m,t){const d=versDate(m.Debut),f=versDate(m.Fin);return (!d||d<=t)&&(!f||f>=t)}
function parcoursAnnee(id,an){return deEleve("Parcours",id).find(p=>p.Annee===an)}
function alertes(){
  const t=aujourdhui(),A=[],ids=T.Eleves.filter(present).map(e=>e.id);
  const mMdph=reglageNb("alerte_mdph_mois",6),mPai=reglageNb("alerte_pai_mois",2),mEss=reglageNb("alerte_ess_mois",12),mSuivi=reglageNb("alerte_suivi_mois",3);
  for(const id of ids){
    const ms=deEleve("MDPH",id),vivantes=ms.filter(m=>!versDate(m.Fin)||versDate(m.Fin)>=t);
    for(const m of ms){const f=versDate(m.Fin);if(!f)continue;
      if(f<t&&!vivantes.length)A.push({n:0,e:id,txt:`Notification MDPH échue le ${fr(m.Fin)}`});
      else if(f>=t&&f<=plusMois(t,mMdph)&&!ms.some(x=>x!==m&&(!versDate(x.Fin)||versDate(x.Fin)>f)))A.push({n:1,e:id,txt:`Notification MDPH jusqu'au ${fr(m.Fin)} : penser au renouvellement`})}
    const pai=deEleve("PAI",id).sort((a,b)=>(b.Date||0)-(a.Date||0))[0];
    if(pai&&pai.Renouvellement){const r=versDate(pai.Renouvellement);if(r<t)A.push({n:0,e:id,txt:`PAI à renouveler (échu le ${fr(pai.Renouvellement)})`});else if(r<=plusMois(t,mPai))A.push({n:1,e:id,txt:`PAI à renouveler avant le ${fr(pai.Renouvellement)}`})}
    const p=parcoursAnnee(id,anneeScolaire());
    if(ms.some(m=>mdphActif(m,t))||(p&&p.PPS)){
      const dern=deEleve("Rencontres",id).filter(r=>r.Type==="ESS").map(r=>versDate(r.Date)).filter(Boolean).sort((a,b)=>b-a)[0];
      if(!dern||dern<plusMois(t,-mEss))A.push({n:1,e:id,txt:`ESS annuelle à programmer (dernière : ${dern?fr(dern.getTime()/1000):"aucune"})`});
    }
    for(const s of deEleve("Suivis",id)){const d=versDate(s.Date_preconisation);
      if((s.Etat==="Préconisé"||s.Etat==="Demandé")&&d&&d<=plusMois(t,-mSuivi)){const pr=par("Professionnels",s.Professionnel);A.push({n:1,e:id,txt:`Suivi ${pr?"chez "+pr.Nom:""} ${s.Etat.toLowerCase()} le ${fr(s.Date_preconisation)} : pas de nouvelles ?`})}}
  }
  return A.sort((a,b)=>a.n-b.n);
}
function pastilles(id){
  const p=parcoursAnnee(id,anneeScolaire()),t=aujourdhui(),o=[];
  if(p){for(const [c,l] of [["PAI","PAI"],["PPS","PPS"],["PAP","PAP"],["PPRE","PPRE"],["UPE2A","UPE2A"]])if(p[c])o.push(l)}
  if(deEleve("MDPH",id).some(m=>mdphActif(m,t)))o.push("MDPH");
  return o.map(x=>`<span class="pastille">${x}</span>`).join("");
}

/* ---------- Écrans ---------- */
function barre(){
  const retour=S.vue!=="accueil"?`<a class="btn petit" href="#accueil" data-nav="accueil">← Accueil</a>`:"";
  return `<div class="barre noprint">${retour}<span class="titre"></span>
   <button class="btn petit" id="btn-annuler" data-act="annuler">↶ Annuler</button>
   <a class="btn petit" href="#reglages" data-nav="reglages">⚙ Réglages</a></div>`;
}
function vueAccueil(){
  const q=norm(S.recherche),classes=[...new Set(T.Eleves.map(e=>e.Classe).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"fr"));
  const ligne=e=>`<a class="eleve" href="#eleve/${e.id}" data-nav="eleve/${e.id}"><b>${esc(nomEleve(e))}</b><span class="aide">${esc(e.Classe||"")}${e.Statut==="Archivé"?" · archivé":""}</span><span class="pastilles">${pastilles(e.id)}</span></a>`;
  let h=`<div class="carte"><input id="recherche" type="search" placeholder="Chercher un élève (nom ou prénom)" value="${esc(S.recherche)}" aria-label="Chercher un élève"></div>`;
  if(q){
    const L=T.Eleves.filter(e=>norm(nomEleve(e)).includes(q)||norm((e.Nom||"")+" "+(e.Prenom||"")).includes(q)).sort((a,b)=>nomEleve(a).localeCompare(nomEleve(b),"fr"));
    return h+`<div class="carte"><h2>${L.length} résultat${L.length>1?"s":""}</h2>${L.map(ligne).join("")||`<p class="aide">Personne ne correspond.</p>`}</div>`;
  }
  const A=alertes();
  h+=`<details class="carte alertes" ${A.length?"open":""}><summary>Alertes <span class="pastille ${A.some(a=>a.n===0)?"rouge":"orange"}">${A.length}</span></summary>${A.length?A.map(a=>`<a class="alerte n${a.n}" href="#eleve/${a.e}" data-nav="eleve/${a.e}"><b>${esc(nomEleve(par("Eleves",a.e)))}</b> ${esc(a.txt)}</a>`).join(""):`<p class="aide">Rien à signaler. Les délais se règlent dans ⚙ Réglages.</p>`}</details>`;
  h+=`<div class="carte"><button class="btn plein" data-act="nouveau">+ Nouvel élève</button>${S.nouveau?formNouveau():""}</div>`;
  const pres=T.Eleves.filter(present);
  if(!pres.length)h+=`<div class="carte"><p class="aide">Aucun élève pour l'instant. Ajoute-en un (fictif tant que le DPD n'a pas répondu), ou on importera la liste d'ONDE dans une prochaine version.</p></div>`;
  const parClasse={};pres.forEach(e=>(parClasse[e.Classe||"Sans classe"]=parClasse[e.Classe||"Sans classe"]||[]).push(e));
  for(const c of Object.keys(parClasse).sort((a,b)=>a.localeCompare(b,"fr")))
    h+=`<details class="carte" open><summary>${esc(c)} <span class="aide">${parClasse[c].length} élève${parClasse[c].length>1?"s":""}</span></summary>${parClasse[c].sort((a,b)=>nomEleve(a).localeCompare(nomEleve(b),"fr")).map(ligne).join("")}</details>`;
  const arch=T.Eleves.filter(e=>!present(e));
  if(arch.length){const lim=plusMois(aujourdhui(),-reglageNb("archivage_mois",12));
    h+=`<details class="carte"><summary>Élèves archivés <span class="aide">${arch.length}</span></summary>${arch.map(e=>`${ligne(e)}${versDate(e.Depart)&&versDate(e.Depart)<lim?`<p class="msg">Parti(e) le ${fr(e.Depart)} : suppression proposée (plus de ${reglageNb("archivage_mois",12)} mois).</p>`:""}`).join("")}</details>`;}
  return h+`<datalist id="classes">${classes.map(c=>`<option value="${esc(c)}">`).join("")}</datalist>`;
}
function formNouveau(){return `<form class="grille" data-form="eleve" style="margin-top:10px">
  <label class="ch"><span class="lab">Prénom</span><input name="Prenom" required></label><label class="ch"><span class="lab">Nom</span><input name="Nom" required></label>
  <label class="ch"><span class="lab">Date de naissance</span><input name="Naissance" type="date"></label><label class="ch"><span class="lab">Classe</span><input name="Classe" list="classes"></label>
  <div class="ch large"><button class="btn plein" type="submit">Créer l'élève</button></div></form>`}

function contact(pr){if(!pr)return "";return `<span class="aide">${esc(pr.Type||"")}${pr.Telephone?` · <a href="tel:${esc(pr.Telephone.replace(/\s/g,""))}">${esc(pr.Telephone)}</a>`:""}${pr.Mail?` · <a href="mailto:${esc(pr.Mail)}">${esc(pr.Mail)}</a>`:""}</span>`}
const ONGLETS=[["resume","Résumé"],["parcours","Parcours"],["suivis","Suivis"],["rencontres","Rencontres"],["mdph","MDPH et PAI"]];
function vueEleve(){
  const e=par("Eleves",S.id);if(!e)return `<div class="carte"><p>Élève introuvable.</p></div>`;
  let h=`<div class="carte"><div class="entete-eleve"><div><h2 style="margin:0">${esc(nomEleve(e))}</h2><span class="aide">${esc(e.Classe||"Sans classe")}${e.Naissance?` · né(e) le ${fr(e.Naissance)} (${age(e.Naissance)})`:""}${e.Statut==="Archivé"?` · archivé${e.Depart?" depuis le "+fr(e.Depart):""}`:""}</span></div>
   <div class="noprint actions"><button class="btn petit" data-act="modifier">${S.edit?"Fermer":"Modifier"}</button><button class="btn petit" data-act="imprimer">Imprimer</button></div></div>
   ${S.edit?`<div class="noprint">${champs("Eleves",e,F_ELEVE)}<div class="actions" style="margin-top:8px">${present(e)?`<button class="btn petit" data-act="archiver">Archiver (l'élève quitte l'école)</button>`:`<button class="btn petit" data-act="reactiver">Réactiver</button>`}${SUP("Eleves",e.id,"Supprimer l'élève et tout son dossier")}</div></div>`:""}</div>
   <div class="onglets noprint" role="tablist">${ONGLETS.map(([k,l])=>`<button role="tab" data-onglet="${k}" aria-selected="${S.onglet===k}">${l}</button>`).join("")}</div>`;
  return h+({resume:ongletResume,parcours:ongletParcours,suivis:ongletSuivis,rencontres:ongletRencontres,mdph:ongletMdph})[S.onglet](e)+`<datalist id="classes">${[...new Set(T.Eleves.map(x=>x.Classe).filter(Boolean))].map(c=>`<option value="${esc(c)}">`).join("")}</datalist>`;
}
function ongletResume(e){
  const an=anneeScolaire(),p=parcoursAnnee(e.id,an),t=aujourdhui();
  let h=`<div class="carte"><h3>Cette année · ${an}</h3>`;
  if(p){
    const flags=GROUPES.flatMap(g=>g.f).filter(f=>f.kind==="bool"&&p[f.c]).map(f=>`<span class="pastille">${esc(f.label)}</span>`).join(" ");
    h+=`<p>${p.Travail?`Travail <b>${esc(p.Travail)}</b>/4`:""}${p.Travail&&p.Comportement?" · ":""}${p.Comportement?`comportement <b>${esc(p.Comportement)}</b>/4`:""}</p>${flags?`<p class="pastilles">${flags}</p>`:""}
     ${liste(p.Amenagements).length?`<p><b>Aménagements :</b> ${liste(p.Amenagements).map(esc).join(", ")}</p>`:""}${p.Points_appui?`<p><b>Points d'appui :</b> ${esc(p.Points_appui)}</p>`:""}`;
  }else h+=`<p class="aide">Pas encore de parcours pour cette année. <a href="#" data-onglet="parcours">Le créer</a></p>`;
  h+=`</div>`;
  const ms=deEleve("MDPH",e.id).sort((a,b)=>(b.Debut||0)-(a.Debut||0)),pai=deEleve("PAI",e.id).sort((a,b)=>(b.Date||0)-(a.Date||0))[0];
  if(ms.length||pai){h+=`<div class="carte"><h3>MDPH et PAI</h3>`+ms.map(m=>`<p>${badgeMdph(m,t)} ${liste(m.Nature).map(esc).join(", ")||"Notification"}${m.Fin?` jusqu'au <b>${fr(m.Fin)}</b>`:""}${m.Quotite_AESH?` · AESH <b>${esc(m.Quotite_AESH)} h/semaine</b>`:""}${m.Nom_AESH?` (${esc(m.Nom_AESH)})`:""}</p>`).join("")+(pai?`<p>PAI du ${fr(pai.Date)}${pai.Renouvellement?`, à renouveler le <b>${fr(pai.Renouvellement)}</b>`:""}</p>`:"")+`</div>`}
  const su=deEleve("Suivis",e.id).filter(s=>s.Etat!=="Terminé"&&s.Etat!=="Arrêté");
  if(su.length)h+=`<div class="carte"><h3>Suivis en cours</h3>${su.map(s=>{const pr=par("Professionnels",s.Professionnel);return `<p><b>${esc(pr?pr.Nom:"(professionnel à choisir)")}</b> · ${esc(s.Etat||"")}<br>${contact(pr)}</p>`}).join("")}</div>`;
  const re=deEleve("Rencontres",e.id).sort((a,b)=>(b.Date||0)-(a.Date||0)).slice(0,3);
  if(re.length)h+=`<div class="carte"><h3>Derniers bilans</h3>${re.map(r=>`<p><b>${fr(r.Date)}</b> · ${esc(r.Type||"")}<br>${esc(r.Resume||r.Decisions||"(pas de résumé)")}</p>`).join("")}</div>`;
  return h;
}
function badgeMdph(m,t){const f=versDate(m.Fin);if(f&&f<t)return `<span class="pastille rouge">échue</span>`;if(f&&f<=plusMois(t,reglageNb("alerte_mdph_mois",6)))return `<span class="pastille orange">bientôt échue</span>`;return `<span class="pastille ok">en cours</span>`}
function ongletParcours(e){
  const rows=deEleve("Parcours",e.id),courante=anneeScolaire(),annees=[...new Set([...rows.map(r=>r.Annee),courante])].sort().reverse();
  if(!S.annee||!annees.includes(S.annee))S.annee=courante;
  const p=rows.find(r=>r.Annee===S.annee);
  let h=`<div class="carte noprint"><label class="ch"><span class="lab">Année scolaire</span><select id="annee">${annees.map(a=>`<option ${a===S.annee?"selected":""}>${a}</option>`).join("")}</select></label></div>`;
  if(!p)return h+`<div class="carte"><p class="aide">Pas de parcours pour ${S.annee}.</p><button class="btn plein" data-act="creer-parcours">Créer le parcours ${S.annee}</button></div>`;
  for(const g of GROUPES)h+=`<div class="carte"><h3>${esc(g.t)}</h3>${g.aide?`<p class="aide">${esc(g.aide)}</p>`:""}${g.chips?`<div class="chips">${g.f.map(f=>champ("Parcours",p,f)).join("")}</div>`:champs("Parcours",p,g.f)}</div>`;
  return h+`<div class="carte noprint">${SUP("Parcours",p.id,"Supprimer ce parcours "+S.annee)}</div>`;
}
function ongletSuivis(e){
  const L=deEleve("Suivis",e.id).sort((a,b)=>(b.Date_preconisation||0)-(a.Date_preconisation||0));
  let h=`<div class="carte noprint"><button class="btn plein" data-act="ajout-suivi">+ Ajouter un suivi</button> <button class="btn" data-act="nouveau-pro">+ Nouveau professionnel dans l'annuaire</button>${S.nouveauPro?formPro():""}</div>`;
  if(!L.length)h+=`<div class="carte"><p class="aide">Aucun suivi noté.</p></div>`;
  return h+L.map(s=>`<div class="carte"><div class="entete-eleve"><b>${esc((par("Professionnels",s.Professionnel)||{}).Nom||"Suivi")}</b>${contact(par("Professionnels",s.Professionnel))}</div>${champs("Suivis",s,F_SUIVI)}<div class="noprint">${SUP("Suivis",s.id)}</div></div>`).join("");
}
function formPro(){return `<form class="grille" data-form="pro" style="margin-top:10px"><label class="ch"><span class="lab">Type (orthophoniste, CMP…)</span><input name="Type" list="types" required></label><label class="ch"><span class="lab">Nom</span><input name="Nom" required></label><label class="ch"><span class="lab">Téléphone</span><input name="Telephone" type="tel"></label><label class="ch"><span class="lab">Mail</span><input name="Mail" type="email"></label><div class="ch large"><button class="btn plein" type="submit">Ajouter à l'annuaire</button></div></form><datalist id="types">${[...new Set(T.Professionnels.map(r=>r.Type).filter(Boolean))].map(c=>`<option value="${esc(c)}">`).join("")}</datalist>`}
function ongletRencontres(e){
  const L=deEleve("Rencontres",e.id).sort((a,b)=>(b.Date||0)-(a.Date||0));
  let h=`<div class="carte noprint"><button class="btn plein" data-act="ajout-rencontre">+ Nouvelle rencontre</button><p class="aide">Entretien avec les parents, équipe éducative ou ESS : date, ce qui a été dit, décisions, résumé du bilan, compte rendu en pièce jointe.</p></div>`;
  if(!L.length)h+=`<div class="carte"><p class="aide">Aucune rencontre notée.</p></div>`;
  return h+L.map(r=>`<div class="carte"><div class="entete-eleve"><b>${fr(r.Date)} · ${esc(r.Type||"")}</b></div>${champs("Rencontres",r,F_RENC)}
   <div class="ch large"><span class="lab">Compte rendu joint</span><div class="pj">${liste(r.CR).map(id=>`<a class="btn petit" href="#" data-pj="${id}">📎 ${esc(ATT[id]||"fichier "+id)}</a>`).join("")||`<span class="aide">Aucun</span>`}</div>
   <button class="btn petit noprint" style="margin-top:6px" data-act="aide-pj" data-id="${r.id}">Joindre un fichier</button>${S.aidePJ===r.id?aidePJ(r):""}</div><div class="noprint">${SUP("Rencontres",r.id)}</div></div>`).join("");
}
function aidePJ(r){return `<div class="aidepj noprint"><p><b>Pour joindre un fichier (3 gestes) :</b></p><ol><li>Dans le menu de gauche de Grist, ouvre <b>Données source</b>, puis la table <b>Rencontres</b>.</li><li>Trouve la ligne du <b>${fr(r.Date)}</b> (${esc(nomEleve(par("Eleves",r.Eleve)))}) et dépose ton fichier dans la colonne <b>Compte rendu joint</b>.</li><li>Reviens ici et touche <b>Actualiser</b>.</li></ol><button class="btn petit plein" data-act="actualiser">Actualiser</button></div>`}
function ongletMdph(e){
  const t=aujourdhui(),M=deEleve("MDPH",e.id).sort((a,b)=>(b.Debut||0)-(a.Debut||0)),P=deEleve("PAI",e.id).sort((a,b)=>(b.Date||0)-(a.Date||0));
  return `<div class="carte noprint"><button class="btn plein" data-act="ajout-mdph">+ Notification MDPH</button> <button class="btn" data-act="ajout-pai">+ PAI</button></div>`
   +M.map(m=>`<div class="carte"><h3>Notification MDPH ${badgeMdph(m,t)}</h3>${champs("MDPH",m,F_MDPH)}<div class="noprint">${SUP("MDPH",m.id)}</div></div>`).join("")
   +P.map(p=>`<div class="carte"><h3>PAI</h3>${champs("PAI",p,F_PAI)}<div class="noprint">${SUP("PAI",p.id)}</div></div>`).join("")
   +(M.length||P.length?"":`<div class="carte"><p class="aide">Rien de noté.</p></div>`);
}

const REG=[["alerte_mdph_mois","Fin de notification MDPH : prévenir … mois avant"],["alerte_ess_mois","ESS annuelle : prévenir après … mois sans ESS"],["alerte_pai_mois","PAI : prévenir … mois avant le renouvellement"],["alerte_suivi_mois","Suivi demandé : prévenir après … mois sans nouvelles"],["archivage_mois","Élève parti : proposer la suppression après … mois"]];
function section(id,titre,corps,ouvert){const o=OUT.ouverts[id];return `<details class="carte" data-sec="${id}" ${(o===undefined?ouvert:o)?"open":""}><summary>${titre}</summary>${corps}</details>`}
function vueReglages(){
  const reg=REG.map(([k,l])=>{const r=(T.Reglages||[]).find(x=>x.Cle===k);return r?champ("Reglages",r,{c:"Valeur",kind:"text",type:"number",label:l}):""}).join("");
  return `<div class="carte noprint"><button class="btn petit" data-act="tout-deplier">Tout déplier</button> <button class="btn petit" data-act="tout-replier">Tout replier</button></div>`
  +section("alertes","Alertes et conservation",`<div class="grille">${reg}</div>`,true)
  +section("install","Installation du document",`<p class="aide">Crée les tables et listes qui manquent. Ne supprime rien et ne remplace rien.</p><div id="etat-tables" class="aide"></div><button class="btn plein" data-act="installer">Installer / compléter le document</button><pre id="journal" hidden></pre>`,false)
  +section("apropos","À propos",`<p class="aide">Version ${VERSION}. Les données sont dans ton document Grist, hébergé par l'État. Cette page publique ne contient aucune donnée d'élève.</p><p class="aide">Ctrl+Z annule la dernière modification. Tant que le DPD de l'académie n'a pas répondu : élèves fictifs seulement.</p>`,false);
}

/* ---------- Affichage et navigation ---------- */
async function rendre(){
  const y=window.scrollY;
  if(S.vue==="reglages"&&S.pret){for(const [k,l] of REGLAGES_DEFAUT){if(!(T.Reglages||[]).some(r=>r.Cle===k)){const v=REGLAGES_DEFAUT.find(x=>x[0]===k)[1];await ajouter("Reglages",{Cle:k,Valeur:v},"réglage");PILE.pop()}}}
  $("app").innerHTML=barre()+({accueil:vueAccueil,eleve:vueEleve,reglages:vueReglages})[S.vue]();
  majBoutonAnnuler();window.scrollTo(0,y);
}
function lireHash(){
  const h=location.hash.replace(/^#/,"").split("/");
  if(h[0]==="eleve"&&par("Eleves",+h[1])){S.vue="eleve";S.id=+h[1];S.onglet=h[2]||"resume"}
  else if(h[0]==="reglages")S.vue="reglages";else S.vue="accueil";
  S.edit=false;S.nouveauPro=false;
}
function aller(h){history.pushState(null,"","#"+h);lireHash();window.scrollTo(0,0);rendre()}
