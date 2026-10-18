'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Pack=require('../rpg_narrative_pack'),Side=require('../rpg_side_quests'),Story=require('../rpg_story'),Schedules=require('../rpg_schedules'),World=require('../rpg_world'),Arc=require('../rpg_rival_arc'),Tournaments=require('../rpg_tournaments'),Epilogue=require('../rpg_epilogue'),Bridge=require('../rpg_duel_bridge');
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
 const win={NeoRpgNarrativePack:Pack,NeoRpgSideQuests:Side,NeoHarborStory:Story,NeoRpgSchedules:Schedules,NeoRpgWorld:World,NeoRpgRivalArc:Arc,NeoRpgTournaments:Tournaments,NeoRpgEpilogue:Epilogue,NeoRpgDuelBridge:Bridge,
  addEventListener(name,cb){listeners[name]=cb;}};
 const local={getItem(k){return saved[k]||null;},setItem(k,v){saved[k]=String(v);}};
 const session={removeItem(){}};
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
 assert.ok(challenge);challenge.onclick();
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
