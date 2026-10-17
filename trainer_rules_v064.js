'use strict';
// v0.6.4: Sabrina's ESP is an OPTIONAL *whole-set* reroll. Previously the
// attachment could be played but never affected a single coin flip.
//
// Commit a known set of attack coins before resolving attack effects, then
// let the human keep that set or reroll all of it exactly once. A canceled
// choice does not create a fresh set of coins. This hook deliberately declines
// unsupported conditional coin sequences (where the number of attack flips
// depends on damage or additional effects) instead of guessing.
const trainer64PreviousAttack = Engine.prototype.attack;
const trainer64CoinNames = new Set([
 'Healing Pollen','Sonic Distortion','Night Spirits','Naptime','Suggestion',
 'Water Spray','Pendulum Curse','Hug','Life Drain','Magic Darts',
 'Quick Attack','Lick','Random ESP','Removal Beam','Shadow Attack'
]);
function trainer64EspFlips(game, source, attack, targetSlot){
 if(!source || !attack || !trainer64CoinNames.has(attack.name))return null;
 if(!game.card(source)?.name.startsWith("Sabrina's "))return null;
 const text=String(attack.text||'');
 if(attack.name==='Night Spirits')return [game.me.active,...game.me.bench].filter(u=>u&&/^Sabrina's (Gastly|Haunter|Gengar)$/.test(game.card(u)?.name||'')).length;
 if(attack.name==='Pendulum Curse')return Math.floor((game.foe.active?.damage||0)/10);
 const all=[...text.matchAll(/\bflip (\d+) coins?\b|\bflip a coin\b/gi)];
 if(all.length!==1)return null;
 if(attack.name==='Magic Darts'&&!Number.isInteger(targetSlot))return null;
 // Shadow Attack flips only if a Benched target exists; the attack must
 // already have a valid selected Bench target before previewing the coin.
 if(attack.name==='Shadow Attack'&&(!game.foe?.bench?.length||!Number.isInteger(targetSlot)||targetSlot<0||targetSlot>=game.foe.bench.length))return null;
 // Removal Beam flips only while the Defending Pokémon has Energy.
 if(attack.name==='Removal Beam'&&!game.foe?.active?.energies?.length)return null;
 const count=all[0][1]?Number(all[0][1]):1;
 return count>0&&count<=30?count:null;
}
Engine.prototype.attack=function(i,slot=null,defer=false,choice=null,override=null){
 const own=this.me,source=own?.active,attack=this.card(source)?.attacks?.[i];
 const esp=(source?.attachedTrainers||[]).some(t=>lookup.get(t.id)?.name==="Sabrina's ESP");
 if(this._trainer64Resolving||this.turn!==0||!esp||override||!attack||this.phase!=='game'||this.over||
   !this.foe?.active||['Asleep','Paralyzed','Confused'].includes(source.status)||
   !this.afford(source,attack.cost)||!this.legalAttack(attack)||
   source.attackLocks.some(x=>(x.name===attack.name||x.name==='*')&&x.until>=this.round)||
   source.usedAttacks[attack.name]||source.conditionalAttackLockUntil>=this.round){
  return trainer64PreviousAttack.call(this,i,slot,defer,choice,override);
 }
 const count=trainer64EspFlips(this,source,attack,slot);
 if(count===null||count===0)return trainer64PreviousAttack.call(this,i,slot,defer,choice,override);
 let state=this._trainer64Esp;
 if(!state||state.turn!==this.turnSerial||state.source!==source||state.index!==i||state.slot!==slot){
  state={turn:this.turnSerial,source,index:i,slot,original:Array.from({length:count},(_,k)=>coin(`Sabrina's ESP original flip ${k+1}/${count}`))};
  this._trainer64Esp=state;
 }
 deckSearchRequest={label:`Sabrina's ESP — ${attack.name}: original flips ${state.original.map(h=>h?'Heads':'Tails').join(', ')}. Keep the results or reroll ALL ${count} coins once.`,
  options:[{index:'keep',name:'Keep original results'},{index:'reroll',name:`Reroll all ${count} coin${count===1?'':'s'} once`}],
  execute:option=>{
   if(option!=='keep'&&option!=='reroll'||this._trainer64Esp!==state)return false;
   const results=option==='keep'?state.original:Array.from({length:count},(_,k)=>coin(`Sabrina's ESP reroll ${k+1}/${count}`));
   this.log(`Sabrina's ESP: ${option==='keep'?'kept':'rerolled all'} ${count} coin(s): ${results.map(h=>h?'H':'T').join(', ')}.`);
   const previousCoin=coin;
   let cursor=0, outcome;
   this._trainer64Resolving=true;
   // Do not animate the same dice twice. These results were already shown
   // by the preview flips, and should drive exactly the same attack effects.
   coin=function(context){return cursor<results.length?results[cursor++]:previousCoin(context)};
   deckSearchRequest=null;
   try {outcome=trainer64PreviousAttack.call(this,i,slot,defer,choice,override)}
   finally {coin=previousCoin;this._trainer64Resolving=false;}
   if(outcome===true||this.phase!=='game')this._trainer64Esp=null;
   render();return outcome;
  }
 };
 render();return null;
};
// Expire a previous attack's pending coin preview when turns advance, even if
// it was left behind by a player canceling the choice display.
const trainer64PreviousEnd=Engine.prototype.end;
Engine.prototype.end=function(...args){
 if(this._trainer64Esp&&String(deckSearchRequest?.label||'').startsWith("Sabrina's ESP"))deckSearchRequest=null;
 this._trainer64Esp=null;return trainer64PreviousEnd.apply(this,args);
};

// Sabrina's Psychic Control: borrowed legacy Trainers need an actual target
// choice. trainer58 already has transactional choices for its registered cards,
// but Switch / Gust of Wind / Potion are handled in the original engine. Their
// old path did not commit Psychic Control or clean up the temporary proxy.
const trainer64PreviousTrainer=Engine.prototype.trainer;
Engine.prototype.trainer=function(i,slot=null){
 const proxy=this._psychicProxy59,borrowed=lookup.get(this.me?.hand?.[i]);
 // A borrowed card must still exist in the opponent's discard when a delayed
 // target choice resolves. Never execute a vanished source through its proxy.
 if(proxy&&proxy.id===borrowed?.id&&!this.foe.discard.includes(proxy.originalId)){
  this.cancelPsychic59();
  return false;
 }
 if(!proxy||proxy.id!==borrowed?.id||!new Set(['Switch','Gust of Wind','Potion']).has(borrowed.name)){
  return trainer64PreviousTrainer.call(this,i,slot);
 }
 const name=borrowed.name,available=name==='Switch'?this.me.bench.map((u,j)=>({index:j,name:this.card(u)?.name||'Bench Pokémon'})):
   name==='Gust of Wind'?this.foe.bench.map((u,j)=>({index:j,name:this.card(u)?.name||'Opposing Bench Pokémon'})):
   [{index:-1,unit:this.me.active},...this.me.bench.map((unit,j)=>({index:j,unit}))]
     .filter(o=>o.unit&&o.unit.damage>0).map(o=>({index:o.index,name:this.card(o.unit)?.name||'Pokémon'}));
 if(slot===null){
  if(!available.length)return false;
  deckSearchRequest={label:`Sabrina's Psychic Control: choose a target for borrowed ${name}.`,options:available,
   execute:selectedSlot=>this.trainer(i,selectedSlot)};
  render();return null;
 }
 if(!available.some(o=>o.index===slot))return false;
 const owner=this.me,opponent=this.foe,foreignCount=opponent.discard.filter(id=>id===proxy.originalId).length;
 const result=trainer64PreviousTrainer.call(this,i,slot);
 if(result!==true)return result;
 // Neither player changes ownership of the historical borrowed Trainer.
 const leftover=owner.hand.indexOf(proxy.id);if(leftover>=0)owner.hand.splice(leftover,1);
 const discarded=owner.discard.lastIndexOf(proxy.id);if(discarded>=0)owner.discard.splice(discarded,1);
 const ctrl=owner.hand.indexOf(proxy.source);if(ctrl>=0)owner.discard.push(owner.hand.splice(ctrl,1)[0]);
 this._trainer59Coins?.delete(proxy.flipKey);
 lookup.delete(proxy.id);this._psychicProxy59=null;deckSearchRequest=null;
 this.log(`Sabrina's Psychic Control used ${name}; the original remains in the rival discard pile.`);
 if(opponent.discard.filter(id=>id===proxy.originalId).length!==foreignCount){
  this.log('Warning: borrowed Trainer ownership changed unexpectedly.');
 }
 render();return true;
};

// Canceling a borrowed-card picker must not leave a synthetic Trainer record
// in the global lookup. Keep the original Psychic Control coin result cached
// so cancel/retry is not a way to roll again for free.
const trainer64PreviousCancelPsychic=Engine.prototype.cancelPsychic59;
Engine.prototype.cancelPsychic59=function(...args){
 const id=this._psychicProxy59?.id;
 const result=trainer64PreviousCancelPsychic.apply(this,args);
 if(id)lookup.delete(id);
 return result;
};
