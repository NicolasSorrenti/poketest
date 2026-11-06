'use strict';
// RPG overworld stage renderer. Receives presentation data and dispatches
// commands to the authoritative RPG controller; never mutates campaign state.
(function(root,factory){
 const view=factory();
 if(typeof module==='object'&&module.exports)module.exports=view;
 if(root)root.NeoRpgOverworldStageView=view;
})(typeof window==='undefined'?null:window,function(){
 const RESPONSE_ACTIONS=new Set([
  'mandatoryChoice','storyChoice','sliceChoice','sideChoice','arcChoice',
  'encounterChoice','situationChoice','sideDuel','sidePause','dateBook',
  'dateActivity','dateSlot','book','socialPlan','dateInvite','flirt',
  'eventInvite','eventChat'
 ]);
 function render({document:doc,model,onAction,onContinue,onCommand}){
  if(!doc||!model)return false;
  const get=id=>doc.getElementById(id);
  const dialogue=get('dialogue'),speaker=get('speaker'),line=get('line'),
   choices=get('choices'),characterActions=get('characterActions');
  if(!dialogue||!speaker||!line||!choices||!characterActions)return false;
  const saying=model.speech||{};
  const isNarration=saying.speaker==='Narrator';
  speaker.textContent=isNarration?'':(saying.speaker||'');
  speaker.hidden=isNarration;
  line.textContent=saying.line||'The town is waiting.';
  dialogue.classList.toggle('is-narration',isNarration);
  const offered=model.choices||[];
  const promptRoot=get('playerChoicePrompt'),promptPanel=get('playerChoicePanel');
  const playerPrompt=offered.some(item=>RESPONSE_ACTIONS.has(String(item.action||'').split(':')[0]));
  const newPrompt=!!(promptRoot?.hidden&&playerPrompt);
  if(promptRoot&&promptPanel){
   promptRoot.hidden=!playerPrompt;
   const parent=playerPrompt?promptPanel:dialogue;
   if(choices.parentElement!==parent)parent.append(choices);
   choices.classList.toggle('centered',playerPrompt);
  }
  choices.replaceChildren();
  for(const item of offered){
   const button=doc.createElement('button');
   button.type='button';
   button.className='choice'+(item.finish?' finish':'');
   button.textContent=item.label;
   button.disabled=!!item.disabled;
   if(item.reason)button.title=item.reason;
   button.onclick=()=>item.continue||item.action==='activityContinue'?onContinue?.():onAction?.(item.action);
   choices.append(button);
  }
  if(newPrompt){
   const first=[...choices.children].find(button=>!button.disabled);
   first?.focus?.({preventScroll:true});
  }
  const menu=model.menu||{};
  const menuMode=!!menu.mode;
  const hasDialogue=!!model.locked||!!saying.line||offered.length>0;
  dialogue.hidden=menuMode||!hasDialogue;
  doc.body?.classList.toggle('rpg-character-choice-menu',menuMode);
  characterActions.classList.toggle('choice-menu',menuMode);
  characterActions.hidden=!menu.characterId;
  characterActions.replaceChildren();
  if(menuMode&&menu.characterId){
   const eyebrow=doc.createElement('span');eyebrow.className='character-menu-eyebrow';
   eyebrow.textContent=menu.heading||'CHOOSE AN OPTION';
   const heading=doc.createElement('strong');heading.className='character-menu-title';
   heading.textContent=menu.name||'';
   const description=doc.createElement('p');description.className='character-menu-description';
   description.textContent=menu.description||'Choose an option.';
   const list=doc.createElement('div');list.className='character-menu-options';
   characterActions.append(eyebrow,heading,description,list);
   for(const item of menu.choices||[]){
    const button=doc.createElement('button');
    button.type='button';button.className='character-action-btn';
    button.textContent=item.label;
    button.disabled=!!item.disabled;
    if(item.reason)button.title=item.reason;
    button.onclick=()=>onAction?.(item.action);
    list.append(button);
   }
  }else if(menu.characterId){
   for(const item of menu.actions||[]){
    const button=doc.createElement('button');
    button.type='button';button.className='character-action-btn';
    button.textContent=item.label;button.title=item.title||'';
    button.dataset.characterAction=item.id==='scout'?'scout':item.id==='glance'?'glance':item.id==='deck'?'deck':'other';
    button.onclick=()=>onCommand?.(item.id,menu.characterId);
    characterActions.append(button);
   }
  }
  return true;
 }
 return Object.freeze({render});
});
