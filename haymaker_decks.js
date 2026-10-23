'use strict';
// Five intentionally aggressive 60-card Basic-only decks for Single Match,
// Online Match, and the deck builder. Historical Base/Jungle/Fossil printings,
// standard four-of rule and full original WotC card text. No evolution cards.
const recipes=Object.freeze({
 haymaker_classic:{
  name:'Haymaker · Classic Punch (Fighting / Lightning)',
  description:'Hitmonchan, Electabuzz and Scyther backed by draw, Gust and Energy Removal.',
  pokemon:[[4,'base1-7'],[4,'base1-20'],[3,'base2-26'],[2,'base1-27'],[2,'base2-47']],
  trainers:[[4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],[4,'base1-84'],
   [3,'base1-93'],[3,'base1-92'],[2,'base1-79'],[2,'base1-78'],[1,'base1-95']],
  energy:[[7,'base1-97'],[7,'base1-100'],[4,'base1-96']]
 },
 haymaker_fire:{
  name:'Haymaker · Firestorm (Fire / Lightning)',
  description:'Fossil Magmar and Electabuzz apply status pressure while Scyther attacks with colorless Energy.',
  pokemon:[[4,'base3-39'],[4,'base1-20'],[3,'base2-26'],[2,'base1-27'],[1,'base2-5']],
  trainers:[[4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],[3,'base1-93'],
   [4,'base1-84'],[3,'base1-92'],[1,'base1-79'],[2,'base1-78']],
  energy:[[9,'base1-98'],[8,'base1-100'],[4,'base1-96']]
 },
 haymaker_psychic:{
  name:'Haymaker · Mind Games (Psychic / Fighting)',
  description:'Mewtwo, Jynx and Hitmonchan attack different Weaknesses; Chansey absorbs pressure.',
  pokemon:[[4,'base1-10'],[4,'base1-7'],[3,'base2-26'],[2,'base1-31'],[1,'base1-3']],
  trainers:[[4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],[3,'base1-84'],
   [3,'base1-93'],[3,'base1-92'],[2,'base1-79'],[2,'base1-78'],[1,'base1-95']],
  energy:[[9,'base1-101'],[7,'base1-97'],[4,'base1-96']]
 },
 haymaker_water:{
  name:'Haymaker · Tidal Punch (Water / Fighting)',
  description:'Lapras leads quickly, Hitmonchan punishes Lightning targets and Articuno closes games.',
  pokemon:[[4,'base3-25'],[4,'base1-7'],[3,'base2-26'],[2,'base3-17'],[1,'base2-5']],
  trainers:[[4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],[3,'base1-93'],
   [3,'base1-84'],[3,'base1-92'],[2,'base1-78'],[1,'base1-95'],[1,'base1-79']],
  energy:[[11,'base1-102'],[6,'base1-97'],[4,'base1-96']]
 },
 haymaker_jungle:{
  name:'Haymaker · Jungle Tempo (Lightning / Grass)',
  description:'Electabuzz pushes damage while Scyther, Lickitung and Tauros sustain the board.',
  pokemon:[[4,'base2-26'],[4,'base1-20'],[4,'base2-38'],[2,'base2-47'],[1,'base2-5']],
  trainers:[[4,'base1-91'],[3,'base1-88'],[3,'base1-71'],[2,'base1-74'],[3,'base1-84'],
   [3,'base1-93'],[3,'base1-92'],[2,'base1-78'],[2,'base1-79'],[1,'base1-95']],
  energy:[[11,'base1-100'],[4,'base1-99'],[4,'base1-96']]
 }
});
const expand=rows=>rows.flatMap(([amount,id])=>Array(amount).fill(id));
const entries=Object.freeze(Object.entries(recipes).map(([id,recipe])=>
 Object.freeze({id,name:recipe.name,description:recipe.description,haymaker:true})));
function list(id){
 if(!Object.hasOwn(recipes,id))return null;
 const recipe=recipes[id];
 return expand([...recipe.pokemon,...recipe.trainers,...recipe.energy]);
}
function has(id){return typeof id==='string'&&Object.hasOwn(recipes,id);}
function validateRecipes(){
 for(const id of Object.keys(recipes)){
  const r=recipes[id],p=expand(r.pokemon),t=expand(r.trainers),e=expand(r.energy);
  if(p.length<10||p.length>20||t.length<15||e.length<12||p.length+t.length+e.length!==60)
   throw Error('Invalid Haymaker card balance: '+id);
  for(const [category,ids] of [['Pokémon',p],['Trainer',t],['Energy',e]]){
   if(ids.some(cardId=>!/^(base[123])-\d+$/.test(cardId)))
    throw Error('Haymaker uses unsupported printing: '+id+' '+category);
  }
 }
}
validateRecipes();
module.exports=Object.freeze({recipes,entries,list,has,validateRecipes});
