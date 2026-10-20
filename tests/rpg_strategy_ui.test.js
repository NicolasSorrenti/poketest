'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Core=require('../rpg_collection'),Strategy=require('../rpg_strategy');
const script=fs.readFileSync(path.join(__dirname,'..','rpg_deck_studio.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','rpg_deck_studio.html'),'utf8');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
class Node{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.options=[];this.textContent='';
  this.hidden=false;this.disabled=false;this.value='';this.className='';}
 append(...nodes){this.children.push(...nodes);if(this.tagName==='SELECT')this.options=this.children;}
 replaceChildren(...nodes){this.children=[];this.options=[];this.append(...nodes);}
}
function seed(){
 const s={day:9,slot:1,location:'shop',results:[],met_reina:true,credits:80,deckJourney:Core.fresh()};
 Core.choose(s,'ember_garden');
 Core.awardSignature(s,'base1-12');
 return s;
}
function makeCards(){
 const ids=new Set([...Core.starters.flatMap(x=>x.cards),'base1-12','base2-17']);
 return [...ids].map(id=>{
  if(id==='base1-12')return {id,name:'Ninetales',supertype:'Pokémon',subtypes:['Stage 1'],types:['Fire'],evolvesFrom:'Vulpix'};
  if(id==='base2-17')return {id,name:'Jungle Oddish',supertype:'Pokémon',subtypes:['Basic'],types:['Grass'],weaknesses:[{type:'Fire'}]};
  if(Core.ENERGY.has(id))return {id,name:'Fire Energy',supertype:'Energy',types:['Fire']};
  const n=Number(id.split('-')[1]);
  if(n>=70)return {id,name:'Trainer '+id,supertype:'Trainer'};
  return {id,name:id==='base1-66'?'Vulpix':'Basic '+id,supertype:'Pokémon',subtypes:['Basic'],types:['Grass']};
 });
}
async function launch(options={}){
 const state=options.state||seed(),nodes=Object.fromEntries(ids.map(id=>[id,new Node(id==='strategyOpponent'?'select':'div')]));
 nodes.deckStudio.hidden=true;nodes.studioError.hidden=true; // Match the HTML initial hidden attributes.
 const saved={neoHarborRpgV1:JSON.stringify(state)},builder={updates:[],onChange:null};
 const collections=makeCards(),decks=Array(60).fill('base2-17');
 const w={NeoRpgCollection:Core,NeoRpgStrategy:Strategy,
  CubeDeckBuilder:{create(args){builder.onChange=args.onChange;return {update(values){builder.updates.push(values)}}}},
  NeoRpgNarrativePack:{cast:{}},NeoRpgSideQuests:{cast:{}}};
 const doc={getElementById(id){assert.ok(nodes[id],'Missing node '+id);return nodes[id];},
  createElement(tag){return new Node(tag)}};
 const storage={getItem:k=>saved[k]||null,setItem:(k,v)=>{saved[k]=v}};
 const fetch=async url=>({ok:true,json:async()=>url.startsWith('/api/classic/')?{cards:decks}:collections});
 new Function('window','document','localStorage','location','fetch','URLSearchParams',script)(
  w,doc,storage,{search:options.search||'?scout=reina'},fetch,URLSearchParams);
 await new Promise(resolve=>setImmediate(resolve));
 return {nodes,builder,state:()=>JSON.parse(saved.neoHarborRpgV1)};
}
test('RPG studio shows Strategy Lab without replacing the shared Cube deck builder',async()=>{
 const app=await launch();
 assert.equal(app.nodes.deckStudio.hidden,false);
 assert.ok(app.builder.updates.length);
 assert.match(app.nodes.strategySummary.textContent,/60 cards/);
 assert.ok(app.nodes.strategySwaps.children.length>0);
 assert.equal(app.state().deckJourney.deck.length,60);
});
test('wishlist search is interactive, persists across reload and does not spend credits',async()=>{
 const app=await launch(),input=app.nodes.strategySearch;
 input.value='Jungle Oddish';input.oninput();
 assert.ok(app.nodes.strategySearchResults.children.length>0);
 app.nodes.strategySearchResults.children[0].onclick();
 assert.deepEqual(app.state().deckStrategy.wishlist,['base2-17']);
 assert.equal(app.state().credits,80);
 assert.ok(app.nodes.strategyPacks.children.length>0,'Jungle expansion appears in pack guidance');
 const again=await launch({state:app.state()});
 assert.deepEqual(again.state().deckStrategy.wishlist,['base2-17']);
});
test('staging an upgrade leaves saved 60-card deck unchanged until explicit Save',async()=>{
 const app=await launch();
 const suggestions=app.nodes.strategySwaps.children.filter(x=>x.children.some(n=>n.tagName==='BUTTON'));
 assert.ok(suggestions.length>0);
 const original=app.state().deckJourney.deck;
 const action=suggestions[0].children.find(x=>x.tagName==='BUTTON');action.onclick();
 assert.deepEqual(app.state().deckJourney.deck,original);
 assert.notDeepEqual(app.state().deckJourney.draft,original);
 assert.equal(app.nodes.saveDeck.disabled,false);
 app.nodes.discardDraft.onclick();
 assert.deepEqual(app.state().deckJourney.deck,original);
 assert.deepEqual(app.state().deckJourney.draft,original);
});
test('scouting a previously met NPC uses actual theme-deck service without changing the campaign',async()=>{
 const app=await launch();
 assert.equal(app.nodes.strategyOpponent.value,'reina');
 assert.equal(app.nodes.strategyScout.disabled,false);
 const before=JSON.stringify(app.state());
 app.nodes.strategyScout.onclick();
 await new Promise(resolve=>setImmediate(resolve));
 assert.ok(app.nodes.strategyScoutResult.children.some(x=>/Common Pokémon types/.test(x.textContent)));
 assert.equal(JSON.stringify(app.state()),before);
});
test('no studio editing when a live duel has locked its deck snapshot',async()=>{
 const s=seed();s.pendingDuel={id:'active'};
 const app=await launch({state:s});
 assert.equal(app.nodes.deckStudio.hidden,true);
 assert.match(app.nodes.studioError.textContent,/Finish your current duel/);
});
