'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Pack=require('../rpg_narrative_pack'),Side=require('../rpg_side_quests'),Story=require('../rpg_story'),Schedules=require('../rpg_schedules'),World=require('../rpg_world'),Arc=require('../rpg_rival_arc'),Tournaments=require('../rpg_tournaments'),Epilogue=require('../rpg_epilogue'),Appointments=require('../rpg_appointments'),Intentions=require('../rpg_intentions'),CG=require('../rpg_cg_gallery'),Planner=require('../rpg_daily_planner'),Social=require('../rpg_social_activities'),Dates=require('../rpg_planned_dates'),Bridge=require('../rpg_duel_bridge'),Pre=require('../rpg_preduel'),Collection=require('../rpg_collection'),Journey=require('../rpg_season_journey'),Situations=require('../rpg_situations');
const js=fs.readFileSync(path.join(__dirname,'..','rpg.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','rpg.html'),'utf8');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);

class FakeNode{
 constructor(tag='div'){
  this.tagName=tag.toUpperCase();this.children=[];this.options=[];this.style={};this.className='';
  this.hidden=false;this.disabled=false;this.textContent='';this.title='';this.value='';this.src='';
  this.classList={toggle:(name,on)=>{if(on&&!this.className.includes(name))this.className+=' '+name;if(!on)this.className=this.className.replace(name,'');}};
 }
 append(...nodes){this.children.push(...nodes);for(const x of nodes)x.parentElement=this;if(this.tagName==='SELECT')this.options=this.children;}
 replaceChildren(...nodes){this.children=[];this.options=[];this.append(...nodes);}
 setAttribute(name,value){this[name]=value;}
 addEventListener(name,fn){this['on'+name]=fn;}
 remove(){this.removed=true;}
 showModal(){this.open=true;}close(){this.open=false;}
}
function launch(initial,approve=false){
 const elements={},listeners={},saved={neoHarborRpgV1:initial?JSON.stringify(initial):null};
 for(const id of ids)elements[id]=new FakeNode(id==='deckPicker'?'select':'div');
 elements.battle.contentWindow={};
 const doc={getElementById(id){if(!elements[id])throw Error('Missing '+id);return elements[id];},
  createElement(tag){return new FakeNode(tag);},body:new FakeNode('body'),
  addEventListener(name,cb){listeners['document:'+name]=cb;}};
 const win={NeoRpgNarrativePack:Pack,NeoRpgSideQuests:Side,NeoHarborStory:Story,NeoRpgSchedules:Schedules,NeoRpgWorld:World,NeoRpgRivalArc:Arc,NeoRpgTournaments:Tournaments,NeoRpgEpilogue:Epilogue,NeoRpgAppointments:Appointments,NeoRpgIntentions:Intentions,NeoRpgCGGallery:CG,NeoRpgDailyPlanner:Planner,NeoRpgSocialActivities:Social,NeoRpgPlannedDates:Dates,NeoRpgPreDuel:Pre,NeoRpgCollection:Collection,NeoRpgSeasonJourney:Journey,NeoRpgSituations:Situations,NeoRpgDuelBridge:Bridge,
  addEventListener(name,cb){listeners[name]=cb;}};
 const local={getItem(k){return saved[k]||null;},setItem(k,v){saved[k]=String(v);}};
 const session={removeItem(){},setItem(){},getItem(){return null;}};
 const loc={origin:'http://localhost',href:'http://localhost/rpg.html',reload(){}};
 new Function('window','document','localStorage','sessionStorage','location','fetch','confirm',js)(
  win,doc,local,session,loc,async()=>({ok:true,json:async()=>({decks:[{id:'blackout',name:'Blackout'}]})}),()=>approve);
 return {elements,listeners,loc,state:()=>JSON.parse(saved.neoHarborRpgV1)};
}
test('RPG boots at home with four life statistics and location activities',()=>{
 const r=launch();
 assert.match(r.elements.whereLabel.textContent,/HOME/);
 assert.equal(r.elements.lifeStats.children.length,4);
 assert.ok(r.elements.townActivities.children.length>0);
});
test('radar free travel points to a character who is really there',()=>{
 const r=launch(),radar=r.elements.townRadar.children.find(x=>x.className==='radar-person');
 assert.ok(radar);
 const name=radar.children[0].textContent;
 radar.onclick();
 assert.ok(r.elements.people.children.some(x=>x.children[1].children[0].textContent===name));
 assert.equal(r.state().slot,0);
});
test('location activity advances a single period and saves preparation',()=>{
 const r=launch();
 const action=r.elements.townActivities.children.find(x=>x.children[0].textContent.includes('Review your duel journal'));
 assert.ok(action);
 action.onclick();
 assert.equal(r.state().insight,2);
 assert.equal(r.state().preparation,1);
 assert.equal(r.state().focus,70);
 assert.equal(r.state().slot,1);
});
test('encounter resumes through a reload and rewards exactly once',()=>{
 const first=launch({day:10,slot:2,location:'home'});
 const scene=first.elements.townEncounters.children.find(x=>x.children?.[0]?.textContent.includes('Postcard'));
 assert.ok(scene);scene.onclick();
 assert.equal(first.state().activeEncounter.phase,'choice');
 const second=launch(first.state());
 second.elements.choices.children[0].onclick();
 assert.equal(second.state().activeEncounter.phase,'response');
 second.elements.choices.children[0].onclick();
 const saved=second.state();
 assert.equal(saved.day,11);assert.equal(saved.slot,0);
 assert.equal(saved.encountersDone.home_postcard.choice,0);
 assert.equal(saved.activeEncounter,null);
});
test('duel battle result applies one preparation bonus only once',()=>{
 const r=launch({day:5,slot:0,location:'shop',preparation:2});
 const hana=r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Hana Mizuno');
 assert.ok(hana);hana.onclick();
 const challenge=r.elements.choices.children.find(x=>x.textContent.includes('Challenge to a duel'));
 assert.ok(challenge);challenge.onclick();r.elements.preDuelSkip.onclick();
 const d=r.state().pendingDuel;assert.ok(d);
 const event={data:Bridge.message(d.id,0),origin:r.loc.origin,source:r.elements.battle.contentWindow};
 r.listeners.message(event);
 assert.equal(r.state().results.length,1);
 assert.equal(r.state().preparation,1);
 assert.equal(r.state().credits,100);
 assert.equal(r.state().slot,1);
 r.listeners.message(event);
 assert.equal(r.state().results.length,1);
});


test('a scheduled rivalry chapter plays multiple lines and saves its personal choices',()=>{
 const r=launch({day:14,slot:2,location:'center',results:[{id:'earlier',npc:'reina',won:false,day:3}]});
 const episode=r.elements.storyEvents.children.find(x=>x.className.includes('arc-episode'));
 assert.ok(episode,'optional Reina chapter is visible after a previous match');
 episode.onclick();
 for(let i=0;i<3;i++)r.elements.choices.children[0].onclick();
 assert.equal(r.state().activeArc.phase,'choice');
 r.elements.choices.children[0].onclick();
 assert.equal(r.state().activeArc.phase,'response');
 r.elements.choices.children[0].onclick();
 const state=r.state();
 assert.ok(state.arcFlags.reina_rival_1);
 assert.equal(state.activeArc,null);
 assert.equal(state.day,15);
 assert.equal(state.slot,0);
});

test('a private rivalry challenge launches the Classic duel and records a defeat branch once',()=>{
 const r=launch({day:58,slot:2,location:'center',
  arcFlags:{reina_rival_1:{day:14},reina_rival_2:{day:36}},
  results:[{id:'old-1',npc:'reina',won:false,day:6},{id:'old-2',npc:'reina',won:false,day:12}],
  insight:3});
 const episode=r.elements.storyEvents.children.find(x=>x.className.includes('arc-episode'));
 assert.ok(episode,'the trial unlocks through preparation even without a prior win');
 episode.onclick();
 for(let i=0;i<3;i++)r.elements.choices.children[0].onclick();
 assert.equal(r.state().activeArc.phase,'choice');
 r.elements.choices.children[0].onclick();
 const pending=r.state().pendingDuel;
 assert.ok(pending);
 assert.equal(pending.arcEpisode,'reina_rival_trial');
 r.elements.preDuelSkip.onclick();
 const event={data:Bridge.message(pending.id,1),origin:r.loc.origin,source:r.elements.battle.contentWindow};
 r.listeners.message(event);
 const state=r.state();
 assert.equal(state.arcFlags.reina_rival_trial.outcome,'Defeat');
 assert.equal(state.activeArc,null);
 assert.equal(state.results.length,3);
 assert.equal(state.day,59);
 assert.equal(state.slot,0);
 r.listeners.message(event);
 assert.equal(r.state().results.length,3);
});


test('in-progress rivalry dialogue resumes at the same line after save and reload',()=>{
 const first=launch({day:14,slot:2,location:'center',results:[{id:'early',npc:'reina',won:false,day:3}]});
 const episode=first.elements.storyEvents.children.find(x=>x.className.includes('arc-episode'));
 assert.ok(episode);episode.onclick();
 first.elements.choices.children[0].onclick();
 const state=first.state();
 assert.equal(state.activeArc.phase,'lines');
 assert.equal(state.activeArc.index,1);
 const restored=launch(state);
 assert.equal(restored.state().activeArc.index,1);
 assert.ok(restored.elements.line.textContent.includes('match'));
 restored.elements.choices.children[0].onclick();
 assert.equal(restored.state().activeArc.index,2);
});

test('three tournament victories advance a saved championship bracket exactly once per duel',()=>{
 const r=launch({day:30,slot:0,location:'center'});
 assert.ok(r.elements.bracketProgress.children.some(x=>x.children[0].textContent==='Neighborhood Cup'));
 for(let round=0;round<3;round++){
  const button=r.elements.activities.children.find(x=>x.textContent.includes('Neighborhood Cup')&&x.textContent.includes('Round '+(round+1)));
  assert.ok(button,'Missing round '+(round+1));
  button.onclick();
  const pending=r.state().pendingDuel;
  assert.equal(pending.tournamentRound,round);
  assert.equal(pending.tournamentId,'neighborhood');
  r.elements.preDuelSkip.onclick();
  const ev={origin:r.loc.origin,source:r.elements.battle.contentWindow,data:Bridge.message(pending.id,0)};
  r.listeners.message(ev);r.listeners.message(ev);
  assert.equal(r.state().tournaments.neighborhood.round,round+1);
  assert.equal(r.state().results.length,round+1);
 }
 const complete=r.state();
 assert.equal(complete.tournaments.neighborhood.state,'champion');
 assert.equal(complete.points,36);
 assert.equal(complete.credits,178);
 assert.ok(r.elements.bracketProgress.children.some(x=>x.children[1].textContent.includes('CHAMPION')));
});
test('tournament defeat eliminates but never blocks home travel',()=>{
 const r=launch({day:60,slot:0,location:'center'});
 const cup=r.elements.activities.children.find(x=>x.textContent.includes('Regional Qualifier'));
 assert.ok(cup);cup.onclick();
 const pending=r.state().pendingDuel;
 r.elements.preDuelSkip.onclick();
 r.listeners.message({origin:r.loc.origin,source:r.elements.battle.contentWindow,data:Bridge.message(pending.id,1)});
 assert.equal(r.state().tournaments.regional.state,'eliminated');
 assert.equal(r.state().tournaments.regional.round,0);
 assert.ok(r.elements.activities.children.every(x=>!x.textContent.includes('Regional Qualifier')));
 assert.ok(!r.elements.quickHome.disabled);
 r.elements.quickHome.onclick();assert.equal(r.state().location,'home');
});
test('drawn bracket round remains available for a rematch',()=>{
 const r=launch({day:30,slot:0,location:'center'});
 const round=r.elements.activities.children.find(x=>x.textContent.includes('Neighborhood Cup'));
 assert.ok(round);round.onclick();
 const d=r.state().pendingDuel;
 r.elements.preDuelSkip.onclick();
 r.listeners.message({origin:r.loc.origin,source:r.elements.battle.contentWindow,data:Bridge.message(d.id,null)});
 const s=r.state();
 assert.equal(s.tournaments.neighborhood.round,0);
 assert.equal(s.tournaments.neighborhood.results.length,1);
 assert.ok(r.elements.activities.children.some(x=>x.textContent.includes('Neighborhood Cup')));
});

test('an eliminated player can discover and finish a real relationship aftermath scene',()=>{
 const r=launch({day:31,slot:2,location:'center',
  tournaments:{neighborhood:{round:1,results:[],state:'eliminated'}}});
 const event=r.elements.townEncounters.children.find(x=>x.children?.[0]?.textContent.includes('A Match Worth Remembering'));
 assert.ok(event);event.onclick();
 assert.equal(r.state().activeEncounter.phase,'choice');
 r.elements.choices.children[0].onclick();r.elements.choices.children[0].onclick();
 const s=r.state();
 assert.ok(s.encountersDone.cup_neighborhood_rival);
 assert.equal(s.relationships.reina.respect,2);
 assert.equal(s.preparation,1);
 assert.equal(s.day,32);
 assert.equal(s.slot,0);
});
test('old saves past a missed cup can unlock an alternative NPC scene on load',()=>{
 const r=launch({day:36,slot:0,location:'shop'});
 assert.equal(r.state().tournaments.neighborhood.state,'missed');
 const event=r.elements.townEncounters.children.find(x=>x.children?.[0]?.textContent.includes('A Seat at the Next Table'));
 assert.ok(event,'Hana should offer a way forward after missing a cup');
 event.onclick();r.elements.choices.children[0].onclick();r.elements.choices.children[0].onclick();
 const s=r.state();
 assert.ok(s.encountersDone.cup_neighborhood_return);
 assert.equal(s.relationships.hana.trust,2);
 assert.equal(s.day,36);assert.equal(s.slot,1);
});

test('season epilogue remains hidden until the final period has passed',()=>{
 const r=launch({day:90,slot:2,location:'home'});
 assert.equal(r.elements.endSeason.hidden,true);
 r.elements.quickNext.onclick();
 const s=r.state();
 assert.equal(s.day,91);
 assert.equal(s.ended,true);
 assert.equal(r.elements.endSeason.hidden,false);
 assert.ok(r.elements.endSeason.children.some(x=>x.className==='finale-stats'));
 const actions=r.elements.endSeason.children.find(x=>x.className==='finale-actions');
 assert.ok(actions);assert.ok(actions.children[0].textContent.includes('New Game+'));
});
test('finale reflects the player actual match, cup and romantic relationship outcomes',()=>{
 const r=launch({day:91,ended:true,slot:0,location:'home',points:36,
  results:[{won:true,draw:false},{won:false,draw:false},{won:false,draw:true}],
  tournaments:{championship:{state:'champion',round:3,results:[]}},
  partner:'hana',relationships:{hana:{affection:10,trust:8,duels:1}}});
 assert.equal(r.elements.endSeason.hidden,false);
 const title=r.elements.endSeason.children.find(x=>x.tagName==='H2');
 assert.equal(title.textContent,'The Harbor Champion');
 const social=r.elements.endSeason.children.find(x=>x.className==='finale-social');
 assert.ok(social.textContent.includes('Hana Mizuno'));
});
test('New Game+ records a report and starts fresh without stale romance or standings',()=>{
 const r=launch({day:91,ended:true,slot:0,location:'home',credits:999,points:66,
  results:[{won:true}],partner:'reina',relationships:{reina:{affection:9,trust:5}},
  ngPlus:0},true);
 const button=r.elements.endSeason.children.find(x=>x.className==='finale-actions').children[0];
 button.onclick();const s=r.state();
 assert.equal(s.day,1);assert.equal(s.ngPlus,1);assert.equal(s.credits,80);
 assert.equal(s.points,0);assert.equal(s.partner,null);assert.equal(s.results.length,0);
 assert.equal(s.campaignHistory.length,1);assert.equal(s.campaignHistory[0].partner,'Reina Kurogane');
});


test('side quest is discoverable, choice persists through reload, and chapter pays only once',()=>{
 const first=launch({day:4,slot:1,location:'shop'});
 const invitation=first.elements.sideQuestEvents.children.find(x=>x.children?.[0]?.textContent.includes('Bent Binder'));
 assert.ok(invitation,'Elio chapter is not discoverable in the card shop');
 invitation.onclick();
 assert.equal(first.state().activeSideQuest.id,'borrowed_deck');
 first.elements.choices.children[0].onclick();
 assert.equal(first.state().activeSideQuest.index,1);
 const second=launch(first.state());
 assert.equal(second.state().activeSideQuest.index,1);
 for(let i=1;i<Side.byId('borrowed_deck').stages[0].lines.length;i++)second.elements.choices.children[0].onclick();
 assert.equal(second.state().activeSideQuest.phase,'choice');
 second.elements.choices.children[0].onclick();
 assert.equal(second.state().activeSideQuest.phase,'response');
 const third=launch(second.state());
 const credits=third.state().credits;
 third.elements.choices.children[0].onclick();
 assert.equal(third.state().sideQuests.borrowed_deck.step,1);
 assert.equal(third.state().sideQuests.borrowed_deck.history[0].flag,'elio_own_list');
 assert.equal(third.state().credits,credits+4);
 assert.equal(third.state().activeSideQuest,null);
 assert.ok(third.elements.sideQuestJournal.children.some(x=>x.textContent.includes('Missing Pieces')));
});

test('Elio quest launches a real deck duel and rewards a saved result only once',()=>{
 const first=launch({day:35,slot:1,location:'center',
  sideQuests:{borrowed_deck:{status:'active',step:2,history:[{step:0,flag:'elio_own_list'},{step:1,flag:'elio_budget'}]}}});
 const invitation=first.elements.sideQuestEvents.children.find(x=>x.children?.[0]?.textContent.includes('No Inherited Victory'));
 assert.ok(invitation,'final encounter is not reachable');
 invitation.onclick();
 const total=Side.byId('borrowed_deck').stages[2].lines.length+1; // includes remembered callback
 for(let i=0;i<total;i++)first.elements.choices.children[0].onclick();
 assert.equal(first.state().activeSideQuest.phase,'duel');
 const resumed=launch(first.state());
 resumed.elements.choices.children[0].onclick();
 const pending=resumed.state().pendingDuel;
 assert.equal(pending.sideQuestId,'borrowed_deck');
 assert.equal(pending.opponent,'bodyguard');
 resumed.elements.preDuelSkip.onclick();
 const ev={origin:resumed.loc.origin,source:resumed.elements.battle.contentWindow,data:Bridge.message(pending.id,1)};
 resumed.listeners.message(ev);
 const s=resumed.state(),credits=s.credits;
 assert.equal(s.sideQuests.borrowed_deck.status,'complete');
 assert.equal(s.sideQuests.borrowed_deck.history[2].result,'loss');
 assert.equal(s.results.length,1);
 assert.equal(s.activeSideQuest,null);
 resumed.listeners.message(ev);
 assert.equal(resumed.state().credits,credits);
 assert.equal(resumed.state().results.length,1);
 assert.ok(resumed.elements.sideQuestJournal.children.some(x=>x.textContent.includes('Completed')));
});

test('an invitation schedules a real NPC meeting without advancing time',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 const hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(hana,'Hana should be at the shop on the morning of Day 5');hana.onclick();
 const invite=r.elements.choices.children.find(x=>x.textContent.includes('Invite to a future meet-up'));
 assert.ok(invite);invite.onclick();
 const offer=r.elements.choices.children.find(x=>x.textContent.startsWith('Day '));
 assert.ok(offer);offer.onclick();
 const save=r.state();
 assert.equal(save.day,5);assert.equal(save.slot,0);
 assert.equal(save.appointments.length,1);
 assert.equal(save.appointments[0].status,'booked');
 assert.ok(r.elements.appointments.children[0].children[1].textContent.includes('DAY '));
});
test('attending a scheduled meet-up uses exactly one period and awards affection/trust once',()=>{
 const fresh=launch({day:5,slot:0,location:'shop'});
 const hana=fresh.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');hana.onclick();
 fresh.elements.choices.children.find(x=>x.textContent.includes('Invite to a future meet-up')).onclick();
 fresh.elements.choices.children.find(x=>x.textContent.startsWith('Day ')).onclick();
 const scheduled=fresh.state().appointments[0];
 const restored=launch({...fresh.state(),day:scheduled.day,slot:scheduled.slot,location:scheduled.place});
 const button=restored.elements.appointments.children[0].children[2].children[0];
 assert.ok(button.textContent.includes('Meet now'));button.onclick();
 const s=restored.state();
 assert.equal(s.appointments[0].status,'attended');
 assert.equal(s.relationships.hana.affection,2);assert.equal(s.relationships.hana.trust,1);
 assert.equal(s.bonds.hana.affection,2);assert.equal(s.bonds.hana.trust,1);
 assert.equal(s.day*3+s.slot,scheduled.day*3+scheduled.slot+1);
 assert.ok(restored.elements.appointments.children[0].textContent.includes('No plans yet'));
});
test('skipping a booked meet-up only reduces trust once after its time has passed',()=>{
 const first=launch({day:5,slot:0,location:'shop',relationships:{hana:{affection:4,trust:3}},bonds:{hana:{affection:4,trust:3,duels:0}}});
 first.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 first.elements.choices.children.find(x=>x.textContent.includes('Invite to a future meet-up')).onclick();
 first.elements.choices.children.find(x=>x.textContent.startsWith('Day ')).onclick();
 const plan=first.state().appointments[0];
 const later=launch({...first.state(),day:plan.day+1,slot:0,location:'home'});
 assert.equal(later.state().appointments[0].status,'missed');
 assert.equal(later.state().relationships.hana.trust,2);
 assert.equal(launch(later.state()).state().relationships.hana.trust,2);
});

test('daily intention: player chooses one social, duel or town focus, never all three',()=>{
 const r=launch();
 const buttons=r.elements.dailyIntention.children.filter(x=>x.className==='intention-choice');
 assert.equal(buttons.length,3);
 assert.match(buttons[0].children[1].textContent,/meet-up/);
 buttons[2].onclick();
 assert.equal(r.state().dailyIntention.id,'town');
 assert.equal(r.elements.dailyIntention.children.filter(x=>x.className==='intention-choice').length,0);
 const activity=r.elements.townActivities.children.find(x=>x.children?.[0]?.textContent.includes('Review your duel journal'));
 activity.onclick();
 assert.equal(r.state().dailyIntention.completed,true);
 assert.equal(r.state().intentionsCompleted,1);
 assert.equal(r.state().reputation,2);
 assert.equal(r.state().credits,88);
 assert.match(r.elements.dailyIntention.children[0].children[0].textContent,/COMPLETED/);
});
test('social daily intention can be fulfilled by a normal hangout, persisted exactly once',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 r.elements.dailyIntention.children.find(x=>x.children?.[0]?.textContent==='Make time for someone').onclick();
 const hana=r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Hana Mizuno');
 assert.ok(hana);hana.onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Spend time together')).onclick();
 assert.equal(r.state().dailyIntention.completed,true);
 assert.equal(r.state().intentionsCompleted,1);
 assert.equal(r.state().focus,80);
 assert.equal(r.state().insight,1);
 assert.equal(launch(r.state()).state().intentionsCompleted,1);
});
test('duel intention counts authentic defeat, then resets cleanly the next day',()=>{
 const r=launch({day:5,slot:2,location:'shop'});
 r.elements.dailyIntention.children.find(x=>x.children?.[0]?.textContent==='Play a meaningful match').onclick();
 const regular=r.elements.people.children.find(x=>!x.disabled);
 assert.ok(regular);
 regular.onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Challenge to a duel')).onclick();
 const d=r.state().pendingDuel;assert.ok(d);
 r.elements.preDuelSkip.onclick();
 const event={data:Bridge.message(d.id,1),origin:r.loc.origin,source:r.elements.battle.contentWindow};
 r.listeners.message(event);
 assert.equal(r.state().results.length,1);
 assert.equal(r.state().preparation,1);
 assert.equal(r.state().intentionsCompleted,1);
 assert.equal(r.state().dailyIntention,null);
 assert.equal(r.state().day,6);
 r.listeners.message(event);
 assert.equal(r.state().intentionsCompleted,1);
 assert.equal(r.elements.dailyIntention.children.filter(x=>x.className==='intention-choice').length,3);
});

test('gallery opens with 32 locked CGs; a real first encounter reveals only its earned profile',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 r.elements.galleryBtn.onclick();
 assert.equal(r.elements.galleryDialog.open,true);
 assert.equal(r.elements.galleryGrid.children.length,32);
 assert.equal(r.elements.galleryGrid.children.filter(x=>!x.disabled).length,0);
 r.elements.galleryClose.onclick();
 const person=r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Hana Mizuno');
 assert.ok(person);person.onclick();
 assert.equal(r.state().cgUnlocked.hana_first_meeting.day,5);
 r.elements.galleryBtn.onclick();
 assert.equal(r.elements.galleryGrid.children.filter(x=>!x.disabled).length,1);
 const tile=r.elements.galleryGrid.children.find(x=>!x.disabled);
 tile.onclick();
 assert.match(r.elements.galleryPreview.children[0].textContent,/Warm Welcome/);
 assert.equal(r.state().cgViewed.hana_first_meeting,undefined,'missing image is earned but not viewed');
});
test('a genuine duel may unlock pre-duel art but still opens the authoritative iframe with no image files',()=>{
 const r=launch({day:8,slot:1,location:'shop',relationships:{hana:{affection:2,trust:2}},bonds:{hana:{affection:2,trust:2,duels:0}}});
 const person=r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Hana Mizuno');
 assert.ok(person);person.onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Challenge to a duel')).onclick();
 assert.ok(r.state().pendingDuel);
 assert.equal(r.state().cgUnlocked.hana_shop_challenge,undefined,'CG unlocks when the duel actually starts');
 assert.equal(r.elements.duel.hidden,true);
 assert.equal(r.elements.preDuelDialog.open,true);
 r.elements.preDuelSkip.onclick();
 assert.ok(r.state().cgUnlocked.hana_shop_challenge);
 assert.equal(r.elements.duel.hidden,false);
 assert.match(r.elements.battle.src,/classic_live\.html/);
});
test('ordinary riverside hangout does not grant situation-exclusive summer CG',()=>{
 const r=launch({day:20,slot:1,location:'park',relationships:{marina:{affection:7,trust:3}},bonds:{marina:{affection:7,trust:3,duels:0}}});
 const person=r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Marina Aoki');
 assert.ok(person);person.onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Spend time together')).onclick();
 assert.equal(r.state().cgUnlocked.marina_beach_towel,undefined);
 const saved=launch(r.state()).state();
 assert.equal(saved.cgUnlocked.marina_beach_towel,undefined);
 assert.ok(!saved.pendingDuel);
});

test('contextual day planner shows grounded cards without changing period or campaign resources',()=>{
 const r=launch(),before=r.state();
 assert.ok(r.elements.dailyPlanner.children.length>0&&r.elements.dailyPlanner.children.length<=3);
 assert.ok(r.elements.dailyPlanner.children.some(x=>x.className.includes('planner-card')));
 const after=r.state();assert.equal(after.day,before.day);assert.equal(after.slot,before.slot);assert.equal(after.credits,before.credits);
});
test('planner travel shortcut changes only location and never advances time',()=>{
 const r=launch({day:30,slot:1,location:'home'});
 const target=r.elements.dailyPlanner.children.find(x=>x.children?.[1]?.textContent.includes('Neighborhood Cup'));
 assert.ok(target,'an active tournament must be discoverable in the planner');
 const go=target.children.find(x=>x.className==='planner-action');assert.ok(go);
 go.onclick();
 const next=r.state();
 assert.equal(next.location,'center');assert.equal(next.day,30);assert.equal(next.slot,1);
 assert.ok(r.elements.activities.children.some(x=>x.textContent.includes('Neighborhood Cup')));
 assert.equal(next.pendingDuel,null,'planner only navigates, never starts a duel');
});
test('planner prioritizes scheduled appointment and does not auto-attend it',()=>{
 const seed=launch({day:4,slot:0,location:'shop'});
 const offered=Appointments.proposed(seed.state(),'hana',Schedules)[0];assert.ok(offered);
 const prepared={...seed.state(),day:offered.day,slot:offered.slot,location:'home',
  appointments:[{id:1,npc:'hana',day:offered.day,slot:offered.slot,place:offered.place,status:'booked',bookedDay:4}],appointmentSeq:1};
 const r=launch(prepared),first=r.elements.dailyPlanner.children[0];
 assert.match(first.children[1].textContent,/Meet-up happening now/);
 assert.equal(r.state().appointments[0].status,'booked');
 first.children.find(x=>x.className==='planner-action').onclick();
 const saved=r.state();assert.equal(saved.location,offered.place);assert.equal(saved.appointments[0].status,'booked');
 assert.equal(saved.slot,offered.slot);
});
test('planner does not offer shortcuts while player is in a committed story scene',()=>{
 const r=launch({day:4,slot:0,location:'shop',activeStory:{id:'hana_route_1',phase:'lines',index:0}});
 assert.equal(r.elements.dailyPlanner.children.length,1);
 assert.match(r.elements.dailyPlanner.children[0].textContent,/Finish your current scene/);
});

test('social planner lists three personality-aware choices with cost and favorite hints',()=>{
 const r=launch({day:1,slot:0,location:'shop'});
 const hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(hana);hana.onclick();
 const plan=r.elements.choices.children.find(x=>x.textContent.includes('Choose a shared activity'));
 assert.ok(plan);plan.onclick();
 const choices=r.elements.choices.children;
 assert.equal(choices.length,4);
 const welcome=choices.find(x=>x.textContent.includes('Welcome a new player'));
 assert.ok(welcome);assert.match(welcome.textContent,/Favorite/);
 assert.match(welcome.textContent,/8 focus/);
 assert.equal(r.state().slot,0,'reading social options is free');
});
test('real shared activity consumes one period, saves bond and cannot repeat alongside old hangout',()=>{
 const r=launch({day:1,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Choose a shared activity')).onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Welcome a new player')).onclick();
 const s=r.state();
 assert.equal(s.slot,1);assert.equal(s.focus,67);assert.equal(s.hungOut['1:hana'],true);
 assert.equal(s.socialHistory.hana.lastActivity,'shop_welcome');
 assert.equal(s.relationships.hana.affection,2);assert.equal(s.relationships.hana.trust,1);
 const reload=launch(s);
 assert.equal(reload.state().socialHistory.hana.count,1);
 reload.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 assert.ok(reload.elements.choices.children.some(x=>x.textContent.includes('Already spent time today')));
});
test('competitive Reina outing increases respect without creating phantom TCG matches',()=>{
 const r=launch({day:1,slot:1,location:'center'});
 const reina=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Reina Kurogane');
 assert.ok(reina);reina.onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Choose a shared activity')).onclick();
 const preferred=r.elements.choices.children.find(x=>x.textContent.includes('Practice tricky openings'));
 assert.ok(preferred);assert.match(preferred.textContent,/Favorite/);
 preferred.onclick();
 const s=r.state();
 assert.equal(s.relationships.reina.respect,2);assert.equal(s.socialHistory.reina.lastTag,'strategy');
 assert.equal(s.pendingDuel,null);assert.equal(s.results.length,0);
 assert.equal(s.slot,2);
});
test('insufficient resources leave social dialogue and campaign time unchanged',()=>{
 const r=launch({day:1,slot:0,location:'shop',focus:0,credits:0});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Choose a shared activity')).onclick();
 const button=r.elements.choices.children.find(x=>x.textContent.includes('Customize deck sleeves'));
 assert.match(button.textContent,/Not enough focus/);
 const before=r.state();
 assert.equal(button.disabled,true,'unaffordable activities cannot be clicked');
 assert.match(button.title,/Not enough focus/);
 const after=r.state();
 assert.equal(after.slot,before.slot);assert.equal(after.focus,0);assert.equal(after.credits,0);
 assert.equal(after.socialHistory.hana,undefined);assert.equal(after.hungOut['1:hana'],undefined);
});
test('guest cast can use the generic activity framework without changing authored character dialogue',()=>{
 const r=launch({day:12,slot:1,location:'center'});
 const person=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Jun Arai');
 assert.ok(person,'Jun follows the current day-12 community center afternoon schedule');
 person.onclick();
 assert.ok(r.elements.choices.children.some(x=>x.textContent.includes('Choose a shared activity')));
});

test('G3: plan a friendship outing through three-step conversation without spending time',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 const invite=r.elements.choices.children.find(x=>x.textContent.includes('Plan an activity or date'));
 assert.ok(invite);invite.onclick();
 r.elements.choices.children.find(x=>x.textContent.startsWith('Day ')).onclick();
 const activity=r.elements.choices.children.find(x=>x.textContent.includes('Welcome a new player'));
 assert.ok(activity);activity.onclick();
 const friends=r.elements.choices.children.find(x=>x.textContent.includes('Spend time as friends'));
 assert.ok(friends);friends.onclick();
 const saved=r.state();
 assert.equal(saved.day,5);assert.equal(saved.slot,0);assert.equal(saved.focus,75);
 assert.equal(saved.appointments.length,1);assert.equal(saved.appointments[0].status,'booked');
 assert.equal(saved.appointments[0].activityId,'shop_welcome');
 assert.equal(saved.appointments[0].socialTone,'friendship');
 assert.match(r.elements.appointments.children[0].children[2].textContent,/Welcome a new player/);
});
test('G3: honor a planned outing exactly once with a real activity cost and save continuity',()=>{
 const start=launch({day:5,slot:0,location:'shop'});
 start.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 start.elements.choices.children.find(x=>x.textContent.includes('Plan an activity or date')).onclick();
 start.elements.choices.children.find(x=>x.textContent.startsWith('Day ')).onclick();
 start.elements.choices.children.find(x=>x.textContent.includes('Welcome a new player')).onclick();
 start.elements.choices.children.find(x=>x.textContent.includes('Spend time as friends')).onclick();
 const saved=start.state(),meeting=saved.appointments[0];
 const r=launch({...saved,day:meeting.day,slot:meeting.slot,location:meeting.place});
 const button=r.elements.appointments.children[0].children.at(-1).children[0];
 assert.match(button.textContent,/Enjoy outing/);
 button.onclick();const s=r.state();
 assert.equal(s.appointments[0].status,'attended');
 assert.equal(s.focus,67);assert.equal(s.credits,80);
 assert.equal(s.relationships.hana.affection,2,'booked outing applies social rewards once, not +2 twice');
 assert.equal(s.relationships.hana.trust,2,'friendship plan provides one extra trust beyond favorite outing');
 assert.equal(s.socialHistory.hana.lastActivity,'shop_welcome');
 assert.equal(s.hungOut[meeting.day+':hana'],true);
 assert.equal(s.day*3+s.slot,meeting.day*3+meeting.slot+1);
 const reloaded=launch(s);assert.equal(reloaded.state().appointments[0].status,'attended');
 assert.equal(reloaded.state().relationships.hana.affection,2);
});
test('G3: romantic tone is explicitly gated and does not auto-commit a route',()=>{
 const base={day:5,slot:0,location:'shop',relationships:{hana:{affection:5,trust:3}},bonds:{hana:{affection:5,trust:3,duels:0}}};
 const r=launch(base);
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Plan an activity or date')).onclick();
 r.elements.choices.children.find(x=>x.textContent.startsWith('Day ')).onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Customize deck sleeves')).onclick();
 const option=r.elements.choices.children.find(x=>x.textContent.includes('Ask for a date'));
 assert.ok(option);assert.equal(option.disabled,false);
 option.onclick();const booked=r.state().appointments[0];
 assert.equal(booked.socialTone,'romantic');
 const scheduled=launch({...r.state(),day:booked.day,slot:booked.slot,location:booked.place});
 const enter=scheduled.elements.appointments.children[0].children.at(-1).children[0];
 assert.match(enter.textContent,/Go on date/);enter.onclick();
 const s=scheduled.state();
 assert.equal(s.relationships.hana.attraction,1);
 assert.equal(s.partner,null);
 assert.ok(!s.routeOutcomes.hana);
 assert.equal(s.appointments[0].status,'attended');
});
test('G3: unavailable romantic tone is disabled instead of accepting a low-bond relationship',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Plan an activity or date')).onclick();
 r.elements.choices.children.find(x=>x.textContent.startsWith('Day ')).onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Customize deck sleeves')).onclick();
 const option=r.elements.choices.children.find(x=>x.textContent.includes('Ask for a date'));
 assert.ok(option);assert.equal(option.disabled,true);
 assert.match(option.title,/Build affection/);
 assert.equal(r.state().appointments.length,0);
});
test('G3: insufficient funds disable a booked outing and preserve both save and calendar',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Plan an activity or date')).onclick();
 r.elements.choices.children.find(x=>x.textContent.startsWith('Day ')).onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Customize deck sleeves')).onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Spend time as friends')).onclick();
 const booked=r.state().appointments[0];
 const resumed=launch({...r.state(),day:booked.day,slot:booked.slot,location:booked.place,focus:0,credits:0});
 const button=resumed.elements.appointments.children[0].children.at(-1).children[0];
 assert.equal(button.disabled,true);assert.match(button.title,/Not enough focus/);
 assert.equal(resumed.state().appointments[0].status,'booked');
});

test('G4: an NPC challenge pauses before iframe creation and blocks premature or forged results',()=>{
 const r=launch({day:8,slot:1,location:'shop',relationships:{hana:{affection:4,trust:2}},bonds:{hana:{affection:4,trust:2,duels:0}}});
 r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Hana Mizuno').onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Challenge to a duel')).onclick();
 const pending=r.state().pendingDuel;
 assert.equal(pending.preview.phase,'ready');assert.equal(pending.preview.index,0);
 assert.equal(r.elements.battle.src,'about:blank');assert.equal(r.elements.duel.hidden,true);
 assert.equal(r.elements.preDuelDialog.open,true);
 assert.match(r.elements.preDuelContext.textContent,/Friendly challenge/);
 assert.match(r.elements.preDuelLine.textContent,/match/);
 assert.equal(r.state().cgUnlocked.hana_shop_challenge,undefined);
 assert.equal(r.state().slot,1);
 r.listeners.message({origin:r.loc.origin,source:r.elements.battle.contentWindow,data:Bridge.message(pending.id,0)});
 assert.equal(r.state().results.length,0);assert.equal(r.state().pendingDuel.id,pending.id);
 r.elements.preDuelNext.onclick();
 assert.equal(r.state().pendingDuel.preview.index,1);
 assert.equal(r.elements.preDuelStart.hidden,false);
 r.elements.preDuelStart.onclick();
 assert.equal(r.elements.preDuelDialog.open,false);
 assert.equal(r.elements.duel.hidden,false);
 assert.equal(r.state().pendingDuel.id,pending.id);
 assert.equal(r.state().pendingDuel.preview.phase,'launched');
 assert.ok(r.state().cgUnlocked.hana_shop_challenge);
 assert.match(r.elements.battle.src,/classic_live\.html/);
 r.elements.preDuelStart.onclick();
 assert.equal(r.state().pendingDuel.id,pending.id);
 r.listeners.message({origin:r.loc.origin,source:r.elements.battle.contentWindow,data:Bridge.message(pending.id,1)});
 assert.equal(r.state().results.length,1);
});
test('G4: a partially viewed pre-duel scene resumes on the same dialogue line after reload',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Hana Mizuno').onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Challenge to a duel')).onclick();
 const id=r.state().pendingDuel.id;
 r.elements.preDuelNext.onclick();
 const restored=launch(r.state());
 assert.equal(restored.elements.preDuelDialog.open,true);
 assert.equal(restored.elements.preDuelStart.hidden,false);
 assert.equal(restored.elements.preDuelNext.hidden,true);
 assert.equal(restored.elements.battle.src,'about:blank');
 assert.equal(restored.state().pendingDuel.id,id);
 restored.elements.preDuelSkip.onclick();
 assert.equal(restored.state().pendingDuel.id,id);
 assert.equal(restored.state().pendingDuel.preview.phase,'launched');
 assert.match(restored.elements.battle.src,/duelId=/);
 const after=launch(restored.state());
 assert.equal(after.elements.preDuelDialog.open,undefined);
 assert.equal(after.state().pendingDuel.id,id);
 assert.match(after.elements.battle.src,/duelId=/);
});
test('G4: a migrated pending duel from an older save resumes directly, without a second preview',()=>{
 const first=launch({day:1,slot:1,location:'arcade'});
 first.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Yuna Hoshino').onclick();
 first.elements.choices.children.find(x=>x.textContent.includes('Challenge to a duel')).onclick();
 const old=first.state();
 delete old.pendingDuel.preview;
 const restored=launch(old);
 assert.equal(restored.state().pendingDuel.preview.phase,'launched');
 assert.equal(restored.elements.preDuelDialog.open,undefined);
 assert.match(restored.elements.battle.src,/classic_live\.html/);
});

test('G5: rare encounter offers real SFW scene, holds time during dialogue, then unlocks its exact CG',()=>{
 const event=Situations.events.find(e=>e.npc==='hana');
 const day=Array.from({length:event.end-event.start+1},(_,i)=>event.start+i)
  .find(d=>Schedules.locationFor(event.npc,d,event.slot)===event.place&&Situations.chance(event,d,event.slot));
 assert.ok(day,'event must have a scheduled opportunity');
 const r=launch({day,slot:event.slot,location:event.place,focus:75,
  relationships:{hana:{affection:8,trust:4}},bonds:{hana:{affection:8,trust:4,duels:0}}});
 const entry=r.elements.situationEvents.children.find(x=>x.textContent.includes(event.title)||x.children[0]?.textContent.includes(event.title));
 assert.ok(entry,'the optional G5 event should appear only when eligible');
 assert.equal(r.state().cgUnlocked?.[event.id],undefined);
 entry.onclick();
 assert.equal(r.state().activeSituation.id,event.id);
 assert.equal(r.state().day,day);assert.equal(r.state().focus,75);
 assert.equal(r.elements.quickNext.disabled,true,'the ongoing VN scene locks other time actions');
 const afterBegin=launch(r.state());
 assert.equal(afterBegin.state().activeSituation.phase,'choice');
 afterBegin.elements.choices.children[0].onclick();
 assert.equal(afterBegin.state().activeSituation.phase,'response');
 const beforeFinish=launch(afterBegin.state());
 assert.equal(beforeFinish.state().activeSituation.choice,0);
 beforeFinish.elements.choices.children[0].onclick();
 const result=beforeFinish.state();
 assert.equal(result.activeSituation,null);
 assert.equal(result.situationDone[event.id].choice,0);
 assert.equal(result.focus,69);
 assert.equal(result.cgUnlocked[event.id].trigger,'situation');
 assert.equal(result.hungOut[day+':hana'],true);
 assert.equal(result.day*3+result.slot,day*3+event.slot+1);
 const final=launch(result);
 assert.equal(final.state().situationDone[event.id].choice,0);
 assert.equal(final.state().cgUnlocked[event.id].trigger,'situation');
});
test('G5: surprising encounter can be declined without time, costs or affection progress',()=>{
 const event=Situations.events.find(e=>e.npc==='hana');
 const day=Array.from({length:event.end-event.start+1},(_,i)=>event.start+i)
  .find(d=>Schedules.locationFor(event.npc,d,event.slot)===event.place&&Situations.chance(event,d,event.slot));
 const r=launch({day,slot:event.slot,location:event.place,focus:75,
  relationships:{hana:{affection:7,trust:3}},bonds:{hana:{affection:7,trust:3,duels:0}}});
 const b=r.elements.situationEvents.children.find(x=>x.children?.[0]?.textContent.includes(event.title));
 assert.ok(b);b.onclick();
 const quit=r.elements.choices.children.find(x=>x.textContent.includes('Not now'));
 assert.ok(quit);quit.onclick();
 assert.equal(r.state().activeSituation,null);
 assert.equal(r.state().day,day);assert.equal(r.state().slot,event.slot);
 assert.equal(r.state().focus,75);assert.equal(r.state().situationDone[event.id],undefined);
 assert.equal(r.state().cgUnlocked?.[event.id],undefined);
});

test('G6: journey panel exposes meaningful milestones and opens the real memory album',()=>{
 const r=launch({day:46,slot:1,location:'home'});
 assert.ok(r.elements.journeyProgress.children.length>=5);
 const overview=r.elements.journeyProgress.children[0];
 assert.match(overview.textContent,/Season 1.*Day 46 \/ 90.*0\/32 memories/);
 const progress=r.elements.journeyProgress.children.find(x=>x.className==='journey-track');
 assert.equal(progress.children[0].style.width,'0%');
 const open=r.elements.journeyProgress.children.find(x=>x.className==='journey-gallery');
 assert.ok(open);
 open.onclick();
 assert.equal(r.elements.galleryDialog.open,true);
 assert.equal(r.elements.galleryGrid.children.length,32);
 assert.equal(r.elements.galleryProgress.children.length,12);
 assert.match(r.elements.galleryCount.textContent,/0\/32 overall/);
});
test('G6: gallery shows earned vs viewed correctly and the unseen filter hides locked art',()=>{
 const r=launch({day:12,slot:0,location:'home',
  cgUnlocked:{hana_first_meeting:{day:3,slot:0,trigger:'meet'},reina_rival_intro:{day:5,slot:0,trigger:'meet'}},
  cgViewed:{hana_first_meeting:true}});
 r.elements.journeyProgress.children.find(x=>x.className==='journey-gallery').onclick();
 assert.match(r.elements.galleryCount.textContent,/2\/32 overall.*1 earned but not yet viewed/);
 r.elements.galleryUnseen.checked=true;r.elements.galleryUnseen.onchange();
 assert.equal(r.elements.galleryGrid.children.length,1);
 assert.match(r.elements.galleryGrid.children[0].children[2].textContent,/Reina/);
 r.elements.galleryGrid.children[0].onclick();
 // Image binary is missing in the controller fixture: gallery inspection is not an actual view.
 assert.equal(r.state().cgViewed.reina_rival_intro,undefined);
 assert.equal(r.state().cgViewed.hana_first_meeting,true);
 r.elements.galleryUnseen.checked=false;r.elements.galleryUnseen.onchange();
 assert.equal(r.elements.galleryGrid.children.length,32);
});
test('G6: end of season displays accurate social summary and previous-run archive',()=>{
 const r=launch({day:91,ended:true,slot:0,location:'home',
  points:54,appointments:[{id:1,npc:'hana',day:10,slot:1,place:'shop',status:'attended'},
   {id:2,npc:'reina',day:11,slot:1,place:'center',status:'missed'}],
  situationDone:{hana_apron_mixup:{day:20,slot:1,choice:1}},
  cgUnlocked:{hana_first_meeting:{day:2,slot:0,trigger:'meet'}},
  campaignHistory:[{run:1,title:'The People Who Stayed',wins:2,points:13,galleryEarned:1}]});
 const numbers=r.elements.endSeason.children.find(x=>x.className==='finale-stats');
 const pairs=numbers.children.map(x=>[x.children[1].textContent,x.children[0].textContent]);
 assert.ok(pairs.some(x=>x[0]==='Plans kept'&&x[1]==='1'));
 assert.ok(pairs.some(x=>x[0]==='Special moments'&&x[1]==='1'));
 assert.ok(pairs.some(x=>x[0]==='Gallery memories'&&x[1]==='1'));
 const archive=r.elements.endSeason.children.find(x=>x.className==='finale-archive');
 assert.ok(archive);assert.ok(archive.children.some(x=>x.textContent.includes('Season 1')));
});
test('G6: New Game+ archives the run, preserves memories but resets G5 special-event availability',()=>{
 const r=launch({day:91,ended:true,slot:0,location:'home',ngPlus:0,points:15,
  situationDone:{hana_apron_mixup:{day:10,slot:1,choice:0}},
  relationships:{hana:{affection:10,trust:8}},
  cgUnlocked:{hana_first_meeting:{day:1,slot:0,trigger:'meet'}},
  cgViewed:{hana_first_meeting:true}},true);
 const button=r.elements.endSeason.children.find(x=>x.className==='finale-actions').children[0];
 button.onclick();const after=r.state();
 assert.equal(after.day,1);assert.equal(after.ngPlus,1);
 assert.equal(after.situationDone.hana_apron_mixup,undefined);
 assert.equal(after.cgUnlocked.hana_first_meeting.day,1);
 assert.equal(after.cgViewed.hana_first_meeting,true);
 assert.equal(after.relationships.hana?.affection,undefined);
 assert.equal(after.campaignHistory.length,1);
 assert.equal(after.campaignHistory[0].situations,1);
 const reloaded=launch(after);
 assert.match(reloaded.elements.journeyProgress.children[0].textContent,/Season 2/);
 assert.match(reloaded.elements.galleryCount.textContent||'',/^$/);
 reloaded.elements.journeyProgress.children.find(x=>x.className==='journey-gallery').onclick();
 assert.match(reloaded.elements.galleryCount.textContent,/1\/32 overall/);
});
test('G6: completing a 90-day season by normal period advancement stops at day 91 and offers replay',()=>{
 const r=launch({day:1,slot:0,location:'home'});
 for(let i=0;i<270;i++){
  assert.equal(r.elements.quickNext.disabled,false,'day '+r.state().day+' slot '+r.state().slot);
  r.elements.quickNext.onclick();
 }
 const end=r.state();
 assert.equal(end.day,91);assert.equal(end.slot,0);assert.equal(end.ended,true);
 assert.equal(end.pendingDuel,null);assert.equal(end.activeSituation,null);
 assert.equal(r.elements.quickNext.disabled,true);
 assert.equal(r.elements.endSeason.hidden,false);
 assert.ok(r.elements.endSeason.children.some(x=>x.className==='finale-actions'));
 assert.match(r.elements.journeyProgress.children[2].children[0].textContent,/Your season is complete/);
});

test('RPG collection: new players must choose one of three modest dual-type starters',()=>{
 const r=launch();
 assert.equal(r.elements.starterDialog.open,true);
 assert.equal(r.elements.starterChoices.children.length,3);
 assert.deepEqual(r.elements.starterChoices.children.map(x=>x.children[0].textContent.includes(' / ')),[true,true,true]);
 r.elements.starterChoices.children[1].onclick();
 const s=r.state();
 assert.equal(s.deckJourney.starter,'tidal_circuit');
 assert.equal(s.deckJourney.deck.length,60);
 assert.equal(s.playerDeck,'custom');
 assert.equal(r.elements.starterDialog.open,false);
 assert.equal(r.elements.deckPicker.disabled,true);
 assert.ok(r.elements.deckCollection.children.some(x=>x.textContent.includes('Edit your 60-card deck')));
});
test('RPG collection: buy a training pack at shop, edit a real owned upgrade and save without changing campaign time',()=>{
 const r=launch({day:5,slot:0,location:'shop',credits:80,deckJourney:Collection.fresh()});
 r.elements.starterChoices.children[0].onclick();
 const original=r.state().deckJourney.deck;
 const buy=r.elements.deckCollection.children.find(x=>x.textContent.includes('Buy training pack'));
 assert.ok(buy);buy.onclick();
 const afterPack=r.state();
 assert.equal(afterPack.credits,60);assert.equal(afterPack.deckJourney.packs,1);
 assert.equal(afterPack.day,5);assert.equal(afterPack.slot,0);
 const editor=r.elements.deckCollection.children.find(x=>x.textContent.includes('Edit your 60-card deck'));
 editor.onclick();assert.equal(r.elements.deckEditDialog.open,true);
 const counts=Collection.rank(original);
 const card=Object.keys(afterPack.deckJourney.owned).find(id=>!counts[id]);
 assert.ok(card,'pack should introduce at least one new candidate eventually');
 r.elements.deckRemove.value='base1-94';r.elements.deckAdd.value=card;
 r.elements.deckSwap.onclick();
 assert.equal(r.state().deckJourney.deck.join(','),original.join(','),'draft must not alter live duel deck');
 r.elements.deckSave.onclick();
 const saved=r.state();
 assert.equal(saved.deckJourney.deck.length,60);
 assert.ok(saved.deckJourney.deck.includes(card));
 assert.equal(saved.deckJourney.draft,null);
 assert.equal(saved.day,5);assert.equal(saved.slot,0);
});
test('RPG collection: pre-duel snapshot locks the actual 60 owned cards until the result',()=>{
 const r=launch({day:5,slot:0,location:'shop',deckJourney:Collection.fresh()});
 r.elements.starterChoices.children[2].onclick();
 const before=r.state().deckJourney.deck.join(',');
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Challenge to a duel')).onclick();
 const pending=r.state().pendingDuel;
 assert.equal(pending.playerDeck,'custom');assert.equal(pending.deckCards.join(','),before);
 assert.equal(r.elements.deckCollection.children.find(x=>x.textContent.includes('Edit your 60-card deck')).disabled,true);
 r.elements.preDuelSkip.onclick();assert.match(r.elements.battle.src,/deck=custom/);
 r.listeners.message({origin:r.loc.origin,source:r.elements.battle.contentWindow,data:Bridge.message(pending.id,0)});
 assert.equal(r.state().deckJourney.rewards,1);
 assert.equal(r.state().pendingDuel,null);
});
