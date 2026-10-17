'use strict';
// Historic Neo Genesis / Discovery attack signatures; fail closed when text changes.
const cards=[...require('./cards/neo1.json'),...require('./cards/neo2.json')];
const defs={
 'neo1-21|Rapid Spin':'rapid-spin',
 'neo1-26|Pilfer':'pilfer',
 'neo1-29|Sweet Scent':'sweet-scent',
 'neo1-30|Squaredance':'squaredance',
 'neo1-39|Baton Pass':'baton-pass',
 'neo1-46|Fire Wind':'fire-wind',
 'neo1-52|Prophecy':'prophecy',
 'neo2-2|Rapid Spin':'rapid-spin',
 'neo2-7|Lock-on':'lock-on',
 'neo2-7|Electric Bolt':'electric-bolt',
 'neo2-16|Counter':'counter',
 'neo2-21|Rapid Spin':'rapid-spin',
 'neo2-26|Lock-on':'lock-on',
 'neo2-26|Electric Bolt':'electric-bolt',
 'neo2-32|Pursuit':'pursuit',
 'neo2-35|Counter':'counter',
 'neo2-41|Secrete Poison':'secrete-poison',
 'neo2-44|Belly Drum':'belly-drum',
 'neo2-56|Work Together':'work-together'
};
const bySignature=new Map();
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),card=cards.find(c=>c.id===id),attack=card?.attacks?.find(a=>a.name===name);
 if(!attack)throw Error('Missing printed Neo attack '+key);
 const signature=JSON.stringify([attack.name,attack.damage||'',attack.text||'']);
 const program=Object.freeze(kind==='prophecy'?{kind:'prophecy',damage:0}:{kind:'neo49:'+kind,damage:Number.parseInt(attack.damage,10)||0});
 const existing=bySignature.get(signature);
 if(existing&&existing.kind!==program.kind)throw Error('Conflicting attack signature '+key);
 bySignature.set(signature,program);
}
function compile(a){return bySignature.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'']))||null;}
function resolve(p,flip,ctx={}){
 if(!p?.kind?.startsWith('neo49:'))throw Error('Invalid Neo v0.49 attack');
 const type=p.kind.slice(6),r={damage:p.damage,flips:[],neo49:type};
 const coin=()=>{const heads=Boolean(flip());r.flips.push(heads);return heads;};
 switch(type){
  case 'rapid-spin':r.neo49Rapid=true;break;
  case 'pilfer':r.damage=0;r.neo49Pilfer=coin();break;
  case 'sweet-scent':r.damage=0;r.neo49SweetScent=coin()?'self':'enemy';break;
  case 'squaredance':{
   r.damage=0;const count=ctx.totalPokemon||0;
   if(!Number.isInteger(count)||count<0||count>12)throw Error('Invalid Squaredance Pokémon count');
   for(let i=0;i<count;i++)coin();
   r.neo49Heads=r.flips.filter(Boolean).length;break;
  }
  case 'baton-pass':r.neo49Baton=true;break;
  case 'fire-wind':r.neo49FireWind=Number(coin())+Number(coin());break;
  case 'prophecy':r.damage=0;r.neo49Prophecy=true;break;
  case 'lock-on':r.damage=0;r.neo49LockOn=true;break;
  case 'electric-bolt':{
   const locked=Boolean(ctx.neo49Locked);
   const hits=Number(locked||coin())+Number(locked||coin());
   if(locked)r.flips=[true,true];
   if(hits!==2)r.damage=0;else r.status='Paralyzed';break;
  }
  case 'counter':r.damage=0;r.neo49Counter=true;break;
  case 'pursuit':r.neo49Pursuit=true;break;
  case 'secrete-poison':r.damage=0;r.neo49SecretePoison=true;break;
  case 'belly-drum':r.damage=0;r.neo49BellyDrum=true;break;
  case 'work-together':if(coin())r.damage+=10*(ctx.neo49Fossils||0);break;
  default:throw Error('Unported Neo v0.49 type '+type);
 }
 return r;
}
module.exports={defs,compile,resolve};
