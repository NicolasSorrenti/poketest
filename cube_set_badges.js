'use strict';
// Shared expansion badges for Solo Cube selection and Multiplayer room setup.
// Before a draft, these show eligible printings; after creation they can show
// the precise expansions present in that seeded 240-card cube.
(()=>{
 const SETS=Object.freeze({
  base1:{name:'Base Set',short:'Base',mark:'★',color:'#d9a94d'},
  base2:{name:'Jungle',short:'Jungle',mark:'✿',color:'#5fbb78'},
  base3:{name:'Fossil',short:'Fossil',mark:'◆',color:'#b69a77'},
  base4:{name:'Base Set 2',short:'Base 2',mark:'2',color:'#a0a9d9'},
  base5:{name:'Team Rocket',short:'Rocket',mark:'R',color:'#c66b77'},
  gym1:{name:'Gym Heroes',short:'Gym Heroes',mark:'GH',color:'#7fa4d7'},
  gym2:{name:'Gym Challenge',short:'Gym Challenge',mark:'GC',color:'#d89b63'},
  neo1:{name:'Neo Genesis',short:'Neo Genesis',mark:'NG',color:'#7dc5bb'},
  neo2:{name:'Neo Discovery',short:'Neo Discovery',mark:'ND',color:'#a995d9'},
  neo3:{name:'Neo Revelation',short:'Neo Revelation',mark:'NR',color:'#d58fb8'},
  neo4:{name:'Neo Destiny',short:'Neo Destiny',mark:'N★',color:'#a2a6e4'}
 });
 const ORDER=Object.keys(SETS);
 const style=document.createElement('style');
 style.textContent=`.cube-set-overview{margin:9px 0 15px}.cube-set-caption{font-size:12px;font-weight:800;letter-spacing:.04em;color:#dae4fa;margin-bottom:7px}.cube-set-grid{display:flex;flex-wrap:wrap;gap:6px}.cube-set-chip{display:inline-flex;gap:6px;align-items:center;white-space:nowrap;color:#eaf0ff;background:#253550;border:1px solid #52698e;border-radius:8px;padding:4px 8px 4px 4px;font-size:12px;font-weight:650}.cube-set-mark{display:grid;place-items:center;width:26px;height:26px;flex:none;border-radius:5px;background:var(--cube-set-color);color:#101e33;font-size:11px;font-weight:900;line-height:1}.cube-set-note{display:block;color:#adbfdc;font-size:12px;margin-top:7px;line-height:1.4}@media(max-width:520px){.cube-set-grid{gap:5px}.cube-set-chip{font-size:11px;padding:3px 6px 3px 3px}.cube-set-mark{width:23px;height:23px}}`;
 document.head.append(style);
 function fromPool(pool){
  if(!Array.isArray(pool))return [];
  const present=new Set(pool.map(card=>String(card?.id||'').split('-')[0]));
  return ORDER.filter(id=>present.has(id));
 }
 function render(target,{sets=[],exact=false,fixed=false}={}){
  if(!target)return;
  const selected=new Set(Array.isArray(sets)?sets:[]);
  const ids=ORDER.filter(id=>selected.has(id));
  target.replaceChildren();
  target.hidden=!ids.length;
  if(!ids.length)return;
  const title=document.createElement('div');
  title.className='cube-set-caption';
  title.textContent=exact?'Expansions in this draft':fixed?'Expansions in this fixed Cube':'Expansions available in this Cube';
  const grid=document.createElement('div');
  grid.className='cube-set-grid';
  grid.setAttribute('role','list');
  grid.setAttribute('aria-label',title.textContent);
  for(const id of ids){
   const s=SETS[id],chip=document.createElement('span');
   chip.className='cube-set-chip';chip.setAttribute('role','listitem');
   chip.setAttribute('aria-label',s.name);chip.title=s.name;
   const mark=document.createElement('span');
   mark.className='cube-set-mark';mark.textContent=s.mark;
   mark.style.setProperty('--cube-set-color',s.color);
   mark.setAttribute('aria-hidden','true');
   const label=document.createElement('span');label.textContent=s.short;
   chip.append(mark,label);grid.append(chip);
  }
  const note=document.createElement('small');
  note.className='cube-set-note';
  note.textContent=exact?
   'The full 240-card list used for this draft.':
   fixed?'Fixed 240-card Cube: the card pool stays the same, only the packs are shuffled.':
   'Eligible card printings; the final 240-card selection is randomized.';
  target.append(title,grid,note);
 }
 window.CubeSetBadges={render,fromPool};
})();
