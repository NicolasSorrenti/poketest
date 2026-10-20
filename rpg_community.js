'use strict';
// Autonomous, explicitly simulated off-screen *club* activity.
// Never use this as a substitute for a Classic engine duel, official Cup, or player result.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgCommunity=api;
})(typeof window!=='undefined'?window:null,function(){
 const CLUB=['center','shop','arcade'],SOCIAL=['cafe','park','library'];
 const SKILL=Object.freeze({hana:5,reina:8,shiori:7,yuna:5,akari:8,camila:7,marina:6,kaede:9,
  jinx:7,luna:5,rina:6,elena:7,sol:5,sierra:7,jun:6,teo:5,iris:7});
 const VOICES=Object.freeze({
  hana:{win:'It was a close one! I was cheering for both of us by the end.',loss:'They deserved that win, but I want to keep learning.',meet:'We ended up talking about helping the newer players feel welcome.'},
  reina:{win:'I spotted a gap in their opening and took it. They will fix it next time.',loss:'They read my setup. I am not giving them the same opening twice.',meet:'It turns out we both spend far too much time studying deck lists.'},
  shiori:{win:'That game rewarded patience rather than force.',loss:'I mistook quiet confidence for an easy position.',meet:'We shared a peaceful conversation that had nothing to do with winning.'},
  yuna:{win:'You missed my dramatic final turn! Even I thought it was ridiculous.',loss:'My incredible plot twist was cancelled by an even bigger one.',meet:'We came up with a truly terrible idea for an arcade tournament.'},
  akari:{win:'The match aligned surprisingly well with my opening-hand calculations.',loss:'I have already identified two assumptions that need revising.',meet:'We compared notes about what makes a player change their mind.'},
  camila:{win:'An excellent return on one carefully timed risk, darling.',loss:'That deal went in their favor. It will not stay that way forever.',meet:'We debated whether the story behind a card can matter more than its price.'},
  marina:{win:'I waited until the right moment and the game finally turned.',loss:'I hurried through a turn that needed more patience.',meet:'We talked about taking a break by the river after the season.'},
  kaede:{win:'They thought they had me. That was the fun part.',loss:'They got me this time. I almost enjoyed losing.',meet:'Somehow we ended up comparing the worst places we have travelled to play.'},
  elena:{win:'My contingency plan worked precisely when I needed it.',loss:'I underestimated one risk. My notes are already updated.',meet:'We had a refreshingly practical conversation about time and priorities.'},
  jinx:{win:'They fell for it! No, I am not explaining the trick.',loss:'Okay, that was a spectacular disaster. I want a rematch.',meet:'We started talking and nearly got thrown out for laughing.'},
  luna:{win:'My own idea worked! I was trying not to second-guess it.',loss:'It did not work, but I know what I want to practice.',meet:'We talked about the decks we want to learn, not just the ones we own.'},
  rina:{win:'I squeezed in a practice session and it actually paid off.',loss:'I knew I needed another rehearsal for that opening.',meet:'We compared calendars and found one small afternoon just to talk.'},
  sierra:{win:'It felt good to make a decision without anyone telling me what to play.',loss:'A crowd watched me lose. I am still glad I sat down.',meet:'We had a conversation where nobody needed anything from us.'},
  sol:{win:'That was unexpectedly fun. I might actually be improving.',loss:'I lost and still had a pretty good afternoon.',meet:'We talked about something ordinary for once. I liked that.'}
 });
 const valid=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const hash=s=>{let n=2166136261;for(const c of String(s))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n>>>0;};
 const pair=(a,b)=>[a,b].sort().join(':');
 const DAY_CAP=90,MAX_EVENTS=90;
 const name=(id,cast)=>cast?.[id]?.name||String(id).replace(/[_-]/g,' ');
 function hydrate(state){
  if(!valid(state.community))state.community={};
  const c=state.community;
  // No retroactive invented results in existing saves; begin from the prior day.
  if(!Number.isInteger(c.lastResolvedDay)||c.lastResolvedDay<0||c.lastResolvedDay>DAY_CAP)
   c.lastResolvedDay=Math.max(0,Math.min(DAY_CAP,(Number.isInteger(state.day)?state.day:1)-1));
  if(!Array.isArray(c.events))c.events=[];
  if(!valid(c.standings))c.standings={};
  if(!valid(c.links))c.links={};
  return c;
 }
 function pairCandidates(day,places,schedules,cast,slots=[1,2]){
  const candidates=[];
  if(!schedules?.peopleAt||!cast)return candidates;
  for(const place of places)for(const slot of slots){
   const ids=[...new Set(schedules.peopleAt(day,slot,place))].filter(id=>!!cast[id]).sort();
   for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)
    candidates.push({day,slot,place,a:ids[i],b:ids[j],key:pair(ids[i],ids[j])});
  }
  return candidates;
 }
 function rank(state,cast){
  const rows=Object.entries(hydrate(state).standings)
   .filter(([id])=>!cast||cast[id])
   .map(([id,r])=>({id,name:name(id,cast),wins:r.wins||0,losses:r.losses||0,played:(r.wins||0)+(r.losses||0)}));
  return rows.sort((a,b)=>b.wins-a.wins||a.losses-b.losses||a.name.localeCompare(b.name));
 }
 function recent(state,limit=5){return hydrate(state).events.slice(-Math.max(0,limit)).reverse();}
 function choose(day,kind,candidates,history){
  if(!candidates.length)return null;
  const prior=new Set(history.slice(-5).filter(e=>e.kind===kind).map(e=>e.pair));
  const eligible=candidates.filter(x=>!prior.has(x.key));
  const pool=eligible.length?eligible:candidates;
  return pool[hash('neo-harbor:'+kind+':'+day)%pool.length];
 }
 function simulate(state,day,{schedules,cast}={}){
  if(!Number.isInteger(day)||day<1||day>DAY_CAP||!schedules?.peopleAt||!cast)return [];
  const c=hydrate(state),created=[];
  if(day%2===0){
   const spot=choose(day,'match',pairCandidates(day,CLUB,schedules,cast),c.events);
   if(spot){
    const ability=id=>Number.isInteger(SKILL[id])?SKILL[id]:4+hash('skill:'+id)%5;
    // Deterministic form can upset a stronger NPC. These are club score slips, not simulated card turns.
    const a=ability(spot.a)+(hash('form:a:'+day+':'+spot.key)%7)-3;
    const b=ability(spot.b)+(hash('form:b:'+day+':'+spot.key)%7)-3;
    const winner=a===b?(hash('tiebreak:'+day+':'+spot.key)%2?spot.a:spot.b):a>b?spot.a:spot.b;
    const loser=winner===spot.a?spot.b:spot.a;
    const link=c.links[spot.key]||(c.links[spot.key]={meetings:0,matches:0});
    link.matches=(link.matches||0)+1;
    for(const [id,field] of [[winner,'wins'],[loser,'losses']]){
     if(!valid(c.standings[id]))c.standings[id]={wins:0,losses:0};
     c.standings[id][field]=(c.standings[id][field]||0)+1;
    }
    const event={id:'club-match-'+day,kind:'match',day,slot:spot.slot,place:spot.place,
     pair:spot.key,a:spot.a,b:spot.b,winner,loser,
     rivalry:link.matches>=2,
     title:link.matches>=2?'A rivalry continues':'Club practice result'};
    created.push(event);
   }
  }
  if(day%5===0){
   const spot=choose(day,'meetup',pairCandidates(day,SOCIAL,schedules,cast,[0,1,2]),c.events.concat(created));
   if(spot){
    const link=c.links[spot.key]||(c.links[spot.key]={meetings:0,matches:0});
    link.meetings=(link.meetings||0)+1;
    created.push({id:'club-meetup-'+day,kind:'meetup',day,slot:spot.slot,place:spot.place,
     pair:spot.key,a:spot.a,b:spot.b,friendship:link.meetings>=2,
     title:link.meetings>=2?'A familiar friendship':'A conversation around town'});
   }
  }
  for(const event of created)c.events.push(event);
  if(c.events.length>MAX_EVENTS)c.events.splice(0,c.events.length-MAX_EVENTS);
  return created;
 }
 // Finalize *completed* days only. Never precompute future scenes or reward effects.
 function sync(state,completedThrough,deps){
  const c=hydrate(state),through=Math.min(DAY_CAP,Math.max(0,Number.isInteger(completedThrough)?completedThrough:0));
  if(through<=c.lastResolvedDay)return [];
  const events=[];
  for(let day=c.lastResolvedDay+1;day<=through;day++)events.push(...simulate(state,day,deps));
  c.lastResolvedDay=through;
  return events;
 }
 function describe(event,cast){
  if(!event)return '';
  const a=name(event.a,cast),b=name(event.b,cast);
  if(event.kind==='match')return name(event.winner,cast)+' defeated '+name(event.loser,cast)+
   ' in an off-screen club match'+(event.rivalry?' — their rivalry is growing.':'.');
  return a+' and '+b+(event.friendship?' caught up again':' spent some time together')+
   ' at '+({cafe:'the café',park:'the park',library:'the library'}[event.place]||event.place)+'.';
 }
 function forCharacter(state,id,maxAge=5){
  const today=state?.day||1;
  return recent(state,MAX_EVENTS).find(e=>e.day<=today&&today-e.day<=maxAge&&
   (e.a===id||e.b===id))||null;
 }
 function dialogue(state,npc,cast){
  const event=forCharacter(state,npc);
  if(!event)return null;
  const id='react:community:'+npc+':'+event.id;
  const other=event.a===npc?event.b:event.a,otherName=name(other,cast);
  let lines;
  if(event.kind==='match'){
   const winner=event.winner===npc,personality=VOICES[npc];
   const base=winner?'I played '+otherName+' at the club. That match took more thought than I expected.':
     otherName+' got the better of me at the club. I have been thinking about the opening.';
   lines=[(personality?.[winner?'win':'loss']||base)+' It was against '+otherName+'.',
    'Are you planning to play each other again?',
    event.rivalry?'We have faced each other enough times that the rematch feels personal.':
     winner?'Probably. A good result is no reason to stop practicing.':
      'Yes. I have an idea I want to test next time.'];
  }else{
   lines=[(VOICES[npc]?.meet||'We had a chance to talk away from the card tables.')+' I ran into '+otherName+'.',
    'How was it to talk without a match to worry about?',
    event.friendship?'We keep finding something new to talk about. It is becoming a nice habit.':
     'It was good. It turns out we have more in common than decks.'];
  }
  return {id,kind:'community',day:event.day,lines:[{speaker:npc,text:lines[0]},
   {speaker:'Protagonist',text:lines[1]},{speaker:npc,text:lines[2]}]};
 }
 return Object.freeze({SKILL,VOICES,CLUB,SOCIAL,hash,hydrate,pairCandidates,simulate,sync,rank,recent,describe,forCharacter,dialogue});
});
