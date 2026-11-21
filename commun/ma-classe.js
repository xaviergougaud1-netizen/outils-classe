/* Outils de classe partagés · « Ma classe » : la liste d'élèves commune à tous les outils du kit.
   Stockée UNIQUEMENT sur l'appareil (localStorage « kit-classe ») : rien n'est envoyé ni publié.
   Format : {v:1, at, eleves:[{id, prenom, niveau, groupe}]}
   - prenom : unique dans la classe (les évaluations des outils sont rangées par prénom) ;
   - niveau : PS, MS, GS, CP, CE1, CE2, CM1, CM2 ou Autre ;
   - groupe : facultatif (« Groupe bleu », « CM2 b »…) ; sans groupe, l'élève est rangé dans son niveau.
   Les outils lisent la liste avec MaClasse.roster() → {groups:[…], roster:[{name, group, niveau}]}.
   Tout ce qui appelle ce fichier pendant le chargement n'utilise que des fonctions déclarées avec function. */
(function(){
'use strict';
var KEY = 'kit-classe';
var NIVEAUX = ['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', 'Autre'];
function defaut(){ return {v:1, at:0, eleves:[]}; }
function migrer(d){
  var out = defaut();
  if(!d || typeof d !== 'object') return out;
  out.at = d.at || 0;
  out.eleves = (Array.isArray(d.eleves) ? d.eleves : []).filter(function(e){ return e && String(e.prenom || '').trim(); }).map(function(e){
    return {id: e.id || nouvelId(), prenom: String(e.prenom).trim(), niveau: NIVEAUX.indexOf(e.niveau) >= 0 ? e.niveau : 'Autre', groupe: String(e.groupe || '').trim()};
  });
  return out;
}
function nouvelId(){ return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function charger(){
  var brut = null;
  try{ brut = localStorage.getItem(KEY); }catch(e){ return defaut(); }
  if(!brut) return migrer(defaut());
  try{ return migrer(JSON.parse(brut)); }
  catch(e){ try{ localStorage.setItem(KEY + '-secours', brut); }catch(x){} return migrer(defaut()); }
}
function enregistrer(d){
  d.at = Date.now();
  try{ localStorage.setItem(KEY, JSON.stringify(d)); return true; }catch(e){ return false; }
}
function ordreNiveau(n){ var i = NIVEAUX.indexOf(n); return i < 0 ? 99 : i; }
function trier(liste){
  return liste.slice().sort(function(a, b){ return ordreNiveau(a.niveau) - ordreNiveau(b.niveau) || a.prenom.localeCompare(b.prenom, 'fr', {sensitivity:'base'}); });
}
function groupeDe(e){ return e.groupe || e.niveau; }
function roster(){
  var d = charger(), groups = [];
  trier(d.eleves).forEach(function(e){ var g = groupeDe(e); if(groups.indexOf(g) < 0) groups.push(g); });
  var r = d.eleves.map(function(e){ return {name: e.prenom, group: groupeDe(e), niveau: e.niveau}; });
  r.sort(function(x, y){ return x.name.localeCompare(y.name, 'fr', {sensitivity:'base'}); });
  return {groups: groups, roster: r};
}
/* Un prénom déjà pris reçoit un numéro (« Léa 2 ») : chaque élève doit rester reconnaissable dans les outils. */
function prenomLibre(prenom, eleves, saufId){
  var base = prenom.trim(), p = base, n = 2;
  function pris(x){ return eleves.some(function(e){ return e.id !== saufId && e.prenom.toLocaleLowerCase('fr') === x.toLocaleLowerCase('fr'); }); }
  while(pris(p)){ p = base + ' ' + n; n++; }
  return p;
}
/* Quand un prénom change, les évaluations déjà faites dans les outils du kit le suivent (même appareil). */
function renommerEvals(ancien, nouveau){
  try{
    for(var i = 0; i < localStorage.length; i++){
      var k = localStorage.key(i);
      if(!/^kit-evals-[^-]+$/.test(k)) continue;
      var d = JSON.parse(localStorage.getItem(k) || 'null'); if(!d) continue;
      Object.keys(d.marks || {}).forEach(function(c){ var m = d.marks[c]; if(m && m[ancien]){ m[nouveau] = m[ancien]; delete m[ancien]; } });
      if(d.place && d.place[ancien]){ d.place[nouveau] = d.place[ancien]; delete d.place[ancien]; }
      localStorage.setItem(k, JSON.stringify(d));
    }
  }catch(e){}
}
/* Réglage de chaque outil du kit : évaluer ses élèves sur cet appareil (non par défaut). */
function evalsOn(outil){ try{ return localStorage.getItem('kit-evals-on-' + outil) === '1'; }catch(e){ return false; } }
function encartEvals(el, outil){
  if(!el) return;
  var n = charger().eleves.length;
  el.innerHTML = evalsOn(outil)
    ? '<p class="aide kit-evals">👥 Évaluations enregistrées sur cet appareil seulement (' + n + ' élève' + (n > 1 ? 's' : '') + ' dans <a href="../ma-classe/">Ma classe</a>) · <button type="button" class="lien" data-kit="off">Ne plus évaluer ici</button></p>'
    : '<div class="vers-classe"><span>👥 Tu peux aussi évaluer tes élèves (A, AR, ECA, NA). Tout reste sur cet appareil ; les prénoms viennent de <a href="../ma-classe/">Ma classe</a>.</span><button type="button" class="btn petit" data-kit="on">Activer</button></div>';
  el.onclick = function(e){
    var b = e.target.closest('[data-kit]'); if(!b) return;
    try{ localStorage.setItem('kit-evals-on-' + outil, b.dataset.kit === 'on' ? '1' : '0'); }catch(x){}
    location.reload();
  };
}
/* Sauvegarde complète du kit : tout ce que les outils gardent sur l'appareil (élèves, groupes, plans, évaluations, dictées). */
var JOUR = 864e5;
function cleSauvee(k){ return /^(kit-|classe-groupes-v1|classe-plan-v1|flashmath-)/.test(k) && !/^kit-ui-|-secours$|^kit-export-|^kit-avant-import/.test(k); }
function sauvegarde(){
  var cles = {};
  try{ for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if(cleSauvee(k)) cles[k] = localStorage.getItem(k); } }catch(e){}
  return {outil:'outils-de-classe-partages', format:2, at:Date.now(), eleves:charger().eleves, cles:cles};
}
/* Avec les images (photos, pages de PDF) rangées par commun/kit-images.js */
function sauvegardeComplete(){
  var s = sauvegarde();
  if(!window.KitImages) return Promise.resolve(s);
  return window.KitImages.tout().then(function(l){
    return Promise.all(l.map(function(o){ return window.KitImages.versTexte(o.blob).then(function(t){ return {id:o.id, data:t}; }); }));
  }).then(function(imgs){ s.images = imgs; return s; }).catch(function(){ return s; });
}
function restaurerComplet(p){
  var ok = restaurer(p);
  if(!ok || !window.KitImages || !Array.isArray(p.images)) return Promise.resolve(ok);
  return Promise.all(p.images.map(function(o){ return window.KitImages.deTexte(o.data).then(function(b){ return window.KitImages.put(b, o.id); }); }))
    .then(function(){ return true; }).catch(function(){ return ok; });
}
function restaurer(p){
  if(!p || !p.cles) return false;
  try{ localStorage.setItem('kit-avant-import', JSON.stringify(sauvegarde())); }catch(e){}
  try{
    var vieilles = []; for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if(cleSauvee(k)) vieilles.push(k); }
    vieilles.forEach(function(k){ localStorage.removeItem(k); });
    Object.keys(p.cles).forEach(function(k){ if(cleSauvee(k)) localStorage.setItem(k, p.cles[k]); });
    return true;
  }catch(e){ return false; }
}
function lsNum(k){ try{ return +localStorage.getItem(k) || 0; }catch(e){ return 0; } }
function lsPose(k, v){ try{ localStorage.setItem(k, String(v)); }catch(e){} }
function exportFait(){ lsPose('kit-export-at', Date.now()); }
/* Rappel « Pense à exporter » : 30 jours après le dernier export (ou après le premier usage), « Plus tard » = 7 jours. */
function rappelDu(){
  if(!charger().eleves.length) return false;
  var now = Date.now(), depuis = lsNum('kit-export-depuis');
  if(!depuis){ lsPose('kit-export-depuis', now); return false; }
  return now - Math.max(lsNum('kit-export-at'), depuis) > 30 * JOUR && now > lsNum('kit-export-plustard');
}
function plusTard(){ lsPose('kit-export-plustard', Date.now() + 7 * JOUR); }
function dernierExport(){ var t = lsNum('kit-export-at'); return t ? new Date(t) : null; }
window.MaClasse = {KEY: KEY, NIVEAUX: NIVEAUX, charger: charger, enregistrer: enregistrer, migrer: migrer, trier: trier,
  roster: roster, prenomLibre: prenomLibre, nouvelId: nouvelId, renommerEvals: renommerEvals, groupeDe: groupeDe, evalsOn: evalsOn, encartEvals: encartEvals,
  sauvegarde: sauvegarde, restaurer: restaurer, sauvegardeComplete: sauvegardeComplete, restaurerComplet: restaurerComplet, exportFait: exportFait, rappelDu: rappelDu, plusTard: plusTard, dernierExport: dernierExport};
})();
