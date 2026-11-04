'use strict';
// The single overworld presentation for event opportunities. The RPG controller
// owns all eligibility checks, state changes and action dispatch.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgOverworldOpportunities=api;
})(typeof window==='undefined'?null:window,function(){
 const sections=[
  {id:'story',title:'Story events',empty:'No special story encounter right now.'},
  {id:'situation',title:'Unexpected moments',empty:'No unusual moment here right now. Stronger bonds and the right time may reveal one.'},
  {id:'sidequest',title:'Side quests',empty:'No side quest encounter here right now.'},
  {id:'encounter',title:'Local encounters',empty:'No special encounters here at this time.'}
 ];
 function render(container,groups,onChoose,doc=container?.ownerDocument){
  if(!container||!doc)return false;
  const fragments=[];
  for(const section of sections){
   const group=doc.createElement('section');
   group.className='neo-ow-opportunity-group';
   const heading=doc.createElement('h3');
   heading.textContent=section.title;
   heading.style.cssText='font:700 13px system-ui;color:#f5c9e9;margin:14px 0 7px';
   group.append(heading);
   const entries=Array.isArray(groups?.[section.id])?groups[section.id]:[];
   if(!entries.length){
    const empty=doc.createElement('p');empty.className='empty-note';empty.textContent=section.empty;
    group.append(empty);
   }
   for(const item of entries){
    const button=doc.createElement('button');
    button.type='button';button.className='event-btn neo-ow-opportunity';
    button.dataset.opportunityKind=String(item.kind);
    button.dataset.opportunityId=String(item.id);
    button.disabled=!!item.disabled;
    button.textContent=item.label;
    if(item.description){
     const hint=doc.createElement('small');
     hint.textContent=item.description;
     button.append(hint);
    }
    button.onclick=()=>onChoose?.(String(item.kind),String(item.id));
    group.append(button);
   }
   fragments.push(group);
  }
  container.replaceChildren(...fragments);
  return true;
 }
 return Object.freeze({render});
});
