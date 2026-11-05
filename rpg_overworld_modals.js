'use strict';
// Pure DOM presenters for active RPG calendar, community and season-end modals.
// Campaign state, spoiler eligibility and every gameplay command stay in rpg.js.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgOverworldModals=api;
})(typeof window==='undefined'?null:window,function(){
 function el(doc,tag,className,text){
  const node=doc.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=String(text);
  return node;
 }
 function renderCommunity(doc,model){
  if(!doc||!model)return false;
  const table=doc.getElementById('communityStandings');
  const news=doc.getElementById('communityNews');
  const connections=doc.getElementById('communityConnections');
  if(!table||!news||!connections)return false;
  const standings=[];
  if(!model.standings?.length)standings.push(el(doc,'p','empty-note','The club season has only just begun. Results will appear as days pass.'));
  for(const [i,item] of (model.standings||[]).entries()){
   const row=el(doc,'div','club-standing');
   row.append(el(doc,'strong',null,(i+1)+'. '+item.name),
    el(doc,'span',null,item.wins+' W · '+item.losses+' L'));
   standings.push(row);
  }
  table.replaceChildren(...standings);
  const newsItems=[];
  if(!model.events?.length)newsItems.push(el(doc,'p','empty-note','The community board is quiet for now.'));
  for(const item of model.events||[]){
   const row=el(doc,'div','club-news-entry');
   row.append(el(doc,'small',null,'DAY '+item.day+' · '+item.place),
    el(doc,'p',null,item.description));
   newsItems.push(row);
  }
  news.replaceChildren(...newsItems);
  const links=[];
  if(!model.connections?.length)links.push(el(doc,'p','empty-note','Friendships and rivalries emerge as the season progresses.'));
  for(const item of model.connections||[])
   links.push(el(doc,'p','club-link',item.label));
  connections.replaceChildren(...links);
  return true;
 }
 function renderCalendar(root,model,onSelect){
  if(!root||!model)return false;
  const doc=root.ownerDocument||document,sections=[];
  const entries=Array.isArray(model.entries)?model.entries:[];
  if(!entries.length)sections.push(el(doc,'p','empty-note','No known plans yet. Talk to people around town or check back later.'));
  let lastDay=null,daySection=null;
  for(const entry of entries){
   if(entry.day!==lastDay){
    lastDay=entry.day;
    daySection=el(doc,'section','rpg-calendar-day');
    daySection.append(el(doc,'h3',null,'Day '+entry.day+(entry.day===model.day?' · Today':'')));
    sections.push(daySection);
   }
   const row=el(doc,'article','rpg-calendar-item');
   row.append(el(doc,'small','rpg-calendar-type',entry.kind),
    el(doc,'strong',null,entry.title),
    el(doc,'p',null,(entry.period||'Any period')+' · '+entry.placeName+' · '+entry.detail));
   if(entry.canVisit){
    const action=el(doc,'button',null,entry.place===model.location?'View here':'Visit '+entry.placeName+' · free');
    action.type='button';action.disabled=!!model.locked;
    action.onclick=()=>{if(!action.disabled)onSelect?.(entry);};
    row.append(action);
   }
   daySection.append(row);
  }
  root.replaceChildren(...sections);
  return true;
 }
 function renderSeason(root,model,onReplay){
  if(!root||!model)return false;
  root.hidden=!model.complete;
  if(!model.complete){
   root.dataset.seasonKey='';
   return true;
  }
  const signature=JSON.stringify([model.report,model.history]);
  if(root.dataset.seasonKey===signature)return true;
  const doc=root.ownerDocument||document,r=model.report;
  root.className='campaign-complete season-finale';
  const heading=el(doc,'h2',null,r.title);
  const preface=el(doc,'p','finale-subtitle','NEO HARBOR · SEASON '+r.run+' · DAY 90 / 90');
  const closing=el(doc,'p','finale-closing',r.closing);
  const numbers=el(doc,'div','finale-stats');
  const details=[
   ['Duels',r.played],['Victories',r.wins],['Draws',r.draws],
   ['Circuit points',r.points],['Stories',r.storyScenes],
   ['Town encounters',r.encounters],['Side quests',r.sidequests],
   ['Plans kept',r.appointments],['Special moments',r.situations],
   ['Gallery memories',r.galleryEarned]
  ];
  for(const [key,value] of details){
   const cell=el(doc,'div','finale-stat');
   cell.append(el(doc,'strong',null,value),el(doc,'small',null,key));
   numbers.append(cell);
  }
  const trophyTitle=el(doc,'h3',null,'Your tournament record');
  const trophies=el(doc,'div','finale-cups');
  for(const cup of r.cups||[]){
   const node=el(doc,'div','finale-cup '+(cup.status==='champion'?'is-champion':''),
    cup.title+' · '+(cup.status==='champion'?'Champion':
     cup.status==='eliminated'?'Eliminated after '+cup.roundsWon+' victories':
     cup.status==='missed'||cup.status==='expired'?'Not completed':cup.status));
   trophies.append(node);
  }
  const social=el(doc,'p','finale-social',r.partner?
   'A bond that continues: '+r.partner+'.':
   r.closest?.length?'People you grew closest to: '+r.closest.map(item=>item.name).join(', ')+'.':
   'The people of Neo Harbor are still there for a return visit.');
  const footer=el(doc,'div','finale-actions');
  const replay=el(doc,'button','time-advance','↻ Start New Game+ · archive this season');
  replay.type='button';replay.onclick=()=>onReplay?.();
  footer.append(replay,el(doc,'small',null,
   'Replaying starts a fresh 90-day season. Reports and your selected deck preset carry over; credits, character bonds and brackets reset.'));
  const past=el(doc,'div','finale-archive');
  past.append(el(doc,'h3',null,'Your earlier seasons'));
  if(!model.history?.length)past.append(el(doc,'p',null,'Your first season will be saved here when you choose New Game+.'));
  else for(const season of model.history)
   past.append(el(doc,'p','finale-archive-entry',
    'Season '+season.run+' · '+season.title+' · '+season.wins+' wins · '+
    season.points+' points · '+season.memories+' collected memories'));
  const output=[preface,heading,closing,numbers,trophyTitle,trophies,social];
  if(r.seasonLessons?.length){
   const lessons=el(doc,'section','finale-lessons');
   lessons.append(el(doc,'h3',null,'What changed along the way'));
   for(const line of r.seasonLessons)lessons.append(el(doc,'p',null,line));
   output.push(lessons);
  }
  output.push(past,footer);
  root.replaceChildren(...output);
  root.dataset.seasonKey=signature;
  return true;
 }
 return Object.freeze({renderCommunity,renderCalendar,renderSeason});
});
