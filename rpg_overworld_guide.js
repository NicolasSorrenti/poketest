'use strict';
// Overworld-owned daily guide. The RPG controller supplies read-only data and
// validates commands; this module only builds the visible sheet presentation.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgOverworldGuide=api;
})(typeof window==='undefined'?null:window,function(){
 function render(root,data,onAction){
  if(!root||!data)return false;
  const doc=root.ownerDocument||document;
  const element=(tag,cls,text)=>{
   const node=doc.createElement(tag);
   if(cls)node.className=cls;
   if(text!==undefined)node.textContent=String(text);
   return node;
  };
  const button=(label,kind,id,disabled=false,cls='planner-action')=>{
   const node=element('button',cls,label);
   node.type='button';node.disabled=!!disabled;
   node.onclick=()=>{if(!node.disabled)onAction?.(kind,String(id??''));};
   return node;
  };
  const section=(title)=>{
   const pane=element('section','neo-ow-guide-section');
   const heading=element('h3','neo-ow-guide-heading',title);
   pane.append(heading);return pane;
  };
  const empty=(text,cls='empty-note')=>element('p',cls,text);
  const parts=[];

  const next=section('✦ What’s next?');
  if(data.planner.message)next.append(empty(data.planner.message,'planner-empty'));
  else{
   for(const item of data.planner.items||[]){
    const card=element('article','planner-card'+(item.upcoming?' planner-soon':''));
    const meta=element('small','planner-meta',item.meta);
    const heading=element('strong',null,item.title);
    const detail=element('p',null,item.detail);
    card.append(meta,heading,detail);
    if(item.actionLabel)card.append(button(item.actionLabel,'planner',item.id,data.locked));
    next.append(card);
   }
  }
  parts.push(next);

  const priority=section('✧ Today’s priority');
  const goal=data.priority;
  if(goal.message)priority.append(empty(goal.message,'intention-summary'));
  if(goal.options?.length){
   for(const option of goal.options){
    const choice=button('','priority',option.id,data.locked,'intention-choice');
    choice.append(element('strong',null,option.title),element('small',null,option.detail),
     element('span','intention-reward',option.reward));
    priority.append(choice);
   }
  }
  if(goal.chosen){
   const card=element('div','intention-active'+(goal.completed?' complete':''));
   card.append(element('strong',null,(goal.completed?'✓ COMPLETED · ':'◷ TODAY · ')+goal.chosen.title),
    element('p',null,goal.completed?'You made progress on your own terms. Tomorrow brings a new choice.':goal.chosen.detail),
    element('small',null,'REWARD · '+goal.chosen.reward));
   priority.append(card);
  }
  if(goal.countLabel)priority.append(element('small','intention-count',goal.countLabel));
  parts.push(priority);

  const appointments=section('◷ Upcoming plans');
  if(!data.appointments?.length)appointments.append(empty('No plans yet. Talk to someone in town to arrange a future meet-up.'));
  for(const plan of data.appointments||[]){
   const card=element('article','meeting-card');
   card.append(element('strong',null,plan.name),element('small',null,plan.when));
   if(plan.description)card.append(element('small','meeting-plan',plan.description));
   const actions=element('div','meeting-actions');
   for(const action of plan.actions||[]){
    const control=button(action.label,action.kind,plan.id,data.locked||action.disabled,
     action.kind==='cancelPlan'?'meeting-cancel':'meeting-attend');
    if(action.reason)control.title=action.reason;
    actions.append(control);
   }
   card.append(actions);appointments.append(card);
  }
  parts.push(appointments);

  const journey=section('🏆 Your 90-day journey');
  const progress=data.journey;
  journey.append(empty(progress.overview,'journey-overview'));
  const track=element('div','journey-track'),fill=element('div','journey-fill');
  const percent=Math.max(0,Math.min(100,Number(progress.percent)||0));
  fill.style.width=percent+'%';track.append(fill);journey.append(track);
  for(const item of progress.milestones||[]){
   const row=element('p','journey-goal');
   row.append(element('strong',null,item.title),element('span',null,item.detail));
   journey.append(row);
  }
  journey.append(button('Open memory album · '+progress.unlocked+'/'+progress.total,'gallery','',false,'journey-gallery'));
  parts.push(journey);

  // The retired sidebar used to be the only place showing focus, credits,
  // quest-season notes and other progression. Keep that information accessible
  // as a collapsible native view without retaining the old sidebar DOM.
  const progressSummary=data.townProgress;
  if(progressSummary){
   const details=element('details','neo-ow-guide-history');
   const heading=element('summary',null,
    '◈ Town progress · '+progressSummary.points+' circuit points · '+progressSummary.credits+' credits');
   details.append(heading);
   const stats=element('div','neo-ow-guide-stats');
   for(const item of progressSummary.stats||[]){
    const line=element('p','neo-ow-guide-stat');
    line.title=item.detail||'';
    line.append(element('strong',null,item.name),
     element('span',null,item.value+' / '+item.max));
    stats.append(line);
   }
   details.append(stats);
   if(progressSummary.upcoming?.length){
    details.append(element('h4',null,'Upcoming fixtures'));
    for(const item of progressSummary.upcoming)
     details.append(element('p','neo-ow-guide-log','Day '+item.day+' · '+item.title+' ('+item.period+')'));
   }
   if(progressSummary.recent?.length){
    details.append(element('h4',null,'Recent journal'));
    for(const note of progressSummary.recent)details.append(element('p','neo-ow-guide-log','• '+note));
   }
   parts.push(details);
  }

  root.replaceChildren(...parts);
  return true;
 }
 return Object.freeze({render});
});
