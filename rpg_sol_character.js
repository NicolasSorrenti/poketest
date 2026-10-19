'use strict';
// Backward-compatible Sol export. Sol's single source of truth is characters/sol/*.json.
// Other character packs register automatically through rpg_character_packs.generated.js.
(function(root,factory){
 const packs=typeof module==='object'&&module.exports?require('./rpg_character_packs.generated'):root.NeoRpgCharacterPacks;
 const api=factory(packs);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgSolCharacter=api;
})(typeof window!=='undefined'?window:null,function(packs){
 const sol=packs?.byId('sol');
 if(!sol)throw Error('Missing Sol character pack: run npm run characters:build');
 return Object.freeze({cast:{sol:sol.cast},looks:{sol:sol.looks},schedules:{sol:sol.schedule},arrivals:{sol:sol.arrivalDay},events:sol.events,
  validate:()=>sol.events.filter(e=>e.npc!=='sol'||e.choices?.length<2||e.lines?.length<6).map(e=>e.id)});
});
