'use strict';
// Data-driven RPG outfit art selector; pure and save-state independent.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgOutfits=api;
})(typeof window!=='undefined'?window:null,function(){
 const imagePattern=/^\/rpg-assets\/[a-zA-Z0-9_/-]+\.(?:png|webp|jpg|jpeg)$/;
 const safeImage=x=>typeof x==='string'&&imagePattern.test(x)&&!x.includes('..')&&!x.includes('//');
 function select(outfits,context={}){
  if(!outfits||!outfits.variants||typeof outfits.variants!=='object')return null;
  const {sceneId,location,slot,day}=context;
  let key=outfits.default;
  if(sceneId&&Object.prototype.hasOwnProperty.call(outfits.sceneOverrides||{},sceneId))key=outfits.sceneOverrides[sceneId];
  else{
   const weekday=Number.isInteger(day)&&day>=1?(day-1)%7:null;
   for(const rule of outfits.rules||[]){
    if(rule.locations&&(!location||!rule.locations.includes(location)))continue;
    if(rule.slots&&(!Number.isInteger(slot)||!rule.slots.includes(slot)))continue;
    if(rule.weekdays&&(weekday===null||!rule.weekdays.includes(weekday)))continue;
    if(rule.startDay!==undefined&&(!Number.isInteger(day)||day<rule.startDay))continue;
    if(rule.endDay!==undefined&&(!Number.isInteger(day)||day>rule.endDay))continue;
    key=rule.outfit;break;
   }
  }
  return outfits.variants[key]?{key,variant:outfits.variants[key]}:null;
 }
 function sources(art,context={},expression='neutral',{base='',legacy=''}={}){
  const chosen=select(art?.outfits,context),paths=[];
  if(chosen)paths.push(chosen.variant.expressions?.[expression],chosen.variant.portrait);
  paths.push(art?.expressions?.[expression],legacy,art?.portrait,base);
  return [...new Set(paths.filter(safeImage))];
 }
 return Object.freeze({select,sources,safeImage});
});
