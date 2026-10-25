'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Pack=require('../rpg_narrative_pack'),Side=require('../rpg_side_quests'),Story=require('../rpg_story'),Schedules=require('../rpg_schedules'),World=require('../rpg_world'),Arc=require('../rpg_rival_arc'),Tournaments=require('../rpg_tournaments'),Epilogue=require('../rpg_epilogue'),Appointments=require('../rpg_appointments'),Intentions=require('../rpg_intentions'),CG=require('../rpg_cg_gallery'),Planner=require('../rpg_daily_planner'),Social=require('../rpg_social_activities'),Dates=require('../rpg_planned_dates'),Bridge=require('../rpg_duel_bridge'),Pre=require('../rpg_preduel'),Collection=require('../rpg_collection'),Journey=require('../rpg_season_journey'),Situations=require('../rpg_situations'),Dialogue=require('../rpg_dialogue'),BondRewards=require('../rpg_bond_rewards'),Conversations=require('../rpg_conversations'),PartnerDecks=require('../rpg_partner_decks');
const Mandatory=require('../rpg_mandatory_events'),Season=require('../rpg_season_events'),Registry=require('../rpg_character_packs.generated'),Competitive=require('../rpg_competitive_loop'),Reactivity=require('../rpg_reactivity'),Community=require('../rpg_community'),Consequences=require('../rpg_consequences'),TournamentPresentation=require('../rpg_tournament_presentation');
const NpcDecks=require('../rpg_npc_deck_progression');
const Time=require('../rpg_time_coordinator');
const Relationships=require('../rpg_relationships');
const DialogueMemory=require('../rpg_dialogue_memory');
const Tutorials=require('../rpg_tutorials');
const SceneCast=require('../rpg_scene_cast');
const EventInvites=require('../rpg_event_invites');
const js=fs.readFileSync(path.join(__dirname,'..','rpg.js'),'utf8').replace(/\}\)\(\);\s*$/, 'window.__testRpgAction=act;window.__testRpgSelect=selectPerson;})();');
const RenderPerf=require('../rpg_render_perf');
const html=fs.readFileSync(path.join(__dirname,'..','rpg.html'),'utf8');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);

class FakeNode{
 constructor(tag='div'){
  this.tagName=tag.toUpperCase();this.children=[];this.options=[];this.style={setProperty(name,value){this[name]=String(value);}};this.className='';
  this.dataset={};this.hidden=false;this.disabled=false;this.textContent='';this.title='';this.value='';this.src='';
  this.nodeType=1;
  this.classList={
   contains:name=>this.className.split(/\s+/).includes(name),
   add:name=>{if(!this.className.split(/\s+/).includes(name))this.className=(this.className+' '+name).trim();},
   remove:name=>{this.className=this.className.split(/\s+/).filter(x=>x&&x!==name).join(' ');},
   toggle:(name,on)=>{if(on===undefined)on=!this.classList.contains(name);if(on)this.classList.add(name);else this.classList.remove(name);}
  };
 }
 append(...nodes){
  for(const x of nodes){
   if(x.parentElement)x.parentElement.children=x.parentElement.children.filter(n=>n!==x);
   this.children.push(x);x.parentElement=this;
  }
  if(this.tagName==='SELECT')this.options=this.children;
 }
 get firstChild(){return this.children[0]||null;}
 prepend(...nodes){
  const before=this.firstChild;
  for(const node of nodes)this.insertBefore(node,before);
 }
 querySelector(selector){
  const matches=node=>selector.startsWith('.')?node.className?.split(/\s+/).includes(selector.slice(1)):selector.startsWith('#')?node.id===selector.slice(1):node.tagName?.toLowerCase()===selector.toLowerCase();
  const queue=[...this.children];
  while(queue.length){const node=queue.shift();if(matches(node))return node;queue.unshift(...(node.children||[]));}
  return null;
 }
 replaceWith(node){
  if(!this.parentElement)return;
  const parent=this.parentElement;parent.insertBefore(node,this);this.remove();
 }
 insertBefore(node,reference){
  if(node.parentElement)node.parentElement.children=node.parentElement.children.filter(n=>n!==node);
  const index=reference?this.children.indexOf(reference):-1;
  if(index<0)this.children.push(node);else this.children.splice(index,0,node);
  node.parentElement=this;
  if(this.tagName==='SELECT')this.options=this.children;
  return node;
 }
 replaceChildren(...nodes){
  for(const child of this.children)child.parentElement=null;
  this.children=[];this.options=[];this.append(...nodes);
 }
 setAttribute(name,value){this[name]=value;}
 addEventListener(name,fn){this['on'+name]=fn;}
 remove(){
  this.removed=true;
  if(this.parentElement){
   this.parentElement.children=this.parentElement.children.filter(n=>n!==this);
   this.parentElement=null;
  }
 }
 showModal(){this.open=true;}close(){this.open=false;}
}
function launch(initial,approve=false,mandatory=false){
 const elements={},listeners={},saved={neoHarborRpgV1:initial?JSON.stringify(initial):null};
 for(const id of ids)elements[id]=new FakeNode(id==='deckPicker'?'select':'div');
 elements.battle.contentWindow={};
 const doc={getElementById(id){if(!elements[id])throw Error('Missing '+id);return elements[id];},
  createElement(tag){return new FakeNode(tag);},
  createTextNode(text){const node=new FakeNode('#text');node.nodeType=3;node.nodeValue=String(text);node.textContent=String(text);return node;},
  body:new FakeNode('body'),
  addEventListener(name,cb){listeners['document:'+name]=cb;}};
 const win={NeoRpgRenderPerf:RenderPerf,NeoRpgNarrativePack:Pack,NeoRpgSideQuests:Side,NeoHarborStory:Story,NeoRpgSchedules:Schedules,NeoRpgWorld:World,NeoRpgRivalArc:Arc,NeoRpgTournaments:Tournaments,NeoRpgCompetitiveLoop:Competitive,NeoRpgReactivity:Reactivity,NeoRpgCommunity:Community,NeoRpgConsequences:Consequences,NeoRpgTournamentPresentation:TournamentPresentation,NeoRpgEpilogue:Epilogue,NeoRpgAppointments:Appointments,NeoRpgIntentions:Intentions,NeoRpgCGGallery:CG,NeoRpgDailyPlanner:Planner,NeoRpgSocialActivities:Social,NeoRpgPlannedDates:Dates,NeoRpgPreDuel:Pre,NeoRpgCollection:Collection,NeoRpgSeasonJourney:Journey,NeoRpgSituations:Situations,NeoRpgDuelBridge:Bridge,NeoRpgDialogue:Dialogue,NeoRpgBondRewards:BondRewards,NeoRpgConversations:Conversations,NeoRpgDialogueMemory:DialogueMemory,NeoRpgTutorials:Tutorials,NeoRpgSceneCast:SceneCast,NeoRpgEventInvites:EventInvites,NeoRpgPartnerDecks:PartnerDecks,NeoRpgNpcDeckProgression:NpcDecks,NeoRpgTimeCoordinator:Time,NeoRpgRelationships:Relationships,
  addEventListener(name,cb){listeners[name]=cb;}};
 if(mandatory){win.NeoRpgMandatoryEvents=Mandatory;win.NeoRpgSeasonEvents=Season;win.NeoRpgCharacterPacks=Registry;}
 win.NeoRpgStatus={
  open(state,cast,plan,avatar,onTutorialsChange){
   const toggle=elements.statusTutorialToggle;
   toggle.checked=!!state.gameplayTutorials?.disabled;
   toggle.onchange=()=>onTutorialsChange(!!toggle.checked);
   elements.statusDialog.showModal();
  },
  close(){elements.statusDialog.close();}
 };
 const local={getItem(k){return saved[k]||null;},setItem(k,v){saved[k]=String(v);}};
 const session={removeItem(){},setItem(){},getItem(){return null;}};
 const loc={origin:'http://localhost',href:'http://localhost/rpg.html',reload(){},assign(href){this.href=new URL(href,this.origin).href;}};
 new Function('window','document','localStorage','sessionStorage','location','fetch','confirm','Image',js)(
  win,doc,local,session,loc,async()=>({ok:true,json:async()=>({decks:[{id:'blackout',name:'Blackout'}]})}),()=>approve,function MockImage(){return new FakeNode('img');});
 return {elements,listeners,loc,act:win.__testRpgAction,select:(id,options)=>win.__testRpgSelect(id,options),state:()=>JSON.parse(saved.neoHarborRpgV1)};
}
function finishGreeting(app){
 let steps=0;
 while(steps++<30&&app.state().scene?.dialogue?.length>1&&
   app.state().scene.index<app.state().scene.dialogue.length-1){
  const advance=app.elements.choices.children.find(x=>x.textContent.includes('Continue'));
  assert.ok(advance,'Conversation needs a Continue action');advance.onclick();
 }
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
 const spokenReply=second.elements.line.textContent;
 second.elements.choices.children[0].onclick();
 const saved=second.state();
 assert.notEqual(saved.scene.line,spokenReply,'completed encounter must not repeat its reply');
 assert.equal(saved.day,11);assert.equal(saved.slot,0);
 assert.equal(saved.encountersDone.home_postcard.choice,0);
 assert.equal(saved.activeEncounter,null);
});
test('duel battle result applies one preparation bonus only once',()=>{
 const r=launch({day:5,slot:0,location:'shop',preparation:2});
 const hana=r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Hana Mizuno');
 assert.ok(hana);hana.onclick();finishGreeting(r);
 const challenge=r.elements.characterActions.children.find(x=>x.textContent.includes('Duel'));
 assert.ok(challenge);challenge.onclick();r.elements.preDuelSkip.onclick();
 const d=r.state().pendingDuel;assert.ok(d);
 const event={data:Bridge.message(d.id,0),origin:r.loc.origin,source:r.elements.battle.contentWindow};
 r.listeners.message(event);
 assert.equal(r.state().results.length,1);
 assert.equal(r.state().preparation,1);
 assert.equal(r.state().credits,109);
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
 assert.ok(hana,'Hana should be at the shop on the morning of Day 5');hana.onclick();finishGreeting(r);
 r.act('invite:hana');
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
 const hana=fresh.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');hana.onclick();finishGreeting(fresh);
 fresh.act('invite:hana');
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
 first.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(first);
 first.act('invite:hana');
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
 assert.ok(hana);hana.onclick();finishGreeting(r);
 r.act('hang:hana');
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
 regular.onclick();finishGreeting(r);
 r.elements.characterActions.children.find(x=>x.textContent.includes('Duel')).onclick();
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

test('gallery opens with all planned CGs; a real first encounter reveals only its earned profile',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 r.elements.galleryBtn.onclick();
 assert.equal(r.elements.galleryDialog.open,true);
 assert.equal(r.elements.galleryGrid.children.length,CG.catalog.length);
 assert.equal(r.elements.galleryGrid.children.filter(x=>!x.disabled).length,0);
 r.elements.galleryClose.onclick();
 const person=r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Hana Mizuno');
 assert.ok(person);person.onclick();finishGreeting(r);
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
 assert.ok(person);person.onclick();finishGreeting(r);
 r.elements.characterActions.children.find(x=>x.textContent.includes('Duel')).onclick();
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
 assert.ok(person);person.onclick();finishGreeting(r);
 r.act('hang:marina');
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

test('social planner hides hidden preferences while keeping clear time and resource costs',()=>{
 const r=launch({day:1,slot:0,location:'shop'});
 const hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(hana);hana.onclick();finishGreeting(r);
 r.act('socialPlan:hana');
 const choices=r.elements.choices.children;
 assert.equal(choices.length,4);
 const welcome=choices.find(x=>x.textContent.includes('Welcome a new player'));
 assert.ok(welcome);assert.doesNotMatch(welcome.textContent,/Favorite|Familiar|Something new|New experience/);
 assert.match(welcome.textContent,/8 focus/);
 assert.equal(r.state().slot,0,'reading social options is free');
 assert.ok(choices.every(x=>!/Favorite|Familiar|Something new|New experience|affection|trust|respect/i.test(x.textContent)),
  'hidden relationship mechanics should not be advertised on any activity choice');
 assert.doesNotMatch(r.elements.line.textContent,/Favorite activities|builds respect|deepen our bond/i);
});
test('planned outing menu never spoils which options an NPC prefers',()=>{
 const r=launch({day:1,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.act('dateInvite:hana');
 const slot=r.elements.choices.children.find(x=>x.textContent.includes('choose activity'));
 assert.ok(slot,'a future date slot should be available');
 slot.onclick();
 const labels=r.elements.choices.children.map(c=>c.textContent).join(' | ');
 assert.match(labels,/Welcome a new player/);
 assert.doesNotMatch(labels,/Favorite|Familiar|New experience|Something new|affection|trust|respect/);
});

test('real shared activity consumes one period, saves bond and cannot repeat alongside old hangout',()=>{
 const r=launch({day:1,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.act('socialPlan:hana');
 r.elements.choices.children.find(x=>x.textContent.includes('Welcome a new player')).onclick();
 const s=r.state();
 assert.equal(s.slot,1);assert.equal(s.focus,67);assert.equal(s.hungOut['1:hana'],true);
 assert.equal(s.socialHistory.hana.lastActivity,'shop_welcome');
 assert.equal(s.relationships.hana.affection,2);assert.equal(s.relationships.hana.trust,1);
 const reload=launch(s);
 assert.equal(reload.state().socialHistory.hana.count,1);
 reload.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(reload);
 const beforeRepeat=reload.state();
 reload.act('socialDo:hana:shop_welcome');
 assert.equal(reload.state().socialHistory.hana.count,1,'same-day activity cannot repeat');
 assert.deepEqual(reload.state().relationships.hana,beforeRepeat.relationships.hana,'repeat grants no extra bonds');
 assert.equal(reload.state().slot,beforeRepeat.slot,'repeat consumes no additional time');
});
test('competitive Reina outing increases respect without creating phantom TCG matches',()=>{
 const r=launch({day:1,slot:1,location:'center'});
 const reina=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Reina Kurogane');
 assert.ok(reina);reina.onclick();finishGreeting(r);
 r.act('socialPlan:reina');
 const preferred=r.elements.choices.children.find(x=>x.textContent.includes('Practice tricky openings'));
 assert.ok(preferred);assert.doesNotMatch(preferred.textContent,/Favorite|Familiar|Something new|New experience/);
 preferred.onclick();
 const s=r.state();
 assert.equal(s.relationships.reina.respect,2);assert.equal(s.socialHistory.reina.lastTag,'strategy');
 assert.equal(s.pendingDuel,null);assert.equal(s.results.length,0);
 assert.equal(s.slot,2);
});
test('insufficient resources leave social dialogue and campaign time unchanged',()=>{
 const r=launch({day:1,slot:0,location:'shop',focus:0,credits:0});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.act('socialPlan:hana');
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
 person.onclick();finishGreeting(r);
 r.act('socialPlan:jun');
 assert.ok(r.elements.choices.children.length>1,'guest characters can choose social activities');
});

test('G3: plan a friendship outing through three-step conversation without spending time',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.act('dateInvite:hana');
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
 start.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(start);
 start.act('dateInvite:hana');
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
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.act('dateInvite:hana');
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
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.act('dateInvite:hana');
 r.elements.choices.children.find(x=>x.textContent.startsWith('Day ')).onclick();
 r.elements.choices.children.find(x=>x.textContent.includes('Customize deck sleeves')).onclick();
 const option=r.elements.choices.children.find(x=>x.textContent.includes('Ask for a date'));
 assert.ok(option);assert.equal(option.disabled,true);
 assert.match(option.title,/do not know each other well enough/);
 assert.equal(r.state().appointments.length,0);
});
test('G3: insufficient funds disable a booked outing and preserve both save and calendar',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.act('dateInvite:hana');
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
 r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.elements.characterActions.children.find(x=>x.textContent.includes('Duel')).onclick();
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
 r.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.elements.characterActions.children.find(x=>x.textContent.includes('Duel')).onclick();
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
 first.elements.people.children.find(x=>x.children[1]?.children[0]?.textContent==='Yuna Hoshino').onclick();finishGreeting(first);
 first.elements.characterActions.children.find(x=>x.textContent.includes('Duel')).onclick();
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
 assert.match(overview.textContent,new RegExp('Season 1.*Day 46 / 90.*0/'+CG.catalog.length+' memories'));
 const progress=r.elements.journeyProgress.children.find(x=>x.className==='journey-track');
 assert.equal(progress.children[0].style.width,'0%');
 const open=r.elements.journeyProgress.children.find(x=>x.className==='journey-gallery');
 assert.ok(open);
 open.onclick();
 assert.equal(r.elements.galleryDialog.open,true);
 assert.equal(r.elements.galleryGrid.children.length,CG.catalog.length);
 assert.equal(r.elements.galleryProgress.children.length,CG.categories.length+new Set(CG.catalog.map(e=>e.character)).size);
 assert.match(r.elements.galleryCount.textContent,new RegExp('0/'+CG.catalog.length+' overall'));
});
test('G6: gallery shows earned vs viewed correctly and the unseen filter hides locked art',()=>{
 const r=launch({day:12,slot:0,location:'home',
  cgUnlocked:{hana_first_meeting:{day:3,slot:0,trigger:'meet'},reina_rival_intro:{day:5,slot:0,trigger:'meet'}},
  cgViewed:{hana_first_meeting:true}});
 r.elements.journeyProgress.children.find(x=>x.className==='journey-gallery').onclick();
 assert.match(r.elements.galleryCount.textContent,new RegExp('2/'+CG.catalog.length+' overall.*1 earned but not yet viewed'));
 r.elements.galleryUnseen.checked=true;r.elements.galleryUnseen.onchange();
 assert.equal(r.elements.galleryGrid.children.length,1);
 assert.match(r.elements.galleryGrid.children[0].children[2].textContent,/Reina/);
 r.elements.galleryGrid.children[0].onclick();
 // Image binary is missing in the controller fixture: gallery inspection is not an actual view.
 assert.equal(r.state().cgViewed.reina_rival_intro,undefined);
 assert.equal(r.state().cgViewed.hana_first_meeting,true);
 r.elements.galleryUnseen.checked=false;r.elements.galleryUnseen.onchange();
 assert.equal(r.elements.galleryGrid.children.length,CG.catalog.length);
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
 assert.match(reloaded.elements.galleryCount.textContent,new RegExp('1/'+CG.catalog.length+' overall'));
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
 assert.ok(r.elements.deckCollection.children.some(x=>x.textContent.includes('Build / edit your deck')));
});
test('RPG collection: a training pack unlocks owned cards and full Deck Studio navigation without advancing time',()=>{
 const r=launch({day:5,slot:0,location:'shop',credits:80,deckJourney:Collection.fresh()});
 r.elements.starterChoices.children[0].onclick();
 const original=r.state().deckJourney.deck.join(',');
 const store=r.elements.deckCollection.children.find(x=>x.textContent.includes('Browse booster packs'));
 assert.ok(store,'boosters are purchased in the shop UI, not the collection summary');store.onclick();
 const themes=r.elements.boosterShopGrid.children.slice(0,3).map(x=>x.children[1]?.textContent);
 assert.deepEqual(themes,['Colosseum Circuit','Evolution Workshop',"Trainer's Toolkit"]);
 const buy=r.elements.boosterShopGrid.children.flatMap(x=>x.children).find(x=>x.className==='booster-offer-buy'&&!x.disabled&&x.textContent.includes('Choose free'));
 assert.ok(buy,'two opening mini packs are available without credits');buy.onclick();
 const afterPack=r.state();
 assert.equal(afterPack.credits,80);assert.equal(afterPack.deckJourney.packs,0);
 assert.equal(afterPack.deckJourney.welcomePacks,1);
 assert.equal(afterPack.deckJourney.lastPack.cards.length,5);
 assert.equal(afterPack.day,5);assert.equal(afterPack.slot,0);
 assert.equal(afterPack.deckJourney.deck.join(','),original);
 const editor=r.elements.deckCollection.children.find(x=>x.className==='studio-open');
 assert.ok(editor,'Deck Studio should replace the old swap-card popup');
 editor.onclick();
 assert.match(r.loc.href,/rpg_deck_studio\.html/);
 assert.equal(r.state().day,5);assert.equal(r.state().slot,0);
});
test('booster shop remains open for multiple purchases and shop reveal shows the clerk art',()=>{
 const r=launch({day:5,slot:0,location:'shop',credits:80,deckJourney:Collection.fresh()});
 r.elements.starterChoices.children[0].onclick();
 r.elements.deckCollection.children.find(x=>x.textContent.includes('Browse booster packs')).onclick();
 assert.equal(r.elements.boosterShopDialog.open,true);
 const free=()=>r.elements.boosterShopGrid.children.flatMap(x=>x.children).find(x=>x.className==='booster-offer-buy'&&!x.disabled&&x.textContent.includes('Choose free'));
 assert.ok(free());free().onclick();
 assert.equal(r.elements.boosterShopDialog.open,true,'underlying shop must stay open during pack reveal');
 assert.equal(r.elements.packDialog.open,true);
 assert.equal(r.elements.packGiver.children[0].src,'/rpg-assets/shop/shopkeeper-booster.webp');
 assert.match(r.elements.packContinue.textContent,/Back to booster shop/);
 r.elements.packContinue.onclick();
 assert.equal(r.elements.boosterShopDialog.open,true);
 assert.equal(r.elements.packDialog.open,false);
 assert.equal(r.state().deckJourney.welcomePacks,1);
 assert.ok(free(),'updated offers should allow buying another pack immediately');
 free().onclick();r.elements.packContinue.onclick();
 assert.equal(r.state().deckJourney.welcomePacks,0);
 const paid=()=>r.elements.boosterShopGrid.children.flatMap(x=>x.children).find(x=>x.className==='booster-offer-buy'&&!x.disabled&&x.textContent.includes('Buy'));
 assert.ok(paid());paid().onclick();
 assert.equal(r.state().credits,60);
 assert.equal(r.elements.boosterShopDialog.open,true);
 r.elements.packContinue.onclick();
 assert.ok(paid(),'shop offers must refresh after buying');
 paid().onclick();
 assert.equal(r.state().credits,40,'repeat purchase charges exactly once');
 r.elements.packContinue.onclick();
 assert.equal(r.elements.boosterShopDialog.open,true);
 r.elements.boosterShopClose.onclick();
 assert.equal(r.elements.boosterShopDialog.open,false);
});
test('RPG collection: pre-duel snapshot locks the actual 60 owned cards until the result',()=>{
 const r=launch({day:5,slot:0,location:'shop',deckJourney:Collection.fresh()});
 r.elements.starterChoices.children[2].onclick();
 const before=r.state().deckJourney.deck.join(',');
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.elements.characterActions.children.find(x=>x.textContent.includes('Duel')).onclick();
 const pending=r.state().pendingDuel;
 assert.equal(pending.playerDeck,'custom');assert.equal(pending.deckCards.join(','),before);
 assert.equal(r.elements.deckCollection.children.find(x=>x.textContent.includes('Build / edit your deck')).disabled,true);
 r.elements.preDuelSkip.onclick();assert.match(r.elements.battle.src,/deck=custom/);
 r.listeners.message({origin:r.loc.origin,source:r.elements.battle.contentWindow,data:Bridge.message(pending.id,0)});
 assert.equal(r.state().deckJourney.rewards,1);
 assert.equal(r.state().pendingDuel,null);
});

test('RPG victories award a five-card mini booster, displayed once and safe against duplicate match receipts',()=>{
 const r=launch({day:5,slot:0,location:'shop',deckJourney:Collection.fresh()});
 r.elements.starterChoices.children[0].onclick();
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.elements.characterActions.children.find(x=>x.textContent.includes('Duel')).onclick();
 const pending=r.state().pendingDuel;
 r.elements.preDuelSkip.onclick();
 r.listeners.message({origin:r.loc.origin,source:r.elements.battle.contentWindow,data:Bridge.message(pending.id,0)});
 const s=r.state();
 assert.equal(s.deckJourney.rewards,1);
 assert.equal(s.deckJourney.lastPack.source,'win');
 assert.equal(s.deckJourney.lastPack.cards.length,5);
 assert.equal(r.elements.packDialog.open,true);
 assert.equal(r.elements.packCards.children.length,5);
 assert.match(r.elements.packTitle.textContent,/VICTORY MINI BOOSTER/);
 assert.match(r.elements.packDescription.textContent,/5 cards/);
 r.elements.packRevealAll.onclick();
 assert.ok(r.elements.packCards.children.every(x=>x.className.includes('revealed')));
 const count=Object.values(s.deckJourney.owned).reduce((a,b)=>a+b,0);
 r.listeners.message({origin:r.loc.origin,source:r.elements.battle.contentWindow,data:Bridge.message(pending.id,0)});
 assert.equal(Object.values(r.state().deckJourney.owned).reduce((a,b)=>a+b,0),count);
 r.elements.packContinue.onclick();
 assert.equal(r.state().deckJourney.lastPack.opened,true);
 assert.equal(r.elements.packDialog.open,false);
 const reload=launch(r.state());
 assert.equal(reload.elements.packDialog.open,undefined,'already opened booster must not reappear');
});
test('paid themed booster reveal survives page reload without charging again',()=>{
 const initial={day:5,slot:0,location:'shop',credits:80,deckJourney:Collection.fresh()};
 Collection.choose(initial,'tidal_circuit');
 initial.deckJourney.welcomePacks=0; // Migrated save or player who already claimed both welcome picks.
 const r=launch(initial);
 const store=r.elements.deckCollection.children.find(x=>x.textContent.includes('Browse booster packs'));
 assert.ok(store);store.onclick();
 const buy=r.elements.boosterShopGrid.children.flatMap(x=>x.children).find(x=>x.className==='booster-offer-buy'&&!x.disabled&&x.textContent.includes('Buy'));
 assert.ok(buy);buy.onclick();
 assert.equal(r.state().credits,60);
 assert.equal(r.elements.packCards.children.length,10);
 const again=launch(r.state());
 assert.equal(again.elements.packDialog.open,true);
 assert.equal(again.state().credits,60);
 assert.equal(again.state().deckJourney.packs,1);
 again.elements.packContinue.onclick();
 const final=launch(again.state());
 assert.equal(final.elements.packDialog.open,undefined);
});

test('daily Talk is an actual NPC / protagonist exchange, with no extra time cost',()=>{
 const r=launch({day:1,slot:0,location:'shop'});
 const hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(hana);hana.onclick();finishGreeting(r);
 const talk=r.elements.characterActions.children.find(x=>x.textContent.includes('Talk'));
 assert.ok(talk,'current VN keeps free Talk in the compact character action bar');talk.onclick();
 const first=r.elements.line.textContent;
 assert.equal(r.elements.speaker.textContent,'Hana Mizuno');
 assert.equal(r.elements.choices.children.length,1,'chat should advance one line at a time');
 r.elements.choices.children[0].onclick();
 assert.equal(r.elements.speaker.textContent,'You','the protagonist must speak back');
 r.elements.choices.children[0].onclick();
 assert.equal(r.elements.speaker.textContent,'Hana Mizuno','NPC responds to the player');
 r.elements.choices.children[0].onclick();
 assert.equal(r.elements.speaker.textContent,'You');
 r.elements.choices.children[0].onclick();
 assert.equal(r.elements.speaker.textContent,'Hana Mizuno');
 assert.notEqual(r.elements.line.textContent,first);
 assert.ok(r.elements.characterActions.children.some(x=>x.textContent.includes('Talk')),'talk remains available outside the dialogue box');
 assert.equal(r.state().day,1);assert.equal(r.state().slot,0);
 assert.ok(r.state().scene.dialogue.length>=5,'save should preserve the conversation');
});
test('story responses float to the center while the dialogue line remains visible',()=>{
 const r=launch({day:5,slot:0,location:'shop',activeStory:{id:'hana_route_1',phase:'lines',index:0}});
 assert.equal(r.elements.playerChoicePrompt.hidden,true);
 const stages=Dialogue.storyLines('hana_route_1',Story.linesFor(r.state(),'hana_route_1'));
 assert.equal(stages.length,Story.linesFor(r.state(),'hana_route_1').length,'narration-led chapters keep their authored pacing');
 assert.equal(stages[0].speaker,'Narrator');
 for(let i=0;i<stages.length;i++)r.elements.choices.children[0].onclick();
 assert.equal(r.elements.playerChoicePrompt.hidden,false);
 assert.equal(r.elements.choices.parentElement,r.elements.playerChoicePanel);
 assert.ok(r.elements.choices.children.length>=2,'response prompts should offer meaningful choices');
 assert.equal(r.elements.line.textContent,stages.at(-1).text,'choice prompt preserves the last spoken line');
 assert.equal(r.elements.speaker.textContent,'Hana Mizuno','the last line retains its real speaker');
 r.elements.choices.children[0].onclick();
 assert.equal(r.state().activeStory.phase,'response');
 const finalReply=r.elements.line.textContent;
 r.elements.choices.children[0].onclick();
 assert.equal(r.state().activeStory,null,'finished story is no longer active');
 assert.notEqual(r.state().scene.line,finalReply,'the finished response must not play twice');
});

test('a first meeting plays its greeting scene before actions and survives reload',()=>{
 const r=launch({day:1,slot:0,location:'shop'});
 const hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(hana);hana.onclick();
 assert.equal(r.elements.speaker.textContent,'Hana Mizuno');
 assert.equal(r.elements.choices.children.length,1);
 assert.equal(r.state().scene.index,0);
 r.elements.choices.children[0].onclick();
 assert.equal(r.elements.speaker.textContent,'You');
 const reloaded=launch(r.state());
 assert.equal(reloaded.elements.speaker.textContent,'You','the same line should resume after refresh');
 assert.equal(reloaded.state().scene.index,1);
 reloaded.elements.choices.children[0].onclick();
 assert.equal(reloaded.elements.speaker.textContent,'Hana Mizuno');
 assert.ok(reloaded.elements.characterActions.children.some(x=>x.textContent.includes('Talk')),'action bar returns after greeting');
 assert.equal(reloaded.state().slot,0);
});

test('casual character click starts a free VN exchange with a compact external action bar',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 const hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(hana);r.select('hana',{skipInvitation:true});
 const current=r.state();
 assert.ok(current.scene.dialogue?.length>=3,'character and player exchange more than one line');
 assert.ok(current.scene.dialogue.some(x=>x.speaker==='Protagonist'));
 assert.equal(current.relationships.hana.affection,0,'ordinary greetings must not earn affection');
 assert.equal(current.bonds.hana.affection,0,'legacy bond stats must not change');
 assert.equal(current.day,5);assert.equal(current.slot,0);
 assert.ok(r.elements.choices.children.length<=2,'dialogue is not a command menu');
 const controls=r.elements.characterActions.children.map(x=>x.textContent);
 assert.ok(controls.includes('☏ Talk'));
 assert.ok(controls.includes('⚔ Duel'));
 assert.equal(controls.some(x=>x.includes('Deck')),false,'partner collaboration stays locked');
 finishGreeting(r);
 assert.ok(r.elements.choices.children.length<=2,'optional conversation prompts are small');
});
test('talking repeatedly on the same day cannot farm affection, trust or time',()=>{
 const r=launch({day:5,slot:0,location:'shop'});
 const hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 hana.onclick();finishGreeting(r);
 const before=r.state();
 r.elements.characterActions.children.find(x=>x.textContent.includes('Talk')).onclick();
 finishGreeting(r);
 const after=r.state();
 assert.deepEqual(after.relationships.hana,before.relationships.hana);
 assert.deepEqual(after.bonds.hana,before.bonds.hana);
 assert.equal(after.day,before.day);assert.equal(after.slot,before.slot);
 assert.equal(after.hungOut['5:hana'],undefined);
});
test('a trusted character exposes deck collaboration outside the dialogue box',()=>{
 const day=Array.from({length:18},(_,i)=>24+i).find(d=>
  [0,1,2].some(slot=>Schedules.locationFor('hana',d,slot)!=='home'));
 assert.ok(day,'Hana has a public visit during this chapter');
 const slot=[0,1,2].find(n=>Schedules.locationFor('hana',day,n)!=='home');
 const place=Schedules.locationFor('hana',day,slot);
 const r=launch({day,slot,location:place,storyDone:{hana_route_1:{day:5,choice:0},hana_route_2:{day:24,choice:0}},deckJourney:Collection.fresh()});
 r.elements.starterChoices.children[0].onclick();
 const people=r.elements.people.children.filter(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(people.length,'partner deck editing is accessible when the NPC is present');
 people[0].onclick();
 const deck=r.elements.characterActions.children.find(x=>x.textContent.includes('Deck'));
 assert.ok(deck,'the third button becomes available once the relationship unlocks it');
 assert.equal(r.elements.choices.children.some(x=>x.textContent.includes('Edit')),false);
 deck.onclick();
 assert.match(r.loc.href,/rpg_deck_studio\.html\?partner=hana/);
});

test('occasional natural dialogue invitation opens the existing social system without a command list',()=>{
 const match=Array.from({length:35},(_,i)=>i+1).flatMap(day=>
  [0,1,2].map(slot=>({day,slot,place:Schedules.locationFor('hana',day,slot)})))
  .find(({day,slot,place})=>place&&place!=='home'&&
   Conversations.choices({day,slot,hungOut:{},appointments:[]},'hana').some(([,action])=>action==='socialPlan:hana'));
 assert.ok(match,'Hana offers an optional invitation somewhere in the opening weeks');
 const r=launch({...match,location:match.place}),hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(hana);r.select('hana',{skipInvitation:true});finishGreeting(r);
 const before=r.state();
 assert.equal(before.relationships.hana.affection,0);
 const invite=r.elements.choices.children.find(x=>x.textContent.includes('something together'));
 assert.ok(invite,'contextual invitation appears during a real VN conversation');
 invite.onclick();
 assert.ok(r.elements.choices.children.some(x=>x.textContent.includes('Welcome a new player')||x.textContent.includes('activity')));
 assert.equal(r.state().relationships.hana.affection,0,'planning an activity is not a bond reward');
});


test('mandatory earned bond beat persists its exact dialogue position and supports a neutral no',()=>{
 const seen=Object.fromEntries(Season.events.filter(e=>e.earliestDay<=35).map(e=>[e.id,{day:e.earliestDay,slot:0,choice:0}]));
 const base={day:35,slot:0,location:'home',deckJourney:null,scene:{speaker:'Narrator',line:'',choices:[]},
  storyDone:{rina_route_2:{day:27,choice:1}},
  relationships:{rina:{affection:3,trust:3,respect:2,attraction:0,duels:0}},
  mandatoryEventState:{seen,pending:[],active:null,lastPlayedStamp:null}};
 let r=launch(base,false,true);
 assert.equal(r.state().mandatoryEventState.active?.id,'rina_initiates_practice');
 assert.equal(r.elements.quickNext.disabled,true,'the action bar is locked during mandatory scenes');
 assert.match(r.elements.speaker.textContent,/Rina/);
 assert.match(r.elements.speaker.textContent,/message/,'remote scene must not teleport the NPC');
 const start={day:r.state().day,slot:r.state().slot};
 r.act('mandatoryNext');
 const line=r.state().mandatoryEventState.active.index;
 r=launch(r.state(),false,true);
 assert.equal(r.state().mandatoryEventState.active.index,line,'saved line resumed');
 for(let i=0;i<20&&r.state().mandatoryEventState.active?.phase==='lines';i++)r.act('mandatoryNext');
 assert.equal(r.state().mandatoryEventState.active.phase,'choice');
 const decline=Registry.mandatoryEvents.find(e=>e.id==='rina_initiates_practice').choices[1].label;
 assert.ok(r.elements.choices.children.some(x=>x.textContent.includes(decline)),'the neutral decline must remain available');
 r.act('mandatoryChoice:1');
 r=launch(r.state(),false,true);
 assert.equal(r.state().mandatoryEventState.active.phase,'response');
 r.act('mandatoryFinish');
 assert.equal(r.state().mandatoryEventState.active,null);
 assert.equal(r.state().mandatoryEventState.seen.rina_initiates_practice.choice,1);
 assert.equal(r.state().flags.rina_practice_no,true);
 assert.equal(r.state().partner,null);
 assert.equal(r.state().storyDone.rina_route_2.day,27);
 assert.equal(r.state().day,start.day);
 assert.equal(r.state().slot,start.slot);
 r=launch({...r.state(),scene:{speaker:'Narrator',line:'',choices:[]}},false,true);
 assert.equal(r.state().mandatoryEventState.active,null,'no duplicate on reload');
 assert.equal(r.state().mandatoryEventState.seen.rina_initiates_practice.choice,1);
});

test('season closure blocks epilogue, uses actual tournament history and enables replay afterward',()=>{
 const seen=Object.fromEntries(Season.events.filter(e=>!e.closure).map(e=>[e.id,{day:e.earliestDay,slot:0,choice:0}]));
 const initial={day:91,slot:0,ended:true,location:'home',deckJourney:null,
  scene:{speaker:'Narrator',line:'',choices:[]},results:[],mandatoryEventState:{seen,pending:[],active:null,lastPlayedStamp:null}};
 const r=launch(initial,false,true);
 assert.equal(r.state().mandatoryEventState.active?.id,'neo_season_closure');
 assert.equal(r.elements.endSeason.hidden,true,'season report is held until closure');
 r.act('mandatoryNext');
 assert.match(r.elements.line.textContent,/0 duels, 0 victories/);
 assert.match(r.elements.line.textContent,/not yours this season/);
 for(let i=0;i<20&&r.state().mandatoryEventState.active?.phase==='lines';i++)r.act('mandatoryNext');
 assert.equal(r.state().mandatoryEventState.active.phase,'choice');
 r.act('mandatoryChoice:1');
 r.act('mandatoryFinish');
 assert.equal(r.state().mandatoryEventState.seen.neo_season_closure.choice,1);
 assert.equal(r.elements.endSeason.hidden,false);
 assert.equal(r.state().day,91);
});

test('Saturday locals are playable through the existing duel flow, paying each bonus once',()=>{
 const firstState={day:6,slot:0,location:'shop',deckJourney:Collection.fresh()};
 Collection.choose(firstState,'ember_garden');
 const r=launch(firstState);
 const local=r.elements.competitiveEvents.children.find(x=>x.className==='activity'&&x.textContent===''&&x.children?.[0]?.textContent.includes('Saturday Local'));
 assert.ok(local,'Saturday Local appears in the RPG circuit');
 local.onclick();
 let d=r.state().pendingDuel;
 assert.equal(d.competitiveKind,'local');
 assert.equal(d.competitiveRound,0);
 r.elements.preDuelSkip.onclick();
 const event={data:Bridge.message(d.id,0),origin:r.loc.origin,source:r.elements.battle.contentWindow};
 r.listeners.message(event);
 let saved=r.state();
 assert.equal(saved.competitive.locals['1'].round,1);
 assert.equal(saved.points,8);
 assert.equal(saved.credits,105);
 r.listeners.message(event);
 assert.equal(r.state().points,8,'duplicate duel receipt cannot award points again');
 const second=r.elements.competitiveEvents.children.find(x=>x.children?.[0]?.textContent.includes('Round 2/2'));
 assert.ok(second,'second round appears after a win');
 second.onclick();
 d=r.state().pendingDuel;
 r.elements.preDuelSkip.onclick();
 r.listeners.message({data:Bridge.message(d.id,0),origin:r.loc.origin,source:r.elements.battle.contentWindow});
 saved=r.state();
 assert.equal(saved.competitive.locals['1'].status,'champion');
 assert.equal(Object.values(saved.deckJourney.vouchers).reduce((sum,n)=>sum+n,0),1,
  'local champion earns one booster voucher from a currently unlocked expansion');
 assert.equal(saved.points,28);
 assert.equal(saved.credits,150);
 assert.equal(r.elements.competitiveEvents.children.some(x=>x.children?.[0]?.textContent.includes('Round 2/2')),false);
});

test('daily challenges use the standard pre-duel stage and refresh on the following day',()=>{
 const r=launch({day:4,slot:2,location:'center'});
 const challenge=r.elements.competitiveEvents.children.find(x=>x.children?.[0]?.textContent.includes('Daily Training'));
 assert.ok(challenge);
 challenge.onclick();
 const d=r.state().pendingDuel;
 assert.equal(d.competitiveId,'daily-4');
 assert.equal(d.competitiveKind,'daily');
 r.elements.preDuelSkip.onclick();
 r.listeners.message({data:Bridge.message(d.id,1),origin:r.loc.origin,source:r.elements.battle.contentWindow});
 const s=r.state();
 assert.equal(s.day,5);
 assert.equal(s.competitive.daily['4'].outcome,'Defeat');
 assert.equal(s.competitive.daily['5'],undefined);
 const again=r.elements.competitiveEvents.children.find(x=>x.children?.[0]?.textContent.includes('Daily Training'));
 assert.ok(again);
});

test('RPG reacts to a recent personal loss without time or affection rewards and remembers the exchange',()=>{
 const seed={day:5,slot:1,location:'center',met_reina:true,metReina:true,
  results:[{id:'earlier-reina',npc:'reina',day:4,won:false,draw:false}]};
 const r=launch(seed),person=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Reina Kurogane');
 assert.ok(person,'Reina must be present at the Community Center');
 assert.ok(person.children[1].children.some(n=>n.textContent==='✦ Something to say'));
 person.onclick();
 const key=r.state().scene.reactionId;
 assert.match(key,/react:duel:reina:earlier-reina/);
 assert.equal(r.state().scene.line,Reactivity.VOICE.reina.loss[0],'recovery scene uses Reina\'s actual voiced line');
 assert.equal(r.state().day,5);assert.equal(r.state().slot,1);
 assert.equal(r.state().npcReactivity.seen[key],undefined,'opening the scene must not consume it');
 finishGreeting(r);
 assert.equal(r.state().npcReactivity.seen[key],true);
 assert.equal(r.state().relationships.reina.affection,0,'no daily affection grind');
 const saved=r.state();const again=launch(saved);
 assert.equal(Reactivity.reaction(again.state(),'reina'),null);
});
test('closing a reaction before finishing it leaves the conversation available',()=>{
 const seed={day:5,slot:1,location:'center',met_reina:true,metReina:true,
  results:[{id:'older-reina',npc:'reina',day:4,won:true,draw:false}]};
 const r=launch(seed),person=()=>r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Reina Kurogane');
 person().onclick();
 const key=r.state().scene.reactionId;
 assert.ok(key);
 r.act('dismissDialogue');
 assert.ok(!r.state().npcReactivity.seen[key],'closing before last line must not mark the memory');
 person().onclick();
 assert.equal(r.state().scene.reactionId,key);
 finishGreeting(r);
 assert.equal(r.state().npcReactivity.seen[key],true);
});
test('RPG rematches show character memory in preview and provide contextual duel followup',()=>{
 const r=launch({day:5,slot:1,location:'center',met_reina:true,metReina:true,
  results:[{id:'reina-original',npc:'reina',day:4,won:true,draw:false}]});
 const person=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Reina Kurogane');
 assert.ok(person);
 person.onclick();finishGreeting(r);r.act('dismissDialogue');
 assert.equal(r.state().selected,'reina','talking should not deselect the character');
 assert.ok(r.elements.characterActions.children.some(b=>b.textContent.includes('Duel')),'Duel button remains accessible');
 r.act('duel:reina');
 r.elements.preDuelNext.onclick();
 assert.match(r.elements.preDuelLine.textContent,/last loss|previous result|recalculated|last/i);
 r.elements.preDuelSkip.onclick();
 const pending=r.state().pendingDuel;
 r.listeners.message({data:Bridge.message(pending.id,1),origin:r.loc.origin,source:r.elements.battle.contentWindow});
 assert.equal(r.state().results.length,2);
 assert.equal(r.state().lastDuelReceipt.outcome,'Defeat');
 assert.match(r.state().scene.line,/differently from last time/i,'rematch follow-up acknowledges the earlier result');
});

test('club results accrue on day changes, not on renders, and the board displays standings without time cost',()=>{
 const r=launch({day:1,slot:2,location:'home'});
 const zero=r.state();
 assert.equal(zero.community.events.length,0,'No future NPC events at game start');
 for(let i=0;i<10;i++)r.act('sleep');
 const s=r.state();
 assert.equal(s.day,11);
 assert.ok(s.community.events.length>=2,'NPCs play and socialize while days pass');
 const before=JSON.stringify(s.community),points=s.points,credits=s.credits;
 const board=r.elements.competitiveEvents.children.find(x=>x.textContent.includes('Community Board'));
 assert.ok(board,'A dedicated club board is available from the circuit');
 board.onclick();
 assert.equal(r.elements.communityDialog.open,true);
 assert.ok(r.elements.communityStandings.children.length>0);
 assert.ok(r.elements.communityNews.children.length>0);
 assert.equal(JSON.stringify(r.state().community),before,'Opening the board must be read-only');
 assert.equal(r.state().points,points);assert.equal(r.state().credits,credits);
 assert.equal(r.state().results.length,0,'Off-screen club results are not real player duels');
});
test('NPC can discuss their independently earned club result without affection or reward farming',()=>{
 const history={lastResolvedDay:4,events:[{id:'club-match-4',kind:'match',day:4,slot:1,
  place:'center',pair:'akari:reina',a:'akari',b:'reina',winner:'reina',loser:'akari',rivalry:false}],
  standings:{akari:{wins:0,losses:1},reina:{wins:1,losses:0}},links:{'akari:reina':{matches:1,meetings:0}}};
 const r=launch({day:5,slot:1,location:'center',met_reina:true,metReina:true,community:history});
 const person=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Reina Kurogane');
 assert.ok(person,'Reina is present to discuss an off-screen club match');
 assert.ok(person.children[1].children.some(x=>x.textContent.includes('Something to say')));
 person.onclick();
 assert.equal(r.state().scene.reactionId,'react:community:reina:club-match-4');
 assert.match(r.state().scene.line,/Akari/i);
 const before={points:r.state().points,credits:r.state().credits,bond:r.state().relationships.reina.affection};
 finishGreeting(r);
 assert.equal(r.state().npcReactivity.seen['react:community:reina:club-match-4'],true);
 assert.equal(r.state().points,before.points);assert.equal(r.state().credits,before.credits);
 assert.equal(r.state().relationships.reina.affection,before.bond);
});

test('verified duel defeat offers a one-time voluntary reflection without rewards or time cost',()=>{
 const r=launch({day:5,slot:1,location:'center',met_reina:true,metReina:true});
 r.act('duel:reina');
 const duel=r.state().pendingDuel;assert.ok(duel);r.elements.preDuelSkip.onclick();
 const msg={data:Bridge.message(duel.id,1),origin:r.loc.origin,source:r.elements.battle.contentWindow};
 r.listeners.message(msg);
 assert.equal(r.state().results.length,1);assert.equal(r.state().consequences.events.length,1);
 assert.equal(r.state().consequences.events[0].kind,'setback');
 const reflect=r.elements.competitiveEvents.children.find(x=>x.textContent.includes('Reflect on your match'));
 assert.ok(reflect,'a free setback scene becomes available in the center');
 const before={day:r.state().day,slot:r.state().slot,points:r.state().points,credits:r.state().credits,
  relationship:JSON.stringify(r.state().relationships.reina)};
 r.act('close');reflect.onclick();
 assert.ok(r.state().scene.consequenceId,'specific past duel anchored to reflection');
 assert.equal(r.state().scene.choices.length,4,'three approaches and a free exit');
 r.act('consequenceChoice:study');
 assert.equal(Object.keys(r.state().consequences.choices).length,1);
 assert.equal(r.state().scene.dialogue.length,3);
 assert.equal(r.state().day,before.day);assert.equal(r.state().slot,before.slot);
 assert.equal(r.state().points,before.points);assert.equal(r.state().credits,before.credits);
 assert.equal(JSON.stringify(r.state().relationships.reina),before.relationship);
 finishGreeting(r);
 r.act('close');
 const continuation=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Reina Kurogane');
 assert.ok(continuation);
 continuation.onclick();
 assert.equal(r.state().scene.reactionId,'react:choice:reina:'+duel.id);
 assert.match(r.state().scene.line,/went back over our game/i);
 const second=launch(r.state());
 assert.equal(Consequences.opportunities(second.state()).length,0,'completed choice survives reload');
 second.listeners.message(msg);
 assert.equal(second.state().results.length,1,'duplicate battle message never changes history');
});
test('unfinished reflection survives reload, but cancellation never spends the event',()=>{
 const r=launch({day:5,slot:1,location:'center',met_reina:true,metReina:true});
 r.act('duel:reina');const duel=r.state().pendingDuel;r.elements.preDuelSkip.onclick();
 r.listeners.message({data:Bridge.message(duel.id,1),origin:r.loc.origin,source:r.elements.battle.contentWindow});
 r.act('close');r.act('consequence');
 const pending=r.state().scene.consequenceId;assert.ok(pending);
 const restored=launch(r.state());assert.equal(restored.state().scene.consequenceId,pending);
 restored.act('close');
 assert.equal(Object.keys(restored.state().consequences.choices).length,0);
 restored.act('consequence');restored.act('consequenceChoice:perspective');
 assert.equal(restored.state().consequences.choices[pending].path,'perspective');
});
test('ending uses actual comeback and reflection path but never invents a partner',()=>{
 const s={day:91,ended:true,results:[{id:'loss',npc:'reina',day:9,won:false,draw:false},
  {id:'win',npc:'reina',day:12,won:true,draw:false}],partner:null,relationships:{},tournaments:{}};
 const c={processed:{loss:true,win:true},events:[{id:'turn:loss',npc:'reina',day:9,duelId:'loss',kind:'setback'},
  {id:'turn:win',npc:'reina',day:12,duelId:'win',kind:'comeback'}],
  choices:{'turn:win':{eventId:'turn:win',kind:'comeback',path:'challenge',day:12}}};
 s.consequences=c;
 const report=Epilogue.report(s);
 assert.equal(report.partner,null);assert.equal(report.turningPoints.comebacks,1);
 assert.equal(report.turningPoints.reflections,1);
 assert.ok(report.seasonLessons.some(line=>line.includes('earlier defeat')));
});

test('RPG assigns NPC deck recipes by campaign act and preserves their tier in pending duels',()=>{
 for(const [day,tier] of [[5,1],[31,2],[61,3]]){
  const r=launch({day,slot:0,location:'shop',deckJourney:Collection.fresh()});
  r.elements.starterChoices.children[0].onclick();
  const hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
  assert.ok(hana,'Hana is at the shop on day '+day);
  hana.onclick();finishGreeting(r);
  const challenge=r.elements.characterActions.children.find(x=>x.textContent.includes('Duel'));
  assert.ok(challenge,'challenge available on day '+day);
  challenge.onclick();
  const pending=r.state().pendingDuel;
  assert.ok(pending,'duel saved on day '+day);
  assert.equal(pending.npcDeckTier,tier);
  assert.equal(pending.opponent,'power_reserve');
  const restored=launch(r.state());
  assert.equal(restored.state().pendingDuel.npcDeckTier,tier,'reload cannot advance an already committed duel');
  assert.equal(restored.state().pendingDuel.opponent,'power_reserve');
 }
});

test('RPG challenge snapshots NPC story-upgraded tier without changing other characters or pending duels',()=>{
 const seed={day:20,slot:0,location:'shop',storyDone:{hana_route_1:{day:5,choice:0}},deckJourney:Collection.fresh()};
 const r=launch(seed);
 r.elements.starterChoices.children[0].onclick();
 const hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(hana,'Hana should still be at the card shop');
 hana.onclick();finishGreeting(r);
 r.elements.characterActions.children.find(x=>x.textContent.includes('Duel')).onclick();
 const pending=r.state().pendingDuel;
 assert.equal(pending.npcDeckTier,2,'Hana chapter one should upgrade her deck before Day 31');
 assert.equal(NpcDecks.tierForOpponent(r.state(),'reina'),1,'Hana milestone must not upgrade Reina');
 assert.match(r.elements.preDuelDeck.textContent,/REFINED DECK/);
 const saved=JSON.parse(JSON.stringify(r.state()));
 saved.day=50; // A queued duel retains its original opponent recipe on save/load.
 assert.equal(saved.pendingDuel.npcDeckTier,2);
});

test('tutorials appear for exactly the first two visits per mechanic and survive reloads',()=>{
 const r=launch({day:1,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();finishGreeting(r);
 r.act('socialPlan:hana');
 assert.equal(r.state().gameplayTutorials.seen.social,1);
 assert.match(r.elements.tutorialTitle.textContent,/Meet the locals/);
 r.elements.tutorialDismiss.onclick();
 assert.match(r.elements.tutorialTitle.textContent,/Spend time together/);
 assert.equal(r.elements.gameplayTutorial.hidden,false);
 r.act('socialPlan:hana');
 assert.equal(r.state().gameplayTutorials.seen.social,2);
 r.act('socialPlan:hana');
 assert.equal(r.state().gameplayTutorials.seen.social,2);
 const reloaded=launch(r.state());
 assert.equal(reloaded.state().gameplayTutorials.seen.social,2);
 reloaded.act('socialPlan:hana');
 assert.equal(reloaded.state().gameplayTutorials.seen.social,2);
});

test('Status opt-out hides pending tips, persists, and New Game+ resets it',()=>{
 const r=launch({day:1,slot:0,location:'shop'});
 r.act('intention:town');
 assert.equal(r.state().gameplayTutorials.seen.priorities,1);
 r.elements.statusBtn.onclick();
 const toggle=r.elements.statusTutorialToggle;
 assert.equal(toggle.checked,false);
 toggle.checked=true;toggle.onchange();
 assert.equal(r.state().gameplayTutorials.disabled,true);
 assert.equal(r.elements.gameplayTutorial.hidden,true);
 r.act('intention:town');
 assert.equal(r.state().gameplayTutorials.seen.priorities,1);
 const restored=launch(r.state());
 assert.equal(restored.state().gameplayTutorials.disabled,true);
 restored.elements.statusBtn.onclick();
 assert.equal(restored.elements.statusTutorialToggle.checked,true);
 const newGame=launch({...restored.state(),day:91,ended:true,location:'home'},true);
 newGame.act('replay');
 assert.equal(newGame.state().ngPlus,1);
 assert.equal(newGame.state().gameplayTutorials.disabled,false);
 assert.deepEqual(newGame.state().gameplayTutorials.seen,{});
});

test('player can always invite a present character to a shared activity or future outing',()=>{
 const r=launch({day:1,slot:0,location:'shop'});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 const actions=r.elements.characterActions.children.map(x=>x.textContent);
 assert.ok(actions.some(x=>x.includes('Spend time')));
 assert.ok(actions.some(x=>x.includes('Make plans')));
 const before=r.state();
 r.elements.characterActions.children.find(x=>x.textContent.includes('Spend time')).onclick();
 assert.equal(r.state().slot,before.slot,'invitation itself is free');
 assert.ok(r.elements.choices.children.some(x=>x.textContent.includes('Welcome a new player')));
});

test('the player must confirm before skipping a known appointment',()=>{
 const plan={id:1,npc:'hana',day:1,slot:0,place:'shop',status:'booked',bookedDay:1};
 const initial={day:1,slot:0,location:'home',appointments:[plan],appointmentSeq:1};
 const decline=launch(initial,false);
 decline.act('rest');
 assert.equal(decline.state().slot,0);
 assert.equal(decline.state().appointments[0].status,'booked');
 const accept=launch(initial,true);
 accept.act('rest');
 assert.equal(accept.state().slot,1);
 assert.equal(accept.state().appointments[0].status,'missed');
});

test('an NPC greets the player about a booked meeting, without auto-attending or costing time',()=>{
 const plan={id:8,npc:'hana',day:1,slot:0,place:'shop',status:'booked',bookedDay:1};
 const r=launch({day:1,slot:0,location:'shop',appointments:[plan],appointmentSeq:8});
 const button=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(button);
 assert.ok(button.children[1].children.some(x=>x.textContent.includes('Waiting for you')));
 button.onclick();
 assert.equal(r.state().scene.invitation.kind,'appointment');
 assert.equal(r.state().scene.invitation.id,'8');
 assert.equal(r.state().appointments[0].status,'booked');
 assert.equal(r.state().slot,0);
 finishGreeting(r);
 assert.ok(r.elements.choices.children.some(x=>x.textContent==='I am in.'));
 const accept=r.elements.choices.children.find(x=>x.textContent==='I am in.');
 accept.onclick();
 assert.equal(r.state().appointments[0].status,'attended');
 assert.equal(r.state().slot,1);
});
test('a timely character route invitation lets the player begin the original scripted story',()=>{
 const r=launch({day:5,slot:0,location:'shop',met_hana:true});
 const button=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 assert.ok(button);
 button.onclick();
 assert.equal(r.state().scene.invitation?.kind,'story');
 assert.equal(r.state().scene.invitation?.id,'hana_route_1');
 finishGreeting(r);
 r.elements.choices.children.find(x=>x.textContent==='I am in.').onclick();
 assert.equal(r.state().activeStory?.id,'hana_route_1');
 assert.equal(r.state().activeStory?.phase,'lines');
 assert.equal(r.state().slot,0);
});
test('invitation decline and ordinary conversation do not consume time or complete events',()=>{
 const plan={id:3,npc:'hana',day:1,slot:0,place:'shop',status:'booked',bookedDay:1};
 const r=launch({day:1,slot:0,location:'shop',appointments:[plan],appointmentSeq:3});
 const btn=()=>r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
 btn().onclick();finishGreeting(r);
 r.elements.choices.children.find(x=>x.textContent.includes('just talk')).onclick();
 assert.equal(r.state().scene.invitation,null);
 assert.equal(r.state().slot,0);
 assert.equal(r.state().appointments[0].status,'booked');
 btn().onclick();finishGreeting(r);
 r.elements.choices.children.find(x=>x.textContent==='Maybe later.').onclick();
 assert.equal(r.state().appointments[0].status,'booked');
 assert.equal(r.state().slot,0);
});
test('an event invitation survives reload with the same choices, without inventing an event',()=>{
 const plan={id:4,npc:'hana',day:1,slot:0,place:'shop',status:'booked',bookedDay:1};
 const r=launch({day:1,slot:0,location:'shop',appointments:[plan],appointmentSeq:4});
 r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno').onclick();
 const reloaded=launch(r.state());
 assert.equal(reloaded.state().scene.invitation?.id,'4');
 finishGreeting(reloaded);
 assert.ok(reloaded.elements.choices.children.some(x=>x.textContent==='I am in.'));
 assert.equal(reloaded.state().appointments[0].status,'booked');
});

test('the daily guide approaches a present story NPC without triggering or advancing the story',()=>{
 const r=launch({day:5,slot:0,location:'home',met_hana:true});
 const card=r.elements.dailyPlanner.children.find(x=>x.children?.[1]?.textContent?.includes('Personal story with Hana'));
 assert.ok(card,'the guide should surface a current story opportunity');
 const go=card.children.find(x=>x.className==='planner-action');
 assert.ok(go);go.onclick();
 const result=r.state();
 assert.equal(result.location,'shop');
 assert.equal(result.day,5);assert.equal(result.slot,0);
 assert.equal(result.activeStory,null,'no hidden story progression on navigation');
 if(result.scene.invitation?.id!=='hana_route_1'){
  // Planner may highlight the NPC's action rather than immediately starting a greeting.
  const hana=r.elements.people.children.find(x=>x.children?.[1]?.children?.[0]?.textContent==='Hana Mizuno');
  assert.ok(hana,'the story NPC must be reachable after free planner travel');
  hana.onclick();
 }
 assert.equal(r.state().scene.invitation?.id,'hana_route_1');
 finishGreeting(r);
 r.elements.choices.children.find(x=>x.textContent==='I am in.').onclick();
 assert.equal(r.state().activeStory?.id,'hana_route_1');
});


test('a legacy hangout cannot silently miss a booked appointment',()=>{
 const plan={id:21,npc:'hana',day:1,slot:0,place:'shop',status:'booked',bookedDay:1};
 const initial={day:1,slot:0,location:'shop',appointments:[plan],appointmentSeq:21};
 const declined=launch(initial,false);
 declined.act('hang:hana');
 assert.equal(declined.state().day,1);
 assert.equal(declined.state().slot,0);
 assert.equal(declined.state().appointments[0].status,'booked');
 assert.ok(!declined.state().hungOut?.['1:hana'],'declining must not grant a hangout or affection');
 const accepted=launch(initial,true);
 accepted.act('hang:hana');
 assert.equal(accepted.state().slot,1);
 assert.equal(accepted.state().appointments[0].status,'missed');
 assert.equal(accepted.state().hungOut['1:hana'],true);
});

test('an authored chapter cannot start over a booked meeting without consent',()=>{
 const plan={id:22,npc:'hana',day:5,slot:0,place:'shop',status:'booked',bookedDay:5};
 const initial={day:5,slot:0,location:'shop',met_hana:true,appointments:[plan],appointmentSeq:22};
 const declined=launch(initial,false);
 const chapter=declined.elements.storyEvents.children.find(x=>x.dataset.plannerKey==='hana_route_1');
 assert.ok(chapter,'authored chapter must be visible to exercise the guard');
 chapter.onclick();
 assert.equal(declined.state().activeStory,null);
 assert.equal(declined.state().appointments[0].status,'booked');
 const accepted=launch(initial,true);
 accepted.elements.storyEvents.children.find(x=>x.dataset.plannerKey==='hana_route_1').onclick();
 assert.equal(accepted.state().activeStory?.id,'hana_route_1');
 assert.equal(accepted.state().slot,0,'starting dialogue does not prematurely spend the period');
});

test('casual Talk records a chosen memory, survives interruption, and acknowledges its later callback once',()=>{
 const opportunity=Array.from({length:83},(_,i)=>i+4).flatMap(day=>
  [0,1,2].map(slot=>({day,slot,place:Schedules.locationFor('hana',day,slot)})))
  .find(x=>x.place&&x.place!=='home'&&DialogueMemory.offer({day:x.day},'hana')?.kind==='intro'&&
   Conversations.choices({day:x.day,slot:x.slot,hungOut:{},appointments:[]},'hana').length===0);
 assert.ok(opportunity,'a continuity invitation should be reachable during ordinary play');
 const r=launch({...opportunity,location:opportunity.place,met_hana:true},false);
 r.select('hana',{skipInvitation:true});
 const intro=r.state().scene;
 assert.equal(intro.memoryOfferId,'memory:hana:basilisk:intro');
 const before={day:r.state().day,slot:r.state().slot,credits:r.state().credits,
  affection:r.state().relationships.hana.affection};
 r.act('memoryChoice:hana:a'); // clicking before hearing the prompt must not save a reply
 assert.equal(r.state().dialogueMemory.entries['hana:basilisk'],undefined);
 finishGreeting(r);
 assert.equal(r.state().scene.afterChoices.length,2);
 r.act('memoryChoice:hana:a');
 assert.equal(r.state().dialogueMemory.entries['hana:basilisk'].choice,'a');
 assert.equal(r.state().dialogueMemory.entries['hana:basilisk'].day,opportunity.day);
 assert.equal(r.state().credits,before.credits);
 assert.equal(r.state().relationships.hana.affection,before.affection);
 assert.equal(r.state().day,before.day);assert.equal(r.state().slot,before.slot);
 const next=Array.from({length:Math.max(0,90-before.day-1)},(_,i)=>i+before.day+2).flatMap(day=>
  [0,1,2].map(slot=>({day,slot,place:Schedules.locationFor('hana',day,slot)})))
  .find(x=>x.place&&x.place!=='home'&&Conversations.choices({day:x.day,slot:x.slot,hungOut:{},appointments:[]},'hana').length===0);
 assert.ok(next,'an in-season return visit must exist');
 const resumed=launch({...r.state(),...next,location:next.place,scene:{speaker:'Narrator',line:'',choices:[]}},false);
 resumed.select('hana',{skipInvitation:true});
 const callback=resumed.state().scene;
 assert.equal(callback.memoryId,'memory:hana:basilisk:followup');
 assert.match(callback.line,/Basilisk/i);
 assert.equal(resumed.state().dialogueMemory.entries['hana:basilisk'].seen,false);
 const interrupted=launch(resumed.state(),false);
 assert.equal(interrupted.state().scene.memoryId,callback.memoryId,'mid-dialogue save resumes the callback');
 assert.equal(interrupted.state().dialogueMemory.entries['hana:basilisk'].seen,false);
 finishGreeting(interrupted);
 assert.equal(interrupted.state().dialogueMemory.entries['hana:basilisk'].seen,true);
 const loaded=launch(interrupted.state(),false);
 assert.equal(DialogueMemory.offer(loaded.state(),'hana'),null,'a heard callback is not repeated');
});
