'use strict';
// Pure, transport-neutral presentation helper. Authoritative option ids are never
// inferred from a card click; only ids already offered by the server are sent.
(function(root){
 function fieldTargets(decision,view,actor){
  if(!decision||decision.actor!==actor||!Array.isArray(decision.options)||!decision.options.length||!view?.players)return null;
  const entries=decision.options.map(option=>{
   const match=/^(slot|bench):(-?\d+)$/.exec(option.id);
   if(!match)return null;
   const slot=Number(match[2]);if(!Number.isSafeInteger(slot)||slot< -1||slot>4)return null;
   return {id:option.id,label:String(option.label||''),slot};
  });
  if(entries.some(x=>!x))return null;
  const label=String(decision.label||'').toLowerCase();
  // The chooser isn't necessarily the owner: e.g. Gust of Wind and Ninja Trick.
  let owner=null;
  if(/opponent chooses your |choose (?:an? |one )?opponent|opposing|defending|enemy |opponent replacement|opponent['’]s (?:bench|active|pokémon|pokemon)/i.test(label))owner=1-actor;
  else if(/your |one of your|own |attach .* to|replacement active|return one of your/i.test(label))owner=actor;
  const normalized=x=>String(x||'').toLowerCase().replace(/\s+/g,' ').trim();
  const isMatch=(text,name)=>{
   text=normalized(text);name=normalized(name);
   return text===name||text.endsWith(': '+name)||text.endsWith(' — '+name)||text.endsWith(' '+name);
  };
  const mapped=[];
  for(const e of entries){
   const candidates=[];
   for(const side of (owner===null?[0,1]:[owner])){
    const p=view.players[side];if(!p)continue;
    const u=e.slot===-1?p.active:p.bench?.[e.slot];
    if(!u)continue;
    const name=u.displayName||u.cardName||u.name||null;
    candidates.push({side,unit:u,name});
   }
   // Caller can supply the catalogue's names after this pure filter.
   if(!candidates.length)return null;
   mapped.push({...e,candidates});
  }
  return {options:mapped,owner,matchName:isMatch};
 }
 function resolveTargets(decision,view,actor,card){
  const result=fieldTargets(decision,view,actor);if(!result)return null;
  const selected=[];
  for(const option of result.options){
   const matches=option.candidates.filter(({unit,name})=>result.matchName(option.label,name||card(unit.id).name));
   const possibles=matches.length?matches:option.candidates.filter(({unit})=>{
    const text=option.label.toLowerCase();
    // Only accept name-less labels when the target owner is explicit.
    return result.owner!==null && (/^(active|bench)(?:\s*\d+)?$/i.test(text)||text==='');
   });
   if(possibles.length!==1)return null; // Never guess when either field could match.
   selected.push({id:option.id,side:possibles[0].side,slot:option.slot,label:option.label});
  }
  if(new Set(selected.map(x=>`${x.side}:${x.slot}`)).size!==selected.length)return null;
  return selected;
 }
 const api={fieldTargets,resolveTargets};
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.NeoBattleDecisionUI=api;
})(typeof window!=='undefined'?window:globalThis);
