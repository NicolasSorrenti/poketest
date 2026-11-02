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
    // All rendering is isolated to the map iframe; no RPG game state is mutated.
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
      'body.neo-overworld-dialogue #neoEyeLevelStage .neo-eye-character,body.neo-overworld-dialogue #neoEyeLevelArrows,body.neo-overworld-dialogue #neoEyeLevelToggle{display:none!important}',
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
    // Dedicated, character-free 3200x1080 PNGs take priority over the
    // transitional mirrored SVG panoramas. Never modify the top-down art.
    const productionBackgrounds = {
      arcade:'arcade-eye-level.png',
      cafe:'cafe-eye-level.png',
      park:'park-eye-level.png',
      home:'apartment-eye-level.png',
      center:'tournament-eye-level.png',
      library:'library-eye-level.png'
    };
    const productionUrl = productionBackgrounds[map.id]
      ? '/rpg-assets/eye-level/' + productionBackgrounds[map.id] : null;
    const panoramaUrl = '/rpg-assets/eye-level/' + map.id + '-panorama.svg';
    // The original shop illustration is an eye-level plate already, but is too large
    // for the repository connector to embed into an SVG. Build its wider version
    // from that same artwork in the browser, without changing the source image.
    const sources = map.id === 'shop'
      ? [classicUrl, '/rpg-assets/card-shop-day.png', panoramaUrl, map.image].filter(Boolean)
      : [productionUrl, panoramaUrl, classicUrl, map.image].filter(Boolean);
    let sourceIndex = 0;
    const sourceImage = new Image();
    const showNextSource = () => {
      if (++sourceIndex < sources.length) sourceImage.src = sources[sourceIndex];
      else console.warn('No eye-level panorama available for', map.id);
    };
    function shopPanorama(image) {
      const canvas = document.createElement('canvas');
      canvas.width = 3200;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const draw = () => ctx.drawImage(image,600,0,2000,1080);
      // Reflect the existing scenery at both edges, not the character layer.
      ctx.save(); ctx.translate(1200,0); ctx.scale(-1,1); draw(); ctx.restore();
      ctx.save(); ctx.translate(5200,0); ctx.scale(-1,1); draw(); ctx.restore();
      draw();
      const vignette = ctx.createLinearGradient(0,0,0,1080);
      vignette.addColorStop(0,'rgba(12,9,24,.18)');
      vignette.addColorStop(.25,'rgba(12,9,24,0)');
      vignette.addColorStop(.85,'rgba(12,9,24,0)');
      vignette.addColorStop(1,'rgba(12,9,24,.18)');
      ctx.fillStyle=vignette; ctx.fillRect(0,0,3200,1080);
      return canvas.toDataURL('image/webp',.85);
    }
    sourceImage.onload = () => {
      try {
        backdrop.src = map.id === 'shop' && sourceIndex < 2
          ? shopPanorama(sourceImage) || sourceImage.src
          : sourceImage.src;
      } catch(error) {
        console.warn('Panorama composition failed; using original artwork',error);
        backdrop.src = sourceImage.src;
      }
    };
    sourceImage.onerror = showNextSource;
    backdrop.onerror = showNextSource;
    backdrop.onload = () => layout();
    sourceImage.src = sources[0];

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
          // loadChibi owns the error chain across the existing fallback sprites.
          loadChibi(img,p.id);
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
        ? backdrop.naturalWidth / backdrop.naturalHeight : 3200/1080;
      const spriteHeight = Math.round(clamp(height * (useChibi ? .43 : .69), useChibi ? 115 : 210, useChibi ? 270 : 590));
      // Normalized staging positions for the 3200x1080 panoramas. These are
      // deliberately separate from top-down map coordinates and can be tuned
      // once the final PNG artwork is installed without touching gameplay.
      // Each zone keeps feet on a common plane and avoids extreme side edges.
      const sceneStaging = {
        shop:   {slots:[.23,.44,.66,.83], ground:.105, scale:1.00},
        arcade: {slots:[.16,.32,.50,.68,.84],ground:.115,scale:.98},
        park:   {slots:[.15,.32,.50,.68,.85],ground:.105,scale:1.00},
        cafe:   {slots:[.19,.39,.61,.81],ground:.12, scale:.96},
        home:   {slots:[.23,.48,.75],ground:.115,scale:.94},
        center: {slots:[.15,.32,.50,.68,.85],ground:.105,scale:1.00},
        library:{slots:[.19,.39,.61,.81],ground:.115,scale:.96}
      };
      const zone = sceneStaging[map.id] || sceneStaging.shop;
      // Maintain the authored 3200x1080 proportions. Never stretch a
      // panoramic background differently on mobile and desktop.
      stageWidth = Math.ceil(Math.max(width * 1.4, height * ratio));
      backdrop.style.width = shade.style.width = cast.style.width = stageWidth + 'px';
      // Choose a centered run of slots, retaining location-specific anchors.
      // For more NPCs than authored slots, distribute uniformly in the safe
      // 12%-88% span. Preserve the RPG's NPC order for predictable tapping.
      const count = sprites.length;
      let slots;
      if(count <= zone.slots.length){
        const start=Math.floor((zone.slots.length-count)/2);
        slots=zone.slots.slice(start,start+count);
      } else {
        slots=Array.from({length:count},(_,i)=>.12 + .76*(i+.5)/count);
      }
      // Don't let large sprites overlap on narrower screens. Widen the stage
      // rather than shrinking characters or hiding NPCs.
      const desiredGap = Math.round(Math.max(useChibi?140:210,spriteHeight*(useChibi?.55:.70)));
      const minSpan = count>1 ? desiredGap*(count-1)/Math.max(.01,slots[count-1]-slots[0]) : 0;
      if(minSpan > stageWidth){
        stageWidth=Math.ceil(minSpan);
        backdrop.style.width=shade.style.width=cast.style.width=stageWidth+'px';
      }
      sprites.forEach(({button},i) => {
        button.style.left=Math.round(slots[i]*stageWidth)+'px';
        button.style.bottom=(zone.ground*100)+'%';
        button.style.setProperty('--neo-eye-height',Math.round(spriteHeight*zone.scale)+'px');
      });
      moveTo(offset);
    }
    function center() {
      layout();
      moveTo((stageWidth - camera.clientWidth)/2,true);
    }
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
      if (!active || event.button !== 0 || event.target.closest('#neoEyeLevelArrows')) return;
      dragging = {id:event.pointerId, x:event.clientX, initial:offset, moved:false};
      // Delay pointer capture until a real swipe so simple NPC taps keep working.
      stage.classList.add('is-dragging');
    });
    stage.addEventListener('pointermove', event => {
      if (!dragging || dragging.id !== event.pointerId) return;
      const delta = event.clientX - dragging.x;
      if (Math.abs(delta)>7 && !dragging.moved) {
        dragging.moved = true;
        stage.setPointerCapture(event.pointerId);
      }
      if (dragging.moved) moveTo(dragging.initial - delta);
    });
    function finishDrag(event) {
      if (!dragging || dragging.id !== event.pointerId) return;
      suppressClick = dragging.moved;
      if (dragging.moved) event.preventDefault();
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
    // Opt-in preview link for testing in both screen sizes.
    if (params.get('perspective') === 'eye') setMode(true);
    return {setChibiMode,center,setMode};
  }
  return {mount};
})();
