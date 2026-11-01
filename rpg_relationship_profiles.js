'use strict';
/*
 * Character-specific relationship preferences.
 *
 * The four numbers are weights for the four raw relationship metrics:
 * affection, trust, respect and attraction. Every profile uses the same
 * 4:3:2:1 budget; only the priority order changes. This keeps the system
 * understandable while allowing the same answer to land differently with
 * different characters.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgRelationshipProfiles=api;
})(typeof window!=='undefined'?window:null,function(){
 const metrics=['affection','trust','respect','attraction'];
 const defaultProfile=Object.freeze({
  affection:2,trust:2,respect:2,attraction:2,
  weights:Object.freeze({affection:2,trust:2,respect:2,attraction:2})
 });
 const orders={
  // Trust-first characters: consistency and emotional safety matter most.
  hana:['trust','respect','affection','attraction'],
  shiori:['trust','respect','affection','attraction'],
  camila:['trust','respect','affection','attraction'],
  marina:['trust','affection','respect','attraction'],
  alma:['trust','respect','affection','attraction'],
  luna:['trust','respect','affection','attraction'],
  elena:['trust','affection','respect','attraction'],
  lyla:['trust','respect','attraction','affection'],
  jicy:['trust','affection','respect','attraction'],

  // Respect-first characters: competence, honesty and boundaries lead.
  reina:['respect','trust','attraction','affection'],
  akari:['respect','trust','affection','attraction'],
  elio:['respect','trust','affection','attraction'],
  nereo:['respect','trust','affection','attraction'],
  jun:['respect','trust','affection','attraction'],
  sierra:['respect','trust','attraction','affection'],
  kaede:['respect','trust','attraction','affection'],

  // Affection-first characters: warmth and shared enthusiasm are clearest.
  yuna:['affection','attraction','trust','respect'],
  teo:['affection','trust','respect','attraction'],
  iris:['affection','trust','attraction','respect'],
  daisy:['affection','trust','attraction','respect'],
  rina:['affection','attraction','trust','respect'],
  sol:['affection','trust','respect','attraction'],

  // Attraction-first characters: playful chemistry matters, but still sits
  // on top of affection and trust rather than replacing them.
  barb:['attraction','affection','trust','respect'],
  laca:['attraction','affection','trust','respect'],
  jinx:['attraction','affection','trust','respect']
 };
 const profiles={};
 for(const [id,order] of Object.entries(orders)){
  const weights={};
  order.forEach((metric,index)=>{weights[metric]=4-index;});
  profiles[id]=Object.freeze({
   affection:weights.affection,
   trust:weights.trust,
   respect:weights.respect,
   attraction:weights.attraction,
   weights:Object.freeze(weights)
  });
 }
 const frozenProfiles=Object.freeze(profiles);
 function profileFor(id){
  return frozenProfiles[String(id||'').toLowerCase()]||defaultProfile;
 }
 return Object.freeze({
  version:1,
  metrics:Object.freeze(metrics.slice()),
  defaultProfile,
  profiles:frozenProfiles,
  profileFor
 });
});
