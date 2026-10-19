'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Planner=require('../rpg_daily_planner');
const Schedules=require('../rpg_schedules'),Appointments=require('../rpg_appointments');
const Story=require('../rpg_story'),Side=require('../rpg_side_quests'),World=require('../rpg_world');
const Tournaments=require('../rpg_tournaments'),Intentions=require('../rpg_intentions'),Arc=require('../rpg_rival_arc');
const Pack=require('../rpg_narrative_pack');
const places=Object.fromEntries(['home','shop','arcade','park','cafe','center','library'].map(x=>[x,[x.toUpperCase()]]));
const cast={hana:{name:'Hana'},reina:{name:'Reina'},shiori:{name:'Shiori'},yuna:{name:'Yuna'},akari:{name:'Akari'},
 camila:{name:'Camila'},marina:{name:'Marina'},kaede:{name:'Kaede'},...Pack.cast,...Side.cast};
const deps={schedules:Schedules,appointments:Appointments,story:Story,side:Side,world:World,
 tournaments:Tournaments,intentions:Intentions,arc:Arc,cast,places,
 eventCards:[{day:7,slot:1,place:'arcade',title:'Arcade Friendly Cup',reward:7}]};
const sample=(extra={})=>({
 day:1,slot:0,location:'home',focus:75,credits:80,results:[],relationships:{},bonds:{},talked:{},
 hungOut:{},storyDone:{},storyMissed:{},sideQuests:{},appointments:[],appointmentSeq:0,eventsDone:{},
 encountersDone:{},activityDone:{},tournaments:{},arcFlags:{},...extra
});
test('planner returns three or fewer useful distinct suggestions and never modifies a save',()=>{
 const state=sample(),before=JSON.stringify(state);
 const cards=Planner.recommend(state,deps);
 assert.ok(cards.length>0&&cards.length<=3);assert.equal(JSON.stringify(state),before);
 assert.equal(new Set(cards.map(x=>x.id)).size,cards.length);
 for(const c of cards)assert.ok(places[c.place]||c.place===null);
});
test('appointment starting now outranks optional activities and directs to the real booked venue',()=>{
 const s=sample({day:4,slot:0,location:'shop'});
 const time=Appointments.proposed(s,'hana',Schedules)[0];
 assert.ok(time);const booked=Appointments.book(s,'hana',time.day,time.slot,time.place,Schedules);
 s.day=time.day;s.slot=time.slot;s.location='home';
 const before=JSON.stringify(s),cards=Planner.recommend(s,deps);
 assert.equal(cards[0].kind,'appointment');assert.match(cards[0].detail,/Hana/);
 assert.equal(cards[0].place,booked.place);assert.equal(cards[0].action,'travel');
 assert.equal(JSON.stringify(s),before);
});
test('the planner shows a same-day appointment BEFORE its slot without offering a misleading attend action',()=>{
 const s=sample({day:3,slot:0,location:'shop'});
 const picks=Appointments.proposed(s,'hana',Schedules),slot=picks[0];
 assert.ok(slot);Appointments.book(s,'hana',slot.day,slot.slot,slot.place,Schedules);
 // Always place the player one period before: at the previous day's evening if necessary.
 if(slot.slot===0){s.day=slot.day-1;s.slot=2;}
 else{s.day=slot.day;s.slot=slot.slot-1;}
 s.location='home';
 const c=Planner.recommend(s,deps).find(x=>x.kind==='appointment');
 assert.ok(c);assert.equal(c.timing,'upcoming');assert.equal(c.action,'none');
 assert.equal(c.day,slot.day);assert.equal(c.slot,slot.slot);
});
test('opening tournament round appears only inside real registration window',()=>{
 const s=sample({day:30,slot:1,location:'home'});
 const cards=Planner.recommend(s,deps);
 const cup=cards.find(x=>x.kind==='tournament');
 assert.ok(cup);assert.equal(cup.place,'center');assert.equal(cup.action,'travel');
 assert.match(cup.title,/Neighborhood Cup/);
 s.day=36;const late=Planner.recommend(s,deps);
 assert.ok(!late.some(x=>x.kind==='tournament'&&x.title.includes('Neighborhood Cup')));
});
test('earlier tournament announcement is informational only and never starts a match',()=>{
 const s=sample({day:28,slot:1,location:'home'});
 const cards=Planner.recommend(s,deps);
 // Other higher priority events may fill the top three, but any forthcoming cup
 // returned must be clearly marked as a non-actionable date reminder.
 for(const c of cards.filter(x=>x.kind==='tournament_soon')){
  assert.equal(c.action,'none');assert.equal(c.timing,'upcoming');
 }
 assert.ok(cards.every(c=>c.action!=='travel'||c.day===s.day));
});
test('suggested NPCs really exist at the advertised location and period',()=>{
 const s=sample({day:10,slot:1,location:'home'});
 const cards=Planner.recommend(s,deps);
 for(const c of cards.filter(x=>x.kind==='social')){
  const npc=c.id.split(':')[1];
  assert.ok(Schedules.peopleAt(s.day,s.slot,c.place,[...Story.available({...s,location:c.place},c.place),...Side.appointments({...s,location:c.place})]).includes(npc));
 }
});
test('future cast members are not advertised before their start date',()=>{
 const s=sample({day:2,slot:2,location:'arcade'});
 assert.ok(!Planner.recommend(s,deps).some(x=>x.title.includes('Kaede')));
});
test('disabled town activities are never recommended when focus and credits are insufficient',()=>{
 const s=sample({day:8,slot:1,location:'arcade',focus:0,credits:0});
 const cards=Planner.recommend(s,deps);
 for(const c of cards.filter(x=>x.kind==='activity')){
  const a=World.activities.find(x=>x.id===c.id.split(':')[1]);
  assert.ok(a);assert.equal(a.cost,0);assert.equal(a.focus,0);
 }
});
test('fully eligible current personal stories are suggested without exposing unavailable later route chapters',()=>{
 const first=Story.events.find(e=>!e.prerequisite&&e.start<=e.end&&e.start<=90&&cast[e.npc]);
 assert.ok(first);
 const s=sample({day:first.start,slot:first.slot,location:first.place,
  relationships:{[first.npc]:{affection:first.minBond,trust:0,respect:0,attraction:0,duels:0}}});
 const eligible=Story.available(JSON.parse(JSON.stringify(s)),first.place);
 assert.ok(eligible.some(x=>x.id===first.id));
 const cards=Planner.recommend(s,deps);
 assert.ok(cards.some(x=>x.kind==='story'));
 assert.ok(cards.filter(x=>x.kind==='story').every(x=>!x.title.includes('route_4')));
});
test('planner does not suggest anything during an active story, duel or after the season ends',()=>{
 for(const extra of [{activeStory:{id:'test'}},{pendingDuel:{id:'test'}},{day:91,ended:true}]){
  const s=sample(extra);assert.deepEqual(Planner.recommend(s,deps),[]);
 }
});
test('the daily social intention can influence suggestions without mutating intention progress',()=>{
 const s=sample({day:3,slot:1,location:'shop'});
 Intentions.choose(s,'social');const before=JSON.stringify(s);
 const cards=Planner.recommend(s,deps);
 assert.ok(cards.length);assert.equal(JSON.stringify(s),before);
 assert.ok(cards.every(x=>x.action!=='travel'||x.day===s.day));
});
test('planner tolerates a 90-day itinerary and only points at known, reachable venues',()=>{
 for(let day=1;day<=90;day++){
  for(let slot=0;slot<3;slot++){
   const state=sample({day,slot,location:'home'});
   for(const card of Planner.recommend(state,deps)){
    assert.ok(!card.place||Object.hasOwn(places,card.place));
    if(card.action!=='none')assert.equal(card.day,day);
    if(card.kind==='appointment')assert.ok(card.day>=day);
    assert.ok(card.timeCost>=0&&card.timeCost<=1);
   }
  }
 }
});
