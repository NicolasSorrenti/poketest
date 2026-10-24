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
 function hash(text){
  let n=2166136261;
  for(const ch of String(text)){n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;}
  return n>>>0;
 }
 function topic(state,npc,length){
  return length>0?hash(npc+':'+state.day+':'+state.slot)%length:0;
 }
 function dialogue(state,npc,character,dialogueModule,{first=false,present=[]}={}){
  const lines=Array.isArray(character?.talk)&&character.talk.length?character.talk:[character?.repeat||character?.intro||'Good to see you.'];
  if(first){
   const greeting=dialogueModule?.greetingLines?.(npc,character.intro||lines[0]);
   if(Array.isArray(greeting)&&greeting.length>=3)return greeting;
   // Unknown/new packs still get a coherent first meeting, not an unrelated
   // randomly selected daily topic after the introduction.
   return [{speaker:npc,text:character?.intro||lines[0]},
    {speaker:'Protagonist',text:'Nice to meet you. Mind if we talk for a moment?'},
    {speaker:npc,text:'Of course. Good to meet you too.'}];
  }
  // Only already-met NPCs physically attending the same location can join Talk.
  // Important invitations, story events and reactive scenes are checked before
  // this pure casual selector by the runtime, so none of them is displaced.
  const group=GROUP?.select(state,npc,present);
  if(group?.length)return group;
  // Most days can be about something other than cards or defining traits.
  // First meetings, reactive scenes and story events retain their own dialogue.
  if(EVERYDAY?.shouldUse(state,npc)){
   const casual=EVERYDAY.select(state,npc);
   if(casual?.length)return casual;
  }
  // On the other days, mix new, voice-specific banter with established topics.
  // Keep first meetings and higher-priority event/reactivity dialogue untouched.
  if(CHARACTER?.shouldUse(state,npc)){
   const voiced=CHARACTER.select(state,npc);
   if(voiced?.length)return voiced;
  }
  const index=topic(state,npc,lines.length);
  const authored=dialogueModule?.talkLines?.(npc,index,lines[index]);
  if(Array.isArray(authored)&&authored.length>=3)return authored;
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
  return [{speaker:npc,text:lines[index]},
   {speaker:'Protagonist',text:exchange[0]},
   {speaker:npc,text:exchange[1]}];
 }
 function choices(state,npc){
  if(!state||typeof npc!=='string'||state.day>90)return [];
  const n=hash(npc+':'+state.day);
  const spent=!!state.hungOut?.[state.day+':'+npc];
  const planned=Array.isArray(state.appointments)&&state.appointments.some(a=>a.npc===npc&&a.status==='booked');
  // These are infrequent story-like prompts, not a permanent action menu.
  if(!spent&&n%4===0)return [
   ['Would you like to do something together?', 'socialPlan:'+npc],
   ['Maybe another time.', 'close']
  ];
  if(!planned&&n%6===1)return [
   ['Would you like to meet up another day?', 'dateInvite:'+npc],
   ['I should get going.', 'close']
  ];
  if(n%9===2)return [
   ['I could tease you about that.', 'flirt:'+npc],
   ['Leave it there.', 'close']
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
  if(!relationship||relationship.affection<3||state.partner&&state.partner!==npc)return false;
  const completed=Object.keys(state.storyDone||{}).filter(id=>
   id.startsWith(npc+'_')&&/_(route|guest|bond)_\d+$/.test(id)&&state.storyDone[id]).length;
  return relationship.trust>=1||completed>=3;
 }
 return Object.freeze({topic,dialogue,choices,bondNeeded,commitmentReady});
});
