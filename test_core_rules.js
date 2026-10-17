'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('./core_rules');
const sets=fs.readdirSync(path.join(__dirname,'cards')).filter(f=>f.endsWith('.json'));
const cards=sets.flatMap(f=>require('./cards/'+f));
const lookup=new Map(cards.map(c=>[c.id,c]));
assert.equal(cards.length,1123);
let basic=0,energy=0,attack=0,evolutions=0;
for(const card of cards){
 if(core.isBasicPokemon(card)){basic++;assert.equal(card.supertype,'Pokémon');}
 if(core.isEnergy(card)){energy++;assert.ok(!core.isBasicPokemon(card),card.id);}
 for(const a of card.attacks||[]){attack++;assert.ok(Array.isArray(a.cost),card.id+': '+a.name);}
 if(card.evolvesFrom){evolutions++; assert.equal(core.canEvolve(card,{name:card.evolvesFrom}),!['Blaine\'s ','Erika\'s ','Misty\'s ','Brock\'s ','Lt. Surge\'s ','Sabrina\'s ','Koga\'s ','Giovanni\'s ','Rocket\'s '].some(p=>card.name.startsWith(p)&&!card.evolvesFrom.startsWith(p)));}
}
assert.ok(basic>100 && energy>=30 && attack===1479 && evolutions>200);
const simple=(name,type)=>({id:name,name,supertype:type,subtypes:type==='Pokémon'?['Basic']:[]});
assert.equal(core.canEvolve({name:"Brock's Ninetales",evolvesFrom:'Vulpix'},simple("Brock's Vulpix",'Pokémon')),true);
assert.equal(core.canEvolve({name:"Brock's Ninetales",evolvesFrom:'Vulpix'},simple('Vulpix','Pokémon')),false);
assert.equal(core.canEvolve({name:'Dark Charmeleon',evolvesFrom:'Charmander'},simple('Charmander','Pokémon')),true);
const symbols=['Grass','Fire','Water','Lightning','Psychic','Fighting','Colorless'];
let seed=638019;const rnd=n=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)%n;
let randomized=0;
for(let i=0;i<20000;i++){
 const cost=Array.from({length:rnd(6)},()=>symbols[rnd(symbols.length)]);
 const pool=Array.from({length:rnd(8)},()=>symbols[rnd(symbols.length)]);
 const expected=cost.filter(s=>s!=='Colorless').every((s,j)=>{const needed=cost.filter(k=>k===s).length;return pool.filter(k=>k===s).length>=needed;}) && pool.length>=cost.length;
 assert.equal(core.canPayEnergy(cost,pool),expected,JSON.stringify({cost,pool}));
 randomized++;
}
const fire={id:'base1-98',name:'Fire Energy',supertype:'Energy',subtypes:[]};
const bulba=cards.find(c=>c.name==='Bulbasaur' && core.isBasicPokemon(c));
assert.ok(bulba);
assert.equal(core.validateDeck([...Array(56).fill(fire.id),...Array(4).fill(bulba.id)],lookup).valid,true);
assert.equal(core.validateDeck(Array(60).fill(bulba.id),lookup).valid,false);
assert.equal(core.validateDeck(Array(60).fill(fire.id),lookup).valid,false);
assert.equal(core.legalAttachment({card:fire,unit:{energies:[]},round:1}),true);
assert.equal(core.legalAttachment({card:fire,unit:{energies:[]},energyUsed:true,round:1}),false);
assert.equal(core.legalAttachment({card:bulba,unit:{energies:[]},round:1}),false);
assert.equal(core.legalAttachment({card:fire,unit:{energies:[]},round:1,pureBody:true}),true);
assert.equal(core.legalAttachment({card:{...fire,name:'Water Energy'},unit:{energies:[]},round:1,pureBody:true}),false);
const disguised={name:'Water Energy',supertype:'Pokémon',subtypes:['Basic'],attacks:[],abilities:[]};
assert.equal(core.normalize(disguised).supertype,'Energy');assert.equal(core.isBasicPokemon(disguised),false);
console.log(`PASS pure core: ${cards.length} cards, ${attack} attacks, ${evolutions} evolutions, ${energy} Energy records, ${randomized} randomized payment checks, deck and attachment legality`);
