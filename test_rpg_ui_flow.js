'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const story=require('./rpg_story');
const bridge=require('./rpg_duel_bridge');
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.textContent='';this.className='';this.style={};this.hidden=false;this.disabled=false;this.value='';this.dataset={};this.parentElement=null;this.handlers={};this.classList={add(){},remove(){},toggle(){}};}
 append(...children){for(const c of children){this.children.push(c);if(c instanceof Element)c.parentElement=this;}}
 appendChild(c){this.append(c);}
 replaceChildren(...children){this.children=[];this.append(...children);}
 addEventListener(type,fn){this.handlers[type]=fn;}
 setAttribute(name,val){this[name]=val;}
 get options(){return this.children.filter(x=>x.tag==='option');}
 showModal(){this.open=true;}
 close(){this.open=false;}
}
function boot(storage=new Map()){
 const elements=new Map();
 const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
 const frame=get('battle');frame.contentWindow={};
 const handlers={};
 let reloads=0;
 const localStorage={getItem:key=>storage.get(key)||null,setItem:(key,val)=>storage.set(key,String(val)),removeItem:key=>storage.delete(key)};
 const document={getElementById:get,createElement:tag=>new Element(tag),body:new Element('body')};
 const window={NeoHarborStory:story,NeoRpgDuelBridge:bridge,addEventListener:(type,fn)=>{handlers[type]=fn;}};
 const location={origin:'http://localhost:8000',reload:()=>{reloads++;}};
 const fetch=async()=>({ok:true,json:async()=>({decks:[{id:'blackout',name:'Blackout'},{id:'brushfire',name:'Brushfire'}]})});
 vm.runInNewContext(fs.readFileSync('rpg.js','utf8'),{window,document,localStorage,location,fetch,confirm:()=>true,URLSearchParams,console},{filename:'rpg.js'});
 const saved=()=>JSON.parse(storage.get('neoHarborRpgV1'));
 const click=(parent,label)=>{const b=get(parent).children.find(x=>x.textContent.includes(label));assert.ok(b,'Expected control: '+parent+' / '+label);assert.equal(b.disabled,false,'Control is enabled: '+label);assert.equal(typeof b.onclick,'function');b.onclick();};
 const send=(duelId,winner,origin=location.origin,source=frame.contentWindow)=>{
  handlers.message({origin,source,data:{type:'neo-rpg-duel-finished',duelId,winner}});
 };
 return {get,click,send,saved,storage,location,frame,handlers,reloads:()=>reloads};
}
(async()=>{
 const game=boot();
 assert.equal(game.get('day').textContent,'DAY 01 / 90');
 assert.equal(game.get('placeTitle').textContent,'Your Apartment');
 game.get('quickNext').onclick();game.get('quickNext').onclick();game.get('quickNext').onclick();
 assert.equal(game.saved().day,2);
 assert.equal(game.saved().slot,0);
 game.click('places','The Lucky Draw');
 assert.equal(game.saved().location,'shop');
 game.click('people',''); // Hana is available on day 2, morning, at the shop.
 assert.ok(game.get('choices').children.some(x=>x.textContent.includes('Challenge to a duel')));
 game.click('choices','Challenge to a duel');
 const first=game.saved().pendingDuel;
 assert.ok(first&&game.frame.src.includes('duelId='+first.id));
 assert.equal(game.get('deckPicker').disabled,true,'Deck is locked during a match');
 game.send(first.id,0,'https://evil.invalid');assert.equal(game.saved().results.length,0);
 game.send('npc-another-1-1-0',0);assert.equal(game.saved().results.length,0);
 game.send(first.id,0,game.location.origin,{});assert.equal(game.saved().results.length,0);
 game.send(first.id,0);
 assert.equal(game.saved().results.length,1);
 assert.equal(game.saved().pendingDuel,null);
 assert.equal(game.saved().lastDuel.points,3);
 assert.equal(game.saved().lastDuel.credits,15);
 assert.equal(game.saved().relationships[first.npc].duels,1);
 assert.equal(game.saved().slot,1);
 assert.match(game.get('duelReport').textContent,/VICTORY/);
 game.send(first.id,0);assert.equal(game.saved().results.length,1,'Duplicate result cannot pay twice');
 const again=boot(game.storage);
 assert.equal(again.saved().day,2);
 assert.equal(again.saved().results.length,1,'Progress survives reload');
 again.click('people','');
 again.click('choices','Challenge to a duel');
 const second=again.saved().pendingDuel;
 assert.notEqual(second.id,first.id);
 assert.equal(again.saved().results.length,1);
 const resumed=boot(game.storage);
 assert.ok(resumed.frame.src.includes('duelId='+second.id),'Pending duel is restored after RPG reload');
 resumed.send(first.id,0);assert.equal(resumed.saved().results.length,1,'Old duel cannot finish current session');
 resumed.send(second.id,1);
 assert.equal(resumed.saved().results.length,2);
 assert.equal(resumed.saved().lastDuel.points,1);
 assert.equal(resumed.saved().lastDuel.credits,5);
 assert.equal(resumed.saved().relationships[first.npc].duels,2);
 for(let i=0;i<6;i++)resumed.get('quickNext').onclick();
 assert.equal(resumed.saved().day,4,'Time progression works for multiple days');
 resumed.get('save').onclick();
 const loaded=boot(game.storage);
 assert.equal(loaded.saved().day,4,'Manual save + refresh preserves day');
 assert.equal(loaded.saved().results.length,2);
 loaded.click('activities','New campaign');
 assert.equal(loaded.saved().day,1);
 assert.equal(loaded.saved().results.length,0);
 assert.equal(loaded.reloads(),1);
 for(const page of ['classic_live.html','online.html']){
  const html=fs.readFileSync(page,'utf8');
  for(const style of ['classic_live.css','online_compact.css','online_hand_tray.css','duel_accessibility.css'])assert.ok(html.includes(style),page+' should share '+style);
  for(const id of ['handTray','myActive','enemyActive','myBench','enemyBench','turnCoach','duelFeedback','logDrawer'])assert.ok(html.includes('id="'+id+'"'),page+' missing '+id);
 }
 console.log('PASS RPG journey: new campaign, explore, NPC, two duels, spoof/replay protection, payout, relationship, reload, days, new game, shared duel UI');
})().catch(err=>{console.error(err);process.exitCode=1;});
