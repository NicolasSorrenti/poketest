'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Story=require('../rpg_story'),Schedules=require('../rpg_schedules'),World=require('../rpg_world'),Bridge=require('../rpg_duel_bridge');
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
 const win={NeoHarborStory:Story,NeoRpgSchedules:Schedules,NeoRpgWorld:World,NeoRpgDuelBridge:Bridge,
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
