'use strict';
const assert=require('node:assert/strict');
const H=require('./battle_decision_ui');
const cards=new Map([
 ['p-a',{name:'Pikachu'}],['p-b',{name:'Bulbasaur'}],['p-c',{name:'Charmander'}],['p-d',{name:'Squirtle'}]
]);
const card=id=>cards.get(id);
const view={players:[{active:{id:'p-a'},bench:[{id:'p-b'},{id:'p-c'}]},{active:{id:'p-d'},bench:[{id:'p-a'},{id:'p-c'}]}]};
function targets(label,options,actor=0,kind='target'){return H.resolveTargets({actor,label,kind,options},view,actor,card);}
assert.deepEqual(targets('Gust of Wind: choose opponent replacement',[{id:'bench:0',label:'Pikachu'}]),[{id:'bench:0',side:1,slot:0,label:'Pikachu'}]);
assert.deepEqual(targets('Potion: choose one of your Pokémon',[{id:'slot:-1',label:'Active: Pikachu'},{id:'slot:1',label:'Bench: Charmander'}]),[
 {id:'slot:-1',side:0,slot:-1,label:'Active: Pikachu'},
 {id:'slot:1',side:0,slot:1,label:'Bench: Charmander'}]);
assert.deepEqual(targets('Energy Removal: choose opposing Pokémon',[{id:'slot:-1',label:'Active: Squirtle'}]),[{id:'slot:-1',side:1,slot:-1,label:'Active: Squirtle'}]);
assert.equal(targets('Choose Pokémon',[{id:'bench:1',label:'Charmander'}]),null,'Ambiguous board cannot be guessed');
assert.equal(targets('Potion: choose one of your Pokémon',[{id:'slot:0',label:'Bench: Squirtle'}]),null,'Stale card names cannot map to another target');
assert.equal(targets('Energy Removal: select attached Energy',[{id:'energy:0',label:'Water Energy'}]),null,'Energy choices need a modal');
assert.equal(targets('Search for a Pokémon',[{id:'deck:0',label:'Pikachu'}]),null,'Deck cards are not battlefield targets');
assert.deepEqual(targets('Opponent chooses your replacement',[{id:'bench:1',label:'Charmander'}],1),[{id:'bench:1',side:0,slot:1,label:'Charmander'}],'Opposing player can choose the actor’s opponent target');
assert.deepEqual(targets('Choose an opponent Benched Pokémon',[{id:'bench:1',label:'Charmander'}]),[{id:'bench:1',side:1,slot:1,label:'Charmander'}]);
console.log('PASS v0.34 battlefield mapping: own and opposing sides, multi-select, ambiguity fallback, stale options and non-field choices');
