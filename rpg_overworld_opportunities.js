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
  {id:'encounter',title:'Local encounters',empty:'No special encounters here at this time.'},
  {id:'circuit',title:'⚔ Circuit & tournaments',empty:'No matches scheduled right now.'}
 ];
 function render(container,groups,onChoose,doc=container?.ownerDocument){
  if(!container||!doc)return false;
  const fragments=[];
  for(const section of sections){
   const group=doc.createElement('section');
   group.className='neo-ow-opportunity-group';
   group.dataset.opportunitySection=section.id;
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
   if(section.id==='circuit'){
    if(groups?.circuitNote){
     const note=doc.createElement('p');
     note.className='empty-note';note.textContent=groups.circuitNote;
     group.append(note);
    }
    const models=Array.isArray(groups?.brackets)?groups.brackets:[];
    if(models.length){
     const details=doc.createElement('details');
     details.className='neo-ow-circuit-brackets';
     const summary=doc.createElement('summary');
     summary.textContent='🏆 View tournament brackets';
     details.append(summary);
     for(const model of models){
      const card=doc.createElement('section');
      card.className='bracket-card neo-circuit-card'+
       (model.state==='champion'?' bracket-champion':'')+
       (model.state==='eliminated'?' bracket-eliminated':'');
      card.setAttribute('aria-label',model.title+' · '+model.headline);
      const title=doc.createElement('strong');
      title.className='neo-bracket-title';title.textContent=model.title;
      const status=doc.createElement('span');
      status.className='neo-bracket-status';status.textContent=model.headline;
      const rounds=doc.createElement('div');rounds.className='neo-bracket-rounds';
      for(const item of model.rows||[]){
       const row=doc.createElement('div');
       row.className='neo-bracket-round'+(item.label==='CLEARED'?' is-cleared':'')+
        (item.current?' is-current':'')+(item.label==='ELIMINATED'?' is-eliminated':'');
       row.setAttribute('aria-label','Round '+item.round+': '+item.opponent+' · '+item.label);
       const number=doc.createElement('span');number.className='neo-bracket-round__num';
       number.textContent=String(item.round).padStart(2,'0');
       const opponent=doc.createElement('span');opponent.className='neo-bracket-round__name';
       opponent.textContent=item.opponent;
       const outcome=doc.createElement('span');outcome.className='neo-bracket-round__state';
       outcome.textContent=item.label;
       row.append(number,opponent,outcome);rounds.append(row);
      }
      card.append(title,status,rounds);details.append(card);
     }
     group.append(details);
    }
   }
   fragments.push(group);
  }
  container.replaceChildren(...fragments);
  return true;
 }
 return Object.freeze({render});
});
