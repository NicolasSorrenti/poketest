'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Pack=require('../rpg_narrative_pack'),Story=require('../rpg_story'),Schedules=require('../rpg_schedules'),World=require('../rpg_world'),Arc=require('../rpg_rival_arc'),Tournaments=require('../rpg_tournaments'),Bridge=require('../rpg_duel_bridge');
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
function launch(initial){
 const elements={},listeners={},saved={neoHarborRpgV1:initial?JSON.stringify(initial):null};
 for(const id of ids)elements[id]=new FakeNode(id==='deckPicker'?'select':'div');
 elements.battle.contentWindow={};
 const doc={getElementById(id){if(!elements[id])throw Error('Missing '+id);return elements[id];},
  createElement(tag){return new FakeNode(tag);},body:new FakeNode('body'),
  addEventListener(name,cb){listeners['document:'+name]=cb;}};
 const win={NeoRpgNarrativePack:Pack,NeoHarborStory:Story,NeoRpgSchedules:Schedules,NeoRpgWorld:World,NeoRpgRivalArc:Arc,NeoRpgTournaments:Tournaments,NeoRpgDuelBridge:Bridge,
  addEventListener(name,cb){listeners[name]=cb;}};
 const local={getItem(k){return saved[k]||null;},setItem(k,v){saved[k]=String(v);}};
 const session={removeItem(){}};
 const loc={origin:'http://localhost',href:'http://localhost/rpg.html',reload(){}};
 new Function('window','document','localStorage','sessionStorage','location','fetch','confirm',js)(
  win,doc,local,session,loc,async()=>({ok:true,json:async()=>({decks:[{id:'blackout',name:'Blackout'}]})}),()=>false);
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
