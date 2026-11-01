'use strict';
// Optional eye-level presentation for the RPG's existing overworld.
// This file never changes campaign state or the original top-down map.
window.NeoOverworldEyeLevel = (() => {
  const preferenceKey = 'neoCampusOverworldViewV1';
  const classicBackgrounds = {
    home:'home.jpg', shop:'card-shop-day.png', arcade:'arcade.jpg',
    park:'park.jpg', cafe:'cafe.jpg', center:'center.jpg', library:'library.jpg'
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function mount({camera, map, placements, config, params, openPerson, loadChibi, chibiMode}) {
    if (!camera || !map || !Array.isArray(placements)) return null;
    const integrated = params.has('rpg-integration');
    const stage = document.createElement('div');
    stage.id = 'neoEyeLevelStage';
    stage.setAttribute('aria-label', 'Eye-level location, swipe left or right to explore');
    stage.tabIndex = 0;
    const backdrop = document.createElement('img');
    backdrop.className = 'neo-eye-background';
    backdrop.alt = '';
    backdrop.draggable = false;
    const shade = document.createElement('div');
    shade.className = 'neo-eye-ground-shade';
    const cast = document.createElement('div');
    cast.className = 'neo-eye-cast';
    stage.append(backdrop, shade, cast);
    camera.append(stage);

    const controls = document.querySelector('#hud .tools');
    const toggle = document.createElement('button');
    toggle.id = 'neoEyeLevelToggle';
    toggle.type = 'button';
    toggle.title = 'Switch between the original map and eye-level character view';
    toggle.setAttribute('aria-label', 'Switch overworld perspective');
    toggle.setAttribute('aria-pressed', 'false');
    if (controls) controls.prepend(toggle);

    const arrows = document.createElement('div');
    arrows.id = 'neoEyeLevelArrows';
    for (const [direction, label, symbol] of [[-1,'Swipe left','‹'],[1,'Swipe right','›']]) {
      const arrow = document.createElement('button');
      arrow.type='button';
      arrow.className = direction === -1 ? 'neo-eye-left' : 'neo-eye-right';
      arrow.textContent = symbol;
      arrow.setAttribute('aria-label',label);
      arrow.addEventListener('click', () => moveTo(offset + direction * camera.clientWidth * .65, true));
      arrows.append(arrow);
    }
    camera.append(arrows);

    const css = document.createElement('style');
    css.textContent = [
      '#neoEyeLevelStage{display:none;position:absolute;inset:0;overflow:hidden;touch-action:pan-y;user-select:none;cursor:grab;background:#151426}',
      'body.neo-eye-level #neoEyeLevelStage{display:block}',
      'body.neo-eye-level #camera.dragging,#neoEyeLevelStage.is-dragging{cursor:grabbing}',
      'body.neo-eye-level #world,body.neo-eye-level #edges{display:none!important}',
      '#neoEyeLevelStage .neo-eye-background{position:absolute;inset:0 auto 0 0;height:100%;max-width:none;pointer-events:none;object-fit:fill;will-change:transform}',
      '#neoEyeLevelStage .neo-eye-ground-shade{position:absolute;inset:0 auto 0 0;pointer-events:none;background:linear-gradient(0deg,#100a1a9e 0%,transparent 30%,transparent 85%,#100a1a28 100%)}',
      '#neoEyeLevelStage .neo-eye-cast{position:absolute;left:0;top:0;height:100%;pointer-events:none;will-change:transform}',
      '#neoEyeLevelStage .neo-eye-character{position:absolute;bottom:12%;padding:0;border:0;background:transparent;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;cursor:pointer;pointer-events:auto;filter:drop-shadow(0 9px 10px #070419a3)}',
      '#neoEyeLevelStage .neo-eye-character img{display:block;height:var(--neo-eye-height);width:auto;max-width:none;object-fit:contain;object-position:center bottom;pointer-events:none}',
      '#neoEyeLevelStage .neo-eye-character .neo-eye-name{margin-top:3px;display:block;border:1px solid #d996d7;border-radius:9px;padding:4px 11px;background:#171329ed;color:white;font:800 13px system-ui;white-space:nowrap}',
      '#neoEyeLevelStage .neo-eye-character:focus-visible .neo-eye-name,#neoEyeLevelStage .neo-eye-character:hover .neo-eye-name{background:#77466c}',
      '#neoEyeLevelStage .neo-eye-character .neo-eye-fallback{display:none;width:80px;height:120px;place-items:center;background:#4c3459;border-radius:30px;font-size:32px}',
      '#neoEyeLevelStage .neo-eye-character.is-missing img{display:none}',
      '#neoEyeLevelStage .neo-eye-character.is-missing .neo-eye-fallback{display:grid}',
      '#neoEyeLevelArrows{display:none;pointer-events:none;position:absolute;inset:0}',
      'body.neo-eye-level #neoEyeLevelArrows{display:block}',
      '#neoEyeLevelArrows button{pointer-events:auto;position:absolute;top:52%;transform:translateY(-50%);width:38px;height:66px;padding:0;border:1px solid #d9add5aa;border-radius:11px;background:#20182db8;color:white;font:700 38px system-ui}',
      '#neoEyeLevelArrows .neo-eye-left{left:8px}#neoEyeLevelArrows .neo-eye-right{right:8px}',
      'body.neo-eye-level #neoEyeLevelToggle{background:#594060;border-color:#f3b5dc}',
      'body.neo-overworld-dialogue #neoEyeLevelStage .neo-eye-character,body.neo-overworld-dialogue #neoEyeLevelArrows{display:none!important}',
      '@media(max-width:650px){#neoEyeLevelArrows button{width:28px;height:54px;font-size:30px;background:#20182d91}#neoEyeLevelArrows .neo-eye-left{left:3px}#neoEyeLevelArrows .neo-eye-right{right:3px}#neoEyeLevelStage .neo-eye-character .neo-eye-name{font-size:12px;padding:3px 8px}}',
      '@media(prefers-reduced-motion:reduce){#neoEyeLevelStage .neo-eye-cast,#neoEyeLevelStage .neo-eye-background,#neoEyeLevelStage .neo-eye-ground-shade{transition:none!important}}'
    ].join('\n');
    document.head.append(css);

    let active = false, offset = 0, stageWidth = 0, dragging = null, suppressClick = false;
    let useChibi = !!chibiMode;
    const sprites = [];
    const slot = Number(params.get('slot') || 0);
    const oldName = map.id === 'shop' && slot === 2 ? 'card-shop-evening.png' : classicBackgrounds[map.id];
    const classicUrl = '/rpg-assets/' + (oldName || 'park.jpg');
    let sourceIndex = 0;
    const sources = [classicUrl, map.image].filter(Boolean);
    backdrop.onerror = () => {
      if (++sourceIndex < sources.length) backdrop.src = sources[sourceIndex];
    };
    backdrop.onload = () => layout();
    backdrop.src = sources[0];

    function frontArt(p) {
      const poses = config.characters?.[p.id]?.poses || {};
      const selected = poses[p.pose || 'standing'];
      // Keep scheduled uniforms and intentionally triggered outfit poses.
      if (p.triggerDialogue || selected?.outfit) return selected || poses.standing;
      if (selected?.facing === 'front') return selected;
      const preferred = poses.standing;
      if (preferred?.src && preferred.facing !== 'back') return preferred;
      return Object.values(poses).find(art => art?.src && art.facing === 'front') || selected;
    }
    for (const p of placements) {
      const profile = config.characters?.[p.id];
      const art = frontArt(p);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'neo-eye-character';
      button.title = 'Interact with ' + (profile?.name || p.id);
      button.setAttribute('aria-label', button.title);
      const img = document.createElement('img');
      img.alt = '';
      img.draggable = false;
      if (p.flipped) img.style.transform = 'scaleX(-1)';
      const fallback = document.createElement('span');
      fallback.className = 'neo-eye-fallback';
      fallback.textContent = (profile?.name || p.id).charAt(0);
      const name = document.createElement('span');
      name.className = 'neo-eye-name';
      name.textContent = profile?.name || p.id;
      button.append(img, fallback, name);
      button.addEventListener('click', event => {
        if (suppressClick) { event.preventDefault(); return; }
        openPerson(p);
      });
      cast.append(button);
      sprites.push({p,art,button,img});
    }
    function setChibiMode(enabled) {
      useChibi = !!enabled;
      for (const {p,art,button,img} of sprites) {
        button.classList.remove('is-missing');
        if (useChibi) {
          loadChibi(img,p.id);
          img.onerror = () => button.classList.add('is-missing');
        } else if (art?.src) {
          img.onerror = () => button.classList.add('is-missing');
          img.src = art.src;
        } else {
          img.removeAttribute('src');
          button.classList.add('is-missing');
        }
      }
      layout();
    }
    function moveTo(target, animated = false) {
      offset = clamp(target, 0, Math.max(0, stageWidth - camera.clientWidth));
      const duration = animated && !matchMedia('(prefers-reduced-motion:reduce)').matches ? 'transform .22s ease-out' : 'none';
      for (const element of [backdrop,shade,cast]) {
        element.style.transition = duration;
        element.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';
      }
      const buttons = arrows.querySelectorAll('button');
      buttons[0].disabled = offset <= 1;
      buttons[1].disabled = offset >= stageWidth - camera.clientWidth - 1;
    }
    function layout() {
      const width = camera.clientWidth, height = camera.clientHeight;
      if (!width || !height) return;
      const ratio = backdrop.naturalWidth && backdrop.naturalHeight
        ? backdrop.naturalWidth / backdrop.naturalHeight : 1.75;
      const spriteHeight = Math.round(clamp(height * (useChibi ? .43 : .69), useChibi ? 115 : 210, useChibi ? 270 : 590));
      const spacing = Math.max(useChibi ? 150 : 190, spriteHeight * (useChibi ? .57 : .54));
      const side = Math.max(spacing * .75, width * .18);
      stageWidth = Math.ceil(Math.max(width * 1.16, height * ratio, sprites.length * spacing + side * 2));
      backdrop.style.width = shade.style.width = cast.style.width = stageWidth + 'px';
      sprites.forEach(({button},i) => {
        const x = side + (stageWidth - side * 2) * (i + .5) / Math.max(1,sprites.length);
        button.style.left = x + 'px';
        button.style.setProperty('--neo-eye-height', spriteHeight + 'px');
      });
      moveTo(offset);
    }
    function center() { layout(); moveTo((stageWidth - camera.clientWidth)/2, true); }
    function setMode(enabled) {
      active = !!enabled;
      document.body.classList.toggle('neo-eye-level',active);
      toggle.textContent = active ? '◈ Eye-Level' : '▦ Map';
      toggle.setAttribute('aria-pressed',String(active));
      toggle.title = active ? 'Switch to the original top-down map' : 'Switch to eye-level character view';
      try { localStorage.setItem(preferenceKey,active?'eye':'map'); } catch {}
      if (active) center();
    }
    toggle.addEventListener('click', () => setMode(!active));
    document.getElementById('reset')?.addEventListener('click',() => {
      if (active) center();
    });
    stage.addEventListener('pointerdown', event => {
      if (!active || event.button !== 0 || event.target.closest('button')) return;
      dragging = {id:event.pointerId, x:event.clientX, initial:offset, moved:false};
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    });
    stage.addEventListener('pointermove', event => {
      if (!dragging || dragging.id !== event.pointerId) return;
      const delta = event.clientX - dragging.x;
      if (Math.abs(delta)>7) dragging.moved = true;
      moveTo(dragging.initial - delta);
    });
    function finishDrag(event) {
      if (!dragging || dragging.id !== event.pointerId) return;
      suppressClick = dragging.moved;
      dragging = null;
      stage.classList.remove('is-dragging');
      if (suppressClick) setTimeout(() => { suppressClick = false; }, 100);
    }
    stage.addEventListener('pointerup', finishDrag);
    stage.addEventListener('pointercancel', finishDrag);
    stage.addEventListener('keydown',event => {
      if (!active || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      moveTo(offset + (event.key === 'ArrowRight' ? 1 : -1) * camera.clientWidth * .45, true);
    });
    // Wheel/trackpad horizontal gestures are useful on desktop too.
    stage.addEventListener('wheel',event => {
      if (!active || event.ctrlKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        event.preventDefault();
        moveTo(offset + event.deltaX);
      }
    },{passive:false});
    addEventListener('resize',layout);
    setChibiMode(useChibi);
    let saved = 'map';
    try { saved = localStorage.getItem(preferenceKey) || 'map'; } catch {}
    setMode(saved === 'eye');
    // A URL can be used to preview the view without changing the saved preference.
    if (params.get('perspective') === 'eye') setMode(true);
    return {setChibiMode,center,setMode};
  }
  return {mount};
})();
