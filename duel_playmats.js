'use strict';
// Visual only: playmats are deliberately independent of rules and online state.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoDuelPlaymats=api;})(typeof window==='undefined'?null:window,function(){
 const defaults=[{id:'aurora',name:'Neo Campus · Aurora',colors:['#112c45','#116480','#6ae0ca'],symbol:'✦'},{id:'arcade',name:'Neon Arcade',colors:['#261339','#713580','#ed9ee7'],symbol:'◇'},{id:'heritage',name:'Classic Tournament',colors:['#173527','#56784d','#ecd9a4'],symbol:'★'}];
 const themes={
 hana:['Hana','#253e60','#598aab','#c0ebf9','✦'],reina:['Reina','#461f38','#a24466','#ffdaad','♛'],shiori:['Shiori','#20324b','#5678a8','#c2d7fa','◆'],yuna:['Yuna','#441d59','#a24aaa','#ffdc81','★'],
 akari:['Akari','#143946','#47848e','#b7ebe4','⌁'],camila:['Camila','#24382c','#648348','#e0d391','✣'],marina:['Marina','#183c58','#398aad','#a7eafa','≈'],kaede:['Kaede','#34213d','#8a517d','#ecc0df','✶'],
 jun:['Jun','#1d3543','#528c94','#cfeced','◆'],teo:['Teo','#323254','#8b6fbb','#f8e0b0','✦'],iris:['Iris','#2a2c4b','#796ab0','#ddcfff','✧'],jinx:['Jinx','#1b2d63','#5868d4','#f2b0f2','⚡'],
 luna:['Luna','#14334f','#3f82b5','#a1dcff','☾'],sol:['Sol','#523027','#b26942','#fce19a','☀'],elena:['Elena','#2a2d47','#7e819f','#e2dbe6','◇'],rina:['Rina','#1c3b2d','#478865','#b6e7ac','❀'],
 sierra:['Sierra','#362444','#885a99','#e4b5eb','✦'],elio:['Elio','#2e3551','#697cb3','#f0d6ad','★'],alma:['Alma','#313144','#78718c','#dbcae6','✿'],nereo:['Nereo','#183d55','#3787a4','#a6e5ee','≈']
 };
 const catalog=[...defaults,...Object.entries(themes).map(([id,v])=>({id:'npc-'+id,name:v[0]+' · Signature Mat',colors:v.slice(1,4),symbol:v[4]}))];
 const lookup=new Map(catalog.map(m=>[m.id,m]));
 function gifted(state){const owned=new Set();for(const [id,value] of Object.entries(state?.playmatGifts||{}))if(value&&themes[id])owned.add(id);for(const r of Object.values(state?.milestoneRewards||{}))if(r?.chapter>=2&&themes[r?.npc])owned.add(r.npc);return [...owned].sort();}
 function available(ids=[]){return [...defaults,...[...new Set(ids)].filter(id=>themes[id]).map(id=>lookup.get('npc-'+id))];}
 function choose(id,ids){return ids.includes(id)?id:defaults[0].id;}
 function svg(id){
  const m=lookup.get(id)||defaults[0],c=m.colors,label=m.name.replace(/[&<>"']/g,'');
  const art=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640" viewBox="0 0 1280 640"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${c[0]}"/><stop offset=".56" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[0]}"/></linearGradient><radialGradient id="a"><stop stop-color="${c[2]}" stop-opacity=".42"/><stop offset="1" stop-color="${c[2]}" stop-opacity="0"/></radialGradient><pattern id="p" width="76" height="76" patternUnits="userSpaceOnUse" patternTransform="rotate(-26)"><path d="M0 0V76 M15 0V76" stroke="${c[2]}" stroke-opacity=".1" stroke-width="2"/></pattern></defs><rect width="1280" height="640" fill="url(#g)"/><rect width="1280" height="640" fill="url(#p)"/><circle cx="870" cy="326" r="390" fill="url(#a)"/><circle cx="870" cy="326" r="250" fill="none" stroke="${c[2]}" stroke-opacity=".24" stroke-width="5"/><circle cx="870" cy="326" r="194" fill="none" stroke="${c[2]}" stroke-opacity=".19" stroke-width="3"/><path d="M-100 520L520-80 M670 730L1380-20" stroke="${c[2]}" stroke-width="42" stroke-opacity=".08"/><rect x="24" y="24" width="1232" height="592" fill="none" stroke="${c[2]}" stroke-opacity=".45" stroke-width="4"/><text x="870" y="423" text-anchor="middle" fill="${c[2]}" fill-opacity=".22" font-size="270" font-family="Arial,sans-serif" font-weight="900">${m.symbol}</text><text x="85" y="480" fill="white" fill-opacity=".2" font-size="70" font-family="Arial,sans-serif" font-weight="900">NEO CAMPUS</text><text x="89" y="523" fill="${c[2]}" fill-opacity=".73" font-size="22" letter-spacing="5" font-family="Arial,sans-serif">${label.toUpperCase()}</text></svg>`;
  return 'url("data:image/svg+xml,'+encodeURIComponent(art)+'")';
 }
 function apply(side,id){if(!side)return;side.dataset.playmat=lookup.has(id)?id:'aurora';side.style.setProperty('--neo-playmat-image',svg(id));}
 return {defaults,themes,catalog,gifted,available,choose,svg,apply};
});
