/* Mohit Sehrawat portfolio: behaviour only (all content lives in index.html).
   Classic script, one IIFE, works from file://. Every init is wrapped in safe(), so one failure never blocks the rest. */
(() => {
'use strict';
const root = document.documentElement;
/* late boot (slow CDN): the CSS failsafes already ran; never replay the intro */
try { if (performance.now() > 3300) { root.classList.remove('is-intro', 'is-pre'); document.querySelector('.intro')?.remove(); document.querySelectorAll('.rv').forEach(e => e.classList.add('in')); } } catch (e) {}
root.classList.add('booted');
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const mqRM = matchMedia('(prefers-reduced-motion: reduce)'), mqFine = matchMedia('(hover: hover) and (pointer: fine)');
const store = { get:k=>{try{return localStorage.getItem(k)}catch(e){return null}}, set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},
                sget:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}}, sset:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}} };
const hasGSAP = !!(window.gsap && window.ScrollTrigger && window.SplitText);
const safe = fn => { try { return fn(); } catch (e) { console.warn(e); } };
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const clamp = (min, max, v) => Math.max(min, Math.min(max, v));
const headerH = () => parseInt(getComputedStyle(root).getPropertyValue('--header-h'), 10) || 76;
const docMax = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
const refreshLater = debounce(() => { if (hasGSAP) ScrollTrigger.refresh(); }, 200);
let lenis = null, introDone = false, heroSplit = null, marqueeRamp = null, scrollGen = 0, onCurtainFlip = null;

/* classic (space-taking) scrollbars: keep their gutter so Lenis stop/start (intro, menu) never shifts the layout */
try { if (innerWidth - root.clientWidth > 0) root.classList.add('has-sb'); } catch (e) {}
/* start every visit at the top (the hero entrance plays on each load); hash links still land on their target */
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; if (!location.hash) scrollTo(0, 0); } catch (e) {}

/* ---------------- animated media controller (GIF / animated WebP) ---------------- */
function syncPauseButtons(){
  /* one toggle pattern: the name stays "Pause animations" and aria-pressed says whether motion is paused */
  $$('[data-pause]').forEach(b => b.setAttribute('aria-pressed', String(Media.paused)));
}
const lazyBg = c => { if (c && c.dataset.bg) { c.style.backgroundImage = `url(${c.dataset.bg})`; c.removeAttribute('data-bg'); } };
const Media = { els:[], vis:new Map(), since:new Map(), paused:false, MAX:3, DWELL:250, dt:0,
  init(){
    this.paused = mqRM.matches; root.classList.toggle('is-paused', this.paused); syncPauseButtons();
    this.els = $$('[data-anim]');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { es.forEach(e => {
        const r = e.boundingClientRect, vh = innerHeight || 1;
        const seen = e.isIntersecting ? clamp(0, 1, (Math.min(r.bottom, vh) - Math.max(r.top, 0)) / Math.max(1, Math.min(r.height, vh))) : -1;
        if (e.isIntersecting) lazyBg(e.target.closest('[data-bg]'));
        this.vis.set(e.target, e.isIntersecting ? Math.max(seen, .001) : 0); });
        this.update(); }, { rootMargin:'120px 0px', threshold:[0, .1, .25, .5, .75, 1] });
      this.els.forEach(p => io.observe(p));
    } else $$('[data-bg]').forEach(lazyBg);
    $$('[data-pause]').forEach(b => b.addEventListener('click', () => this.toggle()));
    document.addEventListener('visibilitychange', () => this.update());
  },
  eligible(p){ return this.vis.get(p) > 0 && !this.paused && !document.hidden && !p.hasAttribute('data-inactive') && (introDone || !p.closest('.hero')); },
  set(p, on){
    const s = $('source', p), i = $('img', p); if (!s || !i) return;
    const want = on ? s.dataset.srcset : i.dataset.poster;
    if (s.getAttribute('srcset') === want) return;
    if (!on && !i.complete) { /* let an in-flight animated file finish (no cancelled requests), then revert to the poster */
      if (!p.dataset.wait) { p.dataset.wait = '1'; const done = () => { delete p.dataset.wait; this.update(); };
        i.addEventListener('load', done, { once:true }); i.addEventListener('error', done, { once:true }); }
      return;
    }
    s.setAttribute('srcset', want); i.src = on ? i.dataset.src : i.dataset.poster;
  },
  isOn(p){ const s = $('source', p); return !!s && s.getAttribute('srcset') === s.dataset.srcset; },
  update(){ /* ≤ MAX animated images at once, most visible first; each must stay eligible DWELL ms first (no decode bursts on fast scroll) */
    const now = performance.now(); let wait = 0;
    const ok = this.els.filter(p => {
      if (!this.eligible(p)) { this.since.delete(p); return false; }
      if (this.isOn(p) || p.closest('.hero')) return true;
      if (!this.since.has(p)) this.since.set(p, now);
      const age = now - this.since.get(p); if (age >= this.DWELL) return true;
      wait = Math.max(wait, this.DWELL - age); return false;
    });
    const on = ok.sort((a, b) => this.vis.get(b) - this.vis.get(a)).slice(0, this.MAX);
    this.els.forEach(p => this.set(p, on.includes(p)));
    clearTimeout(this.dt); this.dt = wait ? setTimeout(() => this.update(), wait + 20) : 0;
  },
  toggle(){ this.paused = !this.paused; root.classList.toggle('is-paused', this.paused); syncPauseButtons(); this.update(); safe(() => Tabs.onPause()); }
};

/* ---------------- hero tabs (AccessLens / Readme-Architect) ---------------- */
const Tabs = { cur:0, timer:0, due:0, remain:9000, started:false, stopped:false, visible:true, offT:0,
  data:[
    { href:'https://github.com/mohit-sehrawat1708/Audit_Your_Website', cursor:'CODE ↗', live:'Code', code:true, poster:'assets/gifs/accesslens-poster.jpg',
      sr:'AccessLens source code on GitHub (opens in a new tab)', sr2:' (opens the AccessLens repository on GitHub in a new tab)' },
    { href:'https://readmearchitect.vercel.app', cursor:'OPEN ↗', live:'Live', code:false, poster:'assets/gifs/readme-architect-poster.jpg',
      sr:'Open Readme-Architect AI, live site (opens in a new tab)', sr2:' (opens readmearchitect.vercel.app in a new tab)' }
  ],
  init(){
    const dev = this.dev = $('.hero-dev'); if (!dev) return;
    this.tabs = $$('[role=tab]', dev); this.list = $('.tabs', dev); this.shots = $$('[data-shot]', dev);
    this.screen = $('#hero-screen'); this.link = $('.screen__link', dev); this.live = $('[data-live]', dev);
    this.tabs.forEach((t, k) => t.addEventListener('click', () => { this.stop(); if (k !== this.cur) this.select(k); }));
    this.list.addEventListener('keydown', e => {
      const n = this.tabs.length; let k = null;
      if (e.key === 'ArrowRight') k = (this.cur + 1) % n; else if (e.key === 'ArrowLeft') k = (this.cur - 1 + n) % n;
      else if (e.key === 'Home') k = 0; else if (e.key === 'End') k = n - 1;
      if (k === null) return; e.preventDefault(); this.stop(); this.select(k); this.tabs[k].focus();
    });
    const hero = $('.hero');
    if (hero && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; hero.classList.toggle('is-visible', e.isIntersecting); this.sync(); }).observe(hero);
    else hero?.classList.add('is-visible');
    document.addEventListener('visibilitychange', () => this.sync());
    /* hold auto-advance while focus is inside the device */
    dev.addEventListener('focusin', () => this.sync()); dev.addEventListener('focusout', () => setTimeout(() => this.sync(), 0));
    if (mqRM.matches) dev.classList.add('no-autoadvance');
  },
  restartBar(){ this.list.classList.add('rs'); void this.list.offsetWidth; this.list.classList.remove('rs'); },
  stop(){ if (!this.dev) return; this.stopped = true; this.dev.classList.add('no-autoadvance'); clearTimeout(this.timer); this.timer = 0; },
  select(k){
    const d = this.data[k], prev = this.cur; this.cur = k;
    this.tabs.forEach((t, j) => { const on = j === k; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    this.screen.setAttribute('aria-labelledby', this.tabs[k].id);
    this.shots.forEach((s, j) => { s.classList.toggle('is-on', j === k); j === k ? s.removeAttribute('aria-hidden') : s.setAttribute('aria-hidden', 'true'); });
    this.shots[k].removeAttribute('data-inactive');
    clearTimeout(this.offT); /* the old shot keeps playing through the 400 ms crossfade, then returns to its poster */
    this.offT = setTimeout(() => { this.shots.forEach((s, j) => { if (j !== this.cur) s.setAttribute('data-inactive', ''); }); Media.update(); }, prev === k ? 0 : 420);
    this.link.href = d.href; this.link.dataset.cursor = d.cursor; $('[data-live-sr]', this.link).textContent = d.sr;
    if (this.link.matches(':hover')) { const cl = $('.cursor__label'); if (cl) cl.textContent = d.cursor; }   /* auto-advance under a resting pointer */
    this.live.href = d.href; this.live.classList.toggle('is-code', d.code); $('[data-live-t]', this.live).textContent = d.live; $('[data-live-sr2]', this.live).textContent = d.sr2;
    this.screen.style.backgroundImage = `url(${d.poster})`;
    Media.update(); this.restartBar();
    this.remain = 9000; clearTimeout(this.timer); this.timer = 0; this.sync();
  },
  start(){ if (this.started || !this.dev) return; this.started = true; this.dev.classList.add('tabs-live'); this.restartBar(); this.remain = 9000; this.sync(); },
  held(){ return !!this.dev && this.dev.contains(document.activeElement); },
  can(){ return this.started && !this.stopped && this.visible && !Media.paused && !mqRM.matches && !document.hidden && !this.held(); },
  sync(){
    if (!this.dev) return;
    this.dev.classList.toggle('is-held', this.started && !this.stopped && this.held());
    if (this.can()) { if (!this.timer) { this.due = Date.now() + this.remain; this.timer = setTimeout(() => { this.timer = 0; this.select((this.cur + 1) % this.tabs.length); }, this.remain); } }
    else if (this.timer) { clearTimeout(this.timer); this.timer = 0; this.remain = Math.max(0, this.due - Date.now()); }
  },
  onPause(){ if (!this.dev) return; if (!Media.paused) { this.remain = 9000; this.restartBar(); } this.sync(); }
};

/* ---------------- physics pills (matter-js 0.20): record offline, play back, then hand off to a live engine ---------------- */
const FX = [.5,.26,.8,.4,.64,.14,.55,.32,.74,.2,.9,.46,.08,.68], ANG = [-.3,.18,.42,-.12,.2,-.35,.1,.3,-.22,.25,-.4,.15,-.18,.35];
const Pile = { el:null, items:[], dims:[], rec:null, hit:null, shift:null, H:0, lastW:0, engine:null, bodies:null, state:'idle',
  live:false, rm:false, visible:false, handed:false, running:false, mouse:null, mcEngine:null, playFn:null, raf:0, stepFn:null, acc:0, asleep:false, op:[],
  init(){
    const el = this.el = $('[data-pile]'); if (!el || this.inited) return; this.inited = true;
    this.items = $$(':scope > li', el);
    if (!window.Matter) return this.fallback();
    try { Matter.Common.logLevel = 0; } catch (e) {}
    this.rm = mqRM.matches; this.live = mqFine.matches && !this.rm && !!window.gsap;   /* drag needs the GSAP ticker */
    if (!this.layout()) return this.fallback();
    el.classList.toggle('is-live', this.live); el.classList.toggle('can-replay', !this.rm);
    this.arm();
    if ('ResizeObserver' in window) new ResizeObserver(debounce(() => { if (this.rec && Math.abs(el.clientWidth - this.lastW) >= 1) this.resim(); }, 150)).observe(el);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.syncRunner(); }).observe(el);
    document.addEventListener('visibilitychange', () => this.syncRunner());
    $('[data-drop-again]')?.addEventListener('click', () => this.replay());
    /* focus never lands on an undropped pill */
    el.addEventListener('focusin', () => { if (this.state !== 'waiting') return;
      if (this.watcher) { this.watcher.disconnect(); this.watcher = null; }
      this.paint(this.rec.length - 1); el.classList.remove('is-waiting'); this.state = 'done'; this.handoff(); });
    let down = null; /* click vs drag: a pill that moved 4px or more is not a link click */
    el.addEventListener('pointerdown', e => { down = { x:e.clientX, y:e.clientY }; });
    el.addEventListener('click', e => { if (e.target.closest('a.tag') && down && Math.hypot(e.clientX - down.x, e.clientY - down.y) >= 4) e.preventDefault(); }, true);
    el.addEventListener('dragstart', e => e.preventDefault());
    document.fonts?.ready?.then(() => { if (this.rec && this.items.some((li, i) => li.offsetWidth !== this.dims[i].w || li.offsetHeight !== this.dims[i].h)) this.resim(); });
  },
  layout(){
    const el = this.el; el.classList.add('is-physics');
    const W = el.clientWidth;
    this.dims = this.items.map(li => ({ w:li.offsetWidth, h:li.offsetHeight }));
    if (!W || this.dims.some(d => !d.w || !d.h)) return false;
    const t0 = performance.now(); let ok = false;
    try { ok = this.simulate(W); } catch (e) { ok = false; }
    this.simMs = Math.round(performance.now() - t0);
    if (!ok) return false;
    const prev = this.H; this.lastW = W; this.H = this.Hn;
    el.style.setProperty('--pile-h', this.H + 'px');
    if (prev && prev !== this.H) refreshLater();
    return true;
  },
  simulate(W){
    const { Engine, Bodies, Body, Composite, Events } = Matter;
    const engine = Engine.create({ enableSleeping:true, positionIterations:12, velocityIterations:8 });
    engine.gravity.y = 1.15;
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, 30, W + 400, 60, { isStatic:true, friction:.9 }),
      Bodies.rectangle(-30, -1600, 60, 3400, { isStatic:true, friction:.2 }),
      Bodies.rectangle(W + 30, -1600, 60, 3400, { isStatic:true, friction:.2 })
    ]);
    const narrow = W < 600;
    const bodies = this.items.map((li, i) => {
      const { w, h } = this.dims[i], r = h / 2, l = Math.max(0, (w - h) / 2), v = [];
      for (let k = 0; k <= 14; k++) { const t = -Math.PI / 2 + k * Math.PI / 14; v.push({ x:l + Math.cos(t) * r, y:Math.sin(t) * r }); }
      for (let k = 0; k <= 14; k++) { const t = Math.PI / 2 + k * Math.PI / 14; v.push({ x:-l + Math.cos(t) * r, y:Math.sin(t) * r }); }
      const b = Bodies.fromVertices(w / 2 + FX[i % 14] * Math.max(0, W - w), -h - 40 - i * h * 1.25, [v],
        { friction:.85, frictionStatic:1.2, restitution:.04, frictionAir:.018, slop:.02 });
      Body.setAngle(b, narrow ? ANG[i % 14] * .35 : ANG[i % 14]);
      Body.setInertia(b, b.inertia * 3);
      b.k = i; return b;
    });
    Composite.add(engine.world, bodies);
    const rec = [], hit = bodies.map(() => null);
    Events.on(engine, 'collisionStart', e => e.pairs.forEach(p => [p.bodyA, p.bodyB].forEach(part => {
      const b = part.parent || part; if (!b.isStatic && b.k != null && hit[b.k] == null) hit[b.k] = rec.length; })));
    const dt = 1000 / 120;
    for (let s = 0; s < 1500; s++) {
      Engine.update(engine, dt);
      if (s % 2 === 0) rec.push(bodies.map(b => [b.position.x, b.position.y, b.angle]));
      if (s > 200 && bodies.every(b => b.isSleeping)) break;
    }
    rec.push(bodies.map(b => [b.position.x, b.position.y, b.angle]));
    const fin = rec[rec.length - 1];
    /* drop the visually still tail (sub-pixel settling), so playback ends when the motion does */
    const still = f => f.every((p, k) => Math.abs(p[0] - fin[k][0]) < .4 && Math.abs(p[1] - fin[k][1]) < .4 && Math.abs(p[2] - fin[k][2]) < .004);
    let end = rec.length - 1; while (end > 1 && still(rec[end - 1])) end--;
    rec.length = Math.min(rec.length, end + 2); rec[rec.length - 1] = fin;
    if (fin.some(f => !isFinite(f[0]) || !isFinite(f[1]) || f[1] > 40)) return false;
    this.shift = fin.map(f => Math.round(f[2] / Math.PI) * Math.PI);
    const top = Math.min(...fin.map((f, i) => f[1] - Math.abs(Math.sin(f[2])) * (this.dims[i].w / 2) - this.dims[i].h / 2));
    this.Hn = Math.ceil(-top + (W < 650 ? 28 : 56));
    Object.assign(this, { engine, bodies, rec, hit });
    return true;
  },
  tf(k, x, y, a, fade){ const d = this.dims[k], top = this.H + y - d.h / 2, li = this.items[k];
    li.style.transform = `translate(${(x - d.w / 2).toFixed(1)}px,${top.toFixed(1)}px) rotate(${(a - this.shift[k]).toFixed(4)}rad)`;
    /* playback: fade in across the 60px entry zone instead of a hard clip edge */
    const o = fade ? clamp(0, 1, (top + 60) / 60) : 1;
    if (o !== this.op[k]) { this.op[k] = o; li.style.opacity = o >= 1 ? '' : o.toFixed(3); } },
  paint(i){ const f = this.rec[i], fade = i < this.rec.length - 1; for (let k = 0; k < this.items.length; k++) this.tf(k, f[k][0], f[k][1], f[k][2], fade); },
  arm(){
    const el = this.el, last = this.rec.length - 1;
    if (this.rm || el.getBoundingClientRect().bottom < 0) { this.paint(last); this.state = 'done'; this.handoff(); return; }
    this.paint(0); el.classList.add('is-waiting'); this.state = 'waiting';
    if (!('IntersectionObserver' in window)) return this.play();
    this.watcher = new IntersectionObserver(([e]) => { if (e.isIntersecting) { this.watcher.disconnect(); this.watcher = null; this.play(); } }, { threshold:.35 });
    this.watcher.observe(el);
  },
  play(){
    const el = this.el; this.stopRunner(); this.stopPlay();
    this.items.forEach(li => li.classList.remove('hit'));
    el.classList.remove('is-waiting'); this.state = 'playing';
    const last = this.rec.length - 1, per = 1000 / 60 / 1.15, fired = this.items.map(() => false); let t0 = null;
    const step = t => {
      if (t0 === null) t0 = t;                                   /* seeded from the first tick: never a negative index */
      const i = clamp(0, last, Math.floor((t - t0) / per));
      if (this.visible || i >= last) this.paint(i);              /* no writes offscreen */
      for (let k = 0; k < fired.length; k++) if (!fired[k] && this.hit[k] != null && i >= this.hit[k]) { fired[k] = true; this.items[k].classList.add('hit'); }
      if (i >= last) { this.stopPlay(); this.state = 'done'; this.handoff(); }
    };
    if (window.gsap) { this.playFn = time => step(time * 1000); gsap.ticker.add(this.playFn); }
    else { const loop = t => { if (this.state !== 'playing') return; step(t); if (this.state === 'playing') this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop); }
  },
  stopPlay(){ if (this.playFn) { gsap.ticker.remove(this.playFn); this.playFn = null; } if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } },
  handoff(){ /* live drag: fine pointer + motion OK only */
    if (!this.live || !this.engine || !window.gsap) return;
    const { Mouse, MouseConstraint, Events, Composite } = Matter, el = this.el;
    if (!this.mouse) {
      const m = this.mouse = Mouse.create(el);
      el.removeEventListener('wheel', m.mousewheel); el.removeEventListener('DOMMouseScroll', m.mousewheel);
      el.removeEventListener('touchmove', m.mousemove); el.removeEventListener('touchstart', m.mousedown); el.removeEventListener('touchend', m.mouseup);
      addEventListener('mouseup', m.mouseup);
      el.dataset.cursor = 'DRAG';
    }
    if (this.mcEngine !== this.engine) {
      const mc = MouseConstraint.create(this.engine, { mouse:this.mouse, constraint:{ stiffness:.2, render:{ visible:false } } });
      Composite.add(this.engine.world, mc);
      Events.on(mc, 'startdrag', () => { el.classList.add('is-grabbed'); addEventListener('mousemove', this.mouse.mousemove); this.asleep = false; });
      Events.on(mc, 'enddrag', () => removeEventListener('mousemove', this.mouse.mousemove));
      this.mcEngine = this.engine;
    }
    Mouse.setOffset(this.mouse, { x:0, y:-this.H });   /* world y = 0 is the floor top; DOM y = H */
    this.handed = true; this.asleep = false; this.syncRunner();
  },
  paintLive(){
    const all = this.bodies.every(b => b.isSleeping);
    if (all && this.asleep) return; this.asleep = all;
    this.bodies.forEach((b, k) => this.tf(k, b.position.x, b.position.y, b.angle, false));
  },
  syncRunner(){ /* the live engine steps on the GSAP ticker, only while the band is on screen */
    if (!this.handed || !this.engine) return;
    const on = this.visible && this.state === 'done' && !document.hidden;
    if (on && !this.running) {
      this.acc = 0; const dt = 1000 / 60;
      this.stepFn = (time, delta) => { this.acc = Math.min(this.acc + delta, dt * 3); let n = 0;
        while (this.acc >= dt) { Matter.Engine.update(this.engine, dt); this.acc -= dt; n++; }
        if (n) this.paintLive(); };                              /* one paint per tick */
      gsap.ticker.add(this.stepFn); this.running = true;
    } else if (!on && this.running) this.stopRunner();
  },
  stopRunner(){ if (this.stepFn) gsap.ticker.remove(this.stepFn); this.stepFn = null; this.running = false; },
  replay(){
    if (!this.rec || this.rm) return;
    if (this.watcher) { this.watcher.disconnect(); this.watcher = null; }
    this.stopRunner();
    const { Body, Sleeping } = Matter, fin = this.rec[this.rec.length - 1];
    this.bodies.forEach((b, k) => { Body.setPosition(b, { x:fin[k][0], y:fin[k][1] }); Body.setAngle(b, fin[k][2]);
      Body.setVelocity(b, { x:0, y:0 }); Body.setAngularVelocity(b, 0); Sleeping.set(b, true); });
    this.play();
  },
  resim(){
    const waiting = this.state === 'waiting';
    this.stopRunner(); this.stopPlay(); this.mcEngine = null;
    if (!this.layout()) return this.fallback();
    if (waiting) { this.paint(0); return; }
    this.paint(this.rec.length - 1); this.state = 'done'; this.el.classList.remove('is-waiting'); this.handoff();
  },
  fallback(){ const el = this.el; if (!el) return; this.stopRunner?.(); this.stopPlay?.();
    el.classList.remove('is-physics', 'is-waiting', 'is-live', 'can-replay'); el.style.removeProperty('--pile-h'); delete el.dataset.cursor;
    this.items.forEach(li => { li.style.transform = ''; li.style.opacity = ''; }); this.op = []; }
};

/* ---------------- systems that do not need GSAP ---------------- */
function initTheme(){
  const btn = $('[data-theme-toggle]'); if (!btn) return;
  /* name starts with the visible label (WCAG 2.5.3) */
  const label = () => btn.setAttribute('aria-label', 'Change the mode, switch to ' + (root.dataset.theme === 'dark' ? 'light' : 'dark') + ' mode');
  /* the browser bar follows the chosen theme, not only the OS scheme (the pre-paint script does the same on load) */
  const chrome = t => $$('meta[name="theme-color"]').forEach(m => m.setAttribute('content', t === 'dark' ? '#0a0b11' : '#f6f5f1'));
  const apply = t => { root.dataset.theme = t; store.set('ms-theme', t); label(); chrome(t); };
  label();
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || mqRM.matches) return apply(next);
    const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    try {
      document.startViewTransition(() => apply(next)).ready.then(() => root.animate(
        { clipPath:[`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] },
        { duration:700, easing:'cubic-bezier(.7,0,.2,1)', pseudoElement:'::view-transition-new(root)' })).catch(() => {});
    } catch (e) { apply(next); }
  });
}
function initHeader(){
  const hdr = $('#hdr'); if (!hdr || !('IntersectionObserver' in window)) return;
  const s = document.createElement('div'); s.setAttribute('aria-hidden', 'true');
  s.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:40px;pointer-events:none;visibility:hidden';
  document.body.prepend(s);
  new IntersectionObserver(([e]) => hdr.classList.toggle('is-stuck', !e.isIntersecting)).observe(s);
}
/* where a hash should land: under the fixed header (+12 px, + the target's CSS scroll-margin-top); sticky cards use their
   in-flow position; #contact = page end (footer curtain) */
function targetY(hash){
  if (hash === '#top' || hash === '#main') return 0;
  if (hash === '#contact' && curtainOn()) return docMax();
  const el = document.getElementById(hash.slice(1)); if (!el) return null;
  let top;
  /* static: a relative box keeps the sticky 'top' offset */
  if (getComputedStyle(el).position === 'sticky') { el.style.position = 'static'; top = el.getBoundingClientRect().top; el.style.position = ''; }
  else top = el.getBoundingClientRect().top;
  /* a target still waiting for its reveal sits 20px low (translateY): measure where it comes to rest, and reveal it now */
  const rv = el.closest('.rv');
  if (rv) { try { top -= new DOMMatrix(getComputedStyle(rv).transform).m42; } catch (e) {} rv.classList.add('in'); }
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  /* ceil: a flush landing is never a fraction above the section, where the header's night range starts */
  return clamp(0, docMax(), Math.ceil(top + scrollY - headerH() - 12 - margin));
}
function scrollToHash(hash, immediate){
  const y = targetY(hash); if (y == null) return;
  if (lenis) lenis.scrollTo(y, { immediate:immediate || mqRM.matches, force:true });
  else scrollTo(0, y);
}
function initAnchors(){
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute('data-menu-link') || a.classList.contains('skip')) return;
    const hash = a.getAttribute('href'); if (hash.length < 2 || targetY(hash) == null) return;
    e.preventDefault(); scrollToHash(hash);
  });
}
function initMenu(){
  const menu = $('#menu'); if (!menu) return;
  const openers = $$('[data-menu-open]'); let trigger = null, t = 0, open = false;
  /* outside the dialog is inert while open (toast stays live) */
  const setInert = on => [...document.body.children].forEach(n => { if (n !== menu && n.tagName !== 'SCRIPT' && n.id !== 'toast') n.inert = on; });
  const focusables = () => $$('a[href],button:not([disabled])', menu).filter(el => el.getClientRects().length);
  const onKey = e => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables(); if (!f.length) return;
    const first = f[0], last = f[f.length - 1], a = document.activeElement;
    if (e.shiftKey && (a === first || !menu.contains(a))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (a === last || !menu.contains(a))) { e.preventDefault(); first.focus(); }
  };
  function show(from){
    clearTimeout(t); trigger = from || openers[0]; open = true;
    menu.classList.add('is-mounted'); void menu.offsetWidth; menu.classList.add('is-open');
    openers.forEach(b => b.setAttribute('aria-expanded', 'true'));
    root.classList.add('menu-open'); lenis?.stop(); menu.scrollTop = 0; setInert(true);
    document.addEventListener('keydown', onKey);
    const target = (from && from.dataset.focus && $(from.dataset.focus)) || $('.menu__links a', menu);
    setTimeout(() => target?.focus(), 80);
  }
  function close(returnFocus = true){
    if (!open) return; open = false; setInert(false);
    menu.classList.remove('is-open'); openers.forEach(b => b.setAttribute('aria-expanded', 'false'));
    root.classList.remove('menu-open'); lenis?.start();
    document.removeEventListener('keydown', onKey);
    t = setTimeout(() => menu.classList.remove('is-mounted'), mqRM.matches ? 0 : 580);
    if (returnFocus) trigger?.focus({ preventScroll:true });
  }
  openers.forEach(b => b.addEventListener('click', () => show(b)));
  $$('[data-menu-close]', menu).forEach(b => b.addEventListener('click', () => close()));
  $$('[data-menu-link]', menu).forEach(a => a.addEventListener('click', e => {
    const hash = a.getAttribute('href'); e.preventDefault(); close(false);
    scrollToHash(hash);
    const el = hash === '#top' ? $('#main') : document.getElementById(hash.slice(1));
    if (el) { if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1'); el.focus({ preventScroll:true }); }
  }));
}
function initCopy(){
  const toast = $('#toast'); let tt = 0;
  const show = msg => { if (!toast) return; toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('is-on'), 2600); };
  const legacy = text => { const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); return ok; };
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const text = b.dataset.copy, done = ok => show(ok ? 'Copied ' + text : 'Email: ' + text);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => done(true), () => done(legacy(text)));
    else done(legacy(text));
  }));
}
function initReveals(){
  const els = $$('.rv'); if (!els.length) return;
  if (mqRM.matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }),
    { rootMargin:'0px 0px -6% 0px', threshold:.06 });
  els.forEach(e => io.observe(e));
}
function initLocalTime(){
  const el = $('[data-time]'); if (!el || !window.Intl) return;
  const fmt = new Intl.DateTimeFormat('en-IN', { timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', hour12:false });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick(); setTimeout(() => { tick(); setInterval(tick, 60000); }, 60000 - Date.now() % 60000 + 50);
}
const curtainOn = () => !root.classList.contains('no-curtain') && matchMedia('(min-width:761px) and (min-height:700px)').matches;
let curtainCheck = null;
function initFooterCurtainGate(){
  const footer = $('.site-footer'); if (!footer) return;
  let last = null;
  /* curtain only if the whole footer fits under the fixed header */
  const check = curtainCheck = () => { root.classList.toggle('no-curtain', footer.offsetHeight > innerHeight - headerH());
    const on = curtainOn(); if (last !== null && on !== last) { onCurtainFlip?.(); refreshLater(); } last = on; };
  check(); addEventListener('resize', debounce(check, 200));
  /* behind the curtain the browser never scrolls to footer focus: lift it */
  footer.addEventListener('focusin', () => { if (!curtainOn() || scrollY >= docMax() - 2) return;
    if (lenis) lenis.scrollTo(docMax(), { immediate:true, force:true }); else scrollTo(0, docMax()); });
}
function initPrint(){ /* print the final numbers even if a count-up never ran */
  addEventListener('beforeprint', () => $$('[data-count]').forEach(el => { el.textContent = el.dataset.count; }));
}
function initToTop(){
  $$('[data-to-top]').forEach(b => b.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0, { duration:1.4, immediate:mqRM.matches, force:true }); else scrollTo(0, 0);
    $('#main')?.focus({ preventScroll:true });
  }));
}

/* ---------------- GSAP systems ---------------- */
function initLenis(){
  /* no auto-refresh on window 'load': the one refresh happens after fonts + buildScenes (images all reserve their space) */
  ScrollTrigger.config({ ignoreMobileResize:true, autoRefreshEvents:'visibilitychange,DOMContentLoaded,resize' });
  /* lag smoothing ON until the hero entrance has played (a long setup frame must not skip its first beats) */
  gsap.ticker.lagSmoothing(40, 16);
  if (!window.Lenis) return;
  lenis = new Lenis({ lerp:.1, stopInertiaOnNavigate:true });   /* anchors handled by initAnchors (sticky cards + footer curtain need custom targets) */
  lenis.on('scroll', ScrollTrigger.update);
  lenis.on('scroll', () => { scrollGen++; });
  /* prioritized: scroll + ScrollTrigger reads happen before this tick's tween writes (one style pass) */
  gsap.ticker.add(t => lenis.raf(t * 1000), false, true);
  /* a refresh can change the page height: never clamp to a stale limit */
  ScrollTrigger.addEventListener('refresh', () => lenis?.resize());
}
function initCursor(){
  if (!mqFine.matches || mqRM.matches) return;
  const c = $('.cursor'); if (!c) return;
  const dot = $('.cursor__dot', c), disc = $('.cursor__disc', c), label = $('.cursor__label', c), both = [dot, disc];
  root.classList.add('has-cursor');
  gsap.set(both, { xPercent:-50, yPercent:-50, x:-120, y:-120, autoAlpha:0 });
  const dx = gsap.quickTo(dot, 'x', { duration:.18, ease:'power3' }), dy = gsap.quickTo(dot, 'y', { duration:.18, ease:'power3' });
  const cx = gsap.quickTo(disc, 'x', { duration:.3, ease:'power3' }), cy = gsap.quickTo(disc, 'y', { duration:.3, ease:'power3' });
  let shown = false;
  addEventListener('pointermove', e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    if (!shown) { shown = true; gsap.set(both, { x:e.clientX, y:e.clientY }); gsap.to(both, { autoAlpha:1, duration:.2 }); }
    dx(e.clientX); dy(e.clientY); cx(e.clientX); cy(e.clientY);
  }, { passive:true });
  document.addEventListener('pointerover', e => {
    const tg = e.target.closest && e.target.closest('[data-cursor]'), it = e.target.closest && e.target.closest('a,button,[role=button]');
    c.classList.toggle('is-label', !!tg); c.classList.toggle('is-hover', !tg && !!it);
    if (tg) label.textContent = tg.dataset.cursor;
  });
  root.addEventListener('pointerleave', () => { if (shown) gsap.to(both, { autoAlpha:0, duration:.2 }); });
  root.addEventListener('pointerenter', () => { if (shown) gsap.to(both, { autoAlpha:1, duration:.2 }); });
}
function initMagnetic(){
  if (!mqFine.matches || mqRM.matches) return;
  $$('[data-magnetic]').forEach(el => {
    const s = parseFloat(el.dataset.magnetic) || .35;
    const xTo = gsap.quickTo(el, 'x', { duration:.8, ease:'elastic.out(1,.4)' }), yTo = gsap.quickTo(el, 'y', { duration:.8, ease:'elastic.out(1,.4)' });
    let r = null, g = -1;
    el.addEventListener('pointerenter', () => { r = el.getBoundingClientRect(); g = scrollGen; });
    el.addEventListener('pointermove', e => { if (!r || g !== scrollGen) { r = el.getBoundingClientRect(); g = scrollGen; }
      xTo(clamp(-12, 12, (e.clientX - (r.left + r.width / 2)) * s)); yTo(clamp(-12, 12, (e.clientY - (r.top + r.height / 2)) * s)); });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); r = null; });
  });
}
function initTilt(){
  if (!mqFine.matches || mqRM.matches) return;
  $$('[data-tilt]').forEach(el => {
    const max = parseFloat(el.dataset.tilt) || 8, lift = el.classList.contains('device__tilt');
    gsap.set(el, { transformPerspective:900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration:.5, ease:'power3' }), ry = gsap.quickTo(el, 'rotationY', { duration:.5, ease:'power3' });
    let r = null, g = -1;   /* rect re-read only after a scroll (passes in the pinned track also move sideways with scroll) */
    el.addEventListener('pointerenter', () => { r = el.getBoundingClientRect(); g = scrollGen; if (lift) gsap.to(el, { y:-6, duration:.7, ease:'expo.out', overwrite:'auto' }); });
    el.addEventListener('pointermove', e => {
      if (!r || g !== scrollGen) { r = el.getBoundingClientRect(); g = scrollGen; }
      const px = clamp(-.5, .5, (e.clientX - r.left) / r.width - .5), py = clamp(-.5, .5, (e.clientY - r.top) / r.height - .5);
      ry(px * max * 2); rx(-py * max * 2);
      el.style.setProperty('--gx', ((px + .5) * 100).toFixed(1) + '%'); el.style.setProperty('--gy', ((py + .5) * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); r = null; if (lift) gsap.to(el, { y:0, duration:.7, ease:'expo.out', overwrite:'auto' }); });
  });
}
function initPreview(){
  const list = $('[data-hover-preview]'), box = $('.preview'); if (!list || !box || !mqFine.matches) return;
  const img = $('img', box), rows = $$('.idx__row', list);
  gsap.set(box, { xPercent:-50, yPercent:-50, scale:.6, autoAlpha:0 });
  const xTo = gsap.quickTo(box, 'x', { duration:.55, ease:'power3' }), yTo = gsap.quickTo(box, 'y', { duration:.55, ease:'power3' });
  const rTo = gsap.quickTo(box, 'rotation', { duration:.5, ease:'power3' });
  const src = a => (Media.paused || mqRM.matches) ? a.dataset.previewPoster : a.dataset.preview;
  let lastX = null, settle = 0, hh = 76, overRc = false;
  /* beside the pointer (flips near the right edge), inside the viewport, below the header */
  const place = (cx, cy, snap) => {
    const tall = box.dataset.size === 'tall', w = tall ? 180 : 360, h = tall ? 380 : 225, gap = 28, m = 16;
    let x = cx + gap + w / 2; if (x + w / 2 > innerWidth - m) x = cx - gap - w / 2;
    x = clamp(w / 2 + m, innerWidth - w / 2 - m, x);
    const y = clamp(hh + h / 2 + 12, Math.max(hh + h / 2 + 12, innerHeight - h / 2 - 12), cy);
    if (snap) gsap.set(box, { x, y }); xTo(x); yTo(y);
  };
  const show = () => gsap.to(box, { autoAlpha:1, scale:1, duration:.45, ease:'power3', overwrite:'auto' });
  const hide = () => gsap.to(box, { autoAlpha:0, scale:.6, duration:.3, overwrite:'auto' });
  list.addEventListener('pointerenter', () => { hh = headerH(); });
  list.addEventListener('pointermove', e => {
    place(e.clientX, e.clientY, lastX === null);
    if (lastX !== null && !mqRM.matches) { rTo(clamp(-10, 10, (e.clientX - lastX) * .5)); clearTimeout(settle); settle = setTimeout(() => rTo(0), 90); }
    lastX = e.clientX;
  });
  rows.forEach(row => row.addEventListener('pointerenter', e => {
    const a = $('[data-preview]', row); if (!a) return;
    box.dataset.size = a.dataset.previewSize || 'land';
    place(e.clientX, e.clientY, lastX === null); lastX = e.clientX;
    const s = src(a); if (img.getAttribute('src') !== s) img.src = s;   /* only the hovered row's file is fetched */
    if (!overRc) show();
  }));
  /* steps aside over the LIVE / CODE receipts */
  $$('.idx__rc', list).forEach(rc => {
    rc.addEventListener('pointerenter', () => { overRc = true; hide(); });
    rc.addEventListener('pointerleave', () => { overRc = false; if (list.matches(':hover')) show(); });
  });
  list.addEventListener('pointerleave', () => { overRc = false; hide(); lastX = null; });
  lenis?.on('scroll', () => { if (lastX !== null && !list.matches(':hover')) { hide(); lastX = null; } });
}
function initReceipts(){
  const scr = !!window.ScrambleTextPlugin && !mqRM.matches;
  $$('.rc').forEach(rc => {
    const t = $('.rc__t', rc); if (!t) return;
    const text = t.textContent;
    if (!rc.hasAttribute('aria-label')) rc.setAttribute('aria-label', text + (rc.getAttribute('target') === '_blank' ? ' (opens in a new tab)' : ''));
    if (!scr) return;
    const run = () => gsap.to(t, { duration:.4, overwrite:true, scrambleText:{ text, chars:'upperCase', speed:.6 } });
    rc.addEventListener('pointerenter', run); rc.addEventListener('focus', run);
  });
}

/* ---------------- intro curtain ("the pitch") ---------------- */
/* setup (pile sim, triggers, the one refresh) runs in the static hold at 0.9 s: no blank curtain, no skipped rise */
function playIntro(setup){
  return new Promise(resolve => {
    const intro = $('.intro');
    if (!intro) { root.classList.remove('is-intro'); setup(); return resolve(); }
    store.sset('ms-intro', '1');
    let resolved = false; const go = () => { if (!resolved) { resolved = true; setup(); lenis?.start(); resolve(); } };
    const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    const off = () => evs.forEach(n => removeEventListener(n, skip));
    const done = () => { off(); intro.remove(); root.classList.remove('is-intro'); introDone = true; Media.update(); go(); };
    try {
      const name = SplitText.create($('[data-intro-name]', intro), { type:'chars', mask:'chars', tag:'span', aria:'none' });   /* the intro is aria-hidden */
      const sub = $('[data-intro-sub]', intro), subText = sub.textContent.trim(), within = $('.intro__in', intro);
      const tl = gsap.timeline({ paused:true, onComplete:done });
      gsap.set(name.chars, { yPercent:110 });   /* a staggered from() in a timeline only pre-renders its first letter */
      tl.fromTo(name.chars, { yPercent:110 }, { yPercent:0, stagger:.04, duration:.7, ease:'expo.out', immediateRender:false }, 0)
        .from($('.intro__name .s', intro), { yPercent:135, duration:.7, ease:'expo.out' }, .12)   /* the corner labels are already up */
        .fromTo(sub, { autoAlpha:0 }, { autoAlpha:1, duration:.15 }, .3);
      if (window.ScrambleTextPlugin) tl.to(sub, { duration:.6, scrambleText:{ text:subText, chars:'01/{}_', speed:.6 }   /* '<' and '>' get entity-escaped mid-reveal, so braces stand in */ }, .3);
      tl.add(() => setup(), .9)
        .to(intro, { clipPath:'inset(0% 0% 100% 0%)', duration:.7, ease:'expo.inOut' }, 1.0)
        .to(within, { y:-40, autoAlpha:0, duration:.7, ease:'expo.inOut' }, 1.0)
        .add(go, 1.42);                                              /* H0 once the wipe has passed AI TOOLS, so its rise is seen */
      var skip = () => { tl.timeScale(4); off(); };
      evs.forEach(n => addEventListener(n, skip, { passive:true }));
      /* start on a fresh ticker frame: the timeline's first rendered frame is t≈0, never a catch-up through the rise */
      const start = () => { gsap.ticker.remove(start); intro.classList.add('is-go'); tl.play(0); };
      gsap.ticker.add(start);
    } catch (e) { intro.classList.add('is-go'); done(); }
  });
}

/* char splits are aria-hidden; an sr-only copy keeps the heading's name */
function srSplit(el, vars){
  if (!el) return null;
  const nx = el.nextElementSibling;
  if (!nx || !nx.classList.contains('sr-copy')) { const c = document.createElement('span'); c.className = 'sr-only sr-copy'; c.textContent = ' ' + el.textContent.trim(); el.after(c); }
  return SplitText.create(el, Object.assign({}, vars, { aria:'hidden' }));
}
const splitHero = () => heroSplit || (heroSplit = srSplit($('[data-hero-word]'), { type:'chars', mask:'chars', charsClass:'ch', tag:'span' }));

/* ---------------- hero entrance (H0) ---------------- */
function heroEntrance(){
  const split = splitHero();
  const l1 = $$('.hero__l1 .m > span'), rest = $$('.hero__cap, .hero__cta, .hero__note');
  gsap.set(l1, { yPercent:120 });
  gsap.set(split.chars, { yPercent:115 });
  gsap.set('.hd-in', { y:120, scale:.92, rotation:-9, autoAlpha:0 });
  gsap.set(rest, { y:18, autoAlpha:0 });
  root.classList.remove('is-pre');
  gsap.timeline()
    .to(l1, { yPercent:0, duration:.9, stagger:.09, ease:'expo.out' }, 0)
    .to(split.chars, { yPercent:0, duration:1.0, stagger:.035, ease:'expo.out' }, .08)
    .to('.hd-in', { y:0, scale:1, autoAlpha:1, duration:.9, ease:'expo.out' }, .35)
    .to('.hd-in', { rotation:() => innerWidth <= 820 ? -1.5 : -2, duration:1.2, ease:'elastic.out(1,.75)' }, .35)
    .to(rest, { y:0, autoAlpha:1, duration:.7, stagger:.06, ease:'expo.out' }, .6)
    .add(() => { introDone = true; Media.update(); Tabs.start(); }, .5)
    .add(() => marqueeRamp?.play(), .7)
    .add(() => { gsap.ticker.lagSmoothing(0); split.masks?.forEach(m => { m.style.overflow = 'visible'; }); }, 1.6);   /* masks only serve the rise */
}

/* ---------------- velocity marquee ---------------- */
function initMarquee(){
  const el = $('.marquee'), track = el && $('.marquee__track', el); if (!track) return;
  const setX = gsap.quickSetter(track, 'x', 'px'), setSkew = gsap.quickSetter(track, 'skewX', 'deg');
  let x = 0, skew = 0, dir = -1, half = track.scrollWidth / 2, visible = true, held = false, base = innerWidth < 760 ? 45 : 70;
  const k = { v:root.classList.contains('is-pre') ? 0 : 1 };
  marqueeRamp = gsap.to(k, { v:1, duration:.8, ease:'power1.inOut', paused:true });
  const ro = new ResizeObserver(() => { half = track.scrollWidth / 2; base = innerWidth < 760 ? 45 : 70; }); ro.observe(track);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(el);
  /* a mouse resting on the moving text holds it (to read it). Never touch (sticky :hover), keyboard focus, or the strip's own
     pause button: there, Play must resume at once */
  el.addEventListener('pointerover', e => { held = e.pointerType === 'mouse' && !e.target.closest('.pz'); });
  el.addEventListener('pointerleave', () => { held = false; });
  const tick = (time, dt) => {
    if (!visible || held || root.classList.contains('is-paused')) return;
    const v = lenis ? lenis.velocity : 0;
    if (Math.abs(v) > .5) dir = v > 0 ? -1 : 1;
    x = gsap.utils.wrap(-half, 0, x + dir * (base * k.v + Math.min(Math.abs(v) * 30, 1400)) * Math.min(dt, 50) / 1000);
    skew += (clamp(-12, 12, v * -.5) - skew) * .12;
    setX(x); setSkew(skew);
  };
  gsap.ticker.add(tick);
  return () => { gsap.ticker.remove(tick); ro.disconnect(); io.disconnect(); marqueeRamp?.kill(); marqueeRamp = null; gsap.set(track, { clearProps:'transform' }); };
}

/* ---------------- footer: LET'S BUILD rises letter by letter ---------------- */
let footerSplit = null, footerTl = null;
function buildFooter(){
  if (footerTl) { footerTl.scrollTrigger?.kill(); footerTl.progress(1).kill(); footerTl = null; }
  const title = $('[data-footer-title]'), footer = $('.site-footer'), pair = $('.cta__pair'), tog = $('.cta__pair .m > .s');
  if (!title || !footer || !pair || mqRM.matches) return;
  if (!footerSplit) footerSplit = srSplit(title, { type:'chars', mask:'chars', tag:'span' });
  /* curtain: the rise starts as the lifting page begins to uncover LET'S BUILD and lands at the page end, so it is seen */
  const titleBottom = () => title.getBoundingClientRect().bottom - footer.getBoundingClientRect().top;
  const st = curtainOn()
    ? { trigger:'.site-main', start:() => 'bottom ' + Math.round(innerHeight - footer.offsetHeight + titleBottom()), end:'max', scrub:.5, invalidateOnRefresh:true }
    : { trigger:'.cta__pair', start:'top 90%', end:'top 45%', scrub:.5, invalidateOnRefresh:true };
  gsap.set(footerSplit.chars, { yPercent:100 });   /* a staggered from() in a scrubbed timeline only pre-renders its first letter */
  footerTl = gsap.timeline({ scrollTrigger:st })
    .fromTo(footerSplit.chars, { yPercent:100 }, { yPercent:0, stagger:.02, ease:'none', immediateRender:false })
    .from(tog, { yPercent:110, ease:'none', duration:.3 }, '>-0.1');
}

/* ---------------- breakpoint changes keep the reader's place ---------------- */
/* a gated matchMedia flip leaves the page at scrollY 0 (GSAP 3.15); our MQLs exist first, so they see the reader's scrollY */
function initKeepPlace(){
  const secs = $$('.site-main > section, .site-main > div, .site-footer');
  let cache = null, lastY = scrollY, pending = null, until = 0;
  const snap = () => { cache = { vh:innerHeight, list:secs.map(s => { const r = s.getBoundingClientRect(); return { s, top:r.top + scrollY, h:r.height }; }) }; };
  addEventListener('scroll', () => { if (!ScrollTrigger.isRefreshing) lastY = scrollY; }, { passive:true });
  const onChange = () => {
    if (!cache || lastY < 2) return;
    const c = lastY + cache.vh / 2, hit = cache.list.find(o => c >= o.top && c < o.top + o.h); if (!hit) return;
    pending = { s:hit.s, f:(c - hit.top) / Math.max(1, hit.h) }; until = performance.now() + 900;
  };
  [MQ_D, MQ_S].forEach(q => { const m = matchMedia(q); m.addEventListener ? m.addEventListener('change', onChange) : m.addListener(onChange); });
  ScrollTrigger.addEventListener('refresh', () => {
    snap();
    if (!pending || performance.now() > until) { pending = null; return; }
    const a = pending, o = cache.list.find(x => x.s === a.s); if (!o) return;
    const y = clamp(0, docMax(), Math.round(o.top + a.f * o.h - innerHeight / 2));
    lenis?.resize();
    if (lenis) lenis.scrollTo(y, { immediate:true, force:true }); else scrollTo(0, y);
    lastY = y;
  });
}

/* ---------------- all ScrollTriggers ---------------- */
const MQ_D = '(min-width:900px) and (prefers-reduced-motion:no-preference)', MQ_M = '(prefers-reduced-motion:no-preference)',
      MQ_S = '(min-width:900px) and (min-height:680px) and (prefers-reduced-motion:no-preference)';
function buildScenes(){
  const mm = gsap.matchMedia(), D = MQ_D, M = MQ_M, S = MQ_S;
  /* 0. hero split (reused by the entrance and the scroll-exit; never split twice) */
  if (root.classList.contains('is-pre')) splitHero();
  /* 1 + 6 + 9 + 11. size-gated scenes share ONE context (one revert/refresh per breakpoint); the pin keeps refreshPriority 1 */
  mm.add({ d:D, s:S }, ctx => {
    const { d, s } = ctx.conditions, undo = [];
    /* 1. hero scroll-exit (the intro owns yPercent + .hd-in; the scroll owns x/y + .hd) */
    if (d) {
      const chars = splitHero().chars, n = chars.length;
      gsap.timeline({ scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:.6, invalidateOnRefresh:true } })
        .to(chars, { x:i => (i - (n - 1) / 2) * innerWidth * .011, y:i => i % 2 ? -30 : 30, ease:'none', duration:1 }, 0)
        .fromTo('.hero__l1', { y:0, opacity:1 }, { y:-30, opacity:.3, ease:'none', duration:1, immediateRender:false }, 0)
        .to('.hd', { rotation:2, scale:1.06, y:-40, ease:'none', duration:1 }, 0)
        .fromTo('.hero__row', { opacity:1 }, { opacity:0, ease:'none', duration:.4, immediateRender:false }, 0);
    }
    /* 6. stacking cards shrink/darken; positions come from the (non-sticky) .stack; a covered card shows its poster */
    const stack = $('.stack'), cards = $$('.stack__card');
    if (s && stack && cards.length) {
      const flowTop = j => stack.getBoundingClientRect().top + scrollY + j * (cards[0].offsetHeight + (parseFloat(getComputedStyle(stack).rowGap) || 0));
      cards.forEach((card, i) => { if (!cards[i + 1]) return;
        const pic = $('[data-anim]', card), cover = on => { if (!pic) return; on ? pic.setAttribute('data-inactive', '') : pic.removeAttribute('data-inactive'); Media.update(); };
        gsap.timeline({ scrollTrigger:{ start:() => flowTop(i + 1) - innerHeight, end:() => flowTop(i + 1) - innerHeight * .15, scrub:true, invalidateOnRefresh:true,
            onLeave:() => cover(true), onEnterBack:() => cover(false) } })
          .to(card, { scale:.92, ease:'none' }, 0)
          .to($('.stack__shade', card), { opacity:() => root.dataset.theme === 'dark' ? .6 : .5, ease:'none' }, 0);
      });
      undo.push(() => { cards.forEach(c => $('[data-anim]', c)?.removeAttribute('data-inactive')); Media.update(); });
    }
    /* 9 + 11. hackathon pin + pass rotations. No anticipatePin: with Lenis it pinned early (20-36 px jump) */
    const hack = $('.hack'), track = $('.hack__track');
    if (d && hack && track) {
      hack.classList.add('is-pinned');
      /* the passes row is display:contents while pinned: not a scroller, so not a tab stop */
      const row = $('.hack__passes', track); row?.removeAttribute('tabindex');
      undo.push(() => row?.setAttribute('tabindex', '0'));
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, { x:() => -dist(), ease:'none', scrollTrigger:{ trigger:hack, start:'top top', end:() => '+=' + dist(),
        pin:true, scrub:.8, invalidateOnRefresh:true, refreshPriority:1 } });
      $$('.pass', track).forEach(p => { const inner = $('.pass__in', p); if (!inner) return;
        gsap.from(inner, { rotation:() => +p.style.getPropertyValue('--r') || 0, y:30, ease:'none',
          scrollTrigger:{ trigger:p, containerAnimation:tween, start:'left 95%', end:'left 55%', scrub:true } }); });
      /* focus inside the transformed track scrolls the page to where it shows */
      const onFocus = e => {
        const st = tween.scrollTrigger, t = e.target; if (!st || !t.getBoundingClientRect) return;
        const r = t.getBoundingClientRect(); if (r.left >= 0 && r.right <= innerWidth && r.top >= headerH() && r.bottom <= innerHeight) return;
        const el = t.closest('.panel, .pass') || t, x = el.getBoundingClientRect().right - track.getBoundingClientRect().left;
        const y = Math.round(st.start + clamp(0, 1, (x - innerWidth * .85) / Math.max(1, dist())) * (st.end - st.start));
        if (lenis) lenis.scrollTo(y, { immediate:true, force:true }); else scrollTo(0, y);
        ScrollTrigger.update(); st.getTween?.()?.progress(1);
      };
      track.addEventListener('focusin', onFocus);
      undo.push(() => { track.removeEventListener('focusin', onFocus); hack.classList.remove('is-pinned'); });
    }
    return () => undo.forEach(f => f());
  });
  /* 2. marquee ticker */
  mm.add(M, () => initMarquee());
  /* 3. pair-heading rises (masks, no SplitText) */
  mm.add(M, () => { $$('h2[data-rise]').forEach(h => gsap.from($$('.m > *', h), { yPercent:110, rotation:(i, el) => el.classList.contains('s') ? 3 : 0,
    duration:1.0, stagger:.12, ease:'expo.out', scrollTrigger:{ trigger:h, start:'top 85%', once:true } })); });
  /* 4. word fill + highlight bars. aria:'none': the word spans keep their text, so the paragraph stays readable */
  mm.add(M, () => {
    const p = $('[data-fill]'); if (!p) return;
    const split = SplitText.create(p, { type:'words', wordsClass:'w', tag:'span', aria:'none' });
    const items = $$('.w, .ig', p);
    const tl = gsap.timeline({ scrollTrigger:{ trigger:p, start:'top 80%', end:'bottom 55%', scrub:.4 } });
    items.forEach((el, i) => el.classList.contains('ig')
      ? tl.fromTo(el, { opacity:.25, scale:.6 }, { opacity:1, scale:1, duration:.3, ease:'none' }, i * .1)
      : tl.fromTo(el, { opacity:.16 }, { opacity:1, duration:.3, ease:'none' }, i * .1));
    $$('.hl', p).forEach(hl => { const last = $$('.w', hl).pop(); if (!last) return;
      tl.fromTo(hl, { backgroundSize:'0% .38em' }, { backgroundSize:'100% .38em', duration:.4, ease:'none' }, items.indexOf(last) * .1); });
    return () => split.revert();
  });
  /* 5. facts rule + count-ups (300 and 40 only; the animated digits are aria-hidden, the true value sits in sr-only text) */
  mm.add(M, () => {
    if ($('.facts__rule')) gsap.from('.facts__rule', { scaleX:0, duration:.6, ease:'expo.out', scrollTrigger:{ trigger:'.facts-wrap', start:'top 85%', once:true } });
    const nums = $$('[data-count]');
    nums.forEach(el => { const end = +el.dataset.count, o = { v:0 };
      gsap.to(o, { v:end, duration:1.6, ease:'power3.out', onUpdate:() => { el.textContent = Math.round(o.v); },
        scrollTrigger:{ trigger:el, start:'top bottom-=24', once:true } });   /* as soon as it shows: never a lingering "0+" on screen */
      el.textContent = '0'; });
    return () => nums.forEach(el => { el.textContent = el.dataset.count; });
  });
  /* 7. media clip reveals (once); cleared when done so the scaling cards never raster through a mask */
  mm.add(M, () => { $$('[data-clip]').forEach(el => {
    gsap.fromTo(el, { clipPath:'inset(12% 10% 12% 10% round 32px)' }, { clipPath:'inset(0% 0% 0% 0% round 26px)', duration:1.1, ease:'expo.out',
      onComplete:() => gsap.set(el, { clearProps:'clipPath' }), scrollTrigger:{ trigger:el, start:'top 80%', once:true } });
    const dp = $('.dev-pos', el); if (dp) gsap.fromTo(dp, { scale:1.15 }, { scale:1, duration:1.1, ease:'expo.out', scrollTrigger:{ trigger:el, start:'top 80%', once:true } });
  }); });
  /* 8. toolkit pile watcher: IntersectionObserver inside Pile.arm() */
  /* clock reveal: a once-only circular wipe as the section arrives (desktop and mobile) */
  mm.add(M, () => { const c = $('.clock'); if (c) gsap.fromTo(c, { clipPath:'circle(0% at 50% 50%)' }, { clipPath:'circle(50% at 50% 50%)', duration:1.1, ease:'expo.out',
    onComplete:() => gsap.set(c, { clearProps:'clipPath' }), scrollTrigger:{ trigger:'.hack-wrap', start:'top 70%', once:true } }); });
  /* 10. night toggle (all contexts; without the pin the CSS keeps it night anyway). It spans the section's whole time on screen:
     at 'top 60%' / 'bottom 40%' the kicker and the dark passes showed on the light ground before the fade (half-switched).
     The 600 ms fade now runs while only the section's empty top padding is in view. */
  const hw = $('.hack-wrap'), hdr = $('#hdr');
  if (hw) ScrollTrigger.create({ trigger:hw, start:'top bottom', end:'bottom top', toggleClass:{ targets:hw, className:'is-night' } });
  /* header is dark over the night section or the footer: one position rule (toggleClass dropped it at the page end) */
  if (hdr) {
    const hackT = hw && ScrollTrigger.create({ trigger:hw, start:() => 'top ' + headerH(), end:() => 'bottom ' + headerH() });
    /* footer: once the page's bottom edge is under the header's bottom edge (the curtain's end position, and the end of the page
       wherever the footer fills the screen below the header) */
    const footT = $('.site-footer') && ScrollTrigger.create({ trigger:'.site-main', start:() => 'bottom ' + (headerH() + 1), end:'max' });
    const sync = () => { const y = scrollY;
      hdr.classList.toggle('is-night', !!(hackT && y >= hackT.start && y < hackT.end) || !!(footT && y >= footT.start)); };
    ScrollTrigger.create({ start:0, end:'max', onUpdate:sync, onRefresh:sync });
  }
  /* 12. footer chars */
  mm.add(M, () => { buildFooter(); onCurtainFlip = buildFooter;
    return () => { onCurtainFlip = null; if (footerTl) { footerTl.scrollTrigger?.kill(); footerTl.kill(); footerTl = null; }
      const t = $('[data-footer-title]'); footerSplit?.revert(); footerSplit = null;
      if (t && t.nextElementSibling?.classList.contains('sr-copy')) t.nextElementSibling.remove(); }; });
  /* 13. progress-bar fallback */
  if (!CSS.supports('animation-timeline: scroll()')) { const bar = $('.hdr__progress');
    if (bar) { const set = gsap.quickSetter(bar, 'scaleX'); ScrollTrigger.create({ start:0, end:'max', onUpdate:s => set(s.progress) }); } }
}

/* ---------------- boot ---------------- */
const finish = () => { root.classList.remove('is-pre', 'is-intro'); $('.intro')?.remove(); introDone = true; safe(() => Media.update()); safe(() => Tabs.start()); safe(() => marqueeRamp?.play()); };
let setupDone = false;
const setup = () => { if (setupDone) return; setupDone = true;
  safe(() => Pile.init());          /* sets the pile height before any trigger is measured */
  safe(() => curtainCheck?.());     /* fonts change the footer height: re-gate before triggers are measured */
  safe(initKeepPlace);
  safe(buildScenes);
  ScrollTrigger.refresh();          /* the ONE refresh */
  lenis?.resize();                  /* the pin spacer exists now (deep links below it) */
  if (location.hash) safe(() => scrollToHash(location.hash, true));
};
const guard = setTimeout(() => { if (hasGSAP) { safe(setup); safe(() => gsap.ticker.lagSmoothing(0)); } finish(); }, 5000);
safe(initTheme); safe(initHeader); safe(initMenu); safe(initCopy); safe(() => Media.init()); safe(initReveals); safe(initLocalTime);
safe(initFooterCurtainGate); safe(initAnchors); safe(initToTop); safe(initPrint); safe(() => Tabs.init());
if (!hasGSAP) { finish(); safe(() => Pile.init()); clearTimeout(guard); return; }
gsap.registerPlugin(ScrollTrigger, SplitText, ...(window.ScrambleTextPlugin ? [ScrambleTextPlugin] : []));
safe(initLenis); if (root.classList.contains('is-intro')) lenis?.stop();
safe(initCursor); safe(initMagnetic); safe(initTilt); safe(initPreview); safe(initReceipts);
const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 700))]);
fonts.then(() => {
  if (root.classList.contains('is-intro')) return playIntro(setup);
  setup(); return null;
}).then(() => {
  if (root.classList.contains('is-pre')) safe(heroEntrance);
  else { introDone = true; Media.update(); safe(() => Tabs.start()); gsap.ticker.lagSmoothing(0); }
  clearTimeout(guard);
}).catch(() => { safe(setup); finish(); clearTimeout(guard); });
window.__ms = { get lenis(){ return lenis; }, Pile, Media, Tabs };
})();
