'use strict';
// Wizard Black Star promotional printings released during the Neo era.
// Only exact text signatures compile; previously unsupported promos fail closed.
const cards=require('./cards/basep.json');
const defs=Object.freeze({
 'basep-2|Light Screen':'light-screen',
 'basep-4|Recharge':'recharge',
 'basep-7|First Aid':'first-aid',
 'basep-8|Psywave':'psywave',
 'basep-9|Psywave':'psywave',
 'basep-12|Telekinesis':'telekinesis',
 'basep-15|3-D Attack':'3d-attack',
 'basep-20|Fury Swipes':'fury-swipes',
 'basep-22|Diamond Dust':'diamond-dust',
 'basep-31|Eek':'eek',
 'basep-33|Metal Pincer':'metal-pincer',
 'basep-37|Repeating Kick':'repeating-kick',
 'basep-39|Pain Split':'pain-split',
 'basep-43|Seething Anger':'seething-anger',
 'basep-45|Slashing Strike':'slashing-strike',
 'basep-49|Roll Over':'roll-over',
 'basep-50|Leaf Slice':'leaf-slice',
 'basep-52|Sacred Fire':'sacred-fire',
 'basep-53|Hypno Wave':'hypno-wave'
});
const signatures=new Map();
for(const [key,effect] of Object.entries(defs)){
 const [id,name]=key.split('|'),attack=cards.find(x=>x.id===id)?.attacks?.find(a=>a.name===name);
 if(!attack)throw Error('Missing promo printing '+key);
 const signature=JSON.stringify([attack.name,attack.damage||'',attack.text||'']);
 const program=Object.freeze(effect==='recharge'?{kind:'afternoon-nap',damage:0}:
  effect==='telekinesis'?{kind:'target-any',damage:0,targetDamage:30}:
  {kind:'promo86:'+effect,damage:Number.parseInt(attack.damage,10)||0});
 const before=signatures.get(signature);
 if(before&&JSON.stringify(before)!==JSON.stringify(program))throw Error('Conflicting promo text '+key);
 signatures.set(signature,program);
}
function compile(attack){return signatures.get(JSON.stringify([attack?.name,attack?.damage||'',attack?.text||'']))||null;}
function resolve(program,flip,ctx={}){
 if(!program?.kind?.startsWith('promo86:'))throw Error('Not a promo86 program');
 const kind=program.kind.slice(8),r={damage:program.damage,flips:[]};
 const coin=()=>{const heads=Boolean(flip());r.flips.push(heads);return heads;};
 switch(kind){
  case 'light-screen':r.shield={half:true};break;
  case 'first-aid':r.healSelf=10;break;
  case 'psywave':r.damage=10*(ctx.enemyEnergy||0);break;
  case '3d-attack':case 'fury-swipes':case 'leaf-slice':{
   const flips=kind==='leaf-slice'?2:3,each=kind==='3d-attack'?20:kind==='fury-swipes'?10:20;
   r.damage=0;for(let i=0;i<flips;i++)if(coin())r.damage+=each;break;
  }
  case 'diamond-dust':if(coin()){r.status='Paralyzed';r.benchSide='opponent';r.benchDamage=10;}break;
  case 'eek':r.draw=2;break;
  case 'metal-pincer':case 'repeating-kick':{
   let heads=0;while(heads<1000){if(!coin())break;heads++;}
   if(heads===1000)throw Error('Unterminated promo coin sequence');
   r.damage=(kind==='metal-pincer'?30:0)+heads*(kind==='metal-pincer'?10:20);break;
  }
  case 'pain-split':r.placeCounters=ctx.selfCounters||0;break;
  case 'seething-anger':{
   const n=ctx.selfCounters||0;
   if(!Number.isInteger(n)||n<0||n>100)throw Error('Invalid damage counter count');
   r.damage=20;for(let i=0;i<n;i++)if(coin())r.damage+=10;break;
  }
  case 'slashing-strike':r.disableThisAttack=true;break;
  case 'roll-over':r.selfStatus='Asleep';if(coin())r.status='Asleep';break;
  case 'sacred-fire':r.damage=coin()?60:20;break;
  case 'hypno-wave':if(coin())r.damage=50;else r.status='Asleep';break;
  default:throw Error('Unsupported promo effect '+kind);
 }
 return r;
}
module.exports={defs,compile,resolve};