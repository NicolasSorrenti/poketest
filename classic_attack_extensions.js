'use strict';
// Strict Classic-format compiler extensions. Only listed complete effects compile.
// Each program requires a matching printed damage value and, where relevant,
// a precise text structure. Unknown effects are never downgraded to damage.
const fixed=(kind,damage,extra={})=>Object.freeze({kind,damage,...extra});
function compile(a){
 const text=String(a.text||'').trim(),damage=String(a.damage||'');
 let m;
 if((m=/^Does (\d+) damage plus (\d+) more damage for each Energy card attached to the Defending Pokémon\.$/i.exec(text))&&damage===`${m[1]}+`)return fixed('enemy-energy',Number(m[1]),{factor:Number(m[2])});
 if((m=/^Does (\d+) damage plus (\d+) more damage for each (Nidoking) you have in play\.$/i.exec(text))&&damage===`${m[1]}+`)return fixed('team-name',Number(m[1]),{factor:Number(m[2]),names:['Nidoking'],region:'all'});
 if((m=/^Does (\d+) damage plus (\d+) more damage for each (Magnemite, Magneton, and Dark Magneton) on your Bench\.$/i.exec(text))&&damage===`${m[1]}+`)return fixed('team-name',Number(m[1]),{factor:Number(m[2]),names:['Magnemite','Magneton','Dark Magneton'],region:'bench'});
 if((m=/^Does damage to the Defending Pokémon equal to half the Defending Pokémon's remaining HP \(rounded up to the nearest 10\)\.$/i.exec(text))&&damage==='?')return fixed('half-hp',0);
 if((m=/^Does (\d+) damage plus (\d+) more damage for each (?:attached )?(?:Water|W) Energy attached to (.+?) but not used to pay for (?:this attack's Energy cost|this attack)\.(?: Extra Water Energy after the 2nd (?:doesn't|don't) count\.| You can't add more than (\d+) damage in this way\.)?$/i.exec(text))&&damage===`${m[1]}+`){
  return fixed('water-extra',Number(m[1]),{factor:Number(m[2]),subject:m[3],cap:m[4]?Number(m[4]):20});
 }
 if((m=/^Does (\d+) damage plus (\d+) (?:more )?damage for each Energy attached to (.+?) but not used to pay for this attack(?:'s Energy cost)?\.(?: Extra Energy after the (?:end|2nd) don't count\.| You can't add more than (\d+) damage in this way\.| You can't add more than (\d+) damage this way\.)$/i.exec(text))&&damage===`${m[1]}+`){
  return fixed('extra-energy',Number(m[1]),{factor:Number(m[2]),subject:m[3],cap:Number(m[4]||m[5]||20)});
 }
 if((m=/^Flip a coin\. If (?:heads|tails), this attack does (\d+) damage plus (\d+) more damage; if (?:heads|tails), this attack does (\d+) damage\.$/i.exec(text))&&damage===`${m[1]}+`&&m[1]===m[3]){
  return fixed('coin-more',Number(m[1]),{bonus:Number(m[2]),headsBonus:/If heads/.test(text)});
 }
 if((m=/^Your opponent flips a coin\. If tails, this attack does (\d+) damage plus (\d+) more damage; if heads, this attack does (\d+) damage\.$/i.exec(text))&&damage===`${m[1]}+`&&m[1]===m[3])return fixed('coin-more',Number(m[1]),{bonus:Number(m[2]),headsBonus:false});
 if((m=/^Flip a coin\. If heads, the Defending Pokémon is now (Poisoned|Asleep|Paralyzed|Confused) and (Poisoned|Asleep|Paralyzed|Confused)\.$/i.exec(text))&&/^\d*$/.test(damage))return fixed('coin-double-status',Number(damage||0),{statuses:[m[1],m[2]]});
 if((m=/^Flip a coin\. If heads, (?:the )?Defending Pokémon is now (Poisoned|Asleep|Paralyzed|Confused)\.$/i.exec(text))&&/^\d*$/.test(damage))return fixed('coin-status-alias',Number(damage||0),{status:m[1]});
 if((m=/^(Both the Defending Pokémon and .+ are now Confused|.+ is now Confused) \(after doing damage\)\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('self-confuse',Number(damage),{both:text.startsWith('Both ')});
 if((m=/^Flip a coin\. If tails, (.+) is now Confused \(after doing damage\)\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('coin-self-confuse',Number(damage),{subject:m[1]});
 if((m=/^Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\. (.+) is now Confused \(after doing damage\)\.$/i.exec(text))&&damage===`${m[2]}x`)return fixed('coin-times-confuse',0,{flips:Number(m[1]),each:Number(m[2]),subject:m[3]});
 if((m=/^Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\. If you get (\d+) or more heads, (.+) is now Confused \(after dealing damage\)\.$/i.exec(text))&&damage===`${m[2]}x`)return fixed('coin-times-confuse',0,{flips:Number(m[1]),each:Number(m[2]),threshold:Number(m[3]),subject:m[4]});
 if((m=/^Flip a coin\. If heads, the Defending Pokémon is now (Poisoned|Asleep|Paralyzed|Confused)\. If tails, (.+) does (\d+) damage to itself\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('coin-status-recoil',Number(damage),{status:m[1],selfDamage:Number(m[3]),subject:m[2]});
 if((m=/^Flip a coin\. If heads, this attack does (\d+) damage plus (\d+) more damage and the Defending Pokémon is now (Poisoned|Asleep|Paralyzed|Confused); if tails, this attack does (\d+) damage\.$/i.exec(text))&&damage===`${m[1]}+`&&m[1]===m[4])return fixed('coin-bonus-status',Number(m[1]),{bonus:Number(m[2]),status:m[3]});
 if((m=/^Remove a number of damage counters from (.+?) equal to (half )?the damage done to (?:the )?Defending Pokémon \(after applying Weakness and Resistance\)(?: \(rounded up to the nearest 10\))?\.(?: If .+ has fewer damage counters than that, remove all of them\.)?$/i.exec(text))&&/^\d+$/.test(damage))return fixed('drain',Number(damage),{subject:m[1],half:!!m[2]});
 if((m=/^Unless all damage from this attack is prevented, you may remove 1 damage counter from (.+)\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('leech-seed',Number(damage),{subject:m[1]});
 if((m=/^Flip a coin\. If heads, draw a card\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('coin-draw',Number(damage));
 if((m=/^Flip a coin\. If heads, (?:prevent all damage done to|during your opponent's next turn, prevent all effects of attacks, including damage, done to) (.+?) during your opponent's next turn\. \(Any other effects of attacks still happen\.\)$/i.exec(text))&&damage==='')return fixed('coin-shield',0,{subject:m[1],allEffects:false});
 if((m=/^Flip a coin\. If heads, during your opponent's next turn, prevent all effects of attacks, including damage, done to (.+)\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('coin-shield',Number(damage),{subject:m[1],allEffects:true});
 if((m=/^Flip a coin\. If heads, prevent all damage done to (.+) during your opponent's next turn\. \(Any other effects of attacks still happen\.\)$/i.exec(text))&&damage==='')return fixed('coin-shield',0,{subject:m[1],allEffects:false});
 if((m=/^All damage done by attacks to (.+) during your opponent's next turn is reduce[d]? by (\d+) \(after applying Weakness and Resistance\)\.$/i.exec(text))&&damage==='')return fixed('damage-shield',0,{subject:m[1],reduce:Number(m[2])});
 if((m=/^During (?:your )?opponent's next turn, whenever (\d+) or less damage is done to (.+?) \(after applying Weakness and Resistance\), prevent that damage\. \(Any other effects of attacks still happen\.\)$/i.exec(text))&&damage==='')return fixed('damage-shield',0,{subject:m[2],threshold:Number(m[1])});
 if((m=/^If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips a coin\. If tails, (?:this|that) attack does nothing\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('sand-attack',Number(damage));
 if((m=/^Flip a coin\. If heads, the Defending Pokémon can't retreat during your opponent's next turn\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('coin-no-retreat',Number(damage));
 if((m=/^Flip a coin\. If heads, the Defending Pokémon can't attack (.+) during your opponent's next turn\. \(Benching either Pokémon ends this effect\.\)$/i.exec(text))&&damage==='')return fixed('coin-attack-lock',0,{subject:m[1]});
 if((m=/^The Defending Pokémon is now Poisoned\. This attack does (\d+) damage to each of your opponent's Benched Pokémon\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)$/i.exec(text))&&damage===m[1])return fixed('poison-bench',Number(damage),{benchDamage:Number(m[1])});
 if((m=/^Choose 1 of your opponent's Pokémon\. This attack does (\d+) damage to that Pokémon\. Don't apply Weakness and Resistance for this attack\. \(Any other effects that would happen after [aA]pplying Weakness and Resistance still happen\.\)$/i.exec(text))&&damage==='')return fixed('target-any',0,{targetDamage:Number(m[1])});
 if((m=/^Choose 1 of your opponent's Pokémon and flip a coin\. If heads, this attack does (\d+) damage to that Pokémon\. Don't apply Weakness and Resistance for this attack\. \(Any other effects that would happen after applying Weakness and Resistance still happen\.\)$/i.exec(text))&&damage==='')return fixed('target-any-coin',0,{targetDamage:Number(m[1])});
 if((m=/^Flip a number of coins equal to the number of Energy attached to (.+)\. This attack does (\d+) damage times the number of heads\.$/i.exec(text))&&damage===`${m[2]}x`)return fixed('energy-coins',0,{subject:m[1],each:Number(m[2])});
 if((m=/^Your opponent flips a number of coins equal to the number of Pokémon on his or her Bench\. This attack does (\d+) damage times the number of tails\. Don't apply Weakness and Resistance for this attack\. \(Any other effects that would happen after applying Weakness and Resistance still happen\.\)$/i.exec(text))&&damage===`${m[1]}x`)return fixed('bench-tails',0,{each:Number(m[1])});
 if(text==='Shuffle your opponent\'s deck.'&&damage==='')return fixed('shuffle-enemy',0);
 if((m=/^Flip a coin\. If heads, remove a damage counter from (.+)\. This attack can't be used if (.+) has no damage counters on it\.$/i.exec(text))&&damage==='')return fixed('coin-heal-one',0,{subject:m[1]});
 if((m=/^Flip a coin\. If heads, the Defending Pokémon is now Paralyzed\. If tails, this attack does nothing \(not even damage\)\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('coin-clamp',Number(damage));
 if((m=/^(.+) is now Confused \(after doing damage\)\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('self-confuse',Number(damage),{subject:m[1]});

 // Exact historical card text. Each family returns a distinct effect contract.
 if(/^Does (\d+) damage plus (\d+) more damage for each Energy attached to ([A-Za-z ]+) but not used to pay for this attack's Energy cost\. Extra Energy after the 2nd doesn't count\.$/i.test(text)){
  m=/^Does (\d+) damage plus (\d+) more damage for each Energy attached to ([A-Za-z ]+) but not used to pay for this attack's Energy cost\. Extra Energy after the 2nd doesn't count\.$/i.exec(text);
  if(damage===`${m[1]}+`)return fixed('extra-energy',Number(m[1]),{factor:Number(m[2]),subject:m[3],cap:20});
 }
 if((m=/^Does (\d+) damage times the number of damage counters on ([A-Za-z ]+)\.$/i.exec(text))&&damage===`${m[1]}x`)
  return fixed('flail-counters',Number(m[1]),{base:Number(m[1]),factor:Number(m[1]),subject:m[2]});
 if((m=/^Flip a coin\. If heads, this attack does (\d+) damage plus (\d+) more damage; if tails, this attack does (\d+) damage\.$/i.exec(text))&&m[1]===m[3]&&damage===m[1])
  return fixed('coin-stomp',Number(m[1]),{bonus:Number(m[2])});
 if(text==='The Defending Pokémon is now Poisoned. It now takes 20 Poison damage instead of 10 after each player\'s turn (even if it was already Poisoned).'&&damage==='20')
  return fixed('toxic',20);
 if(text==="You can't use this attack unless the Defending Pokémon is Asleep."&&/^\d+$/.test(damage))return fixed('dream-eater',Number(damage));
 if((m=/^Discard all Energy cards attached to ([A-Za-z ]+) in order to use this attack\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('discard-all-self-energy',Number(damage),{subject:m[1]});
 if((m=/^Flip a coin\. If tails, this attack does nothing\. Either way, you can't use this attack again as long as ([A-Za-z' ]+) stays in play \(even putting [A-Za-z' ]+ on the Bench won't let you use it again\.\)$/i.exec(text))&&/^\d+$/.test(damage))return fixed('once-per-unit',Number(damage),{subject:m[1]});
 if(text==="During your next turn, Scyther's Slash attack's base damage is 60 instead of 30."&&damage==='')return fixed('swords-dance',0,{subject:'Scyther'});
 if((m=/^([A-Za-z ]+) does (\d+) damage to itself\. Flip a coin\. If heads, prevent all damage done to \1 during your opponent's next turn\. \(Any other effects of attacks still happen\.\)$/i.exec(text))&&/^\d+$/.test(damage))return fixed('recoil-coin-shield',Number(damage),{subject:m[1],selfDamage:Number(m[2])});
 if((m=/^For each of your opponent's Benched Pokémon, flip a coin\. If heads, this attack does (\d+) damage to that Pokémon\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\) Then, ([A-Za-z ]+) does (\d+) damage times the number of tails to itself\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('thunderstorm',Number(damage),{benchDamage:Number(m[1]),selfPerTail:Number(m[3]),subject:m[2]});
 if((m=/^If the Defending Pokémon isn't Colorless, this attack does (\d+) damage to each Benched Pokémon of the same type as the Defending Pokémon \(including your own\)\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('chain-lightning',Number(damage),{benchDamage:Number(m[1])});
 if((m=/^Flip a coin\. If heads, flip another coin\. If the second coin is heads, this attack does (\d+) damage to each of your opponent's Benched Pokémon\. If the second coin is tails, this attack does (\d+) damage to each of your opponent's Benched Pokémon\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)$/i.exec(text))&&/^\d+$/.test(damage))return fixed('surprise-thunder',Number(damage),{heads:Number(m[1]),tails:Number(m[2])});
 if((m=/^If the Defending Pokémon attacks ([A-Za-z ]+) during your opponent's next turn, any damage done by the attack is reduce(?:d)? by (\d+) \(after applying Weakness and Resistance\)\. \(Benching either Pokémon ends this effect\.\)$/i.exec(text))&&/^\d*$/.test(damage))return fixed('reactive-shield',Number(damage||0),{subject:m[1],reduce:Number(m[2])});
 if((m=/^Discard 1 (Psychic|Grass|Fire|Water|Lightning|Fighting|Metal|Darkness) Energy card attached to ([A-Za-z ]+) in order to use this attack\. Remove all damage counters from \2\.$/i.exec(text))&&damage==='')return fixed('recover-discard',0,{subject:m[2],onlyType:m[1]});
 if((m=/^Discard 1 Energy card attached to ([A-Za-z ]+) in order (?:to use this attack|use this attack)\. Remove all damage counters from \1\.$/i.exec(text))&&damage==='')return fixed('recover-discard',0,{subject:m[1]});
 if((m=/^Discard 1 Energy card to ([A-Za-z ]+) in order to use this attack\. Remove all damage counters from \1\.$/i.exec(text))&&damage==='')return fixed('recover-discard',0,{subject:m[1]});
 if((m=/^If the Defending Pokémon has any Energy cards attached to it, choose 1(?: of them)? and discard it\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('enemy-energy-removal',Number(damage));
 if((m=/^Flip a coin\. If heads and if your opponent has any Benched Pokémon, he or she chooses 1 of them and switches it with the Defending Pokémon\. \(Do the damage before switching the Pokémon\.\)$/i.exec(text))&&/^\d+$/.test(damage))return fixed('coin-defender-switch',Number(damage));
 if((m=/^Flip a coin\. If heads, flip another coin\. If the second coin is heads, this attack does (\d+) damage to each of your opponent's Benched Pokémon\. If the second coin is tails, this attack does (\d+) damage to each of your opponent's Benched Pokémon\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)$/i.exec(text))&&/^\d+$/.test(damage))return fixed('surprise-thunder',Number(damage),{heads:Number(m[1]),tails:Number(m[2])});
 if((m=/^Search your deck for a (Fighting )?Basic Pokémon (?:card|named [^.]+) and put it onto your Bench\. Shuffle your deck afterward\. \(You can't use this attack if your Bench is full\.\)$/i.exec(text))&&damage==='')return fixed('call-family',0,{restriction:m[1]?'Fighting':(text.match(/Basic Pokémon named (.*?) and put it/)||[])[1]||null});
 if((m=/^Choose 3 of your opponent's Benched Pokémon and this attack does (\d+) damage to each of them\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\) If your opponent has fewer than 3 Benched Pokémon, do the damage to each of them\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('bench-up-to-three',Number(damage),{benchDamage:Number(m[1])});
 if((m=/^You may switch ([A-Za-z ]+) with 1 of your Benched Pokémon \(Do the damage before switching the Pokémon\)\.$/i.exec(text))&&/^\d+$/.test(damage))return fixed('optional-switch-self',Number(damage),{subject:m[1]});

 if((m=/^Does (\d+) damage plus (\d+) more damage for each damage counter on ([A-Za-z ]+)\. Flip a coin\. If tails, \3 is now Confused \(after doing damage\)\.$/i.exec(text))&&damage===`${m[1]}+`)
  return fixed('rampage',Number(m[1]),{factor:Number(m[2]),subject:m[3]});
 if((m=/^Flip a coin until you get tails\. This attack does (\d+) damage times the number of heads\.$/i.exec(text))&&damage===`${m[1]}x`)
  return fixed('coins-until-tails',0,{each:Number(m[1])});
 if(text==="Your opponent can't play Trainer cards during his or her next turn."&&damage==='')return fixed('trainer-lock',0);
 if((m=/^Does (\d+) damage times the total number of Koffings, Weezings, and Dark Weezings in play \(Apply Weakness and Resistance\.\)\. Then, this attack does (\d+) damage to each Koffing, Weezing, and Dark Weezing \(even your own\)\. Don't apply Weakness and Resistance\.$/i.exec(text))&&damage===`${m[1]}x`)
  return fixed('mass-explosion',0,{each:Number(m[1]),splashDamage:Number(m[2]),names:['Koffing','Weezing','Dark Weezing']});
 if(text==='Unless this attack Knocks Out the Defending Pokémon, return the Defending Pokémon and all cards attached to it to your opponent\'s hand.'&&/^\d+$/.test(damage))return fixed('hurricane',Number(damage));
 if(text==="Before doing damage, choose 1 of your opponent's Benched Pokémon and switch it with the Defending Pokémon. Do the damage to the new Defending Pokémon. This attack can't be used if your opponent has no Benched Pokémon."&&/^\d+$/.test(damage))return fixed('drag-off',Number(damage));

 if(text==='Your opponent shuffles his or her Active Pokémon and all cards attached to it into his or her deck. This attack can\'t be used if your opponent has no Benched Pokémon.'&&damage==='')return fixed('fling',0);
 if(text==='Shuffle Abra into your deck. (Discard all cards attached to Abra.)'&&damage==='')return fixed('vanish',0,{subject:'Abra'});
 if(text==='If the Defending Pokémon has a Weakness, you may change it to a type of your choice other than Colorless.'&&damage==='')return fixed('conversion1',0);
 if(text==='If Defending Pokémon has a Weakness, you may change it to a type of your choice other than Colorless.'&&damage==='')return fixed('conversion1',0);
 if(text==="Change Porygon's Resistance to a type of your choice other than Colorless."&&damage==='')return fixed('conversion2',0,{subject:'Porygon'});
 if((m=/^You may discard any number of R Energy cards attached to ([A-Za-z ]+) when you use this attack\. If you do, discard that many cards from the top of your opponent's deck\.$/i.exec(text))&&damage==='')return fixed('wildfire',0,{subject:m[1]});
 if(text==='Put up to 2 Energy cards from your discard pile into your hand. Gastly does 10 damage to itself.'&&damage==='')return fixed('energy-conversion',0,{subject:'Gastly',selfDamage:10});
 if(text==='Search your deck for an Evolution card named Gyarados or Dark Gyarados and put it on Magikarp. (This counts as evolving Magikarp.) Shuffle your deck afterward.'&&damage==='')return fixed('rapid-evolution',0,{subject:'Magikarp'});
 if(text==='Search your deck for a Energy card and attach it to Slowpoke. Shuffle your deck afterward.'&&damage==='')return fixed('afternoon-nap',0,{subject:'Slowpoke'});
 // Rhydon's Ram remains unported until KO/switch timing is implemented.
 return null;
}
function resolve(p,flip,ctx){
 const base={damage:p.damage,flips:[]};
 const toss=()=>{const n=Boolean(flip());base.flips.push(n);return n;};
 switch(p.kind){
 case 'enemy-energy':return {...base,damage:p.damage+p.factor*ctx.enemyEnergy};
 case 'team-name':return {...base,damage:p.damage+p.factor*ctx.teamNameCount(p.names,p.region)};
 case 'half-hp':return {...base,damage:Math.ceil(ctx.enemyRemainingHP/20)*10};
 case 'water-extra':case 'extra-energy':return {...base,damage:p.damage+Math.min(p.cap,ctx.extraEnergies(p.kind==='water-extra'?'Water':null)*p.factor)};
 case 'coin-more':return {...base,damage:p.damage+(toss()===p.headsBonus?p.bonus:0)};
 case 'coin-double-status':return {...base,statuses:toss()?p.statuses:[]};
 case 'coin-status-alias':return {...base,status:toss()?p.status:null};
 case 'self-confuse':return {...base,selfStatus:'Confused',status:p.both?'Confused':null};
 case 'coin-self-confuse':return {...base,selfStatus:toss()?null:'Confused'};
 case 'coin-times-confuse':{let n=0;for(let i=0;i<p.flips;i++)if(toss())n++;return {...base,damage:n*p.each,selfStatus:n>=(p.threshold??0)?'Confused':null};}
 case 'coin-status-recoil':return toss()?{...base,status:p.status}:{...base,selfDamage:p.selfDamage};
 case 'coin-bonus-status':return toss()?{...base,damage:p.damage+p.bonus,status:p.status}:base;
 case 'drain':return {...base,healFromDamage:p.half?'half':'full'};
 case 'leech-seed':return {...base,healFromDamage:'seed'};
 case 'coin-draw':return {...base,draw:toss()?1:0};
 case 'coin-shield':return {...base,shield:toss()?{allEffects:p.allEffects,preventDamage:!p.allEffects}:null};
 case 'damage-shield':return {...base,shield:{reduce:p.reduce,threshold:p.threshold}};
 case 'sand-attack':return {...base,attackPenalty:true};
 case 'coin-no-retreat':return {...base,noRetreat:toss()};
 case 'coin-attack-lock':return {...base,attackLock:toss()};
 case 'poison-bench':return {...base,status:'Poisoned',benchSide:'opponent',benchDamage:p.benchDamage};
 case 'target-any':case 'target-any-coin':return {...base,damage:0,targetDamage:p.kind==='target-any-coin'?(toss()?p.targetDamage:0):p.targetDamage};
 case 'energy-coins':{let n=0;for(let i=0;i<ctx.selfEnergy;i++)if(toss())n++;return {...base,damage:n*p.each};}
 case 'bench-tails':{let n=0;for(let i=0;i<ctx.enemyBench;i++)if(!toss())n++;return {...base,damage:n*p.each,ignoreWR:true};}
 case 'shuffle-enemy':return {...base,shuffleEnemy:true};
 case 'coin-heal-one':return {...base,healSelf:toss()?10:0};
 case 'coin-clamp':return toss()?{...base,status:'Paralyzed'}:{...base,damage:0};

 case 'coin-stomp':return {...base,damage:p.damage+(toss()?p.bonus:0)};
 case 'toxic':return {...base,status:'Poisoned',poisonDamage:20};
 case 'dream-eater':return base;
 case 'discard-all-self-energy':return {...base,discardAllSelfEnergy:true};
 case 'once-per-unit':return {...base,damage:toss()?p.damage:0,markOnce:true};
 case 'swords-dance':return {...base,swordsDance:true};
 case 'recoil-coin-shield':return {...base,selfDamage:p.selfDamage,shield:toss()?{allEffects:false,preventDamage:true}:null};
 case 'thunderstorm':{
  const hits=[];let tails=0;
  for(let i=0;i<ctx.enemyBench;i++){if(toss())hits.push(i);else tails++;}
  return {...base,benchHits:hits,benchHitDamage:p.benchDamage,selfDamage:tails*p.selfPerTail};
 }
 case 'chain-lightning':return {...base,chainLightning:p.benchDamage};
 case 'surprise-thunder':{if(!toss())return base;return {...base,benchSide:'opponent',benchDamage:toss()?p.heads:p.tails};}
 case 'reactive-shield':return {...base,reactiveReduction:p.reduce};
 case 'recover-discard':return {...base,healAllSelf:true,discardEnergy:1};
 case 'enemy-energy-removal':return {...base,discardEnemyEnergy:1};
 case 'coin-defender-switch':return {...base,forceSwitch:toss()?'switch-defender':null};
 case 'call-family':return {...base,callFamily:p.restriction};
 case 'bench-up-to-three':return {...base,benchChosenDamage:p.benchDamage};
 case 'optional-switch-self':return {...base,optionalSwitch:true};
 case 'recoil-switch':return {...base,selfDamage:p.selfDamage,forceSwitch:'switch-defender'};

 case 'rampage':return {...base,damage:p.damage+p.factor*(ctx.selfCounters||0),selfStatus:toss()?null:'Confused'};
 case 'coins-until-tails':{let heads=0;while(heads<1000){if(!toss())break;heads++;}if(heads===1000)throw Error('Coin sequence exceeded safety bound');return {...base,damage:heads*p.each};}
 case 'trainer-lock':return {...base,lockTrainers:true};
 case 'mass-explosion':return {...base,damage:p.each*ctx.allNamedCount(p.names),splashNamed:{names:p.names,amount:p.splashDamage}};
 case 'hurricane':return {...base,bounceDefender:true};
 case 'drag-off':return base;

 case 'fling':return {...base,returnDefenderToDeck:true};
 case 'vanish':return {...base,vanishSelf:true};
 case 'conversion1':return {...base,convertWeakness:true};
 case 'conversion2':return {...base,convertResistance:true};
 case 'wildfire':return {...base,millFromFire:true};
 case 'energy-conversion':return {...base,retrieveEnergy:true,selfDamage:p.selfDamage};
 case 'rapid-evolution':return {...base,rapidEvolve:true};
 case 'afternoon-nap':return {...base,attachEnergyFromDeck:true};



 default:throw Error('Unsupported Classic extension');
 }
}
module.exports={compile,resolve};
