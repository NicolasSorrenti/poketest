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
 const start={hana:1,reina:1,shiori:1,yuna:1,akari:1,camila:1,marina:1,kaede:41};
 Object.assign(start,PACK.arrivals);
 const publicPlaces=['shop','arcade','park','cafe','center','library'];
 function locationFor(npc,day,slot,events=[]){
  if(!templates[npc]||!Number.isInteger(day)||day<1||day>90||!Number.isInteger(slot)||slot<0||slot>2||day<start[npc])return null;
  const override=events.find(e=>e.npc===npc&&e.start<=day&&e.end>=day&&e.slot===slot);
  if(override)return override.place;
  const week=Math.floor((day-1)/7),weekday=(day-1)%7;
  let place=templates[npc][weekday][slot];
  // Every fourth week, NPCs change their routine on one afternoon; deterministic after reload.
  if(week%4===3&&slot===1&&weekday===3)place={shop:'cafe',cafe:'park',park:'shop',arcade:'shop',center:'park',library:'cafe',home:'park'}[place]||place;
  return place;
 }
 function peopleAt(day,slot,place,events=[]){if(!publicPlaces.includes(place))return [];return Object.keys(templates).filter(id=>locationFor(id,day,slot,events)===place);}
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
 return Object.freeze({locationFor,peopleAt,itinerary,nextVisit,validate,publicPlaces,start});
});