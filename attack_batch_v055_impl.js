/* v0.5.5 — choice-aware historical attack handlers. These do not parse arbitrary card text. */
const BATCH55=Object.freeze({
 'basep-15|Texture Magic':'textureMagic',
 'basep-24|Birthday Surprise':'birthdaySurprise',
 'basep-32|Paint':'paint',
 'gym1-3|Fairy Power':'fairyPower',
 'gym1-94|Sleight of Hand':'sleightOfHand',
 'gym2-49|Messenger':'messenger',
 'gym2-90|ESP':'esp',
 'neo3-65|Devastate':'devastate',
 'neo3-66|Gold Scale':'goldScale',
 'neo4-13|Bubble Jump':'bubbleJump',
 'neo4-15|Sweet Kiss':'sweetKiss',
 'neo4-24|Flash Touch':'flashTouch',
 'neo4-26|Knock Over':'knockOver',
 'neo4-36|Call Back':'callBack',
 'basep-10|Cat Punch':'catPunch',
 'neo2-45|Dust Devil':'dustDevil',
 'neo3-27|Crystal Wave':'crystalWave',
 'neo4-3|Tusk Toss':'tuskToss',
 'neo4-47|Flipper Stroke':'flipperStroke',
 'neo4-51|Fish Out':'fishOut',
 'neo4-53|Mysterious Wing':'mysteriousWing',
 'neo4-54|Evolution Song':'evolutionSong',
 'neo2-39|Plunder':'plunder',
 'neo3-24|Swipe':'swipe',
 'neo3-41|Grab':'grab',
});
function batch55Kind(c,a){return BATCH55[`${c?.id}|${a?.name}`]||null}
const batch55Types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function batch55List(game,owner){return [owner.active,...owner.bench].filter(Boolean)}
function batch55CandidateCards(ids,fn){return ids.map((id,index)=>({id,index,card:lookup.get(id)})).filter(x=>fn(x.card,x.index))}
let cpuResumeChoice=null;
function batch55Request(game,index,defer,label,options,run,multi=false,max=1,min=0,defenderPrompt=false){
 deckSearchRequest={attackIndex:index,label,options,multi,min,max,selected:[],defenderPrompt,
 execute(value){const result=run(value);if(defenderPrompt&&result===true&&cpuResumeChoice){const done=cpuResumeChoice;cpuResumeChoice=null;done(true)}return result;}};
 render();return false;
}
function batch55Selection(game,kind,choice,index,defer){
 const p=game.me,f=game.foe,u=p.active,card=game.card(u);
 const own=batch55List(game,p),opp=batch55List(game,f),human=game.turn===0;
 const ask=(label,opts,fn,multi=false,max=1,min=0)=>batch55Request(game,index,defer,`${card.name}'s ${kind}: ${label}`,opts,fn,multi,max,min);
 const optsFrom=(array,label)=>array.map((x,j)=>({index:j,name:label(x,j)}));
 const askDefender=(label,opts,fn,multi=false,min=0,max=opts.length)=>game.turn===1?batch55Request(game,index,defer,`${card.name}: defender ${label}`,opts,fn,multi,max,min,true):null;
 const maybePrompt=(opts,label,multi=false,min=0,max=opts.length)=>{
  if(choice===null &&human&&opts.length){ask(label,opts,v=>game.attack(index,null,defer,v),multi,max,min);return {ok:false}}
  return null;
 };
 const select=(options,allowNone=false)=>{
  const v=choice===null?options[0]?.index??-1:choice;
  if(v===-1&&allowNone)return {ok:true,value:null};
  const o=options.find(x=>x.index===v);return o?{ok:true,value:o}:{ok:false};
 };

 if(kind==='plunder')return {ok:true,data:null};
 if(kind==='swipe')return {ok:true,data:{heads:coin('Swipe — discard attached Trainers')}};
 if(kind==='grab'){
  const opts=opp.flatMap((v,slot)=>(v.attachedTrainers||[]).map((x,j)=>({index:slot*100+j,name:`${game.card(v).name} — ${lookup.get(x.id)?.name||x.id}`})));
  if(!opts.length)return {ok:false};
  const prompt=maybePrompt(opts,'choose an opposing attached Trainer');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:result.value.index}:result;
 }
 if(kind==='dustDevil')return {ok:true,data:null};
 if(['catPunch','crystalWave','tuskToss'].includes(kind)){
  const state=game.pending55?.key===kind&&game.pending55.turn===game.turnSerial?game.pending55:{key:kind,turn:game.turnSerial,heads:coin(card.name+' — '+kind)};game.pending55=state;
  if(kind==='catPunch'&&state.heads||kind==='crystalWave'&&state.heads||!f.bench.length)return {ok:true,data:{heads:state.heads,slot:null}};
  // These attacks explicitly give the defender, not the attacker, the decision.
  const opts=f.bench.map((v,index)=>({index,name:game.card(v).name}));
  if(choice===null&&game.turn===1){askDefender('choose a Benched Pokémon',opts,slot=>game.attack(index,null,defer,slot));return {ok:false}}
  const picked=choice===null?opts[0]?.index??null:choice;
  return opts.some(o=>o.index===picked)?{ok:true,data:{heads:state.heads,slot:picked}}:{ok:false};
 }

 if(['flipperStroke','fishOut','mysteriousWing','evolutionSong'].includes(kind)){
  const options=(owner)=>{
   let result=[];
   if(kind==='flipperStroke')result=batch55CandidateCards(owner.deck,(c,j)=>j>=owner.deck.length-3&&energy(c)&&!(c.subtypes||[]).includes('Special')).map(x=>({index:x.index,name:x.card.name+' (top 3)'}));
   else if(['fishOut','mysteriousWing'].includes(kind))result=batch55CandidateCards(owner.discard,c=>c?.supertype==='Pokémon').map(x=>({index:x.index,name:x.card.name+' (discard)'}));
   else if(kind==='evolutionSong'){
    const monsters=batch55List(game,owner);
    for(let pos=0;pos<monsters.length;pos++){
     const pokemon=monsters[pos];for(let j=0;j<owner.deck.length;j++){
      const evolution=lookup.get(owner.deck[j]);if(compatible(evolution,game.card(pokemon)))result.push({index:pos*10000+j,name:`${game.card(pokemon).name} → ${evolution.name}`});
     }
    }
   }
   return result;
  };
  const opOpts=options(f),myOpts=options(p),multi=['fishOut','flipperStroke'].includes(kind),max=kind==='fishOut'?3:kind==='flipperStroke'?3:1;
  let selected=choice;
  if(selected===null)selected={opp:null,own:null};
  if(selected===null||typeof selected!=='object'||Array.isArray(selected))return {ok:false};
  const normalized=(value,opts)=>{
   if(value===null)return null;
   const arr=Array.isArray(value)?value:[value];
   return arr.length<=max&&new Set(arr).size===arr.length&&arr.every(n=>opts.some(x=>x.index===n))?arr:false;
  };
  let opponentPick=normalized(selected.opp,opOpts);
  if(opponentPick===false)return {ok:false};
  if(opponentPick===null){
   if(game.turn===1&&opOpts.length){
    askDefender('choose cards for your side',opOpts,opp=>game.attack(index,null,defer,{...selected,opp}),multi,0,Math.min(max,opOpts.length));return {ok:false};
   }
   // The opposing CPU exercises its optional choice when it benefits its position.
   opponentPick=opOpts.slice(0,max).map(x=>x.index);
  }
  let attackerPick=normalized(selected.own,myOpts);
  if(attackerPick===false)return {ok:false};
  if(attackerPick===null){
   if(game.turn===0&&myOpts.length){ask('choose cards for your side',myOpts,own=>game.attack(index,null,defer,{opp:opponentPick,own}),multi,Math.min(max,myOpts.length),0);return {ok:false}}
   attackerPick=myOpts.slice(0,max).map(x=>x.index);
  }
  return {ok:true,data:{opp:opponentPick,own:attackerPick}};
 }
 if(kind==='birthdaySurprise')return {ok:true,data:{birthday:!!p.isBirthday,heads:p.isBirthday?coin('Birthday Surprise'):false}};
 if(kind==='knockOver'){
  if(!game.stadium)return {ok:true,data:{discard:false}};
  const opts=[{index:1,name:'Discard the Stadium'},{index:0,name:'Leave the Stadium in play'}];
  const prompt=maybePrompt(opts,'choose whether to discard the Stadium');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:{discard:!!result.value.index}}:result;
 }
 if(kind==='paint'){
  const heads=game.pending55?.key==='paint'&&game.pending55?.turn===game.turnSerial?game.pending55.heads:coin('Paint — type change');game.pending55={key:'paint',turn:game.turnSerial,heads};
  if(!heads)return {ok:true,data:{heads:false}};
  const options=batch55Types.map((name,index)=>({index,name}));
  const prompt=maybePrompt(options,'choose the new type');if(prompt)return prompt;
  const selected=select(options);return selected.ok?{ok:true,data:{heads:true,type:batch55Types[selected.value.index]}}:selected;
 }
 if(kind==='textureMagic'){
  const types=[null,...batch55Types];const options=types.flatMap((res,r)=>types.map((weak,w)=>({index:r*types.length+w,name:`Resistance: ${res||'keep'} · opposing Weakness: ${weak||'keep'}`})));
  // The Power is optional, but a player can select the current weakness/resistance if desired.
  const prompt=maybePrompt(options,'choose Resistance and opposing Weakness');if(prompt)return prompt;
  const selected=select(options);return selected.ok?{ok:true,data:{res:types[Math.floor(selected.value.index/9)],weak:types[selected.value.index%9]}}:selected;
 }
 if(kind==='fairyPower'){
  const key='fairyPower',state=game.pending55?.key===key&&game.pending55.turn===game.turnSerial?game.pending55:{key,turn:game.turnSerial,heads:coin('Fairy Power')};game.pending55=state;
  if(!state.heads)return {ok:true,data:[]};
  const options=own.map((poke,index)=>({index,name:`${game.card(poke).name} (${index?'Bench '+index:'Active'})`}));
  if(choice===null&&human)return maybePrompt(options,'choose any Pokémon to return to hand',true,0,options.length);
  const indices=choice===null?[]:choice;
  if(!Array.isArray(indices)||new Set(indices).size!==indices.length||indices.some(x=>!options.some(o=>o.index===x)))return {ok:false};
  return {ok:true,data:indices};
 }
 if(kind==='sleightOfHand'){
  const allHand=optsFrom(p.hand,(id,i)=>`${lookup.get(id)?.name||id} (hand ${i+1})`);
  let selected=choice;
  if(selected===null){if(human)return maybePrompt(allHand,'choose up to three cards to return to deck',true,0,Math.min(3,allHand.length));selected=[];}
  if(Array.isArray(selected))selected={give:selected,take:null};
  if(!selected||!Array.isArray(selected.give)||selected.give.length>3||new Set(selected.give).size!==selected.give.length||selected.give.some(x=>!allHand.some(o=>o.index===x)))return {ok:false};
  const newDeck=[...p.deck,...selected.give.map(j=>p.hand[j])],energyOpts=batch55CandidateCards(newDeck,c=>energy(c)&&!(c.subtypes||[]).includes('Special')).map(x=>({index:x.index,name:x.card.name+' (deck '+(x.index+1)+')'}));
  const max=Math.min(selected.give.length,energyOpts.length);
  if(selected.take===null){
   if(human&&max){ask('choose the Basic Energy to retrieve',energyOpts,take=>game.attack(index,null,defer,{give:selected.give,take}),true,max,max);return {ok:false}}
   selected={...selected,take:energyOpts.slice(0,max).map(x=>x.index)};
  }
  if(!Array.isArray(selected.take)||selected.take.length!==max||new Set(selected.take).size!==max||selected.take.some(j=>!energyOpts.some(x=>x.index===j)))return {ok:false};
  return {ok:true,data:selected};
 }
 if(kind==='messenger'){
  const opts=batch55CandidateCards(p.deck,c=>c?.supertype==='Pokémon'&&c.name!==card.name).map(x=>({index:x.index,name:x.card.name}));
  const prompt=maybePrompt(opts,'choose a Basic or Evolution Pokémon from deck');if(prompt)return prompt;
  const result=select(opts,true);return result.ok?{ok:true,data:result.value?.index??-1}:result;
 }
 if(kind==='esp'){
  const state=game.pending55?.key==='esp'&&game.pending55.turn===game.turnSerial?game.pending55:{key:'esp',turn:game.turnSerial,heads:[1,2,3].filter(n=>coin('ESP — flip '+n)).length};game.pending55=state;
  if(state.heads!==3)return {ok:true,data:{heads:state.heads}};
  const opts=(game.card(f.active)?.attacks||[]).map((attack,index)=>({index,name:attack.name}));
  if(!opts.length)return {ok:true,data:{heads:3,copy:null}};
  const prompt=maybePrompt(opts,'choose a Defending Pokémon attack to copy');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:{heads:3,copy:result.value.index}}:result;
 }
 if(kind==='devastate'){
  const opts=u.energies.map((id,index)=>({index,name:lookup.get(id)?.name||id}));
  if(opts.length<2)return {ok:false};
  let selected=choice;
  if(selected===null){if(human)return maybePrompt(opts,'discard exactly 2 attached Energy',true,2,2);selected=[0,1];}
  if(Array.isArray(selected))selected={cost:selected,remove:null};
  if(!Array.isArray(selected?.cost)||selected.cost.length!==2||new Set(selected.cost).size!==2||selected.cost.some(v=>!opts.some(x=>x.index===v)))return {ok:false};
  const state=game.pending55?.key==='devastate'&&game.pending55.turn===game.turnSerial?game.pending55:{key:'devastate',turn:game.turnSerial,heads:coin('Devastate — discard opponent Energy')};game.pending55=state;
  const targets=opp.map((v,i)=>({v,i})).filter(({v})=>v.energies.length);
  if(state.heads&&targets.length){
   const options=targets.flatMap(({v,i})=>v.energies.map((id,e)=>({index:i*100+e,name:`${game.card(v).name} (${i?'Bench '+i:'Active'}) — ${lookup.get(id)?.name||id}`})));
   if(selected.remove===null){if(human){ask('choose one Energy from EACH opposing Pokémon',options,remove=>game.attack(index,null,defer,{...selected,remove}),true,targets.length,targets.length);return {ok:false}}selected={...selected,remove:targets.map(({i})=>i*100)};}
   const remove=selected.remove;
   if(!Array.isArray(remove)||remove.length!==targets.length||new Set(remove).size!==remove.length||remove.some(x=>!options.some(o=>o.index===x))||targets.some(({i})=>remove.filter(x=>Math.floor(x/100)===i).length!==1))return {ok:false};
  }
  return {ok:true,data:{cost:selected.cost,heads:state.heads,remove:selected.remove||[]}};
 }
 if(kind==='bubbleJump'){
  if(!p.bench.length||u.energies.length<2)return {ok:true,data:null};
  const state=game.pending55?.key===kind&&game.pending55.turn===game.turnSerial?game.pending55:{key:kind,turn:game.turnSerial,heads:coin('Bubble Jump')};game.pending55=state;
  if(!state.heads)return {ok:true,data:null};
  const opts=p.bench.map((v,index)=>({index,name:game.card(v).name}));
  const prompt=maybePrompt(opts,'choose the Benched Pokémon to receive 2 Energy');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:{bench:result.value.index}}:result;
 }
 if(kind==='flashTouch'){
  if(!p.bench.length)return {ok:true,data:null};
  const opts=p.bench.map((v,index)=>({index,name:game.card(v).name}));
  const prompt=maybePrompt(opts,'choose your replacement Active Pokémon');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:result.value.index}:result;
 }
 if(kind==='callBack'){
  if(p.bench.length===5||f.bench.length===5)return {ok:false};
  const opts=batch55CandidateCards(f.discard,c=>c?.supertype==='Pokémon'&&(basic(c)||(c.subtypes||[]).includes('Baby'))).map(x=>({index:x.index,name:x.card.name}));
  if(!opts.length)return {ok:false};
  const prompt=maybePrompt(opts,'choose a Pokémon from opposing discard');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:result.value.index}:result;
 }
 if(['goldScale','sweetKiss'].includes(kind)){
  const opts=[{index:1,name:kind==='goldScale'?'Draw 2 cards':'Draw 1 card'},{index:0,name:'Do not draw'}];
  if(choice===null&&game.turn===1){askDefender('choose whether to draw',opts,answer=>game.attack(index,null,defer,answer));return {ok:false}}
  const selected=choice===null?((kind==='goldScale'?f.deck.length>=2:f.deck.length>0)?1:0):choice;
  return opts.some(o=>o.index===selected)?{ok:true,data:{opponentDraw:!!selected}}:{ok:false};
 }
 return {ok:false};
}
function batch55After(game,kind,data,a,u,p,f){
 const own=batch55List(game,p),opp=batch55List(game,f);
 const bounce=(pokemon,side)=>{side.hand.push(pokemon.id,...pokemon.under,...pokemon.energies);if(pokemon===side.active){side.active=side.bench.shift()||null}else side.bench.splice(side.bench.indexOf(pokemon),1);};
 switch(kind){
  case 'plunder':break; // Resolved in the pre-damage step.
  case 'swipe':if(data.heads)for(const v of opp){f.discard.push(...(v.attachedTrainers||[]).map(x=>x.id));v.attachedTrainers=[]}break;
  case 'grab':{
   const slot=Math.floor(data/100),j=data%100,v=opp[slot],tool=v?.attachedTrainers?.splice(j,1)[0];
   if(tool){f.deck=shuffle([...f.deck,tool.id]);}break;
  }
  case 'catPunch':if(!data.heads&&data.slot!==null){const victim=f.bench[data.slot];if(victim&&!game.unitHasPower(f.active,'Aurora Veil'))victim.damage+=20;}break;
  case 'crystalWave':if(!data.heads&&data.slot!==null&&f.active&&f.active.damage<game.maxHP(f.active)){
   [f.active,f.bench[data.slot]]=[f.bench[data.slot],f.active];
   const retreated=f.bench[data.slot];retreated.status=null;retreated.poison=false;retreated.burn=false;
  }break;
  case 'tuskToss':if(f.bench.length){if(data.heads)bounce(f.active,f);else if(data.slot!==null){[f.active,f.bench[data.slot]]=[f.bench[data.slot],f.active];const old=f.bench[data.slot];old.status=null;old.poison=false;old.burn=false;}}break;
  case 'dustDevil':for(const side of [p,f])for(const target of batch55List(game,side))if(!game.card(target)?.types?.includes('Fighting'))target.damage+=10;break;
  case 'flipperStroke':{
   for(const {owner,picks} of [{owner:f,picks:data.opp},{owner:p,picks:data.own}]){
    for(const j of [...picks].sort((a,b)=>b-a)){const [id]=owner.deck.splice(j,1);owner.hand.push(id)}
    owner.deck=shuffle(owner.deck);
   }break;
  }
  case 'fishOut':{
   for(const {owner,picks} of [{owner:f,picks:data.opp},{owner:p,picks:data.own}]){
    for(const j of [...picks].sort((a,b)=>b-a)){const [id]=owner.discard.splice(j,1);owner.deck.push(id)}
    if(picks.length)owner.deck=shuffle(owner.deck);
   }break;
  }
  case 'mysteriousWing':{
   for(const {owner,picks} of [{owner:f,picks:data.opp},{owner:p,picks:data.own}])if(picks.length){const [id]=owner.discard.splice(picks[0],1);owner.hand.push(id)}
   break;
  }
  case 'evolutionSong':{
   for(const {owner,picks} of [{owner:f,picks:data.opp},{owner:p,picks:data.own}]){
    if(picks.length){const pos=Math.floor(picks[0]/10000),j=picks[0]%10000,target=batch55List(game,owner)[pos],id=owner.deck.splice(j,1)[0];
     if(target&&id){target.under=[target.id,...target.under];target.id=id;target.playedTurn=game.round;target.status=null;target.poison=false;target.burn=false;target.powerUses={};game.onPlayEvolution(target,lookup.get(id));}
     owner.deck=shuffle(owner.deck);
    }
   }break;
  }
  case 'birthdaySurprise':break;
  case 'knockOver':if(data.discard){game.discardStadium();}break;
  case 'paint':if(data.heads){f.active.coloringType=data.type;game.log(`${game.card(f.active).name} changes type to ${data.type}.`)}break;
  case 'textureMagic':if(data.res)u.temporaryResistance=data.res;if(data.weak&&game.card(f.active).weaknesses?.length)f.active.temporaryWeakness=data.weak;break;
  case 'fairyPower':for(const i of [...data].sort((a,b)=>b-a)){const target=own[i];if(target)bounce(target,p)}break;
  case 'sleightOfHand':{
   const returned=data.give.map(j=>p.hand[j]);for(const j of [...data.give].sort((a,b)=>b-a))p.hand.splice(j,1);
   p.deck.push(...returned);const found=data.take.map(j=>p.deck[j]);for(const j of [...data.take].sort((a,b)=>b-a))p.deck.splice(j,1);
   p.hand.push(...found);p.deck=shuffle(p.deck);break;
  }
  case 'messenger':{
   const candidate=data>=0?p.deck[data]:null;
   if(candidate){p.hand.push(candidate);p.deck.splice(data,1)}
   const stack=[u.id,...u.under,...u.energies];p.deck=shuffle([...p.deck,...stack]);p.active=p.bench.shift()||null;break;
  }
  case 'esp':if(data.heads===1)game.draw(p);break;
  case 'devastate':{
   const costs=[...data.cost].sort((a,b)=>b-a);for(const e of costs)p.discard.push(u.energies.splice(e,1)[0]);
   for(const victim of f.bench)if(!game.unitHasPower(f.active,'Aurora Veil'))victim.damage+=10;
   if(data.heads)for(const code of [...data.remove].sort((a,b)=>b-a)){const target=opp[Math.floor(code/100)];if(target){const [id]=target.energies.splice(code%100,1);if(id)f.discard.push(id)}}
   break;
  }
  case 'goldScale':if(data.opponentDraw)game.draw(f,2);game.draw(p,2);break;
  case 'sweetKiss':if(data.opponentDraw)game.draw(f);break;
  case 'bubbleJump':if(data!==null){const target=p.bench[data.bench];if(target){target.energies.push(...u.energies.splice(0,2));bounce(u,p)}}break;
  case 'flashTouch':if(data!==null){[p.active,p.bench[data]]=[p.bench[data],p.active];p.active.immunityConditionUntilBenched=true;}break;
  case 'callBack':{
   const id=f.discard.splice(data,1)[0],v=unit(id);v.damage=10;v.playedTurn=game.round;f.bench.push(v);break;
  }
 }
}
