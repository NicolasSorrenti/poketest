'use strict';
// Canonical RPG relationship mutations. Relationships are authoritative after
// a one-time legacy save reconciliation; bonds remain a mirrored compatibility view.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgRelationships=api;
})(typeof window!=='undefined'?window:null,function(){
 const shared=['affection','trust','duels'],metrics=[...shared,'respect','attraction'];
 const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
 const score=v=>Number.isFinite(v)&&v>=0?Math.min(999,Math.floor(v)):0;
 function buckets(s){
  if(!s||typeof s!=='object')throw Error('Missing RPG relationship state');
  if(!plain(s.relationships))s.relationships={};
  if(!plain(s.bonds))s.bonds={};
 }
 function ensure(s,id){
  buckets(s);
  if(typeof id!=='string'||!id)throw Error('Invalid relationship character');
  const hadR=plain(s.relationships[id]),hadB=plain(s.bonds[id]);
  if(!hadR)s.relationships[id]={};
  if(!hadB)s.bonds[id]={};
  const r=s.relationships[id],b=s.bonds[id];
  for(const k of metrics)r[k]=score(r[k]===undefined&&hadB?b[k]:r[k]);
  for(const k of shared)b[k]=r[k];
  return r;
 }
 // Only reconcile historical saves once. Never take max on a later reload:
 // doing so would undo missed-appointment trust penalties.
 function hydrate(s,ids=[]){
  buckets(s);
  if(s.relationshipModelVersion!==1){
   for(const id of new Set([...Object.keys(s.relationships),...Object.keys(s.bonds),...ids])){
    if(!plain(s.relationships[id]))s.relationships[id]={};
    if(!plain(s.bonds[id]))s.bonds[id]={};
    for(const k of shared){
     const merged=Math.max(score(s.relationships[id][k]),score(s.bonds[id][k]));
     s.relationships[id][k]=merged;s.bonds[id][k]=merged;
    }
    for(const k of ['respect','attraction'])s.relationships[id][k]=score(s.relationships[id][k]);
   }
   s.relationshipModelVersion=1;
  }
  for(const id of new Set([...Object.keys(s.relationships),...Object.keys(s.bonds),...ids]))ensure(s,id);
  return s;
 }
 function apply(s,id,delta){
  if(!plain(delta))throw Error('Invalid relationship change');
  const allowed=Object.entries(delta).filter(([key,value])=>metrics.includes(key)&&Number.isFinite(value));
  if(allowed.length!==Object.keys(delta).length)throw Error('Invalid relationship metric');
  const r=ensure(s,id),b=s.bonds[id];
  for(const [key,value] of allowed){
   r[key]=Math.max(0,Math.min(999,score(r[key])+value));
   if(shared.includes(key))b[key]=r[key];
  }
  return r;
 }
 return Object.freeze({hydrate,ensure,apply,metrics,shared});
});
