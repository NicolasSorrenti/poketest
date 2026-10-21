'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Core=require('../rpg_collection'),Lab=require('../rpg_strategy');
const state=()=>{
 const s={deckJourney:Core.fresh(),day:1,credits:80,location:'shop',results:[]};
 Core.choose(s,'ember_garden');return s;
};
const cards=()=>{
 const result=new Map();
 for(const starter of Core.starters)for(const id of starter.cards){
  if(result.has(id))continue;
  const n=Number(id.split('-')[1]);
  result.set(id,Core.ENERGY.has(id)?
   {id,name:'Fire Energy',supertype:'Energy',types:['Fire']}:
   n>=70?{id,name:'Trainer '+id,supertype:'Trainer'}:
   {id,name:'Starter Basic '+id,supertype:'Pokémon',subtypes:['Basic'],types:['Grass']});
 }
 result.set('base1-12',{id:'base1-12',name:'Ninetales',supertype:'Pokémon',subtypes:['Stage 1'],evolvesFrom:'Vulpix',types:['Fire']});
 result.set('base1-88',{id:'base1-88',name:'Professor Oak',supertype:'Trainer'});
 result.set('base2-17',{id:'base2-17',name:'Jungle Pokémon',supertype:'Pokémon',subtypes:['Basic'],types:['Grass'],weaknesses:[{type:'Fire'}]});
 result.set('neo4-4',{id:'neo4-4',name:'Neo Destiny Pokémon',supertype:'Pokémon',subtypes:['Basic'],types:['Grass'],weaknesses:[{type:'Fire'}]});
 return result;
};
test('legacy or malformed saved wishlist safely migrates and deduplicates',()=>{
 const s=state();s.deckStrategy={wishlist:['base2-17','base2-17',55,'forged-id','base1-98']};
 Lab.hydrate(s,Core);
 assert.deepEqual(s.deckStrategy.wishlist,['base2-17']);
});
test('wishlist may track missing cards but never changes credits or collection ownership',()=>{
 const s=state(),index=cards(),before=JSON.stringify(s.deckJourney);
 assert.equal(Lab.toggle(s,'neo4-4',Core,index),true);
 assert.deepEqual(Lab.goals(s,index,Core).map(x=>[x.set,x.owned]),[['neo4',0]]);
 assert.equal(JSON.stringify(s.deckJourney),before);
 assert.equal(s.credits,80);
 assert.equal(Lab.toggle(s,'neo4-4',Core,index),false);
 assert.deepEqual(s.deckStrategy.wishlist,[]);
});
test('wishlist rejects unknown cards, energy, and over eight goals',()=>{
 const s=state(),index=cards();
 assert.throws(()=>Lab.toggle(s,'fake-10',Core,index),/valid card/);
 assert.throws(()=>Lab.toggle(s,'base1-98',Core,index),/valid card/);
 for(let i=1;i<=9;i++)index.set('base2-'+i,{id:'base2-'+i,name:'Pokémon '+i,supertype:'Pokémon',subtypes:['Basic'],types:['Grass']});
 for(let i=1;i<=8;i++)assert.equal(Lab.toggle(s,'base2-'+i,Core,index),true);
 assert.throws(()=>Lab.toggle(s,'base2-9',Core,index),/up to 8/);
 assert.equal(Lab.goals(s,index,Core).length,8);
});
test('booster advice recommends thematic packs that can actually supply wishlist cards',()=>{
 const s=state(),index=cards();
 Lab.toggle(s,'base2-17',Core,index);Lab.toggle(s,'neo4-4',Core,index);
 let advice=Lab.packAdvice(s,index,Core);
 assert.ok(advice.some(x=>x.id==='arena'&&x.unlocked));
 assert.equal(advice.find(x=>x.id==='evolution').targets,0,'locked Jungle/Neo printings must not be advertised');
 assert.equal(advice.find(x=>x.id==='johto').targets,0,'locked packs have zero currently available targets');
 s.day=90;
 advice=Lab.packAdvice(s,index,Core);
 assert.ok(advice.find(x=>x.id==='johto').unlocked);
 assert.ok(advice.find(x=>x.id==='johto').targets>=1);
 assert.equal(advice.find(x=>x.id==='evolution').targets,2,'old Evolution pack now spans multiple unlocked sets');
 assert.equal(advice.find(x=>x.id==='arena').targets,0,'do not pretend all rares exist in the Arena basic pool');
 s.deckJourney.owned['base2-17']=1;
 assert.equal(Lab.packAdvice(s,index,Core).find(x=>x.id==='evolution').targets,1);
});
test('profile reports 60-card composition and common Pokémon types without editing the save',()=>{
 const s=state(),index=cards(),snapshot=JSON.stringify(s);
 const p=Lab.profile(s.deckJourney.deck,index);
 assert.equal(p.counts.pokemon+p.counts.trainer+p.counts.energy+p.counts.other,60);
 assert.equal(p.basics>0,true);
 assert.equal(JSON.stringify(s),snapshot);
});
test('suggested upgrades are legal one-for-one changes and do not automatically replace a saved deck',()=>{
 const s=state(),index=cards();s.deckJourney.owned['base1-12']=1;
 // The real starter has a Vulpix, making its evolution a useful owned option.
 const vulpix=s.deckJourney.deck.find(id=>id==='base1-68'||id==='base1-66'||id==='base1-24');
 if(vulpix)index.set(vulpix,{id:vulpix,name:'Vulpix',supertype:'Pokémon',subtypes:['Basic'],types:['Fire']});
 const original=[...s.deckJourney.deck];
 const suggestions=Lab.swaps(s,index,Core,8);
 assert.ok(suggestions.length>0);
 for(const row of suggestions){
  const sample=[...original],i=sample.indexOf(row.remove);sample[i]=row.add;
  assert.equal(Core.check(sample,s.deckJourney.owned).valid,true);
  assert.equal(sample.length,60);
 }
 assert.deepEqual(s.deckJourney.deck,original);
 const suggestion=suggestions[0];
 Core.change(s,suggestion.remove,suggestion.add);
 assert.deepEqual(s.deckJourney.deck,original);
 Core.save(s);assert.notDeepEqual(s.deckJourney.deck,original);
 assert.equal(Core.check(s.deckJourney.deck,s.deckJourney.owned).valid,true);
});
test('wishlist prospects never recommend an evolution without a present predecessor',()=>{
 const s=state(),index=cards();
 index.set('neo1-1',{id:'neo1-1',name:'Unsupported Stage 2',supertype:'Pokémon',
  subtypes:['Stage 2'],evolvesFrom:'Unknown Stage 1',types:['Grass']});
 const prospects=Lab.prospects(s,index,Core,100);
 assert.equal(prospects.some(x=>x.id==='neo1-1'),false);
 assert.ok(prospects.some(x=>x.id==='base2-17'));
});
test('scouting analyzes a genuine 60-card snapshot with printed types and weaknesses only',()=>{
 const s=state(),index=cards();
 const d=[...Array(20).fill('base2-17'),...Array(16).fill('base1-91'),...Array(24).fill('base1-98')];
 const before=JSON.stringify(s);
 const snapshot=Lab.scout(d,index,s);
 assert.ok(snapshot);assert.equal(snapshot.composition.pokemon,20);
 assert.equal(snapshot.composition.trainer,16);assert.equal(snapshot.composition.energy,24);
 assert.equal(snapshot.types[0].name,'Grass');
 assert.equal(Lab.scout(d.slice(0,59),index,s),null);
 assert.equal(JSON.stringify(s),before);
});
test('long term suggestions never promise individual-card booster outcomes',()=>{
 const s=state(),index=cards();
 const progress=Lab.prospects(s,index,Core,5);
 assert.ok(progress.length>0);
 assert.ok(progress.every(x=>!(/guarantee|will pull|you receive/i).test(x.reason)));
});
