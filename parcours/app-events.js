/* Parcours élève : événements, enregistrement, démarrage. */
const VERSION="0.2.0";
const lsGet=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
OUT.ouverts=lsGet("parcours-ui",{});

function valeurDe(el){
  const k=el.dataset.k,v=el.value;
  if(k==="date")return enSecondes(v);
  if(k==="num")return v===""?null:parseFloat(v);
  if(k==="ref")return parseInt(v)||0;
  return v;
}
async function sauver(el){
  const {t,id,c,k}=el.dataset,val=valeurDe(el);
  try{
    await modifier(t,+id,c,val,"modification");
    if(c==="Auteur")lsSet("parcours-auteur",val);
    toast("✓ Enregistré");
    if(k==="date"||k==="choice"||k==="ref"||t==="Eleves")rendre();
  }catch(e){toast("⚠ Pas enregistré : "+(e&&e.message||e));await recharger()}
}
async function recharger(){try{await charger();await chargerPJ();rendre()}catch(e){toast("Je n'arrive pas à relire le document")}}
async function basculer(el,calcul,maj){
  const {t,id,c}=el.dataset,r=par(t,+id),nv=calcul(r[c]);
  try{await modifier(t,+id,c,nv,"modification");maj(nv);toast("✓ Enregistré")}catch(e){toast("⚠ Pas enregistré : "+(e&&e.message||e));await recharger()}
}
async function supprimerEleve(id){
  const actions=[];
  for(const n of TABLES){if(n==="Eleves"||n==="Professionnels"||n==="Reglages")continue;const ids=T[n].filter(r=>r.Eleve===id).map(r=>r.id);if(ids.length)actions.push(["BulkRemoveRecord",n,ids])}
  actions.push(["RemoveRecord","Eleves",id]);
  await envoyer(actions);await charger();toast("Élève supprimé");aller("accueil");
}
const aujSec=()=>Math.floor(aujourdhui().getTime()/1000);

async function action(a,el){
  switch(a){
    case"annuler":return annuler();
    case"nouveau":S.nouveau=!S.nouveau;return rendre();
    case"modifier":S.edit=!S.edit;return rendre();
    case"imprimer":try{window.print()}catch(e){toast("Impression bloquée ici : utilise Ctrl+P")}return;
    case"archiver":await modifier("Eleves",S.id,"Statut","Archivé","archivage");await modifier("Eleves",S.id,"Depart",aujSec(),"date de départ");return rendre();
    case"reactiver":await modifier("Eleves",S.id,"Statut","Présent","réactivation");await modifier("Eleves",S.id,"Depart",null,"date de départ");return rendre();
    case"creer-parcours":{const e=par("Eleves",S.id);await ajouter("Parcours",{Eleve:S.id,Annee:S.annee,Classe:e.Classe||""},"parcours");return rendre()}
    case"ajout-suivi":await ajouter("Suivis",{Eleve:S.id,Etat:"Préconisé",Date_preconisation:aujSec()},"suivi");return rendre();
    case"nouveau-pro":S.nouveauPro=!S.nouveauPro;return rendre();
    case"ajout-rencontre":await ajouter("Rencontres",{Eleve:S.id,Date:aujSec(),Type:"Entretien avec les parents",Auteur:lsGet("parcours-auteur","")},"rencontre");return rendre();
    case"ajout-mdph":await ajouter("MDPH",{Eleve:S.id,Date_notification:aujSec()},"notification MDPH");return rendre();
    case"ajout-pai":await ajouter("PAI",{Eleve:S.id,Date:aujSec()},"PAI");return rendre();
    case"tout-deplier":case"tout-replier":["alertes","install","apropos"].forEach(k=>OUT.ouverts[k]=a==="tout-deplier");lsSet("parcours-ui",OUT.ouverts);return rendre();
    case"installer":{
      const j=$("journal");j.hidden=false;j.textContent="";const log=t=>{j.textContent+=t+"\n"};
      el.disabled=true;
      try{await installer(log);await charger();S.pret=true;log("Terminé.")}catch(e){log("⚠ "+(e&&e.message||e)+"\nTouche « Installer » pour réessayer ; envoie-moi une capture de ce message.")}
      el.disabled=false;return;
    }
  }
}

document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-nav],[data-onglet],[data-act],[data-tog],[data-seg],[data-chip],[data-sup],[data-pj]");if(!b)return;
  try{
    if(b.dataset.nav){ev.preventDefault();return aller(b.dataset.nav)}
    if(b.dataset.onglet){ev.preventDefault();return aller(`eleve/${S.id}/${b.dataset.onglet}`)}
    if(b.dataset.act)return await action(b.dataset.act,b);
    if(b.hasAttribute("data-tog"))return basculer(b,v=>!v,nv=>b.setAttribute("aria-pressed",nv));
    if(b.hasAttribute("data-seg"))return basculer(b,v=>v===b.dataset.val?"":b.dataset.val,nv=>b.parentNode.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.val===nv)));
    if(b.hasAttribute("data-chip"))return basculer(b,v=>{const l=liste(v);return ["L",...(l.includes(b.dataset.val)?l.filter(x=>x!==b.dataset.val):[...l,b.dataset.val])]},nv=>b.setAttribute("aria-pressed",nv.includes(b.dataset.val)));
    if(b.dataset.pj){ev.preventDefault();const u=await lienPJ(+b.dataset.pj);window.open(u,"_blank");return}
    if(b.dataset.sup){
      if(!b.dataset.conf){b.dataset.conf="1";b.dataset.txt=b.textContent;b.textContent="Oui, supprimer";setTimeout(()=>{b.dataset.conf="";b.textContent=b.dataset.txt},4000);return}
      const [t,id]=b.dataset.sup.split(":");
      if(t==="Eleves")return await supprimerEleve(+id);
      await supprimer(t,+id);toast("Supprimé (↶ Annuler pour le remettre)");rendre();
    }
  }catch(e){toast("⚠ "+(e&&e.message||e))}
});
document.addEventListener("change",async ev=>{
  const el=ev.target;
  if(el.id==="annee"){S.annee=el.value;return rendre()}
  if(el.dataset&&el.dataset.pjAdd){
    const f=el.files[0];if(!f)return;
    try{toast("Envoi…");const id=await televerser(f);const r=par("Rencontres",+el.dataset.pjAdd);await modifier("Rencontres",r.id,"CR",["L",...liste(r.CR),id],"pièce jointe");await chargerPJ();toast("✓ Fichier joint");rendre()}
    catch(e){toast("⚠ Envoi impossible : "+(e&&e.message||e))}
    return;
  }
  if(el.dataset&&el.dataset.k&&!el.hasAttribute("data-tog")&&!el.hasAttribute("data-seg")&&!el.hasAttribute("data-chip"))sauver(el);
});
document.addEventListener("input",ev=>{
  if(ev.target.id!=="recherche")return;
  S.recherche=ev.target.value;rendre().then(()=>{const r=$("recherche");if(r){r.focus();r.setSelectionRange(r.value.length,r.value.length)}});
});
document.addEventListener("submit",async ev=>{
  ev.preventDefault();const f=ev.target,d=Object.fromEntries(new FormData(f));
  try{
    if(f.dataset.form==="eleve"){const id=await ajouter("Eleves",{Prenom:d.Prenom.trim(),Nom:d.Nom.trim(),Naissance:enSecondes(d.Naissance),Classe:d.Classe.trim(),Statut:"Présent"},"nouvel élève");S.nouveau=false;aller("eleve/"+id)}
    if(f.dataset.form==="pro"){const id=await ajouter("Professionnels",{Type:d.Type.trim(),Nom:d.Nom.trim(),Telephone:d.Telephone,Mail:d.Mail},"professionnel");S.nouveauPro=false;toast("✓ Ajouté à l'annuaire : choisis-le dans la liste");rendre()}
  }catch(e){toast("⚠ "+(e&&e.message||e))}
});
document.addEventListener("keydown",ev=>{
  const typ=/^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName);
  if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==="z"&&!typ){ev.preventDefault();annuler()}
  else if(ev.key==="/"&&!typ&&S.vue==="accueil"){const r=$("recherche");if(r){ev.preventDefault();r.focus()}}
});
document.addEventListener("toggle",ev=>{const s=ev.target.dataset&&ev.target.dataset.sec;if(s){OUT.ouverts[s]=ev.target.open;lsSet("parcours-ui",OUT.ouverts)}},true);
window.addEventListener("popstate",()=>{lireHash();rendre()});
/* Rafraîchissement doux : un collègue a pu modifier le document */
setInterval(()=>{if(!G||!S.pret||document.hidden)return;const a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;recharger()},30000);

(async function(){
  for(const n of TABLES)T[n]=[];
  $("ver").textContent="v"+VERSION;
  G=await chargerGrist();
  if(!G){$("horsgrist").hidden=false;return}
  G.ready({requiredAccess:"full"});
  try{
    const presentes=await tablesPresentes();
    if(TABLES.every(n=>presentes.has(n))){await charger();await chargerPJ();S.pret=true;lireHash()}
    else{S.vue="reglages";OUT.ouverts.install=true}
    rendre();
  }catch(e){$("app").innerHTML=`<div class="carte"><p>Je n'arrive pas à lire le document. Dans le panneau de droite de Grist, mets <b>« Accès complet au document »</b>.</p><p class="aide">${esc(e&&e.message||e)}</p></div>`}
})();
