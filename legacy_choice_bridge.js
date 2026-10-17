'use strict';
// Adapter for older deckSearchRequest handlers. The same decision contract used by
// the headless coordinator validates the choice before any legacy callback runs.
(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./decision_session'):root.NeoDecisionSession);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.NeoLegacyChoiceBridge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(core){
 if(!core)throw Error('decision_session must load before legacy_choice_bridge');
 let sequence=0;
 const cache=new WeakMap();
 function prepare(request,actor=0){
  if(!request||!Array.isArray(request.options))throw Error('Invalid legacy choice');
  if(cache.has(request))return cache.get(request);
  const entries=request.options.map((option,index)=>({id:'option:'+index,label:String(option.name||option.id||option.index||index),value:option.index}));
  // Legacy option indices are not guaranteed unique; identity is by option position.
  const multi=!!request.multi;
  const min=multi?(request.min??0):1;
  const max=multi?(request.max??entries.length):1;
  const session=core.createSession({actor,kind:multi?'multi':'single',label:request.label||'Select an option',options:entries,min,max});
  const prepared={decision:session.decision,entries,session};cache.set(request,prepared);return prepared;
 }
 function commit(request,actor,values,execute){
  const {decision,entries,session}=prepare(request,actor);
  const selected=Array.isArray(values)?values:[values];
  const used=new Set();
  const ids=selected.map(value=>{
   const i=entries.findIndex((entry,index)=>!used.has(index)&&Object.is(entry.value,value));
   if(i<0)throw Error('Selection is no longer available');
   used.add(i);return entries[i].id;
  });
  const current=(request.options||[]).map((o,index)=>({id:'option:'+index,value:o.index}));
  const result=session.answer(actor,{decisionId:decision.id,selected:ids},current.filter(o=>entries[Number(o.id.slice(7))]&&Object.is(entries[Number(o.id.slice(7))].value,o.value)),answer=>{
   const actual=answer.selected.map(id=>entries[Number(id.slice(7))].value);
   return execute(request.multi?actual:actual[0]);
  });
  if(session.status==='resolved')cache.delete(request);
  return result;
 }
 function cancel(request){const prepared=cache.get(request);if(!prepared)return false;prepared.session.cancel();cache.delete(request);return true;}
 return Object.freeze({prepare,commit,cancel});
});
