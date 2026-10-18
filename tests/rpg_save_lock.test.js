'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const PACK=require('../rpg_narrative_pack'),SIDE=require('../rpg_side_quests'),STORY=require('../rpg_story'),SCHEDULES=require('../rpg_schedules'),WORLD=require('../rpg_world'),ARC=require('../rpg_rival_arc'),TOURNAMENTS=require('../rpg_tournaments'),EPILOGUE=require('../rpg_epilogue'),APPOINTMENTS=require('../rpg_appointments'),INTENTIONS=require('../rpg_intentions'),CG=require('../rpg_cg_gallery'),BRIDGE=require('../rpg_duel_bridge');
const script=fs.readFileSync('rpg.js','utf8');
const KEY='neoHarborRpgV1';
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.className='';this.classList={add(){},remove(){},toggle(){}};this.textContent='';this.hidden=false;this.style={};this.attrs={};this.value='';this.src='';if(this.tagName==='SELECT')this.options=[];}
 append(...nodes){this.children.push(...nodes);if(this.options)this.options=this.children;}
 replaceChildren(...nodes){this.children=[...nodes];if(this.options)this.options=this.children;}
 addEventListener(type,fn){(this.events??={})[type]=fn;}
 setAttribute(k,v){this.attrs[k]=v;}
 showModal(){this.open=true;}close(){this.open=false;}
}
function boot(saved=new Map(),sessions=new Map()){
 const ids={},listeners={},document={body:new Element('body'),getElementById(id){return ids[id]??(ids[id]=new Element(id==='deckPicker'?'select':id==='battle'?'iframe':'div'));},createElement(tag){return new Element(tag);},addEventListener(type,fn){listeners[type]=fn;}};
 ids.battle=new Element('iframe');ids.battle.contentWindow={};
 const window={NeoRpgNarrativePack:PACK,NeoRpgSideQuests:SIDE,NeoHarborStory:STORY,NeoRpgSchedules:SCHEDULES,NeoRpgWorld:WORLD,NeoRpgRivalArc:ARC,NeoRpgTournaments:TOURNAMENTS,NeoRpgEpilogue:EPILOGUE,NeoRpgAppointments:APPOINTMENTS,NeoRpgIntentions:INTENTIONS,NeoRpgCGGallery:CG,NeoRpgDuelBridge:BRIDGE,addEventListener(type,fn){listeners[type]=fn;}};
 const localStorage={getItem:k=>saved.has(k)?saved.get(k):null,setItem:(k,v)=>saved.set(k,v)};
 const sessionStorage={getItem:k=>sessions.get(k)||null,setItem:(k,v)=>sessions.set(k,v),removeItem:k=>sessions.delete(k)};
 const fetch=async()=>({ok:true,json:async()=>({decks:[{id:'blackout',name:'Blackout'},{id:'brushfire',name:'Brushfire'}]})});
 const location={search:'',origin:'http://localhost:8000',reload(){}};
 vm.runInNewContext(script,{window,document,localStorage,sessionStorage,fetch,location,confirm:()=>true,console,URLSearchParams},{filename:'rpg.js'});
 return {ids,listeners,saved,sessions,location,read:()=>JSON.parse(saved.get(KEY)),send:payload=>listeners.message({origin:location.origin,source:ids.battle.contentWindow,data:payload})};
}
function label(x){return [x.textContent,...x.children.map(label)].filter(Boolean).join(' ');}
function click(root,part){const b=root.children.find(x=>label(x).includes(part));assert.ok(b,'Missing control: '+part+' in '+root.children.map(label).join(' | '));assert.notEqual(b.disabled,true,'Control disabled: '+part);b.onclick();}
// Integration-owned regression: world navigation persists, and deck selection cannot change a running match.
test('town radar travel survives refresh, including after an NPC meeting',()=>{
 const saved=new Map();let app=boot(saved);
 assert.equal(app.read().location,'home');
 assert.ok(app.ids.townRadar.children.some(x=>label(x).includes('Marina Aoki')),'Marina is active on day one in the morning');
 click(app.ids.townRadar,'Marina Aoki');
 assert.equal(app.read().location,'park','Radar destination is saved');
 app=boot(saved);
 assert.equal(app.read().location,'park','Radar route must remain after reload');
 assert.equal(app.ids.placeTitle.textContent,'Riverside Park');
 assert.ok(app.ids.people.children.some(x=>label(x).includes('Marina Aoki')));
});

test('a pending duel locks navigation and the deck, restores after refresh, and unlocks after the reward',async()=>{
 const saved=new Map(),sessions=new Map();let app=boot(saved,sessions);
 click(app.ids.townRadar,'Marina Aoki');
 click(app.ids.people,'Marina Aoki');
 click(app.ids.choices,'Challenge to a duel');
 const pending=app.read().pendingDuel;
 assert.ok(pending?.id);
 assert.equal(app.ids.deckPicker.disabled,true,'Deck must lock as soon as the iframe launches');
 assert.equal(app.ids.quickNext.disabled,true);
 assert.equal(app.ids.quickHome.disabled,true);
 await new Promise(resolve=>setImmediate(resolve)); // Let asynchronous deck listing finish.
 app.ids.deckPicker.value='brushfire';
 app.ids.deckPicker.onchange();
 assert.equal(app.read().playerDeck,'blackout','Programmatic change cannot replace a running deck');
 assert.equal(app.ids.deckPicker.value,'blackout','Selector reverts to authoritative campaign deck');
 sessions.set(BRIDGE.sessionKey(pending.id),'session-token');
 app=boot(saved,sessions);
 assert.equal(app.ids.deckPicker.disabled,true,'Restored duel keeps selectors locked');
 assert.match(app.ids.battle.src,/duelId=/);
 app.send(BRIDGE.message(pending.id,0));
 assert.equal(app.read().results.length,1);
 assert.equal(app.read().pendingDuel,null);
 assert.equal(app.ids.deckPicker.disabled,false,'Deck unlocks after returning from battle');
 assert.equal(sessions.has(BRIDGE.sessionKey(pending.id)),false,'Finished token is released');
 assert.equal(app.read().slot,1);
 assert.equal(app.read().relationships.marina.duels,1);
 app=boot(saved,sessions);
 assert.equal(app.read().results.length,1);
 assert.equal(app.read().location,'park');
});
