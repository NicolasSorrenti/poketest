'use strict';
// Convert TCGdex v2 card details to the shape consumed by the existing duel engine.
const toText = x => typeof x === 'string' ? x : '';
// Some older TCGdex records omit Stage 1 evolution ancestry; preserve printed lines.
const EVOLUTION_ANCESTRY_OVERRIDES=Object.freeze({'neo1-38':'Chinchou','gym1-8':"Lt. Surge's Magnemite",'neo2-60':'Mysterious Fossil'});
function normalizeCard(card){
 if(!card?.id || !card.name) throw new Error('Malformed TCGdex card');
 const isEnergy=card.category==='Energy'||(['Grass Energy','Fire Energy','Water Energy','Lightning Energy','Psychic Energy','Fighting Energy'].includes(card.name)&&!card.hp&&!card.attacks?.length&&!card.abilities?.length);
 const isTrainer=card.category==='Trainer';
 const stage=card.stage || '';
 // TCGdex labels Basic Energy with stage="Basic" in some historic sets.
 // An explicit category must win over stage/HP inference.
 const pokemon=!isEnergy&&!isTrainer&&Boolean(card.category==='Pokemon'||card.category==='Pokémon'||card.hp!=null||card.stage);
 const subtypes=pokemon ? [stage==='Basic'?'Basic':stage==='Baby'?'Baby':stage==='Stage1'?'Stage 1':stage==='Stage2'?'Stage 2':stage].filter(Boolean):[];
 if(isEnergy && /special/i.test(card.energyType||''))subtypes.push('Special');
 const p={
  id:card.id,name:card.name,supertype:pokemon?'Pokémon':isEnergy?'Energy':isTrainer?'Trainer':card.category||'Trainer',
  subtypes,types:card.types||[],hp:card.hp==null?undefined:String(card.hp),evolvesFrom:card.evolveFrom||EVOLUTION_ANCESTRY_OVERRIDES[card.id],
  attacks:(card.attacks||[]).map(a=>({name:a.name,cost:a.cost||[],damage:a.damage==null?'':String(a.damage),text:toText(a.effect)})),
  abilities:(card.abilities||[]).map(a=>({name:a.name,text:toText(a.effect),type:a.type||'Pokémon Power'})),
  retreatCost:Array.from({length:card.retreat||0},()=> 'Colorless'),
  weaknesses:card.weaknesses||[],resistances:card.resistances||[],
  rules:card.effect?[card.effect]:card.trainerType?[card.trainerType]:[],
  images:card.image?{small:card.image+'/low.webp',large:card.image+'/high.webp'}:{},
  source:'TCGdex',sourceId:card.id
 };
 // Restore historical Neo Discovery Powers omitted or unnamed in upstream
 // imports; keep these corrections reproducible when the archive is refreshed.
 const neoPowerFixes={
  'neo2-68':{name:'[Increase]',text:'When you play Unown [I] from your hand, you may search your deck for a card with Unown in its name and put it onto your Bench. Shuffle your deck afterward. You cannot use this power if your Bench is full.'},
  'neo2-50':{name:'[Normal]',text:'Whenever a Colorless Pokémon damages 1 of your Pokémon, reduce that damage by 30 (after applying Weakness and Resistance). This power stops working if you have more than 1 Unown [N] in play. This power works even if Unown [N] is Asleep, Confused, or Paralyzed.'},
  'neo2-60':{name:'Revive Fossil',text:'Once during your turn (before your attack), you may flip a coin. If heads, search your deck for a card that evolves from Mysterious Fossil and put it onto your Bench. Shuffle your deck afterward. Treat that card as a Basic Pokémon. This power cannot be used if Omanyte is Asleep, Confused, or Paralyzed (or if your Bench is full).'}
 };
 if(neoPowerFixes[p.id])p.abilities=[{...neoPowerFixes[p.id],type:'Pokemon Power'}];
 if(isTrainer&&card.trainerType)p.subtypes=[card.trainerType];
 return p;
}
module.exports={normalizeCard};
