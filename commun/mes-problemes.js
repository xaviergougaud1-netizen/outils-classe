/* Outils de classe partagés · « Mes problèmes » : l'édition libre des Ateliers de problèmes (problemes/?libre, kit seulement).
   Données sur l'appareil : localStorage « kit-problemes » = {v:1, ateliers:[{id, niv, num, titre, pages:[id d'image], rows:[{n, r, e:[étapes]}]}]}
   Images (photos, pages de PDF) : commun/kit-images.js (IndexedDB). PDF découpé en pages avec pdf.js (chargé seulement à l'import d'un PDF).
   MesPb.versData() rend le format du moteur : {niveau: {numéro: {title, rows:[[n, réponse, [étapes]]], pages}}}. */
(function(){
'use strict';
var KEY = 'kit-problemes', NIVEAUX = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', 'Autre'];
var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
function esc(t){ return String(t == null ? '' : t).replace(/[&<>"']/g, function(c){ return '&#' + c.charCodeAt(0) + ';'; }); }
function charger(){
  try{ var d = JSON.parse(localStorage.getItem(KEY) || 'null'); if(d && Array.isArray(d.ateliers)) return d; }catch(e){ try{ localStorage.setItem(KEY + '-secours', localStorage.getItem(KEY)); }catch(x){} }
  return {v:1, ateliers:[]};
}
function sauver(d){ d.at = Date.now(); try{ localStorage.setItem(KEY, JSON.stringify(d)); return true; }catch(e){ return false; } }
function ordreNiv(n){ var i = NIVEAUX.indexOf(n); return i < 0 ? 99 : i; }
function versData(){
  var out = {};
  charger().ateliers.slice().sort(function(a, b){ return ordreNiv(a.niv) - ordreNiv(b.niv) || a.num - b.num; }).forEach(function(a){
    (out[a.niv] = out[a.niv] || {})[a.num] = {title: a.titre || '', pages: a.pages || [], rows: (a.rows || []).map(function(r){ return [r.n, r.r, r.e || []]; }), id: a.id};
  });
  return out;
}
function numLibre(d, niv, sauf){ var n = 1; while(d.ateliers.some(function(a){ return a.niv === niv && a.num === n && a.id !== sauf; })) n++; return n; }
function toast(t){ var el = document.getElementById('toast'); if(!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove('on'); }, 2600); }
function script(src){ return new Promise(function(ok, ko){ var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.append(s); }); }
/* PDF → une image par page (largeur ~1400 px) */
function pagesPdf(fichier, progres){
  var pret = window.pdfjsLib ? Promise.resolve() : script(PDFJS + 'pdf.min.js');
  return pret.then(function(){
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
    return fichier.arrayBuffer();
  }).then(function(buf){ return window.pdfjsLib.getDocument({data: buf}).promise; }).then(function(pdf){
    var n = Math.min(pdf.numPages, 40), ids = [], i = 0;
    function suivante(){
      if(i >= n) return Promise.resolve(ids);
      i++; if(progres) progres(i, n);
      return pdf.getPage(i).then(function(p){
        var v1 = p.getViewport({scale: 1}), v = p.getViewport({scale: Math.min(3, 1400 / v1.width)});
        var c = document.createElement('canvas'); c.width = v.width; c.height = v.height;
        return p.render({canvasContext: c.getContext('2d'), viewport: v}).promise.then(function(){
          return new Promise(function(ok){ c.toBlob(ok, 'image/webp', .85); });
        });
      }).then(function(b){ return window.KitImages.put(b); }).then(function(id){ ids.push(id); return suivante(); });
    }
    return suivante();
  });
}
var CSS = '.mpb-ov{position:fixed;inset:0;z-index:60;background:rgba(10,20,30,.55);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:12px}'
 + '.mpb{background:var(--surface);color:var(--encre);border-radius:var(--arrondi-l);max-width:760px;width:100%;padding:16px;margin:auto 0}'
 + '.mpb h2{margin:0 0 10px;font-size:1.3rem}.mpb label{display:flex;flex-direction:column;gap:4px;font-size:.85rem;color:var(--encre-douce)}'
 + '.mpb input,.mpb select{border:1px solid var(--trait);border-radius:var(--arrondi-m);background:var(--surface-2);padding:8px 10px;min-height:44px;font:inherit;color:var(--encre)}'
 + '.mpb .lg{display:flex;flex-wrap:wrap;gap:8px;align-items:end}.mpb .lg>label{flex:1;min-width:120px}.mpb .lg>.etroit{flex:0 1 110px;min-width:90px}'
 + '.mpb fieldset{border:1px solid var(--trait);border-radius:var(--arrondi-m);margin:12px 0 0;padding:10px}.mpb legend{font-weight:700;padding:0 6px}'
 + '.mpb .pages{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}.mpb .pg{position:relative;width:110px;border:1px solid var(--trait);border-radius:var(--arrondi-s);overflow:hidden;background:#fff}'
 + '.mpb .pg img{display:block;width:100%;height:130px;object-fit:contain}.mpb .pg span{position:absolute;left:4px;top:4px;background:var(--encre);color:var(--fond);border-radius:6px;padding:0 6px;font-size:.75rem;font-weight:700}'
 + '.mpb .pg .act{display:flex}.mpb .pg .act button{flex:1;min-height:36px;border:0;border-top:1px solid var(--trait);background:var(--surface-2);font-weight:700}'
 + '.mpb .ligne{display:grid;grid-template-columns:56px minmax(0,1fr) minmax(0,1.2fr) 40px;gap:6px;margin-top:6px}.mpb .ligne input{min-width:0}'
 + '@media (max-width:560px){.mpb .ligne{grid-template-columns:52px minmax(0,1fr) 40px}.mpb .ligne .et{grid-column:1/3}}'
 + '.mpb .ligne button,.mpb .pg .act button{cursor:pointer}.mpb .ligne button{border:1px solid var(--trait);border-radius:var(--arrondi-s);background:var(--surface);color:var(--danger);font-weight:700}'
 + '.mpb .bas{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-top:14px}.mpb .note{font-size:.85rem;color:var(--encre-douce);margin:6px 0 0}'
 + '.mpb .arme{background:var(--danger)!important;color:#fff!important;border-color:var(--danger)!important}';
function styles(){ if(!document.getElementById('mpb-css')){ var s = document.createElement('style'); s.id = 'mpb-css'; s.textContent = CSS; document.head.append(s); } }

/* Éditeur d'un atelier (id absent = nouvel atelier). surFin(atelier ou null) après enregistrement ou suppression. */
function editer(id, defauts, surFin){
  styles();
  var d = charger(), orig = d.ateliers.find(function(a){ return a.id === id; });
  var a = orig ? JSON.parse(JSON.stringify(orig)) : {id: 'p' + Date.now().toString(36), niv: (defauts && defauts.niv) || 'CM1', num: 0, titre: '', pages: [], rows: [{n: '1', r: '', e: []}]};
  if(!orig) a.num = numLibre(d, a.niv);
  var ajoutees = [], ov = document.createElement('div'); ov.className = 'mpb-ov';
  function lignes(){ return a.rows.map(function(r, k){
    return '<div class="ligne" data-k="' + k + '"><input value="' + esc(r.n) + '" data-f="n" aria-label="Numéro du problème"><input value="' + esc(r.r) + '" data-f="r" placeholder="Réponse (facultatif)" aria-label="Réponse">'
      + '<input class="et" value="' + esc((r.e || []).join(' / ')) + '" data-f="e" placeholder="Calculs, séparés par /" aria-label="Calculs"><button type="button" data-a="rowdel" aria-label="Retirer">✕</button></div>'; }).join(''); }
  function pages(){ return a.pages.map(function(pid, k){
    return '<div class="pg"><img data-kit-src="kit:' + pid + '" alt="Page ' + (k + 1) + '"><span>' + (k + 1) + '</span><div class="act"><button type="button" data-a="pgg" data-k="' + k + '" aria-label="Avancer"' + (k ? '' : ' disabled') + '>←</button><button type="button" data-a="pgdel" data-k="' + k + '" aria-label="Retirer la page">✕</button></div></div>'; }).join(''); }
  function dessiner(){
    ov.innerHTML = '<div class="mpb" role="dialog" aria-modal="true" aria-label="Atelier"><h2>' + (orig ? 'Modifier l’atelier' : 'Nouvel atelier') + '</h2>'
      + '<div class="lg"><label class="etroit">Niveau<select data-f="niv">' + NIVEAUX.map(function(n){ return '<option' + (n === a.niv ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>'
      + '<label class="etroit">Numéro<input type="number" min="1" max="999" value="' + a.num + '" data-f="num"></label>'
      + '<label>Titre (facultatif)<input value="' + esc(a.titre) + '" data-f="titre" placeholder="Ex. Problèmes à étapes"></label></div>'
      + '<fieldset><legend>Énoncé</legend><div class="pages">' + (a.pages.length ? pages() : '<p class="note">Pas encore d’énoncé : ajoute une photo ou un PDF (tu peux aussi n’en mettre aucun).</p>') + '</div>'
      + '<div class="lg"><label class="btn">📷 Photo<input type="file" accept="image/*" multiple data-a="photo" hidden></label><label class="btn">📄 PDF<input type="file" accept="application/pdf,.pdf" data-a="pdf" hidden></label></div>'
      + '<p class="note">Un PDF est découpé en pages : retire celles qui ne servent pas avec ✕. Les fichiers restent sur cet appareil.</p></fieldset>'
      + '<fieldset><legend>Corrigé (facultatif)</legend>' + lignes() + '<div class="lg" style="margin-top:8px"><button class="btn petit" type="button" data-a="rowadd">＋ Un problème</button></div>'
      + '<p class="note">Sans corrigé, l’atelier sert à projeter ou relire l’énoncé.</p></fieldset>'
      + '<div class="bas">' + (orig ? '<button class="btn" type="button" data-a="suppr" style="color:var(--danger);margin-right:auto">🗑 Supprimer l’atelier</button>' : '') + '<button class="btn" type="button" data-a="annuler">Annuler</button><button class="btn plein" type="button" data-a="ok">Enregistrer</button></div></div>';
  }
  function lire(){
    ov.querySelectorAll('[data-f]').forEach(function(i){
      var l = i.closest('.ligne');
      if(l){ var r = a.rows[+l.dataset.k]; if(!r) return; r[i.dataset.f] = i.dataset.f === 'e' ? i.value.split('/').map(function(x){ return x.trim(); }).filter(Boolean) : i.value.trim(); }
      else if(i.dataset.f === 'num') a.num = Math.max(1, +i.value || 1);
      else a[i.dataset.f] = i.value.trim ? i.value.trim() : i.value;
    });
  }
  /* Ferme, puis lance « apres » une fois le retour d'historique fait (sinon la page relirait l'ancienne adresse après coup). */
  function fermer(apres){ ov.remove(); document.removeEventListener('keydown', touche);
    if(history.state && history.state.mpb){ ov._viaRetour = true; if(apres) addEventListener('popstate', function une(){ removeEventListener('popstate', une); setTimeout(apres, 0); }); history.back(); }
    else if(apres) apres(); }
  function annuler(){ ajoutees.forEach(function(pid){ window.KitImages.del(pid); }); fermer(); }
  function touche(e){ if(e.key === 'Escape') annuler(); }
  ov.addEventListener('click', function(e){
    var b = e.target.closest('[data-a]'); if(!b || b.tagName === 'INPUT') return;
    lire(); var k = +b.dataset.k;
    switch(b.dataset.a){
      case 'rowadd': a.rows.push({n: String(a.rows.length + 1), r: '', e: []}); dessiner(); var ls = ov.querySelectorAll('.ligne [data-f="r"]'); if(ls.length) ls[ls.length - 1].focus(); break;
      case 'rowdel': a.rows.splice(+b.closest('.ligne').dataset.k, 1); dessiner(); break;
      case 'pgdel': a.pages.splice(k, 1); dessiner(); break;
      case 'pgg': var t = a.pages[k]; a.pages[k] = a.pages[k - 1]; a.pages[k - 1] = t; dessiner(); break;
      case 'annuler': annuler(); break;
      case 'suppr':
        if(!b.classList.contains('arme')){ b.classList.add('arme'); b.textContent = 'Sûr ? Touche encore'; setTimeout(function(){ b.classList.remove('arme'); b.textContent = '🗑 Supprimer l’atelier'; }, 3500); return; }
        d = charger(); d.ateliers = d.ateliers.filter(function(x){ return x.id !== a.id; }); sauver(d);
        (orig.pages || []).concat(ajoutees).forEach(function(pid){ window.KitImages.del(pid); });
        fermer(function(){ toast('Atelier supprimé'); if(surFin) surFin(null); }); break;
      case 'ok':
        d = charger();
        if(d.ateliers.some(function(x){ return x.niv === a.niv && x.num === a.num && x.id !== a.id; })){ toast('L’atelier ' + a.num + ' existe déjà en ' + a.niv + ' : choisis un autre numéro'); return; }
        a.rows = a.rows.filter(function(r){ return r.r || (r.e && r.e.length); });
        var avant = orig ? orig.pages || [] : [];
        avant.forEach(function(pid){ if(a.pages.indexOf(pid) < 0) window.KitImages.del(pid); });
        ajoutees.forEach(function(pid){ if(a.pages.indexOf(pid) < 0) window.KitImages.del(pid); });
        var i = d.ateliers.findIndex(function(x){ return x.id === a.id; }); if(i >= 0) d.ateliers[i] = a; else d.ateliers.push(a);
        if(!sauver(d)){ toast('Enregistrement impossible : stockage plein ?'); return; }
        fermer(function(){ toast('Atelier enregistré'); if(surFin) surFin(a); }); break;
    }
  });
  ov.addEventListener('change', function(e){
    var i = e.target;
    if(i.dataset.f === 'niv' && !orig){ lire(); a.num = numLibre(charger(), a.niv, a.id); dessiner(); return; }
    if(i.dataset.a === 'photo' && i.files.length){ lire(); var fs = [].slice.call(i.files); toast('Photo en cours…');
      Promise.all(fs.map(function(f){ return window.KitImages.reduire(f).then(function(b){ return window.KitImages.put(b); }); }))
        .then(function(ids){ ajoutees = ajoutees.concat(ids); a.pages = a.pages.concat(ids); dessiner(); toast(ids.length > 1 ? ids.length + ' photos ajoutées' : 'Photo ajoutée'); })
        .catch(function(){ toast('Photo non enregistrée. Réessaie avec une autre image.'); }); }
    if(i.dataset.a === 'pdf' && i.files[0]){ lire(); toast('Lecture du PDF…');
      pagesPdf(i.files[0], function(p, n){ toast('Page ' + p + ' sur ' + n + '…'); })
        .then(function(ids){ ajoutees = ajoutees.concat(ids); a.pages = a.pages.concat(ids); dessiner(); toast(ids.length + ' page' + (ids.length > 1 ? 's' : '') + ' ajoutée' + (ids.length > 1 ? 's' : '')); })
        .catch(function(){ toast('PDF illisible ou connexion absente (la lecture des PDF demande Internet la première fois).'); }); }
  });
  dessiner(); document.body.append(ov); document.addEventListener('keydown', touche);
  history.pushState({mpb: 1}, '');
  addEventListener('popstate', function retour(){ removeEventListener('popstate', retour); if(!ov._viaRetour && ov.isConnected){ ajoutees.forEach(function(pid){ window.KitImages.del(pid); }); ov.remove(); document.removeEventListener('keydown', touche); } });
  setTimeout(function(){ var f = ov.querySelector('[data-f="titre"]'); if(f) f.focus(); }, 60);
}
/* Partage entre collègues : un fichier avec les ateliers et leurs images */
function partager(){
  var d = charger();
  if(!d.ateliers.length){ toast('Aucun atelier à partager'); return Promise.resolve(); }
  toast('Préparation du fichier…');
  return Promise.all(d.ateliers.map(function(a){
    return Promise.all((a.pages || []).map(function(pid){ return window.KitImages.get(pid).then(function(b){ return b ? window.KitImages.versTexte(b) : null; }); }))
      .then(function(imgs){ return {niv: a.niv, num: a.num, titre: a.titre, rows: a.rows, images: imgs.filter(Boolean)}; });
  })).then(function(L){
    var el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([JSON.stringify({outil: 'mes-problemes', ateliers: L})], {type: 'application/json'}));
    el.download = 'mes-problemes.json'; document.body.append(el); el.click(); el.remove(); setTimeout(function(){ URL.revokeObjectURL(el.href); }, 4000);
    toast('Fichier créé : envoie-le à ton collègue');
  });
}
function importer(fichier){
  return fichier.text().then(function(t){
    var p = JSON.parse(t), L = p && Array.isArray(p.ateliers) ? p.ateliers : [];
    if(!L.length) throw new Error('vide');
    var d = charger();
    return L.reduce(function(chaine, x){
      return chaine.then(function(){
        return Promise.all((x.images || []).map(function(u){ return window.KitImages.deTexte(u).then(function(b){ return window.KitImages.put(b); }); })).then(function(ids){
          var niv = NIVEAUX.indexOf(x.niv) >= 0 ? x.niv : 'Autre', num = +x.num || 1;
          if(d.ateliers.some(function(a){ return a.niv === niv && a.num === num; })) num = numLibre(d, niv);
          d.ateliers.push({id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), niv: niv, num: num, titre: String(x.titre || ''), pages: ids,
            rows: (Array.isArray(x.rows) ? x.rows : []).map(function(r){ return {n: String(r.n || ''), r: String(r.r || ''), e: (r.e || []).map(String)}; })});
        });
      });
    }, Promise.resolve()).then(function(){ sauver(d); return L.length; });
  });
}
window.MesPb = {charger: charger, versData: versData, editer: editer, partager: partager, importer: importer, NIVEAUX: NIVEAUX};
})();
