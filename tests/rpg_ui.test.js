'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const STORY=require('../rpg_story'),WORLD=require('../rpg_world'),CIRCUIT=require('../rpg_circuit');
const MARKET=require('../rpg_market'),FINALE=require('../rpg_finale');
const root=path.join(__dirname,'..');
const script=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
const html=fs.readFileSync(path.join(root,'rpg.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
class MockElement {
 constructor(tag='div'){
  this.tagName=tag.toUpperCase();this.children=[];this.options=[];this.value='';
  this.style={};this.hidden=false;this.disabled=false;this.textContent='';this.className='';
  this.classList={add(){},remove(){}};this.contentWindow=null;this.open=false;
 }
 append(...items){for(const item of items){item.parentElement=this;this.children.push(item);}if(this.tagName==='SELECT')this.options=this.children;}
 replaceChildren(...items){this.children=[];this.options=[];this.append(...items);}
 addEventListener(name,handler){this['on'+name]=handler;}
 showModal(){this.open=true;}close(){this.open=false;}
}
const starter=[...Array(56).fill('base1-97'),...Array(4).fill('base1-53')];
const baseCards=[{id:'base1-97',name:'Fighting Energy',supertype:'Energy',subtypes:[]},{id:'base1-53',name:'Machop',supertype:'Pokémon',subtypes:['Basic']}];
for(let i=1;i<=60;i++)baseCards.push({id:'base1-'+i,name:'Creature '+i,supertype:'Pokémon',subtypes:[i%5?'Basic':'Stage 1']});
function launch(initial){
 const store={};if(initial)store.neoHarborRpgV1=JSON.stringify(initial);
 const elements=Object.fromEntries(ids.map(id=>[id,new MockElement(id==='deckPicker'?'select':'div')]));
 elements.battle.contentWindow={};const handlers={};
 const document={
  getElementById:id=>{if(!elements[id])throw Error('Missing element '+id);return elements[id];},
  createElement:tag=>new MockElement(tag),body:new MockElement('body'),
  addEventListener:(name,fn)=>handlers['doc:'+name]=fn,activeElement:{tagName:'DIV'}
 };
 const window={NeoHarborStory:STORY,NeoHarborWorld:WORLD,NeoHarborCircuit:CIRCUIT,NeoHarborMarket:MARKET,NeoHarborFinale:FINALE,
  addEventListener:(name,fn)=>handlers[name]=fn};
 const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=String(v)}};
 const responses={
  '/api/classic/decks':{decks:[{id:'blackout',name:'Blackout'},{id:'brushfire',name:'Brushfire'},{id:'custom',name:'Custom'}]},
  '/api/classic/decklist?id=blackout':{cards:starter},
  '/cards/base1.json':baseCards,'/cards/base2.json':[],'/cards/neo1.json':[]
 };
 const fetch=async url=>({ok:Object.hasOwn(responses,url),json:async()=>responses[url]});
 const location={origin:'https://neo.test',href:'https://neo.test/rpg.html',reload(){this.reloaded=true}};
 vm.runInNewContext(script,{document,window,localStorage,location,fetch,confirm:()=>true,Math,Date,JSON},{filename:'rpg.js'});
 const game={elements,handlers,location,store,state:()=>JSON.parse(store.neoHarborRpgV1)};
 game.finishDuel=(winner=0,matchId=null)=>{
  const duel=game.state().pendingDuel;if(!duel)return false;
  handlers.message({origin:location.origin,source:elements.battle.contentWindow,data:{type:'neo-rpg-duel-finished',matchId:matchId||duel.id,winner}});
  return true;
 };
 return game;
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('home is unmistakable, location travel is free, time actions advance periods',async()=>{
 const g=launch();await flush();
 assert.match(g.elements.whereLabel.textContent,/HOME/);
 assert.equal(g.elements.places.children.length,7);
 g.elements.places.children.find(x=>x.textContent.includes('Lucky Draw')).onclick();
 assert.equal(g.state().slot,0);
 assert.equal(g.state().location,'shop');
 g.elements.quickNext.onclick();
 assert.equal(g.state().slot,1);
 assert.equal(g.elements.period.textContent,'AFTERNOON');
});
test('a timed character scene persists and awards points once',async()=>{
 const g=launch({day:5,slot:0,location:'shop'});await flush();
 g.elements.storyEvents.children[0].onclick();
 assert.equal(g.state().activeStory.id,'hana_route_1');
 for(let n=0;n<3;n++)g.elements.choices.children[0].onclick();
 assert.equal(g.state().activeStory.phase,'choice');
 g.elements.choices.children[0].onclick();g.elements.choices.children[0].onclick();
 assert.equal(g.state().slot,1);
 assert.ok(g.state().storyDone.hana_route_1);
 assert.equal(g.state().relationships.hana.affection,2);
 assert.equal(g.state().activeStory,null);
});
test('tournament duel identity prevents stale results and supports a two-match cup',async()=>{
 const g=launch({day:30,slot:0,location:'center',points:20});await flush();
 const register=g.elements.circuitPanel.children.find(x=>x.textContent.includes('Register'));
 assert.ok(register);register.onclick();
 assert.equal(g.state().tournament.active.id,'neighborhood');
 g.elements.quickNext.onclick();
 const start=g.elements.circuitPanel.children.find(x=>x.textContent.includes('Play round'));assert.ok(start);start.onclick();
 const old=g.state().pendingDuel;
 assert.ok(old.id);
 g.finishDuel(0,'stale-id');assert.equal(g.state().pendingDuel.id,old.id);
 g.finishDuel(0,old.id);
 assert.equal(g.state().tournament.active.round,1);
 assert.equal(g.state().slot,2);
 const second=g.elements.circuitPanel.children.find(x=>x.textContent.includes('Play round'));
 assert.ok(second);second.onclick();g.finishDuel(0);
 assert.equal(g.state().tournament.completed.neighborhood.won,true);
 assert.equal(g.state().results.length,2);
 assert.equal(g.state().points,41);
});
test('owned starter, card purchases and saved custom decks work without overwriting unrelated builder keys',async()=>{
 const g=launch();await flush();await flush();
 assert.equal(g.state().collection.starterReady,true);
 assert.equal(g.state().collection.owned['base1-97'],56);
 g.elements.places.children.find(x=>x.textContent.includes('Lucky Draw')).onclick();
 const open=g.elements.collectionPanel.children.find(x=>x.textContent.includes('Shop cards'));
 assert.ok(open);open.onclick();
 g.elements.marketBuyPack.onclick();
 assert.equal(g.state().collection.packsOpened,1);
 assert.equal(g.state().credits,62);
 // The owned starter is already a valid 60-card legal deck.
 g.elements.marketSaveDeck.onclick();
 assert.equal(g.state().playerDeck,'custom');
 assert.ok(g.store.neoCampusRpgDeck);
 assert.equal(g.store.neoCampusCustomGymDeck,undefined);
});
test('arcade risk challenge consumes one period and pays from the game economy',async()=>{
 const g=launch({day:8,slot:1,location:'arcade',credits:50});await flush();
 g.elements.activities.children.find(x=>x.textContent.includes('Arcade high-score')).onclick();
 assert.ok(g.elements.choices.children.some(x=>x.textContent.includes('Go for the record')));
 g.elements.choices.children.find(x=>x.textContent.includes('Play it safe')).onclick();
 assert.equal(g.state().credits,58);
 assert.equal(g.state().slot,2);
});
test('full campaign reaches an ending and grants a fresh New Game+',async()=>{
 const g=launch({day:91,slot:0,location:'home',points:50,flags:{},partner:'hana',routeOutcomes:{hana:'romance'},tournament:{completed:{championship:{won:true}}}});
 await flush();
 assert.equal(g.elements.finaleDialog.open,true);
 assert.equal(g.elements.finaleChoices.children.length,3);
 g.elements.finaleChoices.children[1].onclick();
 assert.equal(g.state().finale.choice,'town');
 g.elements.finaleNewGame.onclick();
 assert.equal(g.state().day,1);assert.equal(g.state().newGamePlus,1);
 assert.equal(g.state().partner,null);
 assert.equal(g.location.reloaded,true);
});
