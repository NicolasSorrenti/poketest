'use strict';
// Exact Neo card signatures. Unknown text remains unsupported, never plain damage.
const cardSets={neo1:require('./cards/neo1.json'),neo2:require('./cards/neo2.json'),neo3:require('./cards/neo3.json'),neo4:require('./cards/neo4.json')};
const mapping={
 'neo1-1|Gigaspark':'spark',
 'neo1-2|Bubble Shower':'spark',
 'neo1-3|Flower Dance':'bellossom-dance',
 'neo1-4|Chomp':'chomp',
 'neo1-5|Riptide':'riptide',
 'neo1-14|Mind Blast':'mind-blast',
 'neo1-17|Flame Burst':'flame-burst',
 'neo1-25|Beat Up':'beat-up',
 'neo1-37|Raging Charge':'raging-charge',
 'neo1-41|Milk Drink':'milk-drink',
 'neo2-6|Hydrocutter':'hydrocutter',
 'neo2-8|Doubleslap':'double-slap',
 'neo2-10|False Swipe':'false-swipe',
 'neo2-10|Double Claw':'double-claw',
 'neo2-12|Slam':'slam',
 'neo2-15|Double Lariat':'double-lariat',
 'neo2-18|Pin Missile':'pin-missile',
 'neo3-1|Gigavolt':'gigavolt',
 'neo3-3|Psychic Damage':'psychic-damage',
 'neo3-4|Cross Attack':'cross-attack',
 'neo3-8|Black Fang':'black-fang',
 'neo4-1|Shock Bolt':'shock-bolt',
 'neo4-8|Curve Attack':'curve-attack',
 'neo4-11|Mountain Smasher':'mountain-smasher',
 'neo4-12|Gentle Flames':'gentle-flames'
};
const programs=new Map();
for(const [key,kind] of Object.entries(mapping)){
 const id=key.slice(0,key.indexOf('|')),attackName=key.slice(key.indexOf('|')+1);
 const card=cardSets[id.split('-')[0]].find(c=>c.id===id);
 if(!card)throw Error('Missing Neo card '+id);
 const attack=card.attacks?.find(a=>a.name===attackName);
 if(!attack)throw Error('Missing Neo attack '+key);
 const signature=JSON.stringify([attack.name,attack.damage||'',attack.text||'']);
 const candidate=Object.freeze({kind:'neo40:'+kind,damage:Number.parseInt(attack.damage,10)||0,owner:id,name:attack.name});
 if(programs.has(signature)&&programs.get(signature).kind!==candidate.kind)throw Error('Ambiguous Neo attack signature '+key);
 programs.set(signature,candidate);
}
const compile=a=>programs.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'']))||null;
const rollCount=(flip,n)=>Array.from({length:Math.max(0,Math.min(100,n))},()=>Boolean(flip()));
function resolve(p,flip,ctx={}){
 if(!p||!p.kind.startsWith('neo40:'))throw Error('Unknown Neo v0.40 attack');
 const kind=p.kind.slice(6),base=p.damage;
 const out={damage:base,flips:[]};
 const flipOne=()=>{const b=Boolean(flip());out.flips.push(b);return b;};
 const flipMany=n=>{const r=rollCount(flip,n);out.flips.push(...r);return r.filter(Boolean).length;};
 switch(kind){
  case 'spark':if(flipOne()){out.status='Paralyzed';out.benchSide='opponent';out.benchDamage=10;}break;
  case 'bellossom-dance':out.damage=30*(ctx.bellossomCount||0);break;
  case 'chomp':out.damage=50+10*flipMany(ctx.selfCounters||0);break;
  case 'riptide':out.damage=10+10*(ctx.discardEnergyCount||0);out.shuffleDiscardEnergies=true;break;
  case 'mind-blast':if(flipOne()){out.damage+=10;out.status='Confused';}break;
  case 'flame-burst':if(flipOne()){out.damage+=20;out.selfDamage=20;}break;
  case 'beat-up':out.damage=20*flipMany(ctx.ownPokemonCount||0);break;
  case 'raging-charge':out.damage=10+10*(ctx.selfCounters||0);out.selfDamage=20;break;
  case 'milk-drink':out.damage=0;out.healSelf=20*flipMany(2);break;
  case 'hydrocutter':out.damage=40*flipMany(Math.min(3,ctx.selfEnergy||0));break;
  case 'double-slap':out.damage=40*flipMany(2);break;
  case 'double-claw':out.damage=20*flipMany(2);break;
  case 'false-swipe':out.damage=Math.floor((ctx.enemyRemainingHP||0)/20)*10;break;
  case 'slam':out.damage=30*flipMany(2);break;
  case 'double-lariat':out.damage=40*flipMany(2);break;
  case 'pin-missile':out.damage=20*flipMany(4);break;
  case 'gigavolt':if(flipOne())out.damage+=20;else out.status='Paralyzed';break;
  case 'psychic-damage':out.damage=0;out.placeCounters=flipMany(3);break;
  case 'cross-attack':{const heads=flipMany(4);out.damage=20*heads;if(heads>=2)out.status='Confused';break;}
  case 'black-fang':out.damage=30+10*flipMany(ctx.selfEnergy||0);break;
  case 'shock-bolt':out.discardAllSelfEnergy=true;break;
  case 'curve-attack':if(flipOne())out.shield={preventDamage:true};break;
  case 'mountain-smasher':{const heads=flipMany(ctx.selfEnergy||0);out.damage=20*heads;out.millOpponent=heads;break;}
  case 'gentle-flames':out.damage=ctx.enemyBaby?10:ctx.enemyBasic?30:50;break;
  default:throw Error('Unported Neo v0.40 attack '+kind);
 }
 return out;
}
module.exports={compile,resolve,programs,mapping};
