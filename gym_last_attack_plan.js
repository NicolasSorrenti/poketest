'use strict';
// Interactive final Gym Heroes/Challenge attacks. Choices are executed through
// the existing authoritative decision queue, not inferred from client inputs.
const {makeDecision}=require('./decision_core');
const {canEvolve,isBasicPokemon}=require('./core_rules');
const KINDS=new Set(['fairy-power','take-away','call-night','electric-current','flytrap','kindle','sleight-hand','flame-jet','growth','super-removal','earthdrill','overhead-toss','errand','lunar-power','messenger','invigorate','magic-darts','pranks','overrun','group-attack','amnesia']);
const prefix='gym:last-';
function planned(kind){return typeof kind==='string'&&kind.startsWith(prefix)&&KINDS.has(kind.slice(prefix.length));}
function run(g,side,index,program,plan,h){
 const p=g.players[side],f=g.players[1-side],u=p.active,kind=program.kind.slice(prefix.length),d=plan?.data||{};
 const opts=(ids,where)=>ids.map((id,i)=>({id:`${where}:${i}`,label:h.card(g,id).name}));
 const bench=owner=>owner.bench.map((x,i)=>({id:`bench:${i}`,label:h.card(g,x.id).name}));
 const slotList=owner=>[...(owner.active?[{id:'slot:-1',label:'Active: '+h.card(g,owner.active.id).name}]:[]),...owner.bench.map((x,i)=>({id:`slot:${i}`,label:'Bench: '+h.card(g,x.id).name}))];
 const energy=owner=>owner.energies.map((id,i)=>({id:`energy:${i}`,label:h.card(g,id).name}));
 const prompt=(key,actor,options,{min=1,max=min,label=key}={})=>{
  if(Object.hasOwn(d,key))return false;
  if(!options.length||max===0){d[key]=[];return false;}
  g.nextDecisionId++;
  g.pendingDecision=makeDecision({id:`gymlast:${g.nextDecisionId}`,actor,kind:key,label,options,min,max,optional:min===0});
  g.pendingAction={kind:'gym_last_attack',plan:{side,attackIndex:index,data:d,await:key}};
  return true;
 };
 const pick=(key)=>Number(d[key][0].split(':').at(-1));
 // One roll, cached across the entire decision chain.
 if(!d.roll)d.roll=h.resolve(program,()=>h.flip(g),{});
 const heads=d.roll.flips[0];
 switch(kind){
  case 'fairy-power':if(heads&&prompt('returns',side,slotList(p),{min:0,max:p.bench.length+1,label:'Return any of your Pokémon and attachments to hand'}))return;break;
  case 'electric-current':
   if(!u.energies.some(id=>h.card(g,id).name==='Lightning Energy'))throw Error('Electric Current requires a Lightning Energy');
   if(prompt('energy',side,energy(u).filter(x=>h.card(g,u.energies[Number(x.id.slice(7))]).name==='Lightning Energy'),{label:'Choose Lightning Energy to move'}))return;
   if(p.bench.length&&prompt('bench',side,bench(p),{label:'Attach the Lightning Energy to which Benched Pokémon?'}))return;
   break;
  case 'flytrap':if(!f.bench.length)throw Error('Flytrap needs an opponent Bench');if(prompt('bench',side,bench(f),{label:'Choose opposing Pokémon to pull Active before damage'}))return;break;
  case 'kindle':
   if(prompt('energy',side,energy(u),{label:'Discard an attached Energy to use Kindle'}))return;
   if(f.active.energies.length&&prompt('enemy',side,energy(f.active),{label:'Choose Energy to discard from the Defending Pokémon'}))return;break;
  case 'sleight-hand':{
   const count=Math.min(3,p.hand.length);
   if(prompt('top',side,opts(p.hand,'hand'),{min:0,max:count,label:'Put up to three hand cards on your deck'}))return;
   const found=p.deck.flatMap((id,i)=>/^(Grass|Fire|Water|Lightning|Psychic|Fighting) Energy$/.test(h.card(g,id).name)?[{id:`deck:${i}`,label:h.card(g,id).name}]:[]);
   if(prompt('found',side,found,{min:0,max:Math.min((d.top||[]).length,found.length),label:'Find that many basic Energy cards (or fewer)'}))return;
   break;
  }
  case 'flame-jet':if(heads&&prompt('target',side,slotList(f),{label:'Choose opponent Pokémon to take 40 damage'}))return;break;
  case 'growth':if(heads){const pool=p.hand.flatMap((id,i)=>h.card(g,id).name==='Grass Energy'?[{id:`hand:${i}`,label:'Grass Energy'}]:[]);if(prompt('hand',side,pool,{min:0,max:Math.min(2,pool.length),label:'Attach up to 2 Grass Energy'}))return;}break;
  case 'super-removal':if(heads)for(const [si,v] of [[-1,f.active],...f.bench.map((x,i)=>[i,x])])if(v.energies.length&&prompt('energy'+si,side,energy(v),{label:`Discard Energy from ${h.card(g,v.id).name}`}))return;break;
  case 'earthdrill':if(u.gymLieLowSerial!==g.turnSerial-2)throw Error('Earthdrill requires Lie Low on your previous turn');break;
  case 'overhead-toss':if(!heads&&p.bench.length&&prompt('bench',side,bench(p),{label:'Choose your Benched Pokémon to take 20 damage'}))return;break;
  case 'errand':if(heads){const found=p.deck.flatMap((id,i)=>h.card(g,id).supertype==='Trainer'?[{id:`deck:${i}`,label:h.card(g,id).name}]:[]);if(prompt('found',side,found,{min:0,max:1,label:'Search deck for a Trainer'}))return;}break;
  case 'lunar-power':if(heads){const found=p.bench.flatMap((x,s)=>p.deck.flatMap((id,i)=>canEvolve(h.card(g,id),h.card(g,x.id))?[{id:`evo:${s}:${i}`,label:`${h.card(g,x.id).name} → ${h.card(g,id).name}`}]:[]));if(prompt('evolve',side,found,{min:0,max:1,label:'Evolve one of your Benched Pokémon from deck'}))return;}break;
  case 'messenger':{const found=p.deck.flatMap((id,i)=>h.card(g,id).supertype==='Pokémon'&&h.card(g,id).name!=="Koga's Pidgey"?[{id:`deck:${i}`,label:h.card(g,id).name}]:[]);if(prompt('found',side,found,{min:0,max:1,label:'Find a different Pokémon in your deck'}))return;break;}
  case 'invigorate':{
   const found=g.players.flatMap((owner,si)=>owner.bench.length<5?owner.discard.flatMap((id,i)=>isBasicPokemon(h.card(g,id))?[{id:`revive:${si}:${i}`,label:`${owner.name}: ${h.card(g,id).name}`}]:[]):[]);
   if(!found.length)throw Error('Invigorate requires a Basic Pokémon in a discard pile and Bench space');
   if(prompt('revive',side,found,{label:'Choose a Basic Pokémon to revive on its owner’s Bench'}))return;break;
  }
  case 'magic-darts':if(prompt('target',side,slotList(f),{label:'Choose opponent Pokémon for Magic Darts'}))return;break;
  case 'pranks':if(heads){if(!f.discard.length)break;if(prompt('discard',side,opts(f.discard,'discard'),{label:'Put one card from opponent discard on their deck'}))return;}break;
  case 'overrun':if(heads&&f.bench.length&&prompt('bench',side,bench(f),{label:'Choose Bench Pokémon to take 20 damage'}))return;break;
  case 'group-attack':{
   const space=Math.max(0,5-p.bench.length),found=p.deck.flatMap((id,i)=>h.card(g,id).name==="Koga's Zubat"&&isBasicPokemon(h.card(g,id))?[{id:`deck:${i}`,label:h.card(g,id).name}]:[]);
   if(prompt('found',side,found,{min:0,max:Math.min(space,found.length),label:'Put Koga’s Zubat from deck onto Bench'}))return;break;
  }
  case 'amnesia':if(prompt('attack',side,h.card(g,f.active.id).attacks.map((a,i)=>({id:`attack:${i}`,label:a.name})),{label:'Choose an opposing attack to disable'}))return;break;
 }
 h.commit(g,side,index,{gymLastData:d,preRoll:d.roll,gymLastApproved:true,confusionChecked:true,attackPenaltyChecked:true});
}
function answer(g,plan,response,h){const d={...plan.data,[plan.await]:response.decline?[]:[...response.selected]};return run(g,plan.side,plan.attackIndex,h.compile(h.attack(g,plan.side,plan.attackIndex)),{data:d},h);}
module.exports={KINDS,planned,run,answer};
