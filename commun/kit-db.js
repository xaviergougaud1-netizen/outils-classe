/* Outils de classe partagés · « base » de l'appareil pour les pages venues de « Classe » (Groupes, Plan de classe…).
   Seulement dans le kit (github.io ou ?mode=app) : imite window.claude.use("db") et use("downloads") avec le stockage du navigateur,
   pour que la même page tourne dans Classe (vraie base) et chez les collègues (rien n'est envoyé).
   - Documents : localStorage « kit-db:<chemin> » (ex. kit-db:lecture/groupes).
   - « lecture/main » (élèves) n'est pas stocké : il est fabriqué à partir de « Ma classe » (commun/ma-classe.js, à charger avant),
     au format de Classe {state:{students:[{id, n, g, p}]}} ; on n'y écrit jamais.
   - Téléchargements : lien de téléchargement classique (Blob, texte ou data URL). */
(function(){
'use strict';
if(!(/github\.io$/.test(location.hostname) || /[?&]mode=app/.test(location.search))) return;
if(window.claude && window.claude.use) return;
var P = 'kit-db:', ecoutes = {};
function eleves(){
  var d = window.MaClasse ? window.MaClasse.charger() : {eleves:[]};
  return {state:{students: d.eleves.map(function(e){ return {id:e.id, n:e.prenom, g:e.niveau, gr:e.groupe || ''}; })}, kit:true, at:d.at};
}
function lire(chemin){
  if(chemin === 'lecture/main') return eleves();
  try{ var t = localStorage.getItem(P + chemin); return t ? JSON.parse(t) : undefined; }catch(e){ return undefined; }
}
function copie(v){ return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }
function instantane(chemin){
  var v = lire(chemin);
  return {exists: v !== undefined, id: chemin.split('/').pop(), ref: {path: chemin}, metadata: {hasPendingWrites: false},
    data: function(){ return copie(v); }};
}
function prevenir(chemin){
  (ecoutes[chemin] || []).slice().forEach(function(f){ setTimeout(function(){ try{ f(instantane(chemin)); }catch(e){ console.error(e); } }, 0); });
}
function ecrire(chemin, v){
  if(chemin === 'lecture/main') return Promise.resolve();
  try{
    if(v === undefined) localStorage.removeItem(P + chemin);
    else localStorage.setItem(P + chemin, JSON.stringify(v));
  }catch(e){ return Promise.reject(new Error('Stockage plein sur cet appareil')); }
  prevenir(chemin);
  return Promise.resolve();
}
function fusion(a, b){
  var o = Object.assign({}, a || {});
  Object.keys(b || {}).forEach(function(k){
    var v = b[k];
    if(v && typeof v === 'object' && v.__delete__) delete o[k];
    else o[k] = v;
  });
  return o;
}
function doc(chemin){
  return {
    path: chemin, id: chemin.split('/').pop(),
    get: function(){ return Promise.resolve(instantane(chemin)); },
    set: function(v, opts){ return ecrire(chemin, opts && opts.merge ? fusion(lire(chemin), copie(v)) : copie(v)); },
    update: function(v){ var a = lire(chemin); return a === undefined ? Promise.reject(new Error('Document absent')) : ecrire(chemin, fusion(a, copie(v))); },
    delete: function(){ return ecrire(chemin, undefined); },
    onSnapshot: function(f){
      (ecoutes[chemin] = ecoutes[chemin] || []).push(f);
      setTimeout(function(){ try{ f(instantane(chemin)); }catch(e){ console.error(e); } }, 0);
      return function(){ ecoutes[chemin] = (ecoutes[chemin] || []).filter(function(x){ return x !== f; }); };
    }
  };
}
function collection(chemin){
  return {
    path: chemin,
    doc: function(id){ return doc(chemin + '/' + id); },
    get: function(){
      var docs = [];
      try{
        for(var i = 0; i < localStorage.length; i++){
          var k = localStorage.key(i);
          if(k.indexOf(P + chemin + '/') !== 0) continue;
          var reste = k.slice((P + chemin + '/').length);
          if(reste.indexOf('/') < 0) docs.push(instantane(chemin + '/' + reste));
        }
      }catch(e){}
      return Promise.resolve({docs: docs, size: docs.length, empty: !docs.length, forEach: function(f){ docs.forEach(f); }});
    }
  };
}
var db = {doc: doc, collection: collection, kit: true};
var downloads = {save: function(o){
  try{
    var d = o.data, blob = d instanceof Blob ? d
      : typeof d === 'string' && /^data:/.test(d) ? null
      : new Blob([typeof d === 'string' ? d : JSON.stringify(d)], {type: /\.json$/i.test(o.filename) ? 'application/json' : 'text/plain'});
    var a = document.createElement('a');
    a.href = blob ? URL.createObjectURL(blob) : d; a.download = o.filename || 'fichier';
    document.body.append(a); a.click(); a.remove();
    if(blob) setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
    return Promise.resolve();
  }catch(e){ return Promise.reject(e); }
}};
/* Une autre page du kit a changé la liste d'élèves ou un document (autre onglet) : on prévient les pages abonnées. */
addEventListener('storage', function(e){
  if(!e.key) return;
  if(e.key === 'kit-classe') prevenir('lecture/main');
  else if(e.key.indexOf(P) === 0) prevenir(e.key.slice(P.length));
});
window.claude = {use: function(nom){ return Promise.resolve(nom === 'db' ? db : nom === 'downloads' ? downloads : null); }, kit: true};
})();
