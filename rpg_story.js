'use strict';
/* Story authored separately from the view. Public client data for this prototype:
   a server-controlled spoiler-safe scene API is a later milestone. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoHarborStory=api;
})(typeof window!=='undefined'?window:null,function(){
 const REL=typeof module==='object'&&module.exports?require('./rpg_relationships'):window.NeoRpgRelationships;
 const kinds={
  support:{affection:2,trust:2,respect:0,attraction:0},
  honest:{affection:1,trust:1,respect:2,attraction:0},
  flirt:{affection:1,trust:0,respect:0,attraction:2},
  friend:{affection:2,trust:1,respect:0,attraction:0},
  commit:{affection:2,trust:1,respect:0,attraction:2}
 };
 const PACK=typeof module==='object'&&module.exports?require('./rpg_narrative_pack'):window.NeoRpgNarrativePack;
 const BONDC=typeof module==='object'&&module.exports?require('./rpg_bond_chapters'):window.NeoRpgBondChapters;
 const CHARPACKS=typeof module==='object'&&module.exports?require('./rpg_character_packs.generated'):window.NeoRpgCharacterPacks;
 const EXTRA=typeof module==='object'&&module.exports?require('./rpg_route_expansions'):window.NeoRpgRouteExpansions;
 const VN=typeof module==='object'&&module.exports?require('./rpg_conversations'):window.NeoRpgConversations;
 const SCENES=typeof module==='object'&&module.exports?require('./rpg_legacy_scenes'):window.NeoRpgLegacyScenes;
 const E=[];
 function arc(npc,rows){
  rows.forEach((r,index)=>{
   const [title,start,end,place,slot,minBond,lines,opts]=r;
   E.push({
    id:npc+'_route_'+(index+1),npc,chapter:index===0?1:index===1?2:3,
    title,start,end,place,slot,minBond,
    prerequisite:index?npc+'_route_'+index:null,
    lines:lines.map((text,i)=>({speaker:i%2?'Protagonist':npc,text})),
    choices:opts.map(([label,reply,kind,flag])=>({label,reply,kind,flag:flag||null,delta:kinds[kind]}))
   });
  });
 }
 arc('hana',[
 ['Too Many Promises',5,18,'shop',0,0,
  ['You arrived early? I thought I would be alone setting up all these tables.','Everybody is counting on you. Are you sure you need to do all of this yourself?','I always say yes before I remember how many hours are in a day.'],
  [['Help her finish before opening','For once, I might actually finish early. Thanks for staying.','support'],
   ['Suggest she ask the others','Maybe I have been making it harder for everyone to help.','honest'],
   ['Say her smile makes the work look easy','You really know how to make a girl lose her train of thought.','flirt']]],
 ['A Seat Saved',24,40,'cafe',1,2,
  ['I saved a seat! I was not sure if you would come.','You seem distracted. Everything all right?','There is something I want to try on my own, but the idea of letting people down scares me.'],
  [['Offer to practice together','Then I would like that. As a teammate, not as another favor.','support'],
   ['Tell her she deserves her own goals','I needed somebody to say that without asking anything in return.','honest'],
   ['Ask whether this counts as a date','It could, if you stop hiding behind that grin.','flirt']]],
 ['One Empty Chair',48,64,'shop',2,3,
  ['The room was full earlier. Now everyone has gone.','You did not leave with them.','I wanted to see what it feels like to stay because I want to, not because I have to.'],
  [['Stay until the lights go out','I am glad the last chair was not empty after all.','support'],
   ['Ask what she wants next','Maybe that is finally a question I can answer.','honest'],
   ['Tell her you came back for her','I thought so. I was hoping so.','flirt']]],
 ['A Promise for Tomorrow',73,86,'park',2,4,
  ['This season went faster than I imagined.','It is not over yet.','Then before it ends, I would like to decide what comes next.'],
  [['Tell her you want to be together','Then let us see where this goes, beyond the tournament.','commit','romance'],
   ['Promise to remain her friend','I am lucky to have a friend who means what he says.','friend','friendship'],
   ['Tell her to choose for herself','I will. And this time, I am excited to.','honest','friendship']]]
 ]);
 arc('reina',[
 ['Another Hour',7,19,'center',2,0,
  ['The lights should be off by now. You still want to play?','Do you always train after everyone leaves?','Only when there is something worth improving.'],
  [['Stay to practice openings','Good. No excuses when you lose the first three.','support'],
   ['Ask what makes a great rival','Someone who never stops asking that question.','honest'],
   ['Tell her she is the reason you stayed','Bold. You have my attention for one more hour.','flirt']]],
 ['Pressure Point',26,41,'shop',1,2,
  ['You know what makes me angry? When a player gets praised for being lucky.','You cannot control what people say.','No. But I can control what happens at the table.'],
  [['Challenge her to test a new list','Finally. A productive answer.','support'],
   ['Say a loss does not erase her skill','Do not start comforting me. ...I know what you mean.','honest'],
   ['Say she is hard to ignore','You are going to regret how much I remember that.','flirt']]],
 ['Side by Side',52,66,'center',1,3,
  ['You have improved. I hate admitting it.','Then do not. Show me.','There is a match coming that I cannot afford to treat casually.'],
  [['Prepare as training partners','All right. I will trust you to push me.','support'],
   ['Ask what is truly at stake','More than you think. Thank you for asking first.','honest'],
   ['Suggest one evening without cards','Just one. And you are not allowed to call it practice.','flirt']]],
 ['The Match After',76,88,'park',2,4,
  ['We were supposed to talk after the season.','We are talking now.','Then stop looking at me like there is still a score to settle.'],
  [['Say she is more than your rival','Good. I was beginning to hope you could see it.','commit','romance'],
   ['Offer a lifetime of rematches as friends','That is a terrible offer. I accept.','friend','friendship'],
   ['Let her choose the next challenge','Fine. But do not expect me to make it easy.','honest','friendship']]]
 ]);
 arc('shiori',[
 ['A Quiet Observer',12,24,'cafe',2,0,
  ['You watch your opponents very carefully.','You do not seem to play much yourself.','Watching is sometimes easier than participating.'],
  [['Invite her to share a game','Perhaps I have been away from the table too long.','support'],
   ['Ask how she learned to read games','By making errors that mattered.','honest'],
   ['Say you would rather hear about her','You are a curious young man.','flirt']]],
 ['A Recorded Match',35,51,'library',0,2,
  ['This recording is much older than you would guess.','You have watched it a dozen times already.','And every time I think I could have chosen differently.'],
  [['Watch it without judging','Thank you for giving it that much patience.','support'],
   ['Ask what she would do today','That is a harder question. Perhaps a better one.','honest'],
   ['Suggest a better memory together','You really do make dangerous suggestions so gently.','flirt']]],
 ['An Open Door',58,72,'center',2,3,
  ['The room sounds the same as it always did.','But you sound different.','Maybe I finally understand that returning is not the same as repeating.'],
  [['Offer to stand beside her','Then I will take one more step.','support'],
   ['Respect her choice, whatever it is','I think that is exactly what I needed.','honest'],
   ['Tell her she belongs here with you','I did not know how much I wanted to hear that.','flirt']]],
 ['Beyond the Score',78,89,'cafe',2,4,
  ['I used to believe everything important could be decided in one match.','And now?','Now I am curious about things without winners.'],
  [['Ask to discover those things together','There is no score to keep. How wonderfully frightening.','commit','romance'],
   ['Offer your friendship without conditions','Then I hope you will keep visiting.','friend','friendship'],
   ['Encourage her next chapter','I believe I finally can.','honest','friendship']]]
 ]);
 arc('yuna',[
 ['Impossible Combo',9,22,'arcade',1,0,
  ['I have a combo that works exactly once in a hundred games!','That sounds like an awful success rate.','Unless the one time is spectacular.'],
  [['Help test it until closing','You are officially my favorite co-conspirator!','support'],
   ['Ask her to explain the theory','It is a theory. There are charts. Bad charts.','honest'],
   ['Say the spectacle is already worth watching','You are making it impossible to concentrate!','flirt']]],
 ['Behind the Joke',30,46,'arcade',2,2,
  ['Do you think they came to watch a joke or a player?','Who is they?','Does it matter? Sometimes I cannot tell the difference.'],
  [['Stay when the crowd leaves','Good. I had something real to show you.','support'],
   ['Tell her skill and humor can coexist','I wish everyone understood that.','honest'],
   ['Say she never needs a crowd for you','That was way too sincere. I like it.','flirt']]],
 ['A Real Shot',52,67,'shop',1,3,
  ['I brought a serious deck. Nobody laughed.','How did that feel?','Stranger than I expected. The stakes suddenly seemed real.'],
  [['Test the deck with her','Okay. No funny business. Well, a little.','support'],
   ['Praise her preparation','You noticed? I spent nights on that list.','honest'],
   ['Promise to cheer louder than anyone','Do not make me blush right before a match!','flirt']]],
 ['After the Encore',74,87,'arcade',2,4,
  ['The music stopped. I did not realize how late it was.','Do you want me to walk you home?','Maybe. First I want to ask you something serious.'],
  [['Tell her you want a real date','No audience? Just us? That sounds perfect.','commit','romance'],
   ['Promise to keep being her partner in chaos','Then we are going to cause legendary trouble.','friend','friendship'],
   ['Ask what she wants most','For once, I think I already know.','honest','friendship']]]
 ]);
 arc('akari',[
 ['A Statistical Anomaly',13,26,'library',0,0,
  ['Your card choices are statistically unusual.','Is that a compliment?','I have not decided. Sit down.'],
  [['Compare notes together','Your explanation makes more sense than the numbers suggest.','support'],
   ['Challenge her assumptions','A fair criticism. Unexpectedly fair.','honest'],
   ['Ask if she studies everyone this closely','No. That is the anomalous part.','flirt']]],
 ['An Unplanned Afternoon',33,49,'cafe',1,2,
  ['I mapped out three possible conversations today.','How is that working?','You have already deviated from all three.'],
  [['Listen without interrupting','You make uncertainty rather pleasant.','support'],
   ['Ask her to leave the notebook closed','Perhaps one afternoon can remain unmeasured.','honest'],
   ['Offer an entirely improvised date','That is not a controlled experiment. ...Maybe.','flirt']]],
 ['The Broken Prediction',54,70,'center',1,3,
  ['My model was wrong. I knew it could happen.','And yet you seem surprised.','Being prepared for a possibility is not the same as living through it.'],
  [['Work on a new model together','With you? Yes. I would like that.','support'],
   ['Tell her she need not solve everything','An unsettling but useful idea.','honest'],
   ['Suggest you two are an exception','I am tempted to agree without evidence.','flirt']]],
 ['No More Predictions',76,89,'library',2,4,
  ['I did not prepare a speech.','That is new.','I thought I might simply tell you how I feel.'],
  [['Tell her you feel the same','Then this can be our first unscheduled adventure.','commit','romance'],
   ['Choose to remain close friends','A reliable constant. I would value that.','friend','friendship'],
   ['Invite her to surprise herself','I intend to. Thank you.','honest','friendship']]]
 ]);
 arc('camila',[
 ['Terms and Conditions',16,29,'shop',1,0,
  ['That card catches your eye, does it?','You have excellent taste.','Taste is cheap. Knowing what matters is rarer.'],
  [['Trade fairly and openly','That was almost suspiciously honest.','support'],
   ['Ask what she values most','Something that cannot be priced. I am still looking.','honest'],
   ['Tell her she is distracting you','I have been accused of worse.','flirt']]],
 ['A Question of Trust',34,51,'cafe',2,2,
  ['A rumor has been making the rounds.','About the shop?','About people who mistake every deal for a friendship.'],
  [['Ask before judging','You could have believed everyone else.','support'],
   ['Tell her trust must be earned twice','I cannot argue with that.','honest'],
   ['Tell her you came for her, not the cards','What a dangerous thing to say to me.','flirt']]],
 ['The Price of Honesty',58,72,'shop',2,3,
  ['I could make an easy profit today.','But you do not look pleased.','Maybe I am tired of winning conversations I never meant to have.'],
  [['Support a different choice','Perhaps doing the right thing can feel like winning.','support'],
   ['Tell her the decision is hers','Yes. This time, it really is.','honest'],
   ['Say you prefer the person behind the smile','You have been paying closer attention than I thought.','flirt']]],
 ['No Bargaining',77,89,'cafe',2,4,
  ['I usually know what I want before I sit down.','What changed?','You stopped treating our time like a transaction.'],
  [['Ask her to start something real','Then for once, no terms and conditions.','commit','romance'],
   ['Promise your friendship is not for sale','I would never put a price on it.','friend','friendship'],
   ['Give her time to decide','Thank you. I am learning to use it.','honest','friendship']]]
 ]);
 arc('marina',[
 ['Waterline',8,22,'park',2,0,
  ['I like how the river looks when the last boats return.','You sound like you have been coming here a long time.','Long enough to know every reflection changes.'],
  [['Sit and share the quiet','I am glad you did not try to fill every silence.','support'],
   ['Ask about her next tournament','I have thought about it. Thinking is easier than entering.','honest'],
   ['Tell her the sunset has competition','You are making me very glad I stayed.','flirt']]],
 ['The Application',31,47,'cafe',0,2,
  ['The registration form is still in my bag.','You have brought it here three times.','I know. I keep waiting until I am ready.'],
  [['Help her prepare without pressure','Then maybe ready does not have to mean perfect.','support'],
   ['Ask what she is afraid of','I think I am more afraid of trying than losing.','honest'],
   ['Offer to be her first supporter','You always make things sound possible.','flirt']]],
 ['A Step Forward',53,69,'center',1,3,
  ['I signed up. My hands were shaking.','And now?','Still shaking. But I am here.'],
  [['Stay beside her until the match','You have no idea how much that helps.','support'],
   ['Tell her the choice itself matters','Yes. For once I did not let tomorrow decide.','honest'],
   ['Say you want to celebrate together','That sounds like something I can look forward to.','flirt']]],
 ['After the Tide',75,88,'park',2,4,
  ['It is the same river. I think I am the one who changed.','What would you like next?','Something I choose before the current carries it away.'],
  [['Ask her to be with you','Then let us choose each other, today and tomorrow.','commit','romance'],
   ['Promise to keep cheering her on','I can always use a friend like you.','friend','friendship'],
   ['Tell her the future belongs to her','I think I finally believe that.','honest','friendship']]]
 ]);
 arc('kaede',[
 ['An Unexpected Arrival',42,54,'arcade',2,0,
  ['Everyone keeps staring. I have not even played a match.','New faces tend to cause a stir around here.','Then let me give them something to talk about.'],
  [['Show her the local tables','Not a terrible welcome, I suppose.','support'],
   ['Ask what brought her here','Strong opponents. Let us leave it at that.','honest'],
   ['Tell her she made an entrance','Good. I was aiming for memorable.','flirt']]],
 ['No Safe Bets',55,66,'center',1,2,
  ['You came. I thought you would stay with the regulars.','You sound disappointed in advance.','People make their choices. Then they explain them afterward.'],
  [['Hear her side first','That is more courtesy than I expected.','support'],
   ['Ask for a straight answer','Fine. You have earned one.','honest'],
   ['Say you prefer interesting company','Careful. Interesting is not always easy.','flirt']]],
 ['A Place to Return To',69,80,'park',2,3,
  ['A train can take you away in an hour.','Is that what you want?','Sometimes leaving feels easier than answering that.'],
  [['Ask her to stay for herself','You do not ask much of me. That matters.','support'],
   ['Tell her you will respect her decision','You keep making this harder to run from.','honest'],
   ['Admit you would miss her','Then perhaps I ought to give you a reason not to.','flirt']]],
 ['Tomorrow, Maybe',81,90,'arcade',2,4,
  ['I was going to leave without telling anyone.','But you did not.','No. I wanted one last conversation to be honest.'],
  [['Ask for a future together','You have no idea what you are signing up for. ...I do.','commit','romance'],
   ['Offer a friendship that survives distance','Then do not lose my number.','friend','friendship'],
   ['Tell her the decision is still hers','It is. And I finally think I can make it.','honest','friendship']]]
 ]);
 // The original characters now use six-beat authored scenes with explicit
 // narration. Only prose changes; preserve route IDs, prerequisites, windows,
 // choice kinds, flags and relationship deltas for existing saves.
 for(const e of E){
  const revision=SCENES.byId(e.id);
  if(!revision)continue;
  if(revision.choices.length!==e.choices.length)throw Error('Scene choice count changed: '+e.id);
  e.lines=revision.lines.map(line=>({...line}));
  e.choices.forEach((choice,index)=>{
   choice.label=revision.choices[index].label;
   choice.reply=revision.choices[index].reply;
  });
 }
 // Keep the original four-scene heroine routes stable for existing saves.
 // Add optional guest and crossover episodes without renumbering those routes.
 E.push(...(CHARPACKS?.events||[]),...PACK.events,...BONDC.events,...(EXTRA?.events||[]));
 const ID=new Map(E.map(e=>[e.id,e]));
 function normalize(state){
  if(!state.storyDone||typeof state.storyDone!=='object')state.storyDone={};
  if(!state.storyMissed||typeof state.storyMissed!=='object')state.storyMissed={};
  if(!state.relationships||typeof state.relationships!=='object')state.relationships={};
  if(!('partner' in state))state.partner=null;
  if(!state.storyFlags||typeof state.storyFlags!=='object'||Array.isArray(state.storyFlags))state.storyFlags={};
  for(const e of E)if(!state.relationships[e.npc])state.relationships[e.npc]={affection:0,trust:0,attraction:0,respect:0,duels:0};
  // Earlier builds saved the five guests' openly romantic second finale
  // options without a partner, because those options used kind:'flirt'.
  // Restore a *single* unambiguous prior choice on load. Never guess a
  // partner when multiple routes were completed or one already exists.
  if(!state.partner){
   const legacy=['jinx','luna','rina','elena','sierra'].filter(npc=>
    state.storyDone[npc+'_route_5']?.choice===1&&!state.routeOutcomes?.[npc]);
   if(legacy.length===1&&VN.commitmentReady(state,legacy[0])){
    state.partner=legacy[0];
    state.routeOutcomes=state.routeOutcomes||{};
    state.routeOutcomes[legacy[0]]='romance';
   }
  }
  return state;
 }
 function qualifies(e,state,place=state.location){
  const s=normalize(state),b=s.relationships[e.npc],previous=e.prerequisite;
  return s.day>=e.start&&s.day<=e.end&&s.slot===e.slot&&place===e.place&&!s.storyDone[e.id]&&!s.storyMissed[e.id]&&(!previous||!!s.storyDone[previous])&&b.affection>=VN.bondNeeded(e);
 }
 function linesFor(state,id){const e=ID.get(id);if(!e)return [];const flag=state?.storyFlags?.[e.prerequisite];const opening=e.openingByFlag?.[flag];return opening?[{...e.lines[0],text:opening},...e.lines.slice(1)]:e.lines;}
 function available(state,place=state.location){return E.filter(e=>qualifies(e,state,place));}
 function recordExpiry(state){
  normalize(state);const missed=[];
  for(const e of E){
   if(e.evergreen)continue;
   if(state.day>e.end&&!state.storyDone[e.id]&&!state.storyMissed[e.id]){
    state.storyMissed[e.id]=true;
    if(!e.prerequisite||state.storyDone[e.prerequisite])missed.push(e);
   }
  }return missed;
 }
 function resolve(state,eventId,choiceIndex){
  normalize(state);const e=ID.get(eventId);
  if(!e||state.storyDone[eventId])throw Error('Already completed or missing story event');
  if(!qualifies(e,state))throw Error('Story event is no longer available');
  const choice=e.choices[choiceIndex];if(!choice)throw Error('Invalid story choice');
  if(choice.kind==='commit'&&state.partner&&state.partner!==e.npc)throw Error('Already committed to another relationship');
  if(choice.kind==='commit'&&!VN.commitmentReady(state,e.npc))throw Error('A deeper bond is required');
  REL.apply(state,e.npc,choice.delta);
  if(choice.kind==='commit'){if(VN.commitmentReady(state,e.npc)){state.partner=e.npc;state.routeOutcomes=state.routeOutcomes||{};state.routeOutcomes[e.npc]='romance';}else{state.routeOutcomes=state.routeOutcomes||{};state.routeOutcomes[e.npc]='friendship';}}
  if(choice.kind==='friend'||choice.flag==='friendship'){state.routeOutcomes=state.routeOutcomes||{};state.routeOutcomes[e.npc]='friendship';}
  if(choice.flag&&choice.flag!=='romance'&&choice.flag!=='friendship')state.storyFlags[e.id]=choice.flag;
  state.storyDone[e.id]={choice:choiceIndex,day:state.day};
  return {event:e,choice,partner:state.partner};
 }
 function validate(){
  const faults=[],seen=new Set();
  for(const e of E){
   if(seen.has(e.id))faults.push('Duplicate '+e.id);seen.add(e.id);
   if(e.start>e.end||e.start<1||e.end>90||e.slot<0||e.slot>2)faults.push('Invalid window '+e.id);
   if(e.prerequisite){const prev=ID.get(e.prerequisite);if(!prev||(!e.evergreen&&prev.end>=e.end))faults.push('Bad link '+e.id);}
   if(e.choices.length<2||!e.lines.length||!e.choices.every(c=>c.label&&c.reply&&c.delta))faults.push('Incomplete '+e.id);
   if(e.lines.some(line=>!line.speaker||!line.text))faults.push('Invalid dialogue '+e.id);
  }
  return faults;
 }
 return Object.freeze({events:E,byId:id=>ID.get(id),normalize,available,qualifies,linesFor,recordExpiry,resolve,validate});
});
