'use strict';
/* Scene composition only. Characters who happen to be at the same venue
 * should not photobomb a conversation or a scripted story scene. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgSceneCast=api;
})(typeof window!=='undefined'?window:null,function(){
 function speakerId(speaker,cast={}){
  if(typeof speaker!=='string')return null;
  const name=speaker.replace(/^✉\s*/,'').replace(/\s*·\s*message\s*$/,'').trim();
  const ids=Object.keys(cast);
  const exact=ids.find(id=>name===id||name===cast[id]?.name);
  if(exact)return exact;
  // Some authored scenes use first names (e.g. "Reina") as speaker labels.
  // Only accept an unambiguous match so an unrelated character isn't shown.
  const short=ids.filter(id=>name===cast[id]?.name?.split(' ')[0]);
  return short.length===1?short[0]:null;
 }
 function select({cast={},present=[],portraitId=null,shown=null,active=false,script=[],remote=false}={}){
  const lines=Array.isArray(script)&&script.length?script:
   Array.isArray(shown?.dialogue)?shown.dialogue:[];
  const speakers=lines.map(line=>speakerId(Array.isArray(line)?line[0]:line?.speaker,cast)).filter(Boolean);
  const focused=speakerId(shown?.speaker,cast);
  const conversation=!!active||!!shown?.dialogue||
   !!(shown?.line&&focused)||
   !!(shown?.line&&shown?.speaker==='You'&&portraitId&&cast[portraitId]);
  if(!conversation){
   const people=[...new Set([focused,...present,portraitId].filter(id=>!!cast[id]))].slice(0,6);
   return {conversation:false,focused,participants:people};
  }
  // A phone/message exchange should not physically summon its sender.
  if(remote)return {conversation:true,focused:null,participants:[]};
  const participants=[...new Set([...speakers,focused,
   ...(speakers.length?[]:[portraitId])].filter(id=>!!cast[id]))];
  return {conversation:true,focused,participants};
 }
 // Reusable two-person VN portrait window. A newly speaking third person
 // takes the slot of the least-recently-speaking visible person; the other
 // speaker stays on screen. This is independent of everyone attending a map.
 function createSpeakerWindow(){
  let visible=[],recency=new Map(),tick=0;
  function reset(){visible=[];recency=new Map();tick=0;}
  function update(participants,focused){
   const choices=[...new Set((participants||[]).filter(p=>p&&typeof p.id==='string').map(p=>p.id))];
   visible=visible.filter(id=>choices.includes(id));
   for(const id of [...recency.keys()])if(!choices.includes(id))recency.delete(id);
   if(!choices.length){reset();return [];}
   const speaker=choices.includes(focused)?focused:null;
   if(speaker&&!visible.includes(speaker)){
    if(visible.length===2){
     // Least recent speaker is replaced, rather than shifting both portraits.
     const victim=recency.get(visible[0])<=recency.get(visible[1])?0:1;
     visible[victim]=speaker;
    }else visible.push(speaker);
   }
   if(speaker)recency.set(speaker,++tick);
   for(const id of choices){
    if(visible.length>=2)break;
    if(!visible.includes(id))visible.push(id);
   }
   return visible.map(id=>participants.find(p=>p.id===id));
  }
  return Object.freeze({update,reset});
 }
 return Object.freeze({speakerId,select,createSpeakerWindow});
});
