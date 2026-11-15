/* Outils de classe · évaluations des élèves (seulement quand la page est ouverte dans « Classe »).
   Élèves : base de Classe, maths/core.students {groupe: [prénoms]} (on ne les modifie pas).
   Évaluations : base de Classe, evals/<outil> =
     {v:1, appV, at, marks:{clé:{prénom:{m:'A'|'AR'|'ECA'|'NA'|null, at}}}, place:{prénom:{v:'CM1'|'CM2'|'both', at}}}
   Chaque case est datée : à l'enregistrement on relit la base et on fusionne case par case (la plus récente gagne),
   donc deux appareils ne s'écrasent jamais. m:null = case effacée (gardée datée pour que l'effacement se propage).
   Copie de secours sur l'appareil : localStorage « evals-<outil> ». */
(function(){
'use strict';
var MARKS = {A:'Acquis', AR:'À renforcer', ECA:'En cours d’acquisition', NA:'Non acquis'};
var PDF_COLORS = {A:'#1F5C40', AR:'#8FCB7C', ECA:'#F5C842', NA:'#B42318'};
var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/></svg>';

function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function later(a, b){ return b && (!a || (b.at||0) > (a.at||0)); }
function merge(a, b){
  var out = {v:1, marks:{}, place:{}};
  [a, b].forEach(function(src){
    if(!src) return;
    var M = src.marks || {}, P = src.place || {};
    Object.keys(M).forEach(function(k){
      var o = out.marks[k] || (out.marks[k] = {});
      Object.keys(M[k] || {}).forEach(function(n){ if(later(o[n], M[k][n])) o[n] = M[k][n]; });
    });
    Object.keys(P).forEach(function(n){ if(later(out.place[n], P[n])) out.place[n] = P[n]; });
  });
  return out;
}
function toast(t){
  var el = document.getElementById('toast');
  if(!el){ el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role','status'); document.body.append(el); }
  el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove('on'); }, 2400);
}

/* ---------- Le magasin d'évaluations d'un outil ---------- */
function Store(name, appV){
  this.name = name; this.appV = appV; this.LS = 'evals-' + name;
  this.doc = {v:1, marks:{}, place:{}}; this.roster = []; this.groups = [];
  this.status = 'att'; this.undoS = []; this.redoS = []; this.subs = []; this.timer = null; this.saving = false; this.again = false;
  try{ var c = JSON.parse(localStorage.getItem(this.LS) || 'null'); if(c) this.doc = merge(this.doc, c); }catch(e){}
}
Store.prototype.init = async function(){
  var self = this;
  var db = window.claude && window.claude.use ? await window.claude.use('db') : null;
  if(!db) throw new Error('Base indisponible');
  this.db = db; this.ref = db.doc('evals/' + this.name);
  var core = await db.doc('maths/core').get();
  var st = core.exists ? (core.data().students || {}) : {};
  this.groups = Object.keys(st);
  this.roster = [];
  this.groups.forEach(function(g){ (st[g] || []).forEach(function(n){ if(!self.roster.some(function(p){ return p.name === n; })) self.roster.push({name:n, group:g}); }); });
  var sn = await this.ref.get();
  if(sn.exists) this.doc = merge(this.doc, sn.data());
  this.status = 'ok';
  if(this.ref.onSnapshot) this.ref.onSnapshot(function(s){ if(s.exists){ self.doc = merge(self.doc, s.data()); self.emit(); } }, function(){});
  if(this.pending()) this.save();
  this.emit();
};
Store.prototype.pending = function(){ try{ return !!localStorage.getItem(this.LS + '-dirty'); }catch(e){ return false; } };
Store.prototype.on = function(f){ this.subs.push(f); };
Store.prototype.emit = function(){ this.subs.forEach(function(f){ try{ f(); }catch(e){ console.error(e); } }); };
Store.prototype.get = function(key, name){ var e = (this.doc.marks[key] || {})[name]; return e && e.m || null; };
Store.prototype.last = function(keys, name){ /* la case la plus récente parmi plusieurs clés : {key, m, at} */
  var best = null, self = this;
  keys.forEach(function(k){ var e = (self.doc.marks[k] || {})[name]; if(e && e.m && (!best || e.at > best.at)) best = {key:k, m:e.m, at:e.at}; });
  return best;
};
Store.prototype.set = function(key, name, m, quiet){
  var prev = this.get(key, name);
  if(prev === m) return;
  (this.doc.marks[key] || (this.doc.marks[key] = {}))[name] = {m:m, at:Date.now()};
  if(!quiet){ this.undoS.push({key:key, name:name, prev:prev, next:m}); this.redoS = []; }
  this.backup(); this.emit(); this.save();
};
/* Plusieurs cases d'un coup (ex. ceintures précédentes validées en même temps) : une seule étape à annuler */
Store.prototype.setMany = function(list, quiet){
  var self = this, now = Date.now(), done = [];
  list.forEach(function(c){
    var prev = self.get(c.key, c.name);
    if(prev === c.m) return;
    (self.doc.marks[c.key] || (self.doc.marks[c.key] = {}))[c.name] = {m:c.m, at:now};
    done.push({key:c.key, name:c.name, prev:prev, next:c.m});
  });
  if(!done.length) return;
  if(!quiet){ this.undoS.push(done.length === 1 ? done[0] : {many:done, name:done[0].name}); this.redoS = []; }
  this.backup(); this.emit(); this.save();
};
Store.prototype.undo = function(){
  var u = this.undoS.pop(); if(!u){ toast('Rien à annuler'); return; }
  this.redoS.push(u);
  this.setMany((u.many || [u]).map(function(c){ return {key:c.key, name:c.name, m:c.prev}; }), true);
  toast('Annulé : ' + u.name + (u.many ? ' (' + u.many.length + ' cases)' : u.prev ? ' → ' + u.prev : ' → vide'));
};
Store.prototype.redo = function(){
  var u = this.redoS.pop(); if(!u){ toast('Rien à rétablir'); return; }
  this.undoS.push(u);
  this.setMany((u.many || [u]).map(function(c){ return {key:c.key, name:c.name, m:c.next}; }), true);
  toast('Rétabli : ' + u.name);
};
Store.prototype.placeOf = function(p){ var e = this.doc.place[p.name]; return e && e.v || (/^CM1/.test(p.group) ? 'CM1' : /^CM2/.test(p.group) ? 'CM2' : 'both'); };
Store.prototype.setPlace = function(name, v){ this.doc.place[name] = {v:v, at:Date.now()}; this.backup(); this.emit(); this.save(); };
Store.prototype.backup = function(){ try{ localStorage.setItem(this.LS, JSON.stringify(this.doc)); localStorage.setItem(this.LS + '-dirty', '1'); }catch(e){} };
Store.prototype.save = function(){
  var self = this; clearTimeout(this.timer);
  this.status = 'att'; this.emit();
  this.timer = setTimeout(function(){ self.flush(); }, 600);
};
Store.prototype.flush = async function(){
  if(!this.ref) return;
  if(this.saving){ this.again = true; return; }
  this.saving = true;
  try{
    var sn = await this.ref.get();
    this.doc = merge(sn.exists ? sn.data() : null, this.doc);
    await this.ref.set({v:1, appV:this.appV, at:Date.now(), marks:this.doc.marks, place:this.doc.place});
    try{ localStorage.removeItem(this.LS + '-dirty'); localStorage.setItem(this.LS, JSON.stringify(this.doc)); }catch(e){}
    this.status = 'ok'; this.savedAt = new Date();
  }catch(e){ this.status = 'err'; }
  this.saving = false; this.emit();
  if(this.again){ this.again = false; this.flush(); }
};

/* ---------- Le panneau « Évaluations » ----------
   opts : {store, key(), pupils() -> [{name, group, info}], filters: bool, places: bool, pdf(),
           onMark(clé, prénom, code ou null) : remplace l'enregistrement simple (facultatif),
           extra() -> HTML de boutons en plus (data-ev="x"), onExtra(bouton) (facultatifs) } */
function Panel(el, opts){
  var S = opts.store, LSo = 'evals-open-' + S.name, LSf = 'evals-filtre-' + S.name, filt = 'tous';
  try{ filt = localStorage.getItem(LSf) || 'tous'; }catch(e){}
  function list(){
    var all = opts.pupils();
    return opts.filters && filt !== 'tous' ? all.filter(function(p){ return p.group === filt; }) : all;
  }
  function render(){
    var key = opts.key(), L = list();
    if(!key){ el.hidden = true; return; }
    el.hidden = false;
    var done = L.filter(function(p){ return S.get(key, p.name); }).length;
    var open = true; try{ open = localStorage.getItem(LSo) !== '0'; }catch(e){}
    var st = S.status === 'ok' ? '<span class="sync">Enregistré</span>' : S.status === 'err' ? '<span class="sync err">Non enregistré</span>' : '<span class="sync att">Enregistrement…</span>';
    var f = opts.filters && S.groups.length > 1 ? '<div class="seg" role="group" aria-label="Groupe">' + ['tous'].concat(S.groups).map(function(g){
      return '<button type="button" data-ev="filtre" data-g="' + esc(g) + '" aria-pressed="' + (g === filt) + '">' + (g === 'tous' ? 'Tous' : esc(g)) + '</button>'; }).join('') + '</div>' : '';
    var rows = L.map(function(p){
      var cur = S.get(key, p.name);
      return '<li><span class="nom">' + esc(p.name) + (p.info ? '<small>' + p.info + '</small>' : '') + '</span><span class="marks" role="group" aria-label="Évaluation de ' + esc(p.name) + '">' +
        Object.keys(MARKS).map(function(m){ return '<button type="button" class="mk" data-ev="mk" data-n="' + esc(p.name) + '" data-m="' + m + '" aria-pressed="' + (cur === m) + '" title="' + MARKS[m] + '" aria-label="' + m + ' · ' + MARKS[m] + '">' + m + '</button>'; }).join('') + '</span></li>';
    }).join('');
    var places = opts.places ? '<details class="evplace"><summary>Niveau de chaque élève</summary><ul class="evlist">' + S.roster.map(function(p){
      var v = S.placeOf(p);
      return '<li><span class="nom">' + esc(p.name) + '<small>' + esc(p.group) + '</small></span><select data-ev="place" data-n="' + esc(p.name) + '" aria-label="Niveau de ' + esc(p.name) + '">' +
        [['CM1','CM1'],['CM2','CM2'],['both','CM1 et CM2']].map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === v ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></li>'; }).join('') + '</ul></details>' : '';
    var focus = document.activeElement && el.contains(document.activeElement) ? document.activeElement.dataset : null;
    el.innerHTML = '<details class="evals"' + (open ? ' open' : '') + '><summary><span class="tuile-s">' + ICON + '</span><span>Évaluations <span class="compte">· ' + done + '/' + L.length + '</span></span>' + st + '</summary>' +
      '<div class="evbody"><div class="evtools">' + f +
      '<button type="button" class="btn petit" data-ev="undo" title="Annuler (Ctrl+Z)"' + (S.undoS.length ? '' : ' disabled') + '>↶ Annuler</button>' +
      (S.status === 'err' ? '<button type="button" class="btn petit" data-ev="retry">↻ Réessayer</button>' : '') +
      '<button type="button" class="btn petit" data-ev="pdf">⬇ Tableau PDF</button>' + (opts.extra ? opts.extra() : '') + '</div>' +
      (L.length ? '<ul class="evlist">' + rows + '</ul>' : '<p class="aide">Aucun élève. Les prénoms viennent de Classe › Maths (groupes).</p>') + places +
      '<p class="legende">A Acquis · AR À renforcer · ECA En cours d’acquisition · NA Non acquis. Touche une 2<sup>e</sup> fois pour effacer. Ctrl+Z annule.</p></div></details>';
    if(focus && focus.ev){
      var sel = '[data-ev="' + focus.ev + '"]' + (focus.n ? '[data-n="' + CSS.escape(focus.n) + '"]' : '') + (focus.m ? '[data-m="' + focus.m + '"]' : '') + (focus.g ? '[data-g="' + CSS.escape(focus.g) + '"]' : '');
      var b = el.querySelector(sel); if(b) b.focus({preventScroll:true});
    }
  }
  el.addEventListener('click', async function(e){
    var b = e.target.closest('[data-ev]'); if(!b || b.tagName === 'SELECT') return;
    var a = b.dataset.ev, key = opts.key();
    if(a === 'mk'){ var cur = S.get(key, b.dataset.n), next = cur === b.dataset.m ? null : b.dataset.m; if(opts.onMark) opts.onMark(key, b.dataset.n, next); else S.set(key, b.dataset.n, next); if(navigator.vibrate) try{ navigator.vibrate(8); }catch(x){} }
    else if(a === 'filtre'){ filt = b.dataset.g; try{ localStorage.setItem(LSf, filt); }catch(x){} render(); }
    else if(a === 'undo') S.undo();
    else if(a === 'x' && opts.onExtra){ opts.onExtra(b); render(); }
    else if(a === 'retry') S.flush();
    else if(a === 'pdf'){ b.disabled = true; b.textContent = 'Préparation…'; try{ await opts.pdf(); }catch(x){ toast('Le PDF n’a pas pu être préparé. Réessaie.'); } render(); }
  });
  el.addEventListener('change', function(e){ var s = e.target.closest('[data-ev="place"]'); if(s) S.setPlace(s.dataset.n, s.value); });
  el.addEventListener('toggle', function(e){ if(e.target.matches('.evals')) try{ localStorage.setItem(LSo, e.target.open ? '1' : '0'); }catch(x){} }, true);
  S.on(render);
  this.render = render;
  render();
}

/* ---------- Tableau PDF (sans bibliothèque : chaque page est dessinée puis assemblée) ----------
   sections : [{title, cols:[libellé], rows:[{name, cells:[{m, t}]}]}] */
function pdfFromImages(images, width, height){
  var chunks = [], offsets = [0], enc = new TextEncoder(), length = 0;
  function write(v){ var b = typeof v === 'string' ? enc.encode(v) : v; chunks.push(b); length += b.length; }
  function object(n, value, contents){ offsets[n] = length; write(n + ' 0 obj\n' + value); if(contents !== undefined){ write('\nstream\n'); write(contents); write('\nendstream'); } write('\nendobj\n'); }
  write('%PDF-1.4\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  var pages = images.map(function(_, i){ return 3 + 3*i; });
  object(2, '<< /Type /Pages /Count ' + pages.length + ' /Kids [' + pages.map(function(i){ return i + ' 0 R'; }).join(' ') + '] >>');
  images.forEach(function(img, i){
    var p = pages[i], draw = 'q ' + width + ' 0 0 ' + height + ' 0 0 cm /Sheet Do Q';
    object(p, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + width + ' ' + height + '] /Resources << /XObject << /Sheet ' + (p+1) + ' 0 R >> >> /Contents ' + (p+2) + ' 0 R >>');
    object(p+1, '<< /Type /XObject /Subtype /Image /Width ' + img.width + ' /Height ' + img.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + img.bytes.length + ' >>', img.bytes);
    object(p+2, '<< /Length ' + draw.length + ' >>', draw);
  });
  var start = length;
  write('xref\n0 ' + offsets.length + '\n0000000000 65535 f \n');
  offsets.slice(1).forEach(function(o){ write(String(o).padStart(10, '0') + ' 00000 n \n'); });
  write('trailer\n<< /Size ' + offsets.length + ' /Root 1 0 R >>\nstartxref\n' + start + '\n%%EOF\n');
  return new Blob(chunks, {type:'application/pdf'});
}
async function pdf(o){
  var W = 842, H = 595, K = 3, M = 28, nameW = 135, rowH = 17, perPage = 26, colsPage = o.colsPerPage || 18, images = [];
  var font = getComputedStyle(document.body).fontFamily || 'Arial, sans-serif';
  for(var s = 0; s < o.sections.length; s++){
    var sec = o.sections[s];
    for(var c0 = 0; c0 < sec.cols.length; c0 += colsPage){
      var cols = sec.cols.slice(c0, c0 + colsPage), colW = (W - 2*M - nameW) / Math.min(sec.cols.length, colsPage);
      for(var r0 = 0; r0 < Math.max(sec.rows.length, 1); r0 += perPage){
        var cv = document.createElement('canvas'); cv.width = W*K; cv.height = H*K;
        var ctx = cv.getContext('2d', {alpha:false}); ctx.scale(K, K); ctx.textBaseline = 'middle';
        var text = function(v, x, y, size, color, bold, align, max){ ctx.textAlign = align || 'left'; ctx.fillStyle = color || '#111A2C'; ctx.font = (bold ? 'bold ' : '') + (size || 10) + 'px ' + font; max ? ctx.fillText(v, x, y, max) : ctx.fillText(v, x, y); };
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
        text(sec.title, M, 34, 20, '#111A2C', true);
        text((sec.sub ? sec.sub + '  ·  ' : '') + 'Élèves ' + (r0+1) + ' à ' + Math.min(sec.rows.length, r0 + perPage) + '  ·  ' + new Date().toLocaleDateString('fr-FR'), M, 58, 10, '#475166');
        var top = 74, tw = nameW + cols.length*colW;
        ctx.fillStyle = o.color || '#2453C7'; ctx.fillRect(M, top, tw, 22);
        text('Élève', M + 8, top + 11, 10, '#fff', true);
        cols.forEach(function(l, i){ text(String(l), M + nameW + i*colW + colW/2, top + 11, 9, '#fff', true, 'center', colW - 4); });
        sec.rows.slice(r0, r0 + perPage).forEach(function(row, r){
          var y = top + 22 + r*rowH;
          ctx.fillStyle = r % 2 ? '#F4F6FA' : '#fff'; ctx.fillRect(M, y, tw, rowH);
          text(row.name, M + 8, y + rowH/2, 10, '#111A2C', true, 'left', nameW - 16);
          row.cells.slice(c0, c0 + colsPage).forEach(function(cell, i){
            var x = M + nameW + i*colW;
            if(cell && cell.m && PDF_COLORS[cell.m]){ ctx.fillStyle = PDF_COLORS[cell.m]; ctx.fillRect(x, y, colW, rowH); text(cell.t || cell.m, x + colW/2, y + rowH/2, 9, cell.m === 'A' || cell.m === 'NA' ? '#fff' : '#111A2C', true, 'center', colW - 2); }
            ctx.strokeStyle = '#D3DAE5'; ctx.lineWidth = .45; ctx.strokeRect(x, y, colW, rowH);
          });
          ctx.strokeStyle = '#D3DAE5'; ctx.strokeRect(M, y, nameW, rowH);
        });
        text('A  Acquis   ·   AR  À renforcer   ·   ECA  En cours d’acquisition   ·   NA  Non acquis   ·   case vide : non évalué' + (o.note ? '   ·   ' + o.note : ''), M, 568, 9, '#475166');
        text(String(images.length + 1), W - M, 568, 9, '#475166', false, 'right');
        var jpg = await new Promise(function(res, rej){ cv.toBlob(function(b){ b ? res(b) : rej(new Error('image')); }, 'image/jpeg', .94); });
        images.push({width:cv.width, height:cv.height, bytes:new Uint8Array(await jpg.arrayBuffer())});
      }
    }
  }
  var blob = pdfFromImages(images, W, H);
  var dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
  if(!dl){ toast('Téléchargement indisponible ici'); return; }
  try{ await dl.save({filename:o.filename, data:blob}); toast('PDF enregistré'); }
  catch(e){ if(!e || e.code !== 'declined') toast('Impossible d’enregistrer le PDF'); }
}

/* Raccourcis : Ctrl+Z / Ctrl+Maj+Z (ou Ctrl+Y) sur le magasin actif */
var active = null;
document.addEventListener('keydown', function(e){
  if(!active || !(e.ctrlKey || e.metaKey)) return;
  if(e.target.matches && e.target.matches('input,textarea,select')) return;
  var k = e.key.toLowerCase();
  if(k === 'z' && !e.shiftKey){ e.preventDefault(); active.undo(); }
  else if((k === 'z' && e.shiftKey) || k === 'y'){ e.preventDefault(); active.redo(); }
});

window.Evals = {
  MARKS: MARKS, merge: merge, toast: toast, pdf: pdf,
  start: async function(name, appV){ var s = new Store(name, appV); active = s; await s.init(); return s; },
  Panel: Panel
};
})();
