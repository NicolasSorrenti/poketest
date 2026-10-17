'use strict';
// Shared validation for attack, Power and Trainer Pokémon-target prompts.
// The caller supplies *current* legal targets on commit, so invalidated targets
// (KO, switch, evolution, moved units) cannot be selected from a stale prompt.
(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./decision_session'):root.NeoDecisionSession);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.NeoTargetChoiceBridge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(core){
 if(!core)throw Error('decision_session must load before target_choice_bridge');
 let serial=0;
 const pending=new WeakMap();
 function identity(target){return `${target.side}:${target.slot}`;}
 function prepare(request,targets,actor=0){
  if(!request||typeof request!=='object'||!Array.isArray(targets)||!targets.length)throw Error('No legal targets');
  if(pending.has(request))return pending.get(request).decision;
  const ids=new Set();
  const options=targets.map(t=>{
   const id=identity(t);
   if(ids.has(id))throw Error('Duplicate target');
   ids.add(id);
   return {id,label:t.slot===-1?'Active Pokémon':`Bench ${t.slot+1}`};
  });
  const session=core.createSession({actor,kind:'pokemon-target',label:request.name||'Choose Pokémon',options,min:1,max:1});
  pending.set(request,session);return session.decision;
 }
 function commit(request,actor,side,slot,currentTargets,execute){
  const session=pending.get(request);
  if(!session)throw Error('Target choice is no longer available');
  const result=session.answer(actor,{decisionId:session.decision.id,selected:[identity({side,slot})]},currentTargets.map(t=>({id:identity(t)})),()=>execute(slot));
  if(session.status==='resolved')pending.delete(request);
  return result;
 }
 function cancel(request){const session=pending.get(request);if(!session)return false;session.cancel();pending.delete(request);return true;}
 return Object.freeze({prepare,commit,cancel});
});
