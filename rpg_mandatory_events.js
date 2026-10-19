'use strict';
/* Neo Harbor mandatory narrative scheduler. Pure data, no random gates, no UI dependencies. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgMandatoryEvents=api;
})(typeof window!=='undefined'?window:null,function(){
 const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const int=x=>Number.isInteger(x);
 const validId=x=>typeof x==='string'&&/^[a-z][a-z0-9_]{0,79}$/.test(x);
 const metrics=new Set(['affection','trust','respect','attraction']);
 const predicates=new Set(['dayGte','dayLte','storyDone','flag','relationship','duelCountGte','tournamentState','eventSeen','all','any','not']);
 function testPredicate(p,state){
  if(!plain(p)||Object.keys(p).length!==1)return false;
  const [key,value]=Object.entries(p)[0];
  switch(key){
   case 'all':return Array.isArray(value)&&value.every(x=>testPredicate(x,state));
   case 'any':return Array.isArray(value)&&value.length>0&&value.some(x=>testPredicate(x,state));
   case 'not':return !testPredicate(value,state);
   case 'dayGte':return int(value)&&state.day>=value;
   case 'dayLte':return int(value)&&state.day<=value;
   case 'storyDone':return !!state.storyDone?.[value];
   case 'flag':return !!(state.flags?.[value]||state.storyFlags?.[value]||Object.values(state.storyFlags||{}).includes(value));
   case 'eventSeen':return !!state.mandatoryEventState?.seen?.[value];
   case 'relationship':return plain(value)&&Number(state.relationships?.[value.npc]?.[value.metric])>=value.gte;
   case 'duelCountGte':return Array.isArray(state.results)&&state.results.length>=value;
   case 'tournamentState':return plain(value)&&state.tournaments?.[value.id]?.state===value.state;
   default:return false;
  }
 }
 function validate(events,context={}){
  const errors=[],byId=new Map(),known= new Set(context.characterIds||[]);
  const storyIds=new Set(context.storyIds||[]);
  const taken=new Set([...storyIds,...(context.otherIds||[])]);
  function check(p,path,deps){
   if(!plain(p)||Object.keys(p).length!==1){errors.push(path+': expected one predicate');return;}
   const [key,v]=Object.entries(p)[0];
   if(!predicates.has(key)){errors.push(path+': unsupported predicate '+key);return;}
   if(key==='all'||key==='any'){if(!Array.isArray(v)||!v.length)errors.push(path+': nonempty '+key+' required');else v.forEach((x,i)=>check(x,path+'.'+key+'['+i+']',deps));}
   else if(key==='not')check(v,path+'.not',deps);
   else if(key==='dayGte'||key==='dayLte'||key==='duelCountGte'){if(!int(v)||v<(key==='duelCountGte'?0:1)||v>(key==='duelCountGte'?100000:91))errors.push(path+': invalid '+key);}
   else if(key==='storyDone'){if(!validId(v)||(context.storyIds&&!storyIds.has(v)))errors.push(path+': unknown story '+v);}
   else if(key==='eventSeen'){if(!validId(v))errors.push(path+': invalid eventSeen');else deps.add(v);}
   else if(key==='flag'){if(!validId(v))errors.push(path+': invalid flag');}
   else if(key==='relationship'){if(!plain(v)||!validId(v.npc)||!metrics.has(v.metric)||!Number.isFinite(v.gte)||v.gte<0||(context.characterIds&&!known.has(v.npc)))errors.push(path+': invalid relationship');}
   else if(key==='tournamentState'){if(!plain(v)||!validId(v.id)||!['available','open','registered','active','champion','eliminated','missed','expired','complete'].includes(v.state))errors.push(path+': invalid tournamentState');}
  }
  for(const e of events||[]){
   const id=e?.id;
   if(!validId(id)){errors.push('Invalid event id '+id);continue;}
   if(byId.has(id)||taken.has(id))errors.push('Duplicate or reserved event id '+id);
   byId.set(id,e);
   if(!['season','bond'].includes(e.kind))errors.push(id+': invalid kind');
   if(!int(e.earliestDay)||e.earliestDay<1||e.earliestDay>91)errors.push(id+': invalid earliestDay');
   if(!int(e.priority)||e.priority<0||e.priority>9999)errors.push(id+': invalid priority');
   if(!['world','remote_or_present','remote','present'].includes(e.delivery))errors.push(id+': invalid delivery');
   if(e.kind==='season'&&e.delivery!=='world')errors.push(id+': season must use world delivery');
   if(e.kind==='bond'&&(!validId(e.characterId)||(context.characterIds&&!known.has(e.characterId))))errors.push(id+': missing/unknown characterId');
   if(e.timeCost!==0)errors.push(id+': timeCost must be 0 in v1');
   if(e.expiry!==undefined&&e.expiry!=='never')errors.push(id+': expiry must be never');
   if(e.fallback!==undefined&&e.fallback!=='queue')errors.push(id+': fallback must be queue');
   if(!Array.isArray(e.lines)||!e.lines.length||e.lines.some(l=>!plain(l)||typeof l.text!=='string'||!l.text.trim()||typeof l.speaker!=='string'||!(l.speaker==='Narrator'||l.speaker==='Protagonist'||(!context.characterIds||known.has(l.speaker)))))errors.push(id+': invalid lines/speakers');
   if(!Array.isArray(e.choices)||e.choices.length<1||e.choices.some(c=>!plain(c)||typeof c.label!=='string'||!c.label.trim()||typeof c.reply!=='string'||!c.reply.trim()||(c.flag!==undefined&&!validId(c.flag))||(c.effects!==undefined&&(!plain(c.effects)||Object.keys(c.effects).some(k=>k!=='flags')||!Array.isArray(c.effects.flags)||c.effects.flags.some(f=>!validId(f))))))errors.push(id+': invalid choices');
   if(e.choices?.some(c=>c.kind==='commit'||c.effects?.partner||c.effects?.relationship))errors.push(id+': mandatory scenes cannot force romance or relationship changes');
   const deps=new Set();check(e.trigger,id+'.trigger',deps);
  }
  const edges=new Map();
  for(const [id,e] of byId){
   const deps=new Set();
   const collect=p=>{if(!plain(p))return;for(const [k,v] of Object.entries(p)){if(k==='eventSeen')deps.add(v);else if(k==='all'||k==='any'){if(Array.isArray(v))v.forEach(collect);}else if(k==='not')collect(v);}};
   collect(e.trigger);
   for(const ref of deps)if(!byId.has(ref))errors.push(id+': unknown eventSeen '+ref);
   edges.set(id,deps);
  }
  const visiting=new Set(),visited=new Set();
  function visit(id){if(visiting.has(id)){errors.push('Circular eventSeen dependency '+id);return;}if(visited.has(id))return;visiting.add(id);for(const d of edges.get(id)||[])if(edges.has(d))visit(d);visiting.delete(id);visited.add(id);}
  for(const id of byId.keys())visit(id);
  return errors;
 }
 function hydrate(state,events=[]){
  if(!plain(state.mandatoryEventState))state.mandatoryEventState={};
  const m=state.mandatoryEventState,known=new Set(events.map(e=>e.id));
  if(!plain(m.seen))m.seen={};
  if(!Array.isArray(m.pending))m.pending=[];
  const queued=new Set();
  m.pending=m.pending.filter(x=>{
   if(!plain(x)||!known.has(x.id)||m.seen[x.id]||queued.has(x.id))return false;
   queued.add(x.id);return true;
  }).map(x=>({id:x.id,eligibleDay:int(x.eligibleDay)?x.eligibleDay:state.day,eligibleSlot:int(x.eligibleSlot)?x.eligibleSlot:state.slot}));
  if(!plain(m.active)||!known.has(m.active.id)||m.seen[m.active.id])m.active=null;
  else{
   const e=events.find(x=>x.id===m.active.id);
   if(!['lines','choice','response'].includes(m.active.phase))m.active.phase='lines';
   m.active.index=Math.max(0,Math.min(e.lines.length-1,int(m.active.index)?m.active.index:0));
   if(!int(m.active.choice)||!e.choices[m.active.choice])m.active.choice=null;
   if(m.active.phase==='response'&&m.active.choice===null)m.active.phase='choice';
   m.pending=m.pending.filter(x=>x.id!==m.active.id);
  }
  if(typeof m.lastPlayedStamp!=='string')m.lastPlayedStamp=null;
  return m;
 }
 function due(state,events){
  const m=hydrate(state,events);
  return events.filter(e=>e.earliestDay<=state.day&&!m.seen[e.id]&&m.active?.id!==e.id&&!m.pending.some(x=>x.id===e.id)&&testPredicate(e.trigger,state));
 }
 function rank(a,b,lookup){
  const x=lookup.get(a.id),y=lookup.get(b.id);
  return (x.kind==='season'?0:1)-(y.kind==='season'?0:1)||y.priority-x.priority||a.eligibleDay-b.eligibleDay||a.eligibleSlot-b.eligibleSlot||a.id.localeCompare(b.id);
 }
 function queue(state,events){
  const m=hydrate(state,events);
  for(const e of due(state,events))m.pending.push({id:e.id,eligibleDay:state.day,eligibleSlot:state.slot});
  m.pending.sort((a,b)=>rank(a,b,new Map(events.map(e=>[e.id,e]))));
  return m.pending;
 }
 function safe(state){
  return !state.pendingDuel&&!state.activeStory&&!state.activeSituation&&!state.activeSideQuest&&!state.activeEncounter&&!state.activeArc&&!state.activeCG&&!state.activeAppointment&&!state.activePreparedDuel;
 }
 function takeNext(state,events,options={}){
  const m=hydrate(state,events);queue(state,events);
  if(m.active||options.safe===false||!safe(state))return null;
  const stamp=state.day+':'+state.slot;
  const index=m.pending.findIndex(p=>{
   const e=events.find(x=>x.id===p.id);
   return e&&(m.lastPlayedStamp!==stamp||e.closure===true)&&testPredicate(e.trigger,state);
  });
  if(index<0)return null;
  const item=m.pending.splice(index,1)[0];
  m.active={id:item.id,phase:'lines',index:0,choice:null};
  m.lastPlayedStamp=stamp;
  return m.active;
 }
 function advanceDialogue(state,events){
  const m=hydrate(state,events),a=m.active,e=events.find(x=>x.id===a?.id);
  if(!a||a.phase!=='lines'||!e)return false;
  a.index++;
  if(a.index>=e.lines.length){a.index=e.lines.length-1;a.phase='choice';}
  return true;
 }
 function choose(state,events,index){
  const m=hydrate(state,events),a=m.active,e=events.find(x=>x.id===a?.id);
  if(!a||a.phase!=='choice'||!int(index)||!e?.choices[index])return false;
  a.phase='response';a.choice=index;return true;
 }
 function finish(state,events){
  const m=hydrate(state,events),a=m.active,e=events.find(x=>x.id===a?.id);
  if(!a||!e||a.phase!=='response'||!int(a.choice)||!e.choices[a.choice])return null;
  if(m.seen[a.id]){m.active=null;return null;}
  const chosen=e.choices[a.choice];
  m.seen[a.id]={day:state.day,slot:state.slot,choice:a.choice};
  if(chosen.flag){state.storyFlags=plain(state.storyFlags)?state.storyFlags:{};state.storyFlags[a.id]=chosen.flag;}
  if(chosen.effects?.flags?.length){state.flags=plain(state.flags)?state.flags:{};for(const flag of chosen.effects.flags)state.flags[flag]=true;}
  m.active=null;
  return {event:e,choice:chosen};
 }
 return Object.freeze({validate,hydrate,testPredicate,due,queue,takeNext,advanceDialogue,choose,finish,safe});
});
