from pathlib import Path
import re,json
base=Path(__file__).parent
src=(base/'engine.js').read_text()
impl=(base/'attack_batch_v043_impl.js').read_text()
ids=sorted(set(map(int,re.findall(r'case (\d+):',impl))))
# Exclude mechanics whose optional decisions, ambiguous imported card text, or other era-specific rules
# cannot yet be implemented truthfully within the synchronous duel UI.
exclude={65,70,81,88,89,119,137,145,151,152,158,170,175,176,178,179,199,202,205,209,228,235,256,261,304,314,317,132,318,308,217,192,223,264,211,156,150}
# 111 supported records targeted here, each has a dedicated executable effect.
keep=[i for i in ids if i not in exclude]
print('coverage intent:',len(keep),keep)
arr=json.load(open(base/'attack_coverage_v042_baseline.json'))['unsupported']
# prune switch cases for excluded ids; retain unused body branch safe but don't classify those attacks.
mapdata=[(arr[i]['attack']+'\x1f'+arr[i]['text'],i) for i in keep]
mapdata=list({k:v for k,v in reversed(mapdata)}.items())
impl=impl.replace('__BATCH43_RULES__',json.dumps(mapdata,ensure_ascii=False))
assert 'class Engine{' in src
src=src.replace('class Engine{',impl+'\nclass Engine{',1)
# Attack classifier only recognizes exact historical printed text of our implemented records.
src=src.replace('  return null;\n }\n legalAttack(a)',"  if(batch43Id(a)!==null)return 'batch43';\n  return null;\n }\n legalAttack(a)",1)
# Set up new gameplay rule handler immediately after attack validation but before mutation of attack state.
needle="if(!pattern){this.log(`${a.name} is not scripted yet and cannot be used.`);render();return false}"
assert src.count(needle)==1
src=src.replace(needle,needle+"let batch43=null; if(pattern==='batch43'){batch43=batch43Effect(this,batch43Id(a),a,u,f.active,p,f);if(!batch43.ok)return false;dmg=batch43.dmg;pendingStatus=batch43.status||null;}")
# damage calculation: ignore weakness/resistance in those specific attacks that explicitly request it.
needle="dmg=['ignoreWR','swift','benchTailsDamage'].includes(pattern)?"
assert src.count(needle)==1
src=src.replace(needle,"dmg=(batch43?.ignoreWR||['ignoreWR','swift','benchTailsDamage'].includes(pattern))?")
needle='calculateDamage(dmg,c,this.card(f.active));if(c.name==='
assert src.count(needle)==1
# Shining Kabutops explicitly ignores Resistance but not Weakness.
src=src.replace(needle,"calculateDamage(dmg,c,this.card(f.active));if(batch43?.ignoreResistance){const weak=this.card(f.active)?.weaknesses?.find(w=>w.type===c.types?.[0]);dmg=Math.max(0,batch43.dmg)*(weak?2:1)}if(c.name===")
# counterattack tracking for attacks whose damage is conditional on previous action, active card
needle="f.active.lastAttacker=u;f.active.lastAttackerPlayer=p;f.active.damage+=dmg;"
assert src.count(needle)==1
src=src.replace(needle,"f.active.lastAttacker=u;f.active.lastAttackerPlayer=p;f.active.lastAttackerTurn=this.round;f.active.damage+=dmg;")
# finish post-damage status and healing effects after all prevention is calculated.
needle="const effectsBlocked=f.active.preventAttackEffects||this.unitHasPower(f.active,'Crystal Body')||(this.unitHasPower(f.active,'Neutral Shield')&&(u.under||[]).length);"
assert src.count(needle)==1
src=src.replace(needle,needle+"\n if(pendingStatus==='Poisoned'){if(!effectsBlocked&&!this.unitHasPower(f.active,'Thick Skinned'))f.active.poison=true;pendingStatus=null;}\n if(batch43?.after)batch43.after(dmg,effectsBlocked);")
# 'prevent all damage if 30 or greater' only if we decide to support this source later; not enabled.
# maintain last attack identity for follow-up moves before ending the turn.
needle="this.log(`${p.name}: ${c.name} used ${a.name} (${dmg} damage).`);"
assert src.count(needle)==1
src=src.replace(needle,"u.lastAttackName=a.name;u.lastAttackRound=this.round;"+needle)
# Restrict '*' wildcard lock (Freeze, Leer) without breaking named locks.
needle="u.attackLocks.some(x=>x.name===a.name&&x.until>=this.round)"
assert src.count(needle)==1
src=src.replace(needle,"u.attackLocks.some(x=>(x.name===a.name||x.name==='*')&&x.until>=this.round)")
# Historical card 'Intimidate' if later added uses same effect.
# CPU scores utility attacks by effects, not just the printed damage field.
needle=' return damage+(damage&&defending.damage+damage>=+(def.hp||0)?85:0)'
assert src.count(needle)==1
src=src.replace(needle,''' if(engine.attackPattern(a)==='batch43'){
  const id=batch43Id(a);
  if(id===79&&(attacker.lastAttackName!=='Lie Low'||attacker.lastAttackRound!==engine.round-1))return -Infinity;
  if(id===125&&attacker.damage<20)return -Infinity;
  if([55,78,146,174,265,299].includes(id))return Math.max(18,Math.min(48,attacker.damage+16));
  if([120,168,240,311,142].includes(id))return Math.max(12,Math.min(45,attacker.damage+6));
  if([98,102,126,138,185,204,220,251,290,296,320].includes(id))return Math.max(19,damage+13);
  if([141,162,294,208,260].includes(id))return Math.max(15,damage+9);
 }
''' + needle)
(base/'engine.js').write_text(src)
(base/'batch43_targets.json').write_text(json.dumps([{'id':arr[i]['card'],'attack':arr[i]['attack'],'text':arr[i]['text'],'index':i} for i in keep],indent=2,ensure_ascii=False))
print('patch written')
