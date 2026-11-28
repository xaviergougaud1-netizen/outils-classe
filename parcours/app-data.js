/* Parcours élève : couche données (lecture / écriture Grist), dates, annulation, installation.
   Aucune donnée n'est conservée ici : tout vient du document Grist. */
let G=null;                       // API Grist
const TABLES=["Eleves","Professionnels","Parcours","Suivis","Rencontres","MDPH","PAI","Reglages"];
const T={};                       // T.Eleves = [{id, Nom, ...}]
let ATT={};                       // pièces jointes : id -> nom de fichier
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();

/* ---------- Dates : Grist stocke les dates en secondes (minuit UTC) ---------- */
function versDate(v){if(v==null||v===""||v===0)return null;if(v instanceof Date)return v;if(typeof v==="number")return new Date(v*1000);const d=new Date(v);return isNaN(d)?null:d}
const jour=d=>d?d.toISOString().slice(0,10):"";                 // yyyy-mm-dd
const enSecondes=s=>s?Math.floor(Date.parse(s+"T00:00:00Z")/1000):null;
const fr=v=>{const d=versDate(v);return d?d.toLocaleDateString("fr-FR",{timeZone:"UTC"}):""};
const aujourdhui=()=>{const n=new Date();return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate()))};
function plusMois(d,n){const r=new Date(d);r.setUTCMonth(r.getUTCMonth()+n);return r}
function anneeScolaire(d){d=d||aujourdhui();const a=d.getUTCFullYear();return d.getUTCMonth()>=8?`${a}-${a+1}`:`${a-1}-${a}`}
function age(v){const n=versDate(v);if(!n)return "";const t=aujourdhui();let a=t.getUTCFullYear()-n.getUTCFullYear();if(t.getUTCMonth()<n.getUTCMonth()||(t.getUTCMonth()===n.getUTCMonth()&&t.getUTCDate()<n.getUTCDate()))a--;return a+" ans"}
const liste=v=>Array.isArray(v)?(v[0]==="L"?v.slice(1):v):[];

/* ---------- Lecture ---------- */
function lignes(raw){const ids=raw.id||[];return ids.map((id,i)=>{const o={id};for(const k of Object.keys(raw))if(k!=="id"&&k!=="manualSort")o[k]=raw[k][i];return o})}
async function charger(){
  for(const n of TABLES){T[n]=lignes(await G.docApi.fetchTable(n))}
}
async function chargerPJ(){
  try{const r=await G.docApi.fetchTable("_grist_Attachments");ATT={};(r.id||[]).forEach((id,i)=>ATT[id]=r.fileName?r.fileName[i]:("fichier "+id))}catch(e){}
}
const par=(n,id)=>(T[n]||[]).find(r=>r.id===id);
const deEleve=(n,id)=>(T[n]||[]).filter(r=>r.Eleve===id);
const reglage=(cle,def)=>{const r=(T.Reglages||[]).find(x=>x.Cle===cle);return r&&r.Valeur!==""&&r.Valeur!=null?r.Valeur:def};
const reglageNb=(cle,def)=>{const n=parseFloat(reglage(cle,def));return isNaN(n)?def:n};

/* ---------- Écriture, avec annulation (Ctrl+Z) ---------- */
const PILE=[];
function majLocal(table,id,col,val){const r=par(table,id);if(r)r[col]=val}
async function envoyer(actions){return G.docApi.applyUserActions(actions)}
async function modifier(table,id,col,val,etiquette){
  const r=par(table,id);const ancien=r?r[col]:null;
  majLocal(table,id,col,val);
  await envoyer([["UpdateRecord",table,id,{[col]:val}]]);
  PILE.push({label:etiquette||"modification",undo:async()=>{majLocal(table,id,col,ancien);await envoyer([["UpdateRecord",table,id,{[col]:ancien}]])}});
  majBoutonAnnuler();
}
async function ajouter(table,valeurs,etiquette){
  const res=await envoyer([["AddRecord",table,null,valeurs]]);
  let id=res&&res.retValues&&res.retValues[0];
  if(id==null){await charger();id=Math.max(...T[table].map(r=>r.id))}else{T[table].push({id,...valeurs})}
  PILE.push({label:etiquette||"ajout",undo:async()=>{await envoyer([["RemoveRecord",table,id]]);T[table]=T[table].filter(r=>r.id!==id)}});
  majBoutonAnnuler();return id;
}
async function supprimer(table,id,etiquette){
  const r=par(table,id);const copie={...r};delete copie.id;
  await envoyer([["RemoveRecord",table,id]]);T[table]=T[table].filter(x=>x.id!==id);
  PILE.push({label:etiquette||"suppression",undo:async()=>{await envoyer([["AddRecord",table,id,copie]]);T[table].push({id,...copie})}});
  majBoutonAnnuler();
}
async function annuler(){
  const a=PILE.pop();if(!a){toast("Rien à annuler");return}
  try{await a.undo();toast("↶ Annulé : "+a.label);majBoutonAnnuler();rendre()}catch(e){toast("Annulation impossible : "+(e&&e.message||e))}
}

/* ---------- Pièces jointes (REST de Grist) ---------- */
async function jeton(){return G.docApi.getAccessToken({readOnly:false})}
async function televerser(fichier){
  const j=await jeton();const fd=new FormData();fd.append("upload",fichier,fichier.name);
  const r=await fetch(`${j.baseUrl}/attachments?auth=${encodeURIComponent(j.token)}`,{method:"POST",body:fd});
  if(!r.ok)throw new Error("Envoi refusé ("+r.status+")");
  const ids=await r.json();return ids[0];
}
async function lienPJ(id){const j=await jeton();return `${j.baseUrl}/attachments/${id}/download?auth=${encodeURIComponent(j.token)}`}

/* ---------- Installation du document (tables, listes, annuaire) ---------- */
function chargerScript(src){return new Promise((ok,ko)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
async function chargerGrist(){
  if(window.grist)return window.grist;
  for(const src of ["https://grist.numerique.gouv.fr/grist-plugin-api.js","https://docs.getgrist.com/grist-plugin-api.js"]){
    try{await chargerScript(src);if(window.grist)return window.grist}catch(e){}
  }
  return null;
}
const colonne=c=>{const o={id:c.id,type:c.type,label:c.label,isFormula:false};if(c.choices)o.widgetOptions=JSON.stringify({choices:LISTES[c.choices]});return o};
async function tablesPresentes(){const m=await G.docApi.fetchTable("_grist_Tables");return new Set(m.tableId)}
async function installer(log){
  const presentes=await tablesPresentes();
  for(const t of SCHEMA){
    if(presentes.has(t.id)){log(`• ${t.id} : déjà là, je n'y touche pas.`);continue}
    await envoyer([["AddTable",t.id,t.cols.map(colonne)]]);log(`✓ ${t.id} : créée (${t.cols.length} colonnes).`);
  }
  if(!presentes.has("Reglages")){
    await envoyer([["BulkAddRecord","Reglages",REGLAGES_DEFAUT.map(()=>null),{Cle:REGLAGES_DEFAUT.map(r=>r[0]),Valeur:REGLAGES_DEFAUT.map(r=>r[1])}]]);log(`✓ Reglages : ${REGLAGES_DEFAUT.length} réglages de départ.`);
  }
  if(!presentes.has("Professionnels")){
    try{
      await chargerScript("../orienter/donnees.js");
      const type=id=>{const p=PROS.find(x=>x.id===id);return p?p.nom:id};const L=CONTACTS_DEFAUT,col=f=>L.map(f);
      await envoyer([["BulkAddRecord","Professionnels",L.map(()=>null),{Type:col(c=>type(c.pro)),Nom:col(c=>c.nom||""),Adresse:col(c=>c.adresse||""),Telephone:col(c=>c.tel||""),Mail:col(c=>c.mail||""),Verifie:col(c=>c.verifie||"")}]]);
      log(`✓ Professionnels : ${L.length} contacts repris de Boussole élève.`);
    }catch(e){log("• Annuaire : non rempli ("+(e&&e.message||e)+"). Tu pourras ajouter les professionnels à la main.")}
  }
  await afficherNoms(log);
}
async function afficherNoms(log){
  try{
    const Tb=await G.docApi.fetchTable("_grist_Tables"),C=await G.docApi.fetchTable("_grist_Tables_column");
    const tid=n=>Tb.id[Tb.tableId.indexOf(n)];
    const ref=(table,col)=>{const p=tid(table);for(let i=0;i<C.id.length;i++)if(C.parentId[i]===p&&C.colId[i]===col)return C.id[i];return null};
    let n=0;
    for(const t of SCHEMA)for(const c of t.cols){
      if(!c.visible)continue;
      const r=ref(t.id,c.id),v=ref(c.type.split(":")[1],c.visible),i=C.id.indexOf(r);
      if(r==null||v==null||(C.visibleCol&&C.visibleCol[i]===v))continue;
      await envoyer([["UpdateRecord","_grist_Tables_column",r,{visibleCol:v}],["SetDisplayFormula",t.id,null,r,`$${c.id}.${c.visible}`]]);n++;
    }
    if(n)log(`✓ Liens : le nom s'affiche dans ${n} colonne${n>1?"s":""} de lien.`);
  }catch(e){log("• Liens : affichage des noms non réglé ("+(e&&e.message||e)+"). Sans gravité.")}
}
