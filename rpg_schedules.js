'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgSchedules=api;})(typeof window!=='undefined'?window:null,function(){
 const templates={
 hana:[['shop','shop','cafe'],['shop','cafe','park'],['shop','shop','cafe'],['shop','park','cafe'],['shop','shop','cafe'],['shop','center','park'],['park','cafe','home']],
 reina:[['home','center','center'],['shop','center','center'],['home','shop','center'],['home','center','park'],['shop','center','center'],['center','center','shop'],['home','park','center']],
 shiori:[['cafe','library','park'],['home','library','cafe'],['cafe','center','park'],['home','library','cafe'],['cafe','library','park'],['center','cafe','park'],['home','park','cafe']],
 yuna:[['home','arcade','arcade'],['shop','arcade','arcade'],['home','arcade','cafe'],['arcade','arcade','park'],['home','arcade','arcade'],['arcade','center','arcade'],['home','park','arcade']],
 akari:[['library','library','cafe'],['library','center','library'],['home','library','cafe'],['library','library','home'],['library','center','cafe'],['center','library','cafe'],['home','library','home']],
 camila:[['shop','shop','cafe'],['shop','cafe','shop'],['home','shop','cafe'],['shop','shop','arcade'],['shop','cafe','shop'],['shop','center','cafe'],['home','park','cafe']],
 marina:[['park','cafe','park'],['park','shop','park'],['home','cafe','park'],['park','shop','cafe'],['park','center','park'],['shop','park','park'],['home','park','cafe']],
 kaede:[['home','arcade','arcade'],['shop','arcade','park'],['home','center','arcade'],['arcade','arcade','cafe'],['home','shop','arcade'],['center','arcade','park'],['home','park','arcade']]
 };
 const PACK=typeof module==='object'&&module.exports?require('./rpg_narrative_pack'):window.NeoRpgNarrativePack;
 Object.assign(templates,PACK.schedules);
 const SIDE=typeof module==='object'&&module.exports?require('./rpg_side_quests'):window.NeoRpgSideQuests;
 Object.assign(templates,SIDE.schedules);
 // The server provides only the character packs this account may access.
 // In Node, use the generated roster for deterministic offline tests.
 const CHARS=typeof module==='object'&&module.exports?require('./rpg_character_packs.generated'):window.NeoRpgCharacterPacks;
 Object.assign(templates,CHARS?.schedules||{});
 const start={hana:1,reina:1,shiori:1,yuna:1,akari:1,camila:1,marina:1,kaede:41};
 Object.assign(start,PACK.arrivals);
 Object.assign(start,SIDE.arrivals);
 Object.assign(start,CHARS?.arrivals||{});
 const publicPlaces=['shop','arcade','park','cafe','center','library'];
 const NORMAL_PLACE_LIMIT=4;
 // A little flexibility in the timetable, without moving people's workplace
 // shifts or making every NPC converge on the same park at once.
 const workplace={hana:'shop',camila:'shop',elio:'shop',iris:'shop',alma:'cafe',
  jun:'center',teo:'arcade',yuna:'arcade',kaede:'arcade',akari:'library',
  shiori:'library',marina:'park',nereo:'park'};
 const wander={shop:'cafe',cafe:'park',park:'shop',arcade:'shop',
  center:'park',library:'cafe',home:'park'};
 const hash=s=>{let n=2166136261;for(const c of String(s))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n;};
 function baseLocation(npc,day,slot){
  const week=Math.floor((day-1)/7),weekday=(day-1)%7;
  let place=templates[npc][weekday][slot];
  // Stagger the fourth-week routine change so it doesn't move the entire
  // town toward the park in the very same afternoon.
  if(week%4===3&&slot===1&&weekday===3&&hash(npc)%3===0)place=wander[place]||place;
  return place;
 }
 function validTime(day,slot){return Number.isInteger(day)&&day>=1&&day<=90&&Number.isInteger(slot)&&slot>=0&&slot<=2;}
 function placements(day,slot,events=[]){
  if(!validTime(day,slot))return {};
  const ids=Object.keys(templates).filter(id=>day>=start[id]);
  const result={},pinned=new Set(),counts=Object.fromEntries(publicPlaces.map(p=>[p,0]));
  const overrides=Array.isArray(events)?events:[];
  for(const id of ids){
   const event=overrides.find(e=>(e.npc===id||e.participants?.includes(id))&&
    e.start<=day&&e.end>=day&&e.slot===slot&&typeof e.place==='string');
   if(event){result[id]=event.place;pinned.add(id);}
   else result[id]=baseLocation(id,day,slot);
   if(publicPlaces.includes(result[id]))counts[result[id]]++;
  }
  // Preserve every story/appointment attendee. If an event legitimately
  // brings more than four people together, allow that crowd to remain.
  const capacity=p=>Math.max(NORMAL_PLACE_LIMIT,ids.filter(id=>pinned.has(id)&&result[id]===p).length);
  function preference(id,place){
   const week=templates[id];
   let score=0;
   for(const row of week)for(let s=0;s<3;s++)
    if(row[s]===place)score+=s===slot?8:2;
   if(workplace[id]===place)score+=18;
   return score;
  }
  // Move only overflow, preferring characters whose regular routine offers
  // a credible alternative. Stable hash breaks ties; no rerolls on reload.
  for(let turns=0;turns<ids.length*publicPlaces.length;turns++){
   const crowded=publicPlaces.filter(p=>counts[p]>capacity(p))
    .sort((a,b)=>(counts[b]-capacity(b))-(counts[a]-capacity(a))||a.localeCompare(b));
   if(!crowded.length)break;
   const source=crowded[0];
   const destinations=publicPlaces.filter(p=>p!==source&&counts[p]<capacity(p));
   if(!destinations.length)break;
   const movers=ids.filter(id=>result[id]===source&&!pinned.has(id))
    .sort((a,b)=>{
     const stickA=preference(a,source),stickB=preference(b,source);
     return stickA-stickB||(hash(a+':'+day+':'+slot)-hash(b+':'+day+':'+slot));
    });
   if(!movers.length)break;
   const mover=movers[0];
   destinations.sort((a,b)=>{
    const scoreA=preference(mover,a)-counts[a]*8;
    const scoreB=preference(mover,b)-counts[b]*8;
    return scoreB-scoreA||(hash(mover+':'+day+':'+slot+':'+a)-hash(mover+':'+day+':'+slot+':'+b));
   });
   const dest=destinations[0];
   result[mover]=dest;counts[source]--;counts[dest]++;
  }
  return result;
 }
 const normalCache=new Map();
 function dailyLocations(day,slot,events=[]){
  if(Array.isArray(events)&&events.length)return placements(day,slot,events);
  const key=day+':'+slot;
  if(!normalCache.has(key))normalCache.set(key,placements(day,slot));
  return normalCache.get(key);
 }
 function locationFor(npc,day,slot,events=[]){
  if(!templates[npc]||!validTime(day,slot)||day<start[npc])return null;
  return dailyLocations(day,slot,events)[npc]||null;
 }
 function peopleAt(day,slot,place,events=[]){
  if(!publicPlaces.includes(place))return [];
  const places=dailyLocations(day,slot,events);
  return Object.keys(templates).filter(id=>places[id]===place);
 }
 function itinerary(npc,day,events=[]){return [0,1,2].map(slot=>locationFor(npc,day,slot,events));}
 function nextVisit(npc,day,slot,events=[],horizon=7){
  for(let offset=1;offset<=horizon*3;offset++){const n=(day-1)*3+slot+offset,d=Math.floor(n/3)+1,s=n%3;if(d>90)break;const place=locationFor(npc,d,s,events);if(place&&place!=='home')return {day:d,slot:s,place};}
  return null;
 }
 function validate(){
  const issues=[];
  for(const [id,week] of Object.entries(templates)){if(week.length!==7)issues.push(id+' missing weekdays');for(const row of week)if(row.length!==3||row.some(p=>p!=='home'&&!publicPlaces.includes(p)))issues.push(id+' bad location');}
  return issues;
 }
 return Object.freeze({locationFor,peopleAt,itinerary,nextVisit,validate,publicPlaces,start,NORMAL_PLACE_LIMIT});
});