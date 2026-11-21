/* Outils de classe partagés · images du kit (photos, pages de PDF) rangées sur l'appareil (IndexedDB « kit-images », magasin « img »).
   - KitImages.put(blob) → id ; get(id) → Blob ; del(id) ; tout() → [{id, blob, at}] ; url(id) → Promise<adresse locale>.
   - Toute image de la page dont la source est « kit:<id> » (ou data-kit-src="kit:<id>", sans requête inutile) est affichée automatiquement (observateur), même ajoutée plus tard.
   - KitImages.assets imite la capacité « assets » de Claude (upload / delete) pour les pages venues des artéfacts (Flash maths).
   - KitImages.reduire(fichier, max) : photo réduite (WebP, 1600 px par défaut) avant de la ranger. */
(function(){
'use strict';
var BASE = 'kit-images', MAG = 'img', ouverte = null, urls = {};
function ouvrir(){
  if(ouverte) return ouverte;
  ouverte = new Promise(function(ok, ko){
    var r = indexedDB.open(BASE, 1);
    r.onupgradeneeded = function(){ r.result.createObjectStore(MAG, {keyPath:'id'}); };
    r.onsuccess = function(){ ok(r.result); };
    r.onerror = function(){ ko(r.error); };
  });
  return ouverte;
}
function tx(mode, f){
  return ouvrir().then(function(db){ return new Promise(function(ok, ko){
    var t = db.transaction(MAG, mode), s = t.objectStore(MAG), res = f(s);
    t.oncomplete = function(){ ok(res && 'result' in res ? res.result : res); };
    t.onerror = t.onabort = function(){ ko(t.error || new Error('Stockage des images impossible')); };
  }); });
}
function nouvelId(){ return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function put(blob, id){ id = id || nouvelId(); return tx('readwrite', function(s){ s.put({id:id, blob:blob, at:Date.now()}); }).then(function(){ return id; }); }
function get(id){ return tx('readonly', function(s){ return s.get(id); }).then(function(o){ return o ? o.blob : null; }); }
function del(id){ if(urls[id]){ URL.revokeObjectURL(urls[id]); delete urls[id]; } return tx('readwrite', function(s){ s.delete(id); }); }
function tout(){ return tx('readonly', function(s){ return s.getAll(); }).then(function(l){ return l || []; }); }
function url(id){
  if(urls[id]) return Promise.resolve(urls[id]);
  return get(id).then(function(b){ if(!b) return ''; urls[id] = URL.createObjectURL(b); return urls[id]; });
}
function afficher(img){
  var s = img.getAttribute('data-kit-src') || img.getAttribute('src') || '';
  if(s.indexOf('kit:') !== 0 || img.dataset.kitImg === s) return;
  img.dataset.kitImg = s;
  img.removeAttribute('src');
  url(s.slice(4)).then(function(u){ if(img.dataset.kitImg === s){ if(u) img.src = u; else img.alt = 'Image introuvable sur cet appareil'; } });
}
function parcourir(racine){ (racine.querySelectorAll ? racine.querySelectorAll('img[src^="kit:"],img[data-kit-src]') : []).forEach(afficher); if(racine.tagName === 'IMG') afficher(racine); }
function surveiller(){
  parcourir(document);
  new MutationObserver(function(ms){ ms.forEach(function(m){
    if(m.type === 'attributes') afficher(m.target);
    else m.addedNodes.forEach(function(n){ if(n.nodeType === 1) parcourir(n); });
  }); }).observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:['src','data-kit-src']});
}
function reduire(fichier, max){
  max = max || 1600;
  return createImageBitmap(fichier).then(function(bmp){
    var r = Math.min(1, max / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
    c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise(function(ok){ c.toBlob(function(b){ ok(b || fichier); }, 'image/webp', .85); });
  });
}
function versTexte(blob){ return new Promise(function(ok, ko){ var f = new FileReader(); f.onload = function(){ ok(f.result); }; f.onerror = ko; f.readAsDataURL(blob); }); }
function deTexte(t){ return fetch(t).then(function(r){ return r.blob(); }); }
var assets = {
  upload: function(blob){ return put(blob).then(function(id){ return {id:id, url:'kit:' + id}; }); },
  delete: function(id){ return del(id); }
};
window.KitImages = {put:put, get:get, del:del, tout:tout, url:url, reduire:reduire, versTexte:versTexte, deTexte:deTexte, assets:assets};
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', surveiller); else surveiller();
})();
