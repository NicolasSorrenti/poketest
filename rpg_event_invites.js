'use strict';
// A player's arrival can inspire a character to invite them into an *already*
// available event. Presentation only: no event unlocks, secret hints, RNG or time.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgEventInvites=api;
})(typeof window!=='undefined'?window:null,function(){
 const voice=Object.freeze({
  hana:{wait:['I kept a chair open for you. Thought you might turn up.','You made it! I was hoping we would get this time together.'],ask:['Oh, good, you are here. Could you give me a hand with something?','There you are! I wanted to ask you something without the whole shop listening.'],unexpected:['Well, this just got interesting. Want to help me out?','I am so glad you showed up. This is exactly the sort of thing we would laugh about later.']},
  reina:{wait:['You are on time. Good. I hate wasting a good opportunity.','There you are. I was starting to wonder if I would have to come find you.'],ask:['I have something I want to settle. You have a moment?','There is something I want your opinion on. Do not make a big deal of it.'],unexpected:['You see this? I could use a second pair of eyes.','Of course this happens when you are here. Come on, help me figure it out.']},
  shiori:{wait:['I was beginning to enjoy the quiet. You are welcome to join me.','I saved us some time away from the crowd. I am glad you came.'],ask:['There is something I would like to discuss, if you have a moment.','I had hoped to find you here. I would value your thoughts on something.'],unexpected:['Something rather unexpected has happened. Would you mind staying?','The timing of your arrival is almost poetic. I would like to show you something.']},
  yuna:{wait:['Ha! You showed up! I only checked the door, like, four times.','My favorite accomplice arrives right on cue! Excellent timing.'],ask:['Hey! I have an idea. It might even be a good one. Interested?','I have been saving a ridiculous story for you. Want in?'],unexpected:['Okay, okay, you need to see this. Right now.','You arrived at exactly the right moment for maximum chaos. Come here!']},
  akari:{wait:['I allowed enough time for you to arrive. The estimate was correct.','I kept this time free. I was rather hoping you would use it with me.'],ask:['I have a question and would appreciate your judgment.','I have been meaning to show you something. Your perspective would help.'],unexpected:['A variable I did not anticipate has appeared. Are you available?','I could use another observer. Preferably you.']},
  camila:{wait:['Punctual. I do appreciate that. Shall we?','There you are, darling. I was hoping we could have a little time to ourselves.'],ask:['I have a proposition. No fine print, I promise.','There is something I would rather show you in person. Do indulge me.'],unexpected:['Well, an interesting little situation has developed.','Perfect timing, darling. Tell me what you make of this.']},
  marina:{wait:['Oh, you came. I was watching the water and almost lost track of time.','I hoped we would have a little while together. I am glad you found me.'],ask:['There is something I wanted to show you, if you are not busy.','I was hoping to talk to you about something. Just us, if that is okay.'],unexpected:['Oh! I am glad someone else is here to see this.','You have good timing. Will you come look at something with me?']},
  kaede:{wait:['So you made it. I was about to start without you.','There you are. I was hoping you would not leave me waiting too long.'],ask:['I have a challenge for you. Nothing you cannot handle, probably.','I have been meaning to get you alone for a minute. Hear me out.'],unexpected:['Look at this mess. Tell me you want to get involved.','You have perfect timing. This is going to be fun.']},
  elena:{wait:['I made room in my schedule. I am pleased you did the same.','I wanted to keep this time for us. Thank you for coming.'],ask:['There is a matter I would like your opinion on.','Something has been on my mind, and I would rather ask you directly.'],unexpected:['That was not part of the plan. Would you take a look?','An unexpected development. I would welcome your company.']},
  jinx:{wait:['Well, look who actually showed up.','There you are! I was about to go looking for trouble without you.'],ask:['Hey, I have something in mind. You in?','I wanted to tell you something before anyone else got involved.'],unexpected:['Oh, you have to see this. No backing out now.','This is too good not to share with you. Come on!']},
  luna:{wait:['You came! Sorry, I was just making sure I was in the right place.','I was a little nervous you might be busy. I am really glad you are here.'],ask:['Um, could I ask you something? It is a little important to me.','I wanted to tell you something. I think I can say it properly now.'],unexpected:['Oh! I think I might need some help here.','I am so glad you are here. I did not know what to do first.']},
  rina:{wait:['There you are! I made sure we would have a minute without a crowd.','I was hoping you would come. This is nicer than a whole room of applause.'],ask:['I have something exciting to tell you. Promise you will hear me out?','I have been saving something to tell you when we had a moment.'],unexpected:['Wait, you have to see what just happened!','You could not have arrived at a better moment! Come with me!']},
  sierra:{wait:['You made it. I had a feeling you would.','I was hoping for a little quiet time with you. Good timing.'],ask:['I need an opinion. One I can actually trust.','There is something I wanted to talk over with you.'],unexpected:['Well, this was not in the schedule.','You caught me at an interesting moment. Want to help?']},
  sol:{wait:['Hey, you made it! I saved the good part for us.','There you are. I was hoping we could do this together.'],ask:['I had an idea for something we could try. Interested?','There is something I wanted to share with you.'],unexpected:['Whoa, okay, you need to come see this.','I knew you would be the perfect person to ask. Come on!']},
  alma:{wait:['I kept a table free. The good one, too.','There you are. Nice to have company I actually invited.'],ask:['Could you give me a hand with something here?','There is something I would like your help with, if you have time.'],unexpected:['Of course this happens during the quiet shift.','Well, you picked an interesting time to stop by.']},
  elio:{wait:['Oh! You are here. I was afraid I got the time wrong.','I kept checking the clock. Not because I doubted you! I just really wanted to see you.'],ask:['Hey, can I show you something? I have been working on it.','I wanted your opinion before I try this on my own.'],unexpected:['Uh, this might be a problem. Can you take a look?','I am so relieved you came by. What would you do here?']},
  nereo:{wait:['Right on schedule. Better than the ferry.','I was beginning to think the river had swallowed you. Good to see you.'],ask:['Could use another set of hands. You free?','I have got something to talk through, if you can spare the time.'],unexpected:['Well, that is a new one. Care to help?','You are just in time to see what the harbor has invented today.']}
 });
 const missedVoice=Object.freeze({
  hana:'You came. After last time, I was not quite sure. I am happy to see you.',
  reina:'You are here. Good. I was not planning to wait around twice.',
  shiori:'I wondered whether our plans would work out this time. Thank you for coming.',
  yuna:'Hey! You made it this time! I was running out of dramatic backup plans.',
  akari:'Our last appointment did not happen. I am glad this one appears to be on track.',
  camila:'Darling, a second chance at punctuality? I approve.',
  marina:'Oh, you made it. I worried I had misunderstood our plans again.',
  kaede:'I was not going to save your spot forever. But I am glad you came.',
  elena:'I appreciate that we can try again after the last scheduling difficulty.',
  jinx:'Hey, you actually showed! I might forgive the last disappearing act.',
  luna:'Oh! I am glad you came. I thought you might be busy again.',
  rina:'You are here! I really did not want to miss our chance twice.',
  sierra:'Good. I was starting to wonder whether we would ever get this time.',
  sol:'You made it! I was hoping we would get another chance.',
  alma:'I kept the table free again. Do not make me charge rent this time.',
  elio:'Oh, you are here! I was nervous we might miss each other again.',
  nereo:'Look who beat the ferry to the dock. Better timing than last time.'
 });
 const fallback={wait:['Glad you could make it. Shall we?','I was hoping we could spend this time together.'],ask:['I was hoping we could talk about something.','There is something I wanted to share with you.'],unexpected:['Something has come up. Do you have a moment?','I am glad you are here. I could use your help.']};
 const score=(s,id,key)=>Math.max(Number(s?.relationships?.[id]?.[key])||0,Number(s?.bonds?.[id]?.[key])||0);
 const close=(s,id)=>s?.partner===id||score(s,id,'affection')>=6||score(s,id,'trust')>=5;
 const waiting=(s,id)=>score(s,id,'affection')>=2||score(s,id,'trust')>=2;
 function choose(s,id,{present=[],appointments=[],stories=[],sidequests=[],arcs=[],situations=[],encounters=[],competitions=[],cups=[],exhibitions=[],canAttend=()=>null}={}){
  if(!s||s.day>90||!present.includes(id)||s.pendingDuel||s.activeStory||s.activeSideQuest||s.activeArc||s.activeEncounter||s.activeSituation||s.mandatoryEventState?.active)return null;
  // Never promise an activity the player cannot currently perform.
  const plan=appointments.find(p=>p.npc===id&&p.status==='booked'&&p.day===s.day&&p.slot===s.slot&&p.place===s.location&&!canAttend(p));
  if(plan)return {kind:'appointment',id:String(plan.id),npc:id,tone:plan.socialTone||'friendship'};
  const story=stories.find(e=>e.npc===id);
  if(story)return {kind:'story',id:story.id,npc:id,urgent:story.end===s.day};
  const side=sidequests.find(e=>e.stage?.npc===id);
  if(side)return {kind:'sidequest',id:side.quest.id,npc:id,urgent:side.stage.end===s.day};
  const arc=arcs.find(e=>e.npc===id||id==='reina');
  if(arc&&id==='reina')return {kind:'arc',id:arc.id,npc:id,urgent:arc.end===s.day};
  const cup=cups.find(e=>e.npc===id);
  if(cup)return {kind:'cup',id:cup.id,npc:id};
  const exhibition=exhibitions.find(e=>e.npc===id);
  if(exhibition)return {kind:'exhibition',id:String(exhibition.id),npc:id};
  const competitive=competitions.find(e=>e.npc===id);
  if(competitive)return {kind:'competitive',id:competitive.id,npc:id};
  const situ=situations.find(e=>e.npc===id);
  if(situ)return {kind:'situation',id:situ.id,npc:id};
  const enc=encounters.find(e=>e.npc===id);
  if(enc)return {kind:'encounter',id:enc.id,npc:id,urgent:enc.end===s.day};
  return null;
 }
 function dialogue(state,opportunity){
  if(!opportunity)return null;
  const npc=opportunity.npc,style=voice[npc]||fallback,near=close(state,npc),friendly=waiting(state,npc);
  const category=opportunity.kind==='appointment'?'wait':
    opportunity.kind==='situation'||opportunity.kind==='encounter'?'unexpected':'ask';
  const source=style[category]||fallback[category];
  const missed=(state?.appointments||[]).some(p=>p.npc===npc&&p.status==='missed'&&Number.isInteger(p.day)&&
   state.day>=p.day&&state.day-p.day<=7);
  const intro=category==='wait'&&missed?(missedVoice[npc]||source[0]):source[near||friendly?1:0];
  const duel=['cup','competitive','exhibition'].includes(opportunity.kind);
  // A date is an agreed-upon plan, never a surprise romantic escalation.
  const romantic=opportunity.kind==='appointment'&&opportunity.tone==='romantic'&&near;
  const follow=romantic?'I wanted this to feel like our own little corner of the day. Shall we?':
   opportunity.kind==='appointment'?'Shall we do what we planned?':
   duel?'I have my deck ready. Want to play the match?':
   opportunity.urgent?'I was hoping we could make time for it today. What do you think?':
   opportunity.kind==='situation'||opportunity.kind==='encounter'?'Want to see what we can do?':
   'Would you like to talk about it now?';
  return {lines:[{speaker:npc,text:intro},{speaker:'Protagonist',text:'You had something in mind?'},{speaker:npc,text:follow}],
   choices:[[duel?'Let’s play.':'I am in.','eventInvite:'+opportunity.kind+':'+opportunity.id],
    ['Can we just talk for a bit?','eventChat:'+npc],
    ['Maybe later.','close']]};
 }
 return Object.freeze({voice,choose,dialogue});
});
