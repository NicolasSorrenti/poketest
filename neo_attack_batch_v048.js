'use strict';
// Neo milestone: exact imported attack signatures only. Never compile by name.
const cards=[...require('./cards/neo1.json'),...require('./cards/neo2.json'),...require('./cards/neo4.json')];
const kinds={
 'neo1-3|Sweet Nectar':'sweet-nectar',
 'neo1-9|Elemental Blast':'elemental-blast',
 'neo1-12|Zzzap':'zzzap',
 'neo1-18|Flame Wheel':'flame-wheel',
 'neo1-24|Mean Look':'mean-look',
 'neo1-24|Feint Attack':'feint-attack',
 'neo1-28|Pollen Shield':'pollen-shield',
 'neo1-43|Endure':'endure',
 'neo1-44|Freeze':'freeze',
 'neo1-54|Growl':'growl',
 'neo1-78|Growth':'growth',
 'neo2-4|Crunch':'crunch',
 'neo2-4|Flamethrower':'flamethrower',
 'neo2-5|Collect Fire':'collect-fire',
 'neo2-12|Trample':'trample',
 'neo2-13|Feint Attack':'feint-attack',
 'neo2-17|Shockwave':'shockwave',
 'neo2-18|Triple Poison':'triple-poison',
 'neo2-61|Burst':'burst',
 'neo2-71|Slime':'slime',
 'neo4-46|Burning Flame':'burning-flame',
 'neo4-109|Psyburst':'psyburst'
};
const programs=new Map();
for(const [key,kind] of Object.entries(kinds)){
 const [id,name]=key.split('|'),c=cards.find(c=>c.id===id),a=c?.attacks?.find(a=>a.name===name);
 if(!a)throw Error('Missing Neo printing '+key);
 const sig=JSON.stringify([a.name,a.damage||'',a.text||'']);
 const value=Object.freeze({kind:'neo48:'+kind,damage:Number.parseInt(a.damage,10)||0});
 const before=programs.get(sig);if(before&&JSON.stringify(before)!==JSON.stringify(value))throw Error('Conflicting Neo attack '+key);
 programs.set(sig,value);
}
function compile(a){return programs.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'']))||null;}
function resolve(p,flip,ctx={}){
 if(!p?.kind?.startsWith('neo48:'))throw Error('Wrong Neo v0.48 program');
 const kind=p.kind.slice(6),o={damage:p.damage,flips:[],neo48:kind};
 const coin=()=>{const r=Boolean(flip());o.flips.push(r);return r;};
 switch(kind){
  case 'sweet-nectar':o.damage=0;if(coin())o.healFullChoice=true;break;
  case 'elemental-blast':o.neo48DiscardColors=true;break;
  case 'zzzap':o.damage=0;o.neo48Zzzap=true;break;
  case 'flame-wheel':o.benchSide='both';o.benchDamage=20;o.neo48EnergyDiscard=3;break;
  case 'mean-look':o.damage=0;o.neo48MeanLook=true;break;
  case 'feint-attack':o.targetDamage=p.damage||20;o.damage=0;o.ignoreWR=true;o.ignoreDefendingEffects=true;break;
  case 'pollen-shield':o.neo48PollenShield=true;break;
  case 'endure':o.damage=0;if(coin())o.neo48Endure=true;break;
  case 'freeze':if(coin())o.neo48Freeze=true;break;
  case 'growl':o.damage=0;o.neo48Growl=true;break;
  case 'growth':o.damage=0;if(coin())o.neo48Growth=true;break;
  case 'crunch':o.neo48Crunch=true;break;
  case 'flamethrower':o.neo48EnergyDiscard=1;break;
  case 'burning-flame':{const heads=Number(coin())+Number(coin());o.neo48BurningHeads=heads;o.damage=30+heads*20;break;}
  case 'psyburst':o.neo48EnergyDiscard=1;o.damage=40+(ctx.enemyEnergy||0)*10;break;
  case 'collect-fire':o.neo48CollectFire=true;break;
  case 'trample':o.neo48Trample=true;break;
  case 'shockwave':o.damage=0;o.neo48Shockwave=true;o.neo48ShockwaveDamage=coin();break;
  case 'triple-poison':if(coin()){o.status='Poisoned';o.poisonDamage=30;}break;
  case 'burst':{
   const first=coin(),second=coin();if(first){o.selfDamage=40;o.benchSide='both';o.benchDamage=10;}
   if(!second){o.damage=0;o.selfDamage=0;o.benchSide=undefined;}break;
  }
  case 'slime':o.neo48Slime=true;break;
  default:throw Error('Unsupported Neo v0.48 effect '+kind);
 }
 return o;
}
module.exports={kinds,programs,compile,resolve};
