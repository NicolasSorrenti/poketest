'use strict';
// Conversation pacing and contextual invitations for the Neo Harbor VN.
// Pure functions: casual encounters must not award stats, spend time, or expose numeric bonuses.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgConversations=api;
})(typeof window!=='undefined'?window:null,function(){
 const EVERYDAY=typeof module==='object'&&module.exports?require('./rpg_everyday_chats'):window.NeoRpgEverydayChats;
 const CHARACTER=typeof module==='object'&&module.exports?require('./rpg_character_chats'):window.NeoRpgCharacterChats;
 const GROUP=typeof module==='object'&&module.exports?require('./rpg_group_chats'):window.NeoRpgGroupChats;
 const MEMORY=typeof module==='object'&&module.exports?require('./rpg_dialogue_memory'):window.NeoRpgDialogueMemory;
 const REL=typeof module==='object'&&module.exports?require('./rpg_relationships'):window.NeoRpgRelationships;
 function availableTalk(state,npc,character){
  // bondRank normalizes relationship buckets, so isolate those writes from the
  // live save: opening a casual conversation must remain a read-only action.
  const rankState=state&&typeof state==='object'?{
   ...state,
   relationships:{...(state.relationships||{}),[npc]:{...(state.relationships?.[npc]||{})}},
   bonds:{...(state.bonds||{}),[npc]:{...(state.bonds?.[npc]||{})}}
  }:state;
  const rank=REL?.bondRank?.(rankState,npc)||0;
  return (Array.isArray(character?.talk)?character.talk:[])
   .map((entry,index)=>({entry,index}))
   .filter(({entry})=>typeof entry==='string'||(entry&&typeof entry.text==='string'&&
     (Number(entry.minBondRank)||0)<=rank))
   .map(({entry,index})=>({text:typeof entry==='string'?entry:entry.text,index}));
 }
 function hash(text){
  let n=2166136261;
  for(const ch of String(text)){n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;}
  return n>>>0;
 }
 function topic(state,npc,length){
  return length>0?hash(npc+':'+state.day+':'+state.slot)%length:0;
 }
 function dialogueEntry(state,npc,character,dialogueModule,{first=false,present=[]}={}){
  const authoredTalk=availableTalk(state,npc,character);
  const lines=authoredTalk.length?authoredTalk.map(entry=>entry.text):
   [character?.repeat||character?.intro||'Good to see you.'];
  if(first){
   if(Array.isArray(character?.firstMeeting)&&character.firstMeeting.length>=3)return {lines:character.firstMeeting,id:null,source:'intro'};
   const greeting=dialogueModule?.greetingLines?.(npc,character.intro||lines[0]);
   if(Array.isArray(greeting)&&greeting.length>=3)return {lines:greeting,id:null,source:'intro'};
   // Unknown/new packs still get a coherent first meeting, not an unrelated
   // randomly selected daily topic after the introduction.
   return {lines:[{speaker:npc,text:character?.intro||lines[0]},
    {speaker:'Protagonist',text:'Nice to meet you. Mind if we talk for a moment?'},
    {speaker:npc,text:'Of course. Good to meet you too.'}],id:null,source:'intro'};
  }
  // Only already-met NPCs physically attending the same location can join Talk.
  // Important invitations, story events and reactive scenes are checked before
  // this pure casual selector by the runtime, so none of them is displaced.
  const group=GROUP?.select(state,npc,present);
  if(group?.length)return {lines:group,id:MEMORY?.casualId('group',npc,hash(group.map(x=>x.speaker+':'+x.text).join('|')))||null,source:'group'};
  // Most days can be about something other than cards or defining traits.
  // First meetings, reactive scenes and story events retain their own dialogue.
  if(EVERYDAY?.shouldUse(state,npc)){
   const casual=EVERYDAY.select(state,npc);
   if(casual?.length){
    const i=EVERYDAY.topics[npc]?.findIndex(row=>row[0]===casual[0]?.text)??-1;
    return {lines:casual,id:i>=0?MEMORY?.casualId('everyday',npc,i)||null:null,source:'everyday'};
   }
  }
  // On the other days, mix new, voice-specific banter with established topics.
  // Keep first meetings and higher-priority event/reactivity dialogue untouched.
  if(CHARACTER?.shouldUse(state,npc)){
   const voiced=CHARACTER.select(state,npc);
   if(voiced?.length){
    const i=CHARACTER.scenes[npc]?.findIndex(row=>row[0]===voiced[0]?.text)??-1;
    return {lines:voiced,id:i>=0?MEMORY?.casualId('character',npc,i)||null:null,source:'character'};
   }
  }
  const index=topic(state,npc,lines.length);
  const sourceIndex=authoredTalk[index]?.index??index;
  const authored=dialogueModule?.talkLines?.(npc,sourceIndex,lines[index]);
  if(Array.isArray(authored)&&authored.length>=3)return {lines:authored,id:MEMORY?.casualId('classic',npc,sourceIndex)||null,source:'classic'};
  // Last-resort conversation for an NPC with no authored `talkLines`.
  // NEVER attach another random, unrelated topic to the NPC's opening.
  // Varied but connected listening responses avoid the previous repetitive
  // "And how are things going otherwise?" that players kept hearing.
  const fallbacks=[
   ['Was that on your mind today?','A little, yeah. I wanted to say it out loud.'],
   ['I hadn\'t thought about it that way.','Neither had I, until recently.'],
   ['Sounds like you\'ve been thinking about that.','I have. I\'m glad you stopped to listen.'],
   ['And what do you make of it now?','I\'m still working that out, to be fair.']
  ];
  const exchange=fallbacks[hash(npc+':fallback:'+state.day+':'+state.slot)%fallbacks.length];
  return {lines:[{speaker:npc,text:lines[index]},
   {speaker:'Protagonist',text:exchange[0]},
   {speaker:npc,text:exchange[1]}],id:MEMORY?.casualId('classic',npc,sourceIndex)||null,source:'classic'};
 }
 function dialogue(state,npc,character,dialogueModule,options){
  return dialogueEntry(state,npc,character,dialogueModule,options).lines;
 }
 // Varied wording, stable action ids and unchanged eligibility.
 // Player-reply voice guide. Keep these as invitations and observations, not
 // promises: the existing invitation system still decides what can happen.
 // In particular, direct teasing remains behind the existing trust/rank gate.
 const invitationLines=Object.freeze({
  generic:{
   social:["Want to spend a little time together?","Got a moment to hang out?","Fancy doing something after this?","We should do something together sometime.","How about we take a break together?","Would you be up for hanging out?"],
   date:["Would you like to make plans for another day?","Is there a day we could meet up?","Want to find some time for just us?","Maybe we could plan something for later?","Could we catch up another day?","How about we arrange something soon?"],
   flirt:["You know, I could tease you about that.","Careful, you are making this too easy.","Am I allowed to make a joke about that?","I have a comeback, but you might regret hearing it.","That deserves a little teasing, don't you think?","Are you sure you want to give me that opening?"],
   later:["Maybe another time.","I should get going.","Let's pick this up later.","I'll catch you later."]
  },
  hana:{social:["Want to take a real break together?","Could we sit down once the tables are ready?"],date:["Could we make a little time for ourselves another day?","Want to plan an afternoon when neither of us is on duty?"],flirt:["You make taking a break sound awfully appealing.","Careful, I might start looking forward to your visits."]},
  reina:{social:["One round without keeping score?","Want to test our decks somewhere quieter?"],date:["Rematch somewhere that doesn't keep score?","Want to plan an outing and argue about the best strategy on the way?"],flirt:["You keep giving me openings. Is that a challenge?","Careful, I might mistake that confidence for an invitation."]},
  shiori:{social:["Would you like some quiet company?","Could we sit somewhere calm and talk a little?"],date:["Would you like to choose somewhere peaceful for another day?","Could we spend an afternoon without needing to fill every silence?"],flirt:["I would like to hear what you think of me, when you're ready.","That pause is hard to read. Should I take it as permission to tease you?"]},
  yuna:{social:["Want to find something fun to do before the day gets away from us?","Should we make a tiny adventure out of the afternoon?"],date:["Want to plan an outing with absolutely no sensible itinerary?","Could we make time for a rematch and whatever chaos follows?"],flirt:["That was almost a setup for a joke. Want to hear it?","Careful, I might make you the punchline—in a nice way."]},
  akari:{social:["Want to compare notes over a drink?","Could we take a break and see where the conversation goes?"],date:["Would you be interested in scheduling an unstructured afternoon?","Can we test the hypothesis that a plan can be fun without an agenda?"],flirt:["I have a teasing observation, if you consent to the experiment.","That is suggestive evidence. Should I draw a conclusion?"]},
  camila:{social:["Shall we negotiate a better use for the rest of the afternoon?","Want to step away from the tables for a while?"],date:["Could we arrange a meeting with no cards changing hands?","Name the day; I will try not to bring terms and conditions."],flirt:["I could make a very pointed remark about that.","Careful. I know a promising opening when I see one."]},
  marina:{social:["Would you like to sit by the water for a while?","Could we take a quiet break together?"],date:["Would you like to visit the riverside another day?","Could we plan a slow afternoon and see where it takes us?"],flirt:["I like the way this moment feels with you.","You make it easy to stay a little longer."]},
  kaede:{social:["Want to get out of this crowd for a bit?","We could find something better to do than stand here."],date:["Pick a place and I'll meet you there another day.","Want to see if you can keep up somewhere outside the arcade?"],flirt:["You can keep looking at me like that, if you mean it.","Careful. I might take that as a real challenge."]},
  jun:{social:["Would you like to talk somewhere without a score sheet?","Want to take an actual break from officiating?"],date:["Could we meet up when you're off duty?","Want to arrange a rematch with no whistle and no paperwork?"],flirt:["I have a comment that may be outside the rules.","Is this a conversation or are you deliberately testing my composure?"]},
  teo:{social:["Want to take this show somewhere with snacks?","Could we find a new story for the afternoon?"],date:["Want to plan an outing worthy of a full broadcast?","Could we spend an afternoon off-mic for once?"],flirt:["I have a line ready, but the live audience is just you.","Careful, you're making it very hard not to hype you up."]},
  iris:{social:["Want to sit down before you find another task to do?","Could we take a break that doesn't involve carrying boxes?"],date:["Want to plan a day when neither of us has errands?","Could we meet somewhere you don't have to organize?"],flirt:["You deserve a compliment without having to earn it first.","I noticed you made time for me. I like that."]},
  elio:{social:["Want to join me for a low-pressure game?","We could find a quieter table if you'd like."],date:["Would you like to try a new place together sometime?","Could we plan something where neither of us has to be an expert?"],flirt:["I like talking with you. I hope that's okay to say.","You make me a little nervous—in a good way."]},
  alma:{social:["Want to sit down and let someone else handle the café for a change?","Could we have a cup of tea after your shift?"],date:["Would you like to visit somewhere you don't have to host?","Want to plan an afternoon with no tables to clear?"],flirt:["I enjoy your company even when there is no coffee to serve.","You have a way of making this feel like my break too."]},
  nereo:{social:["Want to take a break by the river?","Could we talk somewhere the schedule can't interrupt us?"],date:["Want to see where the ferry takes us on a free afternoon?","Could we make plans that don't depend on the tide?"],flirt:["I might stay a little longer if you're asking.","Careful, I could get used to having you around the dock."]},
  barb:{social:["Want to get out of here and look for something inspiring?","Could we trade ideas over a snack?"],date:["Want to find a place with good colors and better company?","Could we make an afternoon of browsing and sketching?"],flirt:["I have a playful idea, but you can veto it.","You are making this interaction very difficult to design around."]},
  laca:{social:["Want to hang out after your shift? Old-friend privilege.","We could grab something and catch up like we used to."],date:["Want to revive our extremely loose plans tradition?","Could we go somewhere that isn't a pool or a tournament?"],flirt:["Is this where I use my old-friend privilege to tease you?","Careful, I know exactly which buttons still work."]},
  daisy:{social:["Want to get out of the spotlight for a bit?","Could we talk somewhere nobody expects us to perform?"],date:["Want to plan something that feels like us, not a photo op?","Could we spend an afternoon without worrying how it looks?"],flirt:["I could tease you about that, if you can take it.","Careful. I know the difference between confidence and an invitation."]},
  jicy:{social:["Want to play a friendly round together?","Could I help with your deck—or would you rather just hang out?"],date:["Would you like to go somewhere together after the next match?","Could we plan something simple, if that sounds nice?"],flirt:["I was going to say something teasing, but I got shy.","You are making it hard to keep this just a practice match."]},
  rina:{social:["Want to talk cards somewhere without a spotlight?","Could we take a break between appearances?"],date:["Want to plan an afternoon away from the stage?","Could we meet somewhere low-key, just for the cards and company?"],flirt:["I have a compliment that isn't for the audience.","Careful, I might start smiling before the cameras are on."]},
  sol:{social:["Want to do something spontaneous, with veto power?","Could we take the scenic route to absolutely nowhere?"],date:["Want to make a plan loose enough to surprise us?","Could we pick a place by coin flip and bail if it is boring?"],flirt:["I have a ridiculous tease ready. Want it?","Careful, I might be flirting by accident again."]},
  jinx:{social:["Want to get out of here before someone asks for your autograph?","Come on. Let's find something more interesting to do."],date:["Pick a place. I want to see whether your taste is as good as your timing.","Want to take this competition somewhere with better food?"],flirt:["You want to tease me? Make it good.","Careful. I hit back harder when the banter is weak."]},
  luna:{social:["Would you like some help, or just some company?","Want to take a little break together?"],date:["Would you like to visit somewhere new together?","Could we plan something gentle and unhurried?"],flirt:["You make me feel braver about saying what I think.","I hope this isn't too forward, but I like being with you."]},
  elena:{social:["Would you like to step away from work for a little while?","Could we talk somewhere quieter?"],date:["Would you care to meet outside the usual routine?","Could we plan an evening with no work questions?"],flirt:["I have a personal observation, if you would like to hear it.","Your company is becoming a habit I am reluctant to correct."]},
  sierra:{social:["Want to compare deck lists without an audience?","Could we find a quieter table and talk cards?"],date:["Want to check out a shop with a better singles binder?","Could we spend time together somewhere nobody comments on our decks?"],flirt:["That was almost charming. Was it intentional?","Careful, I might start looking forward to your next argument."]},
  lyla:{social:["Want to sit somewhere quiet? I can't tell from your expression if you need a break.","Could we get coffee? Your face is giving me no clues, so I'll ask plainly."],date:["Would you be up for coffee another day? I won't try to guess what that look means.","Want to plan something simple? No need to perform enthusiasm."],flirt:["I can't tell if that was a smile, so I'll ask: are you teasing me?","Your expression is impossible to read. Was that supposed to be a compliment?"]}
 });
 function invitationLabel(kind,npc,day){
  const variants=invitationLines[npc]?.[kind]||invitationLines.generic[kind];
  return variants[hash(npc+':'+kind+':'+day)%variants.length];
 }
 function choices(state,npc){
  if(!state||typeof npc!=='string'||state.day>90)return [];
  const n=hash(npc+':'+state.day);
  const spent=!!state.hungOut?.[state.day+':'+npc];
  const planned=Array.isArray(state.appointments)&&state.appointments.some(a=>a.npc===npc&&a.status==='booked');
  const relationship=state.relationships?.[npc]||{};
  const trust=Number(relationship.trust)||0;
  const rank=REL?.bondRank?.(state,npc)||0;
  // Casual teasing becomes available after a small amount of earned trust.
  // The wording stays playful and indirect; direct commitment is reserved for
  // authored late-route choices.
  const canTease=trust>=2||(rank>=1&&trust>=1);
  if(!spent&&n%4===0)return [
   [invitationLabel('social',npc,state.day), 'socialPlan:'+npc],
   [invitationLabel('later',npc,state.day), 'close']
  ];
  if(!planned&&n%6===1)return [
   [invitationLabel('date',npc,state.day), 'dateInvite:'+npc],
   [invitationLabel('later',npc,state.day), 'close']
  ];
  if(canTease&&n%9===2)return [
   [invitationLabel('flirt',npc,state.day), 'flirt:'+npc],
   [invitationLabel('later',npc,state.day), 'close']
  ];
  return [];
 }
 function bondNeeded(event){
  // Chapters are the main source of bond: completing a predecessor is stronger
  // evidence than repeatedly collecting daily Talk points.
  if(event?.prerequisite&&/_(route|guest|bond)_\d+$/.test(event.id))return Math.min(event.minBond||0,2);
  return event?.minBond||0;
 }
 function commitmentReady(state,npc){
  const relationship=state?.relationships?.[npc];
  if(!relationship||relationship.affection<3)return false;
  const completed=Object.keys(state.storyDone||{}).filter(id=>
   id.startsWith(npc+'_')&&/_(route|guest|bond)_\d+$/.test(id)&&state.storyDone[id]).length;
  return relationship.trust>=1||completed>=3;
 }
 return Object.freeze({topic,dialogue,dialogueEntry,choices,bondNeeded,commitmentReady});
});
