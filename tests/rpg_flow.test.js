'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const PACK=require('../rpg_narrative_pack'),SIDE=require('../rpg_side_quests'),STORY=require('../rpg_story'),SCHEDULES=require('../rpg_schedules'),WORLD=require('../rpg_world'),ARC=require('../rpg_rival_arc'),TOURNAMENTS=require('../rpg_tournaments'),EPILOGUE=require('../rpg_epilogue'),APPOINTMENTS=require('../rpg_appointments'),INTENTIONS=require('../rpg_intentions'),CG=require('../rpg_cg_gallery'),PLANNER=require('../rpg_daily_planner'),SOCIAL=require('../rpg_social_activities'),DATES=require('../rpg_planned_dates'),PRE=require('../rpg_preduel'),COLLECTION=require('../rpg_collection'),JOURNEY=require('../rpg_season_journey'),SITUATIONS=require('../rpg_situations'),BRIDGE=require('../rpg_duel_bridge');
const DIALOGUE=require('../rpg_dialogue'),BONDS=require('../rpg_bond_rewards'),PARTNER=require('../rpg_partner_decks'),VN=require('../rpg_conversations');
const COMPETE=require('../rpg_competitive_loop'),REACT=require('../rpg_reactivity'),COMMUNITY=require('../rpg_community'),CONSEQ=require('../rpg_consequences'),TOURNAMENT_PRESENTATION=require('../rpg_tournament_presentation');
const Time=require('../rpg_time_coordinator'),Relationships=require('../rpg_relationships');
const script=fs.readFileSync('rpg.js','utf8');
const KEY='neoHarborRpgV1';
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.className='';this.dataset={};this.classList={add(){},remove(){},toggle(){}};this.textContent='';this.hidden=false;this.style={setProperty(name,value){this[name]=String(value);}};this.attrs={};this.value='';this.src='';if(this.tagName==='SELECT')this.options=[];}
 prepend(...nodes){this.children.unshift(...nodes);}
 append(...nodes){this.children.push(...nodes);if(this.options)this.options=this.children;}
 replaceChildren(...nodes){this.children=[...nodes];if(this.options)this.options=this.children;}
 querySelector(selector){if(selector.startsWith('.'))return this.children.find(child=>child.className===selector.slice(1))||null;return null;}
 querySelectorAll(){return [];}
 addEventListener(type,fn){(this.events??={})[type]=fn;}
 setAttribute(k,v){this.attrs[k]=v;}
 showModal(){this.open=true;}close(){this.open=false;}
}
function boot(saved=new Map(),sessions=new Map()){
 const ids={},listeners={},document={body:new Element('body'),getElementById(id){return ids[id]??(ids[id]=new Element(id==='deckPicker'?'select':id==='battle'?'iframe':'div'));},createElement(tag){return new Element(tag);},createTextNode(value){return {nodeType:3,textContent:String(value),nodeValue:String(value),children:[]};},createTreeWalker(){return {nextNode(){return false;}};},addEventListener(type,fn){listeners[type]=fn;}};
 ids.battle=new Element('iframe');ids.battle.contentWindow={};
 const window={NeoRpgNarrativePack:PACK,NeoRpgSideQuests:SIDE,NeoHarborStory:STORY,NeoRpgSchedules:SCHEDULES,NeoRpgWorld:WORLD,NeoRpgRivalArc:ARC,NeoRpgTournaments:TOURNAMENTS,NeoRpgCompetitiveLoop:COMPETE,NeoRpgReactivity:REACT,NeoRpgCommunity:COMMUNITY,NeoRpgConsequences:CONSEQ,NeoRpgTournamentPresentation:TOURNAMENT_PRESENTATION,NeoRpgEpilogue:EPILOGUE,NeoRpgAppointments:APPOINTMENTS,NeoRpgIntentions:INTENTIONS,NeoRpgCGGallery:CG,NeoRpgDailyPlanner:PLANNER,NeoRpgSocialActivities:SOCIAL,NeoRpgPlannedDates:DATES,NeoRpgPreDuel:PRE,NeoRpgCollection:COLLECTION,NeoRpgSeasonJourney:JOURNEY,NeoRpgSituations:SITUATIONS,NeoRpgDuelBridge:BRIDGE,NeoRpgTimeCoordinator:Time,NeoRpgRelationships:Relationships,NeoRpgDialogue:DIALOGUE,NeoRpgBondRewards:BONDS,NeoRpgPartnerDecks:PARTNER,NeoRpgConversations:VN,
  NeoRpgRenderPerf:{reconcileKeyed(parent,entries,create,refresh){
   parent.replaceChildren(...entries.map((entry,index)=>{const node=create(entry);refresh(node,entry,index);return node;}));
  }},addEventListener(type,fn){listeners[type]=fn;},dispatchEvent(event){listeners[event.type]?.(event);return true;}};
 const fresh=!saved.has(KEY);
 const localStorage={getItem:k=>saved.has(k)?saved.get(k):null,setItem:(k,v)=>saved.set(k,v)};
 const sessionStorage={getItem:k=>sessions.get(k)||null,setItem:(k,v)=>sessions.set(k,v),removeItem:k=>sessions.delete(k)};
 const fetch=async()=>({ok:true,json:async()=>({decks:[{id:'blackout',name:'Blackout'},{id:'brushfire',name:'Brushfire'}]})});
 const location={search:'',origin:'http://localhost:8000',reload(){}};
 vm.runInNewContext(script,{window,document,localStorage,sessionStorage,fetch,location,confirm:()=>true,console,queueMicrotask,URLSearchParams,Event:class{constructor(type){this.type=type;}},Image:Element,NodeFilter:{SHOW_TEXT:4}},{filename:'rpg.js'});
 if(fresh)ids.starterChoices.children[0].onclick();
 return {ids,listeners,saved,sessions,location,read:()=>JSON.parse(saved.get(KEY)),send:payload=>listeners.message({origin:location.origin,source:ids.battle.contentWindow,data:payload})};
}
function label(x){return [x.textContent,...x.children.map(label)].filter(Boolean).join(' ');}
function click(root,part){const b=root.children.find(x=>label(x).includes(part));assert.ok(b,'Missing control: '+part+' in '+root.children.map(label).join(' | '));assert.notEqual(b.disabled,true,'Control disabled: '+part);b.onclick();}
test('new game, free travel, NPC challenge, duel result, reload and second duel',()=>{
 const store=new Map(),sessions=new Map();let app=boot(store,sessions),s=app.read();
 assert.equal(s.day,1);assert.equal(s.slot,0);assert.equal(s.location,'home');
 assert.match(app.ids.whereLabel.textContent,/HOME/);
 click(app.ids.places,'Pixel Palace');s=app.read();assert.equal(s.location,'arcade');assert.equal(s.slot,0);
 app.ids.quickNext.onclick();s=app.read();assert.equal(s.slot,1);
 assert.ok(app.ids.people.children.some(x=>label(x).includes('Yuna Hoshino')));
 click(app.ids.people,'Yuna Hoshino');
 click(app.ids.characterActions,'Duel');
 assert.equal(app.read().pendingDuel.preview.phase,'ready');app.ids.preDuelSkip.onclick();
 s=app.read();const first=s.pendingDuel;assert.ok(first.id);assert.match(app.ids.battle.src,/duelId=/);
 app.send(BRIDGE.message('stale-duel',0));assert.equal(app.read().results.length,0);
 app.send(BRIDGE.message(first.id,0));s=app.read();
 assert.equal(s.pendingDuel,null);assert.equal(s.results.length,1);
 assert.equal(s.points,3);assert.equal(s.credits,95);assert.equal(s.slot,2);
 assert.match(app.ids.receiptDetails.textContent,/\+3 circuit points/);
 assert.equal(app.ids.duelReceipt.hidden,false);
 app=boot(store,sessions);s=app.read();
 assert.equal(s.slot,2);assert.equal(s.location,'arcade');assert.equal(s.results.length,1);
 assert.equal(s.lastDuelReceipt.outcome,'Victory');
 click(app.ids.people,'Yuna Hoshino');click(app.ids.characterActions,'Duel');app.ids.preDuelSkip.onclick();
 s=app.read();const second=s.pendingDuel;assert.notEqual(second.id,first.id);
 app.send(BRIDGE.message(first.id,0));assert.equal(app.read().results.length,1);
 app.send(BRIDGE.message(second.id,1));s=app.read();
 assert.equal(s.results.length,2);assert.equal(s.day,2);assert.equal(s.slot,0);
 assert.equal(s.points,4);assert.equal(s.credits,100);
 app.ids.dismissReceipt.onclick();assert.equal(app.read().lastDuelReceipt,null);
 app.ids.quickHome.onclick();assert.equal(app.read().location,'home');
 click(app.ids.activities,'Sleep until morning');assert.equal(app.read().day,3);
});
test('NPC route dialogue survives refresh and Space key progresses authored scene',()=>{
 const store=new Map();let app=boot(store);let state=app.read();
 state.day=5;state.slot=0;state.location='shop';store.set(KEY,JSON.stringify(state));
 app=boot(store);assert.ok(app.ids.storyEvents.children.some(x=>label(x).includes('Too Many Promises')));
 click(app.ids.storyEvents,'Too Many Promises');
 const advance=()=>app.listeners.keydown({key:' ',target:{tagName:'BODY'},preventDefault(){}});
 for(let step=0;step<20&&app.read().activeStory?.phase==='lines';step++)advance();
 assert.equal(app.read().activeStory.phase,'choice');
 click(app.ids.choices,'Help with the tables');
 assert.equal(app.read().activeStory.phase,'response');
 app=boot(store);assert.equal(app.read().activeStory.phase,'response');
 click(app.ids.choices,'Finish scene');
 const s=app.read();assert.ok(s.storyDone.hana_route_1);assert.equal(s.activeStory,null);
 assert.equal(s.slot,1);assert.equal(s.relationships.hana.affection,2);
});
