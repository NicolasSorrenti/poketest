'use strict';
// Small, transport-independent state machine for a single interactive effect.
// A session owns its outstanding decision and commits at most once. Callers
// supply the legal options again at answer time; no UI state is trusted.
(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./decision_core'):root.NeoDecisionCore);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.NeoDecisionSession=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(core){
 let serial=0;
 function createSession({actor,kind='select',label='',options,min=1,max=1,optional=false}){
  let status='pending';
  const decision=core.makeDecision({id:'session:'+ ++serial,actor,kind,label,options,min,max,optional});
  const issued=new Map(decision.options.map(o=>[o.id,o]));
  function answer(player,payload,liveOptions,resolve){
   if(status!=='pending')throw Error('Decision is no longer available');
   const validated=core.validateAnswer(decision,player,payload);
   if(!Array.isArray(liveOptions))throw Error('Current legal options are required');
   const live=new Set(liveOptions.map(o=>o.id));
   if(validated.selected.some(id=>!issued.has(id)||!live.has(id)))throw Error('Selection is no longer legal');
   if(typeof resolve!=='function')throw Error('Missing decision resolver');
   // Do not consume an action if the underlying effect declines or fails.
   const result=resolve(validated);
   if(result!==false)status='resolved';
   return result;
  }
  function cancel(){if(status!=='pending')return false;status='cancelled';return true;}
  return Object.freeze({decision,answer,cancel,get status(){return status;}});
 }
 return Object.freeze({createSession});
});
