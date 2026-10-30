'use strict';
// NPC reactions are presentation only, based exclusively on public Classic duel state.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgMatchReactions=api;
})(typeof window==='undefined'?null:window,function(){
 const PORTRAITS=Object.freeze({
  hana:'/rpg-assets/hana.png',
  reina:'/rpg-assets/characters/reina/portraits/primary.png',
  shiori:'/rpg-assets/shiori.png',
  yuna:'/rpg-assets/yuna.png',
  akari:'/rpg-assets/akari.png',
  camila:'/rpg-assets/camila.png',
  marina:'/rpg-assets/marina.png',
  kaede:'/rpg-assets/kaede.png',
  jun:'/rpg-assets/jun.png',
  teo:'/rpg-assets/teo.png',
  iris:'/rpg-assets/iris.png',
  elio:'/rpg-assets/elio.png',
  alma:'/rpg-assets/alma.png',
  nereo:'/rpg-assets/nereo.png',
  elena:'/rpg-assets/characters/elena/portrait.png',
  jinx:'/rpg-assets/characters/jinx/neutral.png',
  luna:'/rpg-assets/characters/luna/neutral.png',
  sierra:'/rpg-assets/characters/sierra/portrait.png',
  sol:'/rpg-assets/sol.png',
  barb:'/rpg-assets/characters/barb/portraits/primary.png',
  laca:'/rpg-assets/characters/laca/expression-portraits/neutral.webp'
 });
 // Established cast has two supported VN-expression folder formats.
 const VN_MAIN=new Set(['hana','reina','shiori','yuna','akari','camila','marina','kaede','barb']);
 const VN_GUEST=new Set(['jun','teo','iris','elio','alma','nereo']);
 const VN_PORTRAITS=new Set(['rina','sol','jinx','luna','elena','sierra','laca']);
 const EXPRESSIONS={
  main:{
   default:['neutral'],attack:['happy','neutral'],play_card:['happy','neutral'],
   evolve:['happy'],power:['happy','neutral'],hurt:['surprised','angry'],
   big_hit:['surprised'],weakness_hit:['surprised'],status_hit:['angry','surprised'],
   ko_taken:['angry','embarrassed'],ko_scored:['happy']
  },
  guest:{
   default:['neutral'],attack:['determined','neutral'],play_card:['happy','neutral'],
   evolve:['happy'],power:['determined','happy'],hurt:['vulnerable','surprised'],
   big_hit:['surprised'],weakness_hit:['surprised'],status_hit:['irritated','surprised'],
   ko_taken:['vulnerable'],ko_scored:['happy']
  },
  portrait:{
   default:['neutral'],attack:['neutral'],play_card:['happy','neutral'],
   evolve:['happy'],power:['happy','neutral'],hurt:['concerned','surprised'],
   big_hit:['surprised'],weakness_hit:['surprised'],status_hit:['concerned'],
   ko_taken:['concerned','soft'],ko_scored:['happy']
  }
 };
 // Vary rivals' battle demeanor while keeping their known sprite filenames.
 const CHARACTER_EXPRESSIONS={
  reina:{attack:'angry',play_card:'neutral',power:'angry',ko_taken:'angry'},
  shiori:{attack:'neutral',power:'neutral',ko_taken:'embarrassed'},
  yuna:{attack:'happy',ko_taken:'surprised'},
  akari:{attack:'neutral',power:'neutral'},
  camila:{attack:'flirty',play_card:'flirty',power:'flirty'},
  marina:{attack:'neutral',ko_taken:'embarrassed'},
  kaede:{attack:'angry',power:'angry',ko_taken:'angry'},
  jinx:{attack:'smirk',play_card:'playful',evolve:'happy',power:'smirk',
   hurt:'annoyed',status_hit:'annoyed',ko_taken:'annoyed',ko_scored:'smirk'},
  teo:{attack:'happy'},
  barb:{attack:'flirty',play_card:'happy',evolve:'happy',power:'flirty',
   hurt:'surprised',big_hit:'surprised',weakness_hit:'surprised',
   status_hit:'angry',ko_taken:'sad',ko_scored:'happy'}
 };
 function vnCandidates(npcId,kind){
  // Daisy's reviewed battle expressions are PNGs, not the established WebP sheets.
  if(npcId==='daisy'){
   const names={
    attack:['determined','happy','neutral'],play_card:['happy','neutral'],
    evolve:['happy','determined'],power:['determined','happy'],
    hurt:['surprised','concerned'],big_hit:['surprised','concerned'],
    weakness_hit:['surprised','concerned'],status_hit:['angry','concerned'],
    ko_taken:['concerned','surprised'],ko_scored:['happy','determined']
   };
   return [...new Set([...(names[kind]||['neutral']),'neutral'])].map(name=>
    '/rpg-assets/characters/daisy/expression-portraits/'+name+'.png');
  }

  if(npcId==='elio'){
   const name=['play_card','evolve','power','ko_scored'].includes(kind)?'happy':
    ['hurt','big_hit','weakness_hit'].includes(kind)?'surprised':
    ['status_hit','ko_taken'].includes(kind)?'concerned':null;
   return name?['/rpg-assets/characters/elio/expression-portraits/'+name+'.png',PORTRAITS.elio]:[PORTRAITS.elio];
  }
  // Keep Alma in canonical cafe workwear; legacy guest art and suit candidates conflict.
  if(npcId==='alma'){
   const name=['attack','play_card','evolve','power','ko_scored'].includes(kind)?'happy':
    ['hurt','big_hit','weakness_hit'].includes(kind)?'surprised':
    ['status_hit','ko_taken'].includes(kind)?'concerned':'neutral';
   return [...new Set([name,'neutral'])].map(expression=>
    '/rpg-assets/characters/alma/expression-portraits/'+expression+'.webp');
  }
  if(npcId==='barb'&&['hurt','big_hit','weakness_hit','status_hit','ko_taken'].includes(kind)){
   const name=kind==='ko_taken'?'soft':'concerned';
   return ['/rpg-assets/characters/barb/expression-portraits/'+name+'.png',
    '/rpg-assets/characters/barb/expression-portraits/neutral.webp'];
  }
  // These guest legacy sheets contain other identities; only the reviewed pair is active.
  if(['iris','jun','nereo','teo','reina','shiori','yuna','hana'].includes(npcId)){
   const happy=['attack','play_card','evolve','power','ko_scored'].includes(kind);
   const hurt=['hurt','big_hit','weakness_hit','status_hit'].includes(kind);
   const name=happy?'happy':hurt?'surprised':'neutral';
   return [...new Set([name,'neutral'])].map(expression=>
    '/rpg-assets/characters/'+npcId+'/expression-portraits/'+expression+'.webp');
  }
  const group=VN_MAIN.has(npcId)?'main':VN_GUEST.has(npcId)?'guest':
   VN_PORTRAITS.has(npcId)?'portrait':null;
  if(!group)return [];
  const folder=group==='portrait'?'expression-portraits':'vn-expressions';
  const names=[CHARACTER_EXPRESSIONS[npcId]?.[kind],
   ...(EXPRESSIONS[group][kind]||EXPRESSIONS[group].default),
   'neutral'].filter(Boolean);
  return [...new Set(names)].map(name=>
   '/rpg-assets/characters/'+npcId+'/'+folder+'/'+name+'.webp');
 }
 const LABELS={attack:['ATTACK!','Their Pokémon attacks'],play_card:['NEW PLAY','They put a card into play'],evolve:['EVOLUTION!','A Pokémon evolves'],power:['POKÉMON POWER!','A special effect'],hurt:['HIT!','Their Pokémon takes damage'],big_hit:['BIG HIT!','A powerful blow'],weakness_hit:['IT’S SUPER EFFECTIVE!','Their Pokémon was hit for Weakness'],status_hit:['STATUS TROUBLE!','A Special Condition was inflicted'],ko_taken:['POKÉMON DOWN!','You take a Prize'],ko_scored:['A KNOCKOUT!','They take a Prize']};
 const GENERIC={attack:'Here goes.',play_card:'I can work with this.',evolve:'There we go.',power:'Try this one.',hurt:'Ouch. Good hit.',big_hit:'That hit harder than I expected.',weakness_hit:'I should have seen that matchup coming.',status_hit:'That condition complicates things.',ko_taken:'You got me there.',ko_scored:'That is one down.'};
 const VOICES={
  "hana": {
    "attack": "Okay, here we go!",
    "play_card": "I think this might help.",
    "evolve": "Aw, you grew up!",
    "power": "Come on, just one more trick.",
    "hurt": "Oh! That was a big one.",
    "ko_taken": "Oh no. I should've switched it out.",
    "ko_scored": "We got one! Sorry—I'm excited."
  },
  "reina": {
    "attack": "Keep up. I'm not waiting for you.",
    "play_card": "Was hoping I'd draw that.",
    "evolve": "Now try it.",
    "power": "Let's see you deal with this.",
    "hurt": "Tch. I left that open.",
    "ko_taken": "I saw that coming. Too late, though.",
    "ko_scored": "One down. Still plenty to do."
  },
  "shiori": {
    "attack": "Shall we?",
    "play_card": "I thought this might come in handy.",
    "evolve": "There you are.",
    "power": "There's another possibility.",
    "hurt": "I should have considered that.",
    "ko_taken": "Ah. I held the wrong card.",
    "ko_scored": "That took longer than I expected."
  },
  "yuna": {
    "attack": "All right, audience of one!",
    "play_card": "Ooh, guess what I found.",
    "evolve": "It gets bigger! It gets worse!",
    "power": "Watch this. No, really, watch.",
    "hurt": "That's not how the trick goes!",
    "ko_taken": "No! The important one!",
    "ko_scored": "YES! That actually worked!"
  },
  "akari": {
    "attack": "Let's test the damage.",
    "play_card": "Interesting draw.",
    "evolve": "That improves things.",
    "power": "The numbers favor this.",
    "hurt": "Hm. That changes the odds.",
    "ko_taken": "I missed a whole line there.",
    "ko_scored": "As expected. More or less."
  },
  "camila": {
    "attack": "Shall we make this interesting?",
    "play_card": "Now, this one I didn't trade away.",
    "evolve": "An upgrade. Very tasteful.",
    "power": "Here's the catch, darling.",
    "hurt": "Oof. That one's going to cost me.",
    "ko_taken": "I should have taken your last offer.",
    "ko_scored": "And that, darling, is a good deal."
  },
  "marina": {
    "attack": "Let's give it a try.",
    "play_card": "Oh, I was hoping for that.",
    "evolve": "There. A little more room to breathe.",
    "power": "I think this could work.",
    "hurt": "Oh! I didn't see that coming.",
    "ko_taken": "I should've kept it on the Bench.",
    "ko_scored": "We did it. Are you all right?"
  },
  "kaede": {
    "attack": "Heads up.",
    "play_card": "Knew I was saving that for something.",
    "evolve": "Now we're getting somewhere.",
    "power": "Don't say I didn't warn you.",
    "hurt": "Ha! Okay, that hurt.",
    "ko_taken": "Nice. I almost want a replay.",
    "ko_scored": "Finally. Your turn to sweat."
  },
  "jun": {
    "attack": "Your turn. Watch the timing.",
    "play_card": "I have an answer to that.",
    "evolve": "Right on schedule.",
    "power": "Here's the ruling in action.",
    "hurt": "Ah. Fair play.",
    "ko_taken": "No argument. You earned it.",
    "ko_scored": "That was legal. And rather satisfying."
  },
  "teo": {
    "attack": "And here we go!",
    "play_card": "Oh, this is a good one.",
    "evolve": "The sequel just got bigger!",
    "power": "You are going to want to see this.",
    "hurt": "Ouch! No, no, we're fine.",
    "ko_taken": "That wasn't how I called it!",
    "ko_scored": "A knockout! Did you see that?"
  },
  "iris": {
    "attack": "All right. Let's work.",
    "play_card": "There it is. Found it.",
    "evolve": "Good, that buys us time.",
    "power": "We have another option.",
    "hurt": "Ow. Right where it hurts.",
    "ko_taken": "Should've kept that one safe.",
    "ko_scored": "That's one less problem to carry."
  },
  "elio": {
    "attack": "Okay. I practiced this.",
    "play_card": "Oh! I know what to do with this.",
    "evolve": "I actually have the next stage!",
    "power": "Wait, I can use this now.",
    "hurt": "Ah. Should've seen that.",
    "ko_taken": "Oh, that was my favorite.",
    "ko_scored": "Did that count? It counted!"
  },
  "alma": {
    "attack": "Right, let's get on with it.",
    "play_card": "Good. That's the one.",
    "evolve": "Well, look at you.",
    "power": "I've got a little something here.",
    "hurt": "Careful. That was a good hit.",
    "ko_taken": "Mm. I was too slow.",
    "ko_scored": "Good. Tea's on me after this."
  },
  "barb": {
    "attack": "Let's see if you noticed what I kept in reserve.",
    "play_card": "I was hoping to draw that. Perfect timing.",
    "evolve": "There we go. The whole plan fits together now.",
    "power": "One small adjustment changes everything.",
    "hurt": "Ouch. I definitely left that open.",
    "ko_taken": "I should've protected that one. Nice play.",
    "ko_scored": "There we go! That setup actually paid off."
  },
  "nereo": {
    "attack": "Let's see if it holds.",
    "play_card": "There's the spare part.",
    "evolve": "Finally, a bit of progress.",
    "power": "Got one more trick in the box.",
    "hurt": "Well, that knocked something loose.",
    "ko_taken": "That's one way to sink my plans.",
    "ko_scored": "Made it across. Just."
  },
  "jinx": {
    "attack": "Try and stop me.",
    "play_card": "I love it when this shows up.",
    "evolve": "Oh, now we're talking.",
    "power": "Bet you didn't plan for this.",
    "hurt": "Ha! I left the door wide open.",
    "ko_taken": "Okay. That one was ugly.",
    "ko_scored": "There we go. Don't blink."
  },
  "luna": {
    "attack": "All right. Cards on the table.",
    "play_card": "Oh! I found it.",
    "evolve": "It evolved! Wait, no, that's right.",
    "power": "I've got something for this.",
    "hurt": "Ow. I didn't protect it enough.",
    "ko_taken": "Oh no. That was the one I needed.",
    "ko_scored": "I did it! I mean—we did it."
  },
  "sol": {
    "attack": "Ready? On three. Two—",
    "play_card": "I brought a surprise. A normal-sized one.",
    "evolve": "Ta-da! That's a bigger problem.",
    "power": "Watch the next bit. It's good.",
    "hurt": "Hey! Those were my plans!",
    "ko_taken": "Nooo. Farewell, brave little guy.",
    "ko_scored": "One point for the home team!"
  },
  "rina": {
    "attack": "One, two, and—go!",
    "play_card": "Yes! Right on cue.",
    "evolve": "There you are. Perfect timing.",
    "power": "This is the good part.",
    "hurt": "Oh! That was offbeat.",
    "ko_taken": "I should have seen that turn coming.",
    "ko_scored": "We got it! Somebody cue the music."
  },
  "elena": {
    "attack": "Your move after this.",
    "play_card": "I've been holding this.",
    "evolve": "That should be sufficient.",
    "power": "There is a better line.",
    "hurt": "Hm. I misjudged the risk.",
    "ko_taken": "Yes, that's a costly mistake.",
    "ko_scored": "A clean knockout. I'll take it."
  },
  "sierra": {
    "attack": "Let's see what you've got.",
    "play_card": "Finally. I was waiting on this.",
    "evolve": "New look. Same plan.",
    "power": "You missed one thing.",
    "hurt": "Ouch. That's going on the reel.",
    "ko_taken": "I really should have switched.",
    "ko_scored": "Got it. No cameras needed."
  }
};
 const CONTEXT_VOICES={
  hana:{weakness_hit:"Oh no—that's the worst matchup!",status_hit:"Hey, hang in there, okay?",big_hit:"Whoa! That really hurt!"},
  reina:{weakness_hit:"I should have switched. My mistake.",status_hit:"You've thrown off my tempo.",big_hit:"Hmph. That was a serious hit."},
  shiori:{weakness_hit:"I overlooked the type advantage.",status_hit:"This condition changes my options.",big_hit:"I underestimated that attack."},
  yuna:{weakness_hit:"Wait, that was super effective?!",status_hit:"No, no, don't fall asleep now!",big_hit:"Okay, that was way too close!"},
  akari:{weakness_hit:"That matchup is less favorable than I thought.",status_hit:"A status effect. How inconvenient.",big_hit:"That was a sharp move."},
  camila:{weakness_hit:"You spotted my weak point. Cute.",status_hit:"That's going to make things interesting.",big_hit:"Well played. I felt that one."},
  marina:{weakness_hit:"Oh, I should have seen that coming.",status_hit:"Easy now. We'll get through it.",big_hit:"That's a bigger wave than I expected."},
  kaede:{weakness_hit:"Tch. Wrong Pokémon for this fight.",status_hit:"Seriously? Now I have to work around that.",big_hit:"Not bad. Don't get comfortable."},
  sol:{weakness_hit:"Oops. I walked right into that.",status_hit:"Hey! That's a dirty little trick.",big_hit:"Okay, okay, you got my attention!"},
  jinx:{weakness_hit:"That was a bad matchup. I know.",status_hit:"Great. Now I can't move how I want.",big_hit:"...I felt that. Keep going."},
  luna:{weakness_hit:"I knew this matchup was dangerous.",status_hit:"That's going to slow us down.",big_hit:"Oh! That was stronger than I expected."},
  elena:{weakness_hit:"I missed the obvious weakness.",status_hit:"That changes the whole plan.",big_hit:"All right. You caught me off guard."},
  sierra:{weakness_hit:"That's not making the highlight reel.",status_hit:"Wonderful. Now we're poisoned, too.",big_hit:"Ouch. No retakes on that one."},
  rina:{weakness_hit:"That's exactly what I was afraid of.",status_hit:"A condition, now? Think, think.",big_hit:"Wow. That hit hard."},
  jun:{weakness_hit:"Right. Of course that type beats mine.",status_hit:"That is going to be a problem.",big_hit:"Ow. You weren't kidding."},
  teo:{weakness_hit:"I brought the wrong answer to this matchup.",status_hit:"That's not in my plan.",big_hit:"I need to respect that damage."},
  iris:{weakness_hit:"I should have predicted that advantage.",status_hit:"This is a frustrating complication.",big_hit:"That was a clean, brutal hit."},
  elio:{weakness_hit:"I read that matchup badly.",status_hit:"Great. Another thing to recover from.",big_hit:"You nearly had me there."},
  alma:{weakness_hit:"Ah. You found the opening.",status_hit:"That condition makes this delicate.",big_hit:"Okay. I need a different approach."},
  barb:{weakness_hit:"I should've seen that matchup coming. I won't miss it twice.",
   status_hit:"That condition ruins my timing. New plan.",
   big_hit:"Okay, that's more damage than I budgeted for."},
  nereo:{weakness_hit:"A type advantage. Clever choice.",status_hit:"I will need to play around that.",big_hit:"A substantial hit. Understood."}
 };
 const CHANCES={attack:.82,play_card:.52,evolve:.85,power:.65,hurt:.7,big_hit:1,weakness_hit:1,status_hit:1,ko_taken:1,ko_scored:.95};
 const MAX_REACTIONS=6;
 const prizeCount=player=>Number.isFinite(player?.prizeCount)?player.prizeCount:null;
 const maxSeq=actions=>actions.reduce((n,e)=>Number.isSafeInteger(e?.seq)?Math.max(n,e.seq):n,0);
 const summary=view=>{
  const opponent=view?.players?.[1],active=opponent?.active;
  return {
   prizes:[prizeCount(view?.players?.[0]),prizeCount(opponent)],
   playerActive:view?.players?.[0]?.active?.id||null,
   cpuActive:active?{id:active.id,damage:Number(active.damage)||0,status:active.status||null,
    poison:!!active.poison,poisonDamage:Number(active.poisonDamage)||0,
    burn:!!(active.burn||active.burned),weaknessOverride:active.weaknessOverride||null}:null,
   cpuUnits:[active,...(opponent?.bench||[])].filter(Boolean).map(u=>({id:u.id,damage:Number(u.damage)||0}))
  };
 };
 const normalizedType=t=>String(t||'').toLowerCase().trim();
 // The Classic engine uses the first attacker's type and honors a current
 // weakness override (Conversion etc.). Damage must actually increase.
 function hitsWeakness(before,getCard){
  if(!before?.playerActive||!before?.cpuActive||typeof getCard!=='function')return false;
  const attackType=normalizedType(getCard(before.playerActive)?.types?.[0]);
  const defender=before.cpuActive;
  const weakness=defender.weaknessOverride?[defender.weaknessOverride]:
   (getCard(defender.id)?.weaknesses||[]).map(w=>typeof w==='string'?w:w?.type);
  return Boolean(attackType)&&weakness.some(w=>normalizedType(w)===attackType);
 }
 function gotStatus(before,after){
  if(!before||!after||before.id!==after.id)return false;
  return Boolean((after.status&&after.status!==before.status)||
   (!before.poison&&after.poison)||
   (after.poisonDamage>0&&after.poisonDamage>before.poisonDamage)||
   (!before.burn&&after.burn));
 }
 function createDirector({npcId,npcName='Opponent',random=Math.random,getCard=()=>null}={}){
  let previous=null,lastSeq=0,lastReactionSeq=-Infinity,count=0,attackShown=false;
  function reset(){previous=null;lastSeq=0;lastReactionSeq=-Infinity;count=0;attackShown=false;}
  function update(data){
   const view=data?.view;if(!view||!Array.isArray(view.players)||view.players.length<2)return null;
   const all=Array.isArray(data.activity)?data.activity:[];
   const nextSeq=Math.max(lastSeq,maxSeq(all)),now=summary(view);
   if(!previous){previous=now;lastSeq=nextSeq;return null;} // Never replay history after load/resume.
   const prior=previous;previous=now;
   const fresh=all.filter(e=>Number.isSafeInteger(e?.seq)&&e.seq>lastSeq&&e.seq<=nextSeq).sort((a,b)=>a.seq-b.seq);
   lastSeq=nextSeq;
   if((view.phase!=='game'&&!view.over)||count>=MAX_REACTIONS)return null;
   const koTaken=prior.prizes[0]!==null&&now.prizes[0]!==null&&now.prizes[0]<prior.prizes[0];
   const koScored=prior.prizes[1]!==null&&now.prizes[1]!==null&&now.prizes[1]<prior.prizes[1];
   let kind=null,event=null;
   if(koTaken)kind='ko_taken';
   else if(koScored)kind='ko_scored';
   else {
    const playerAttacked=fresh.some(a=>a.side===0&&a.type==='attack');
    const sameActive=prior.cpuActive&&now.cpuActive&&prior.cpuActive.id===now.cpuActive.id;
    const activeDamage=sameActive?Math.max(0,now.cpuActive.damage-prior.cpuActive.damage):0;
    const hitAnyUnit=now.cpuUnits.some(u=>prior.cpuUnits.some(p=>p.id===u.id&&u.damage>p.damage));
    if(playerAttacked&&activeDamage>0&&hitsWeakness(prior,getCard))kind='weakness_hit';
    else if(playerAttacked&&sameActive&&gotStatus(prior.cpuActive,now.cpuActive))kind='status_hit';
    else if(playerAttacked&&activeDamage>=40)kind='big_hit';
    else if(playerAttacked&&hitAnyUnit)kind='hurt';
    else {
     const cpu=fresh.filter(a=>a.side===1);
     const kinds={attack:'attack',play_trainer:'play_card',evolve:'evolve',use_power:'power',use_stadium:'play_card',bench:'play_card'};
     event=cpu.slice().reverse().find(a=>kinds[a.type]);
     if(event)kind=kinds[event.type];
    }
   }
   if(!kind||(view.phase!=='game'&&kind!=='ko_taken'&&kind!=='ko_scored'))return null;
   const keyMoment=kind==='ko_taken'||kind==='ko_scored';
   const contextual=kind==='weakness_hit'||kind==='status_hit'||kind==='big_hit';
   // The first CPU attack in an RPG duel always introduces the rival visually.
   // Later reactions remain selective, with a slot reserved for a knockout.
   const firstAttack=kind==='attack'&&!attackShown;
   // Reserve one ordinary slot for that first attack as well as the KO slot.
   const normalCap=MAX_REACTIONS-(attackShown||firstAttack?2:3);
   // Reserve a slot for a meaningful battle reaction and one for a KO.
   if(!keyMoment&&count>=(contextual?MAX_REACTIONS-1:normalCap))return null;
   if(!keyMoment&&!contextual&&!firstAttack&&nextSeq-lastReactionSeq<3)return null;
   if(!contextual&&!firstAttack&&(typeof random==='function'?random():Math.random())>=CHANCES[kind])return null;
   const titles=LABELS[kind];
   const line=CONTEXT_VOICES[npcId]?.[kind]||VOICES[npcId]?.[kind]||VOICES[npcId]?.hurt||GENERIC[kind];
   lastReactionSeq=nextSeq;count++;if(kind==='attack')attackShown=true;
   return {npcId,npcName,kind,title:titles[0],subtitle:kind==='attack'&&event?.label?'Attack: '+String(event.label).slice(0,64):titles[1],line,index:count,imageKey:kind};
  }
  return {update,reset,get count(){return count;}};
 }
 function assetCandidates(manifest,npcId,kind,outfit=null){
  const entry=manifest?.characters?.[npcId];
  const belongsToNpc=path=>typeof path==='string'&&(
   path.startsWith('/rpg-assets/'+npcId+'.')||
   path.startsWith('/rpg-assets/characters/'+npcId+'/')||
   path.startsWith('/rpg-assets/reactions/'+npcId+'/'));
  const valid=path=>typeof path==='string'&&/^\/rpg-assets\/[a-z0-9/_-]+\.(?:png|webp|jpe?g)$/i.test(path)&&belongsToNpc(path);
  // Never retry Elio's unreviewed legacy expressions, including manifest fallbacks.
  if(npcId==='elio')return [...new Set([
   ...(kind==='attack'?[entry?.attack]:[]),...vnCandidates(npcId,kind)
  ].filter(valid))];
  // Dedicated attack art leads its cinematic when declared in the manifest.
  // Other reactions still prefer expressions; all art must belong to this NPC.
  const kinds={weakness_hit:['weakness_hit','hurt','ko_taken'],
   status_hit:['status_hit','hurt'],big_hit:['big_hit','hurt'],
   hurt:['hurt','big_hit'],ko_taken:['ko_taken','hurt'],
   ko_scored:['ko_scored','match_cutin'],
   play_card:['play_card','match_cutin'],evolve:['evolve','match_cutin'],
   power:['power','match_cutin'],attack:['attack','match_cutin']};
  const reactionNames={
   play_card:['play_card','play-card','card_play','card-play'],
   evolve:['evolve','evolution'],
   power:['power','pokemon_power','pokemon-power'],
   weakness_hit:['weakness_hit','weakness-hit','hurt'],
   status_hit:['status_hit','status-hit','hurt'],
   big_hit:['big_hit','big-hit','hurt'],
   hurt:['hurt','hit'],
   ko_taken:['ko_taken','ko-taken','hurt'],
   ko_scored:['ko_scored','ko-scored','victory'],
   attack:['attack']
  };
  const reactionPaths=(entry&&kind!=='attack'?(reactionNames[kind]||[kind]):[]).flatMap(name=>
   ['png','webp','jpg'].map(ext=>'/rpg-assets/reactions/'+npcId+'/'+name+'.'+ext));
  // Laca's current RPG outfit takes priority over legacy generic cut-ins.
  // The images are optional: missing PNGs fall back to the existing art.
  const outfitAttack=kind==='attack'&&npcId==='laca'&&['casual','lifeguard'].includes(outfit)?
   ['/rpg-assets/reactions/laca/'+outfit+'/attack.png']:[];
  const primaryAttackArt=kind==='attack'?[entry?.attack]:[];
  return [...new Set([...outfitAttack,...primaryAttackArt,...vnCandidates(npcId,kind),
   ...(kinds[kind]||[kind]).map(name=>entry?.[name]),
   ...reactionPaths,entry?.default,PORTRAITS[npcId]].filter(valid))];
 }
 // Framing follows the loaded image, even if the first candidate fails.
 function artClass(path){
  return (/^\/rpg-assets\/reactions\/[a-z0-9_-]+\/attack\.(?:png|webp|jpe?g)$/i.test(path)?' has-wide-action-art':'')+
   (/\/cutins\/match-cutin\.webp$/i.test(path)?' has-match-art':'')+
   (/^\/rpg-assets\/reactions\/laca\/(?:casual|lifeguard)\/attack\.png$/i.test(path)?' has-wide-action-art':'')+
   (/\/(?:vn-expressions|expression-portraits)\/[a-z_-]+\.(?:png|webp)$/i.test(path)?' has-vn-expression':'');
 }
 function assetFor(manifest,npcId,kind){
  return assetCandidates(manifest,npcId,kind)[0]||null;
 }
 // Presentation duration is independent of movement accessibility preferences.
 // In reduced-motion mode the static card remains readable for just as long.
 const isClutch=kind=>kind==='ko_taken'||kind==='ko_scored';
 const priorityFor=kind=>isClutch(kind)?3:['weakness_hit','status_hit','big_hit','evolve','power'].includes(kind)?2:1;
 const durationFor=(kind,reduced=false)=>kind==='attack'?2800:isClutch(kind)?2600:['weakness_hit','status_hit','big_hit'].includes(kind)?2300:1650;
 function makeExperience({element,npcId,npcName,outfit=null,random=Math.random,getCard=()=>null,doc=typeof document==='undefined'?null:document,
  onShow=()=>{},schedule=setTimeout,cancel=clearTimeout,media=typeof window==='undefined'?null:window}={}){
  const director=createDirector({npcId,npcName,random,getCard});
  let manifest=null,queued=null,active=false,currentPriority=0,timer=null,generation=0;
  let pendingShown=null,settleShown=null;
  const images=new Map();
  const reduced=()=>!!media?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function settle(){if(settleShown){const done=settleShown;settleShown=null;pendingShown=null;done();}}
  function hide(){
   generation++;
   if(timer!==null)cancel(timer);
   timer=null;active=false;currentPriority=0;
   element?.classList.add('hidden');element?.replaceChildren();
   settle();
  }
  function reset(){director.reset();queued=null;hide();}
  function preloadPath(path){
   if(images.has(path))return images.get(path).promise;
   const img=new media.Image();
   img.decoding='async';
   const promise=new Promise(resolve=>{
    let finished=false;
    const timeout=setTimeout(()=>finish(false),5000);
    function finish(ok){
     if(finished)return;
     finished=true;clearTimeout(timeout);img.onload=null;img.onerror=null;resolve(ok);
    }
    img.onload=()=>{
     if(typeof img.decode==='function'){
      try{Promise.resolve(img.decode()).then(()=>finish(true),()=>finish(false));}
      catch{finish(true);}
     }else finish(true);
    };
    img.onerror=()=>finish(false);
    img.src=path;
   });
   images.set(path,{img,promise});
   return promise;
  }
  async function readyAsset(candidates){
   let timeout;
   const deadline=new Promise(resolve=>{timeout=setTimeout(()=>resolve(null),7500);});
   const find=(async()=>{
    for(const path of candidates)if(await preloadPath(path))return path;
    return null;
   })();
   try{return await Promise.race([find,deadline]);}
   finally{clearTimeout(timeout);}
  }
  function pump(){
   if(active||!queued||!element||!doc)return;
   const reaction=queued;queued=null;active=true;currentPriority=priorityFor(reaction.kind);
   const ticket=++generation;
   pendingShown=new Promise(resolve=>{settleShown=resolve;});
   const candidates=assetCandidates(manifest,npcId,reaction.imageKey,outfit);
   function show(readyPath){
    if(ticket!==generation||!active)return;
    const chibiMode=media?.document?.documentElement?.dataset?.rpgDiscreet==='on';
    if(readyPath&&typeof window!=='undefined'&&!chibiMode){
     try{window.parent?.postMessage({type:'neo-rpg-art-seen',path:readyPath},window.location.origin);}catch{}
    }
    const card=doc.createElement('div');
    const baseClass='npc-reaction-card npc-reaction-'+reaction.kind+(isClutch(reaction.kind)?' is-finisher':'');
    card.className=baseClass;
    const portrait=doc.createElement('div');portrait.className='npc-reaction-portrait';
    if(readyPath){
     const img=doc.createElement('img');img.alt='';img.src=readyPath;
     card.className=baseClass+artClass(readyPath);
     portrait.append(img);
    }else if(typeof media?.Image!=='function'&&candidates.length){
     // Node/test callers without an Image loader retain the older DOM fallback.
     const img=doc.createElement('img');img.alt='';
     let index=0;
     const advance=()=>{
      const path=candidates[index];
      card.className=baseClass+artClass(path);
      img.src=path;
     };
     img.onerror=()=>{
      if(++index<candidates.length)advance();
      else{img.remove();card.className=baseClass;portrait.classList.add('no-art');}
     };
     advance();portrait.append(img);
    }else portrait.classList.add('no-art');
    media?.NeoRpgDiscreetAvatars?.set?.(portrait,npcId,reaction.imageKey||reaction.kind,reaction.npcName);
    const copy=doc.createElement('div');copy.className='npc-reaction-copy';
    const tag=doc.createElement('span');tag.className='npc-reaction-tag';tag.textContent=reaction.subtitle;
    const name=doc.createElement('strong');name.className='npc-reaction-name';name.textContent=reaction.npcName;
    const title=doc.createElement('span');title.className='npc-reaction-title';title.textContent=reaction.title;
    const line=doc.createElement('p');line.textContent='“'+reaction.line+'”';
    copy.append(tag,name,title,line);card.append(portrait,copy);
    element.replaceChildren(card);element.classList.remove('hidden');
    onShow({...reaction,imageCandidates:readyPath?[readyPath,...candidates.filter(p=>p!==readyPath)]:candidates});
    media?.NeoRpgAudio?.play?.(isClutch(reaction.kind)?'knockout':'cutin');
    settle();
    const showingGeneration=generation;
    timer=schedule(()=>{
     if(generation!==showingGeneration)return;
     timer=null;hide();pump();
    },durationFor(reaction.kind,reduced()));
   }
   if(typeof media?.Image==='function'&&candidates.length)
    readyAsset(candidates).then(show,()=>show(null));
   else show(null);
  }
  function update(data){
   const reaction=director.update(data);
   if(!reaction)return null;
   const priority=priorityFor(reaction.kind);
   if(active&&priority===3&&priority>currentPriority){
    queued=null;hide();
   }
   if(!active)queued=reaction;
   else if(!queued||priority>priorityFor(queued.kind))queued=reaction;
   pump();
   return reaction;
  }
  return {update,reset,setManifest:value=>{
    manifest=value;
    if(typeof media?.Image==='function'){
     // Preload actual working images, including fallback variants, not just the
     // first candidate (often a nonexistent file).
     for(const kind of ['attack','play_card','evolve','power','weakness_hit','status_hit','big_hit','hurt','ko_taken','ko_scored']){
      const candidates=assetCandidates(manifest,npcId,kind,outfit);
      if(candidates.length)readyAsset(candidates).catch(()=>{});
     }
    }
   },whenShown:()=>pendingShown||Promise.resolve(),get count(){return director.count;},
   get active(){return active;},get queued(){return queued?.kind||null;}};
 }
 return {createDirector,makeExperience,assetFor,MAX_REACTIONS,priorityFor,durationFor,VOICES};
});


