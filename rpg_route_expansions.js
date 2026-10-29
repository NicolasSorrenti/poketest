'use strict';
// Additional bridge scenes that complete the five-beat relationship structure
// for the original routes and Daisy. These are intentionally dialogue-first:
// they reuse the existing portrait/CG pipeline and do not require new artwork.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgRouteExpansions=api;
})(typeof window!=='undefined'?window:null,function(){
 const deltas={
  support:{affection:2,trust:2,respect:0,attraction:0},
  honest:{affection:1,trust:1,respect:2,attraction:0},
  flirt:{affection:1,trust:0,respect:0,attraction:2}
 };
 const choice=(label,reply,kind,flag)=>({label,reply,kind,flag:flag||null,delta:{...deltas[kind]}});
 const scene=(id,npc,title,start,end,place,slot,minBond,prerequisite,lines,choices)=>({
  id,npc,title,start,end,place,slot,minBond,prerequisite,
  chapter:start<=30?1:start<=60?2:3,
  lines,choices
 });
 const events=[
  scene('hana_route_bridge_4','hana','A Promise With Room',65,72,'shop',1,4,'hana_route_3',[
   {speaker:'hana',text:'I moved the extra tables, answered the messages, and somehow still managed to leave one thing unfinished.'},
   {speaker:'Protagonist',text:'Let me guess. The thing was making time for yourself.'},
   {speaker:'hana',text:'Exactly. I keep treating my own plans like they are the easiest ones to cancel.'},
   {speaker:'Protagonist',text:'What would you choose if nobody needed anything from you tonight?'},
   {speaker:'hana',text:'A quiet hour. Maybe with someone who would not turn it into another obligation.'},
   {speaker:'Protagonist',text:'Then let us make room for that.'}
  ],[
   choice('Help her plan an hour that belongs to her','That sounds simple. I think I needed someone to remind me simple things count.','support','hana_room'),
   choice('Ask what she wants before offering a solution','You are right. I should answer that question for myself first.','honest','hana_choice'),
   choice('Tell her you already saved time for her','You really did? Then I suppose I can stop pretending I am too busy to smile.','flirt','hana_time')
  ]),
  scene('reina_route_bridge_4','reina','No Score to Settle',67,75,'center',1,4,'reina_route_3',[
   {speaker:'reina',text:'The practice hall is empty. No spectators, no bracket, no excuse to pretend this is only training.'},
   {speaker:'Protagonist',text:'You invited me here without challenging me.'},
   {speaker:'reina',text:'I noticed. It was more difficult than expected.'},
   {speaker:'Protagonist',text:'What do you want to talk about?'},
   {speaker:'reina',text:'The part where I stop measuring every conversation by who has the advantage.'},
   {speaker:'Protagonist',text:'You can take your time.'}
  ],[
   choice('Stay beside her without turning it into a contest','I expected you to make a clever argument. This is better.','support','reina_still'),
   choice('Ask what she is afraid of losing','My place beside you, perhaps. That was more honest than I planned.','honest','reina_truth'),
   choice('Say you like her when she is not trying to win','Careful. I might start believing you mean that.','flirt','reina_offguard')
  ]),
  scene('shiori_route_bridge_4','shiori','A Different Kind of Practice',73,77,'library',1,4,'shiori_route_3',[
   {speaker:'shiori',text:'I brought no match recordings today.'},
   {speaker:'Protagonist',text:'That sounds serious.'},
   {speaker:'shiori',text:'I wanted to remember a conversation without replaying it afterward to find the perfect response.'},
   {speaker:'Protagonist',text:'You do not need a perfect response with me.'},
   {speaker:'shiori',text:'I know. That is why this feels like practice of a different kind.'},
   {speaker:'Protagonist',text:'Then we can be a little uncertain together.'}
  ],[
   choice('Let the silence remain comfortable','I thought silence meant I had failed. This feels different.','support','shiori_quiet'),
   choice('Tell her you value what she chooses not to say','You listen more carefully than most people. Thank you.','honest','shiori_listen'),
   choice('Invite her to make an imperfect memory with you','That is a dangerous invitation. I think I would like to accept it.','flirt','shiori_memory')
  ]),
  scene('yuna_route_bridge_4','yuna','The Part Between Jokes',68,73,'arcade',1,4,'yuna_route_3',[
   {speaker:'yuna',text:'I had three jokes ready for this conversation.'},
   {speaker:'Protagonist',text:'Only three? You are losing your edge.'},
   {speaker:'yuna',text:'I know. The problem is that I wanted to say something without hiding behind one.'},
   {speaker:'Protagonist',text:'You do not have to perform for me.'},
   {speaker:'yuna',text:'That is a very unfairly nice thing to say.'},
   {speaker:'Protagonist',text:'You can take a minute before making the punchline.'}
  ],[
   choice('Wait with her until she finds the words','Thanks. I think I like being understood before I am funny.','support','yuna_pause'),
   choice('Ask what she wants people to see beneath the act','Someone who can be serious and still be fun. Maybe I am allowed both.','honest','yuna_real'),
   choice('Tell her you like the quiet version too','Do not say that so sweetly! I am trying not to grin.','flirt','yuna_quiet')
  ]),
  scene('akari_route_bridge_4','akari','An Hour Without a Plan',71,75,'cafe',1,4,'akari_route_3',[
   {speaker:'akari',text:'I arrived twelve minutes early and still did not decide what we would do.'},
   {speaker:'Protagonist',text:'Should I be worried?'},
   {speaker:'akari',text:'Possibly. I am trying to find out whether an hour can be valuable without producing a result.'},
   {speaker:'Protagonist',text:'We could simply spend it together.'},
   {speaker:'akari',text:'That answer is frustratingly difficult to disprove.'},
   {speaker:'Protagonist',text:'Then let us not test it.'}
  ],[
   choice('Let her choose the first thing that feels right','No metric, no schedule, and somehow no panic. I will record that as progress.','support','akari_unplanned'),
   choice('Ask her to close the notebook','All right. I want to know what I think before I calculate it.','honest','akari_notebook'),
   choice('Tell her she is easier to understand when she stops analyzing you','That is an unfairly accurate observation. I may keep it.','flirt','akari_observe')
  ]),
  scene('camila_route_bridge_4','camila','A Deal With No Fine Print',73,76,'shop',2,4,'camila_route_3',[
   {speaker:'camila',text:'I wrote the agreement down, then crossed out every condition.'},
   {speaker:'Protagonist',text:'That is unlike you.'},
   {speaker:'camila',text:'I know. I wanted to see what remained when neither of us was trying to protect an exit.'},
   {speaker:'Protagonist',text:'A conversation, perhaps.'},
   {speaker:'camila',text:'And a choice. The kind that cannot be made fair by adding more clauses.'},
   {speaker:'Protagonist',text:'You can choose without bargaining with yourself.'}
  ],[
   choice('Tell her trust is not a contract','That is what I have been trying to understand. Thank you for saying it plainly.','support','camila_no_contract'),
   choice('Ask what she wants without negotiating against it','I want to stay. I want to see what happens when I stop keeping score.','honest','camila_stay'),
   choice('Say you prefer the person over the deal','Then stop looking at me like a transaction and stay for a while.','flirt','camila_person')
  ]),
  scene('marina_route_bridge_4','marina','Before the Next Current',70,74,'park',1,4,'marina_route_3',[
   {speaker:'marina',text:'The application is still in my bag. I keep checking that it is there, even though I already sent it.'},
   {speaker:'Protagonist',text:'Waiting can be harder than deciding.'},
   {speaker:'marina',text:'Especially when the answer could change where I belong.'},
   {speaker:'Protagonist',text:'Whatever happens, the choice was yours.'},
   {speaker:'marina',text:'I am beginning to believe that is enough to make the next step worth taking.'},
   {speaker:'Protagonist',text:'Then you do not have to face the waiting alone.'}
  ],[
   choice('Offer to sit with her while she waits','You make uncertainty feel less like a verdict.','support','marina_wait'),
   choice('Ask what future she would choose without fear','A future I can enter honestly. I think I finally know what that looks like.','honest','marina_future'),
   choice('Tell her you want to be part of what comes next','That is a beautiful thing to say. Let me decide what I want to carry with me.','flirt','marina_next')
  ]),
  scene('kaede_route_early_1','kaede','A Seat at the Table',24,41,'center',2,0,null,[
   {speaker:'kaede',text:'You are the new challenger, right? Everyone keeps pointing you toward the loudest table.'},
   {speaker:'Protagonist',text:'And you are pointing me somewhere else.'},
   {speaker:'kaede',text:'The quiet table is better. People reveal more when they are not performing for a crowd.'},
   {speaker:'Protagonist',text:'Do you always study a room before entering it?'},
   {speaker:'kaede',text:'Only when I am deciding whether I want to stay.'},
   {speaker:'Protagonist',text:'Then take the seat. You can decide after the first game.'}
  ],[
   choice('Make space without asking where she came from','That is a better welcome than most places manage.','support','kaede_welcome'),
   choice('Ask what would make her want to stay','A reason to return that is not just another challenge.','honest','kaede_reason'),
   choice('Tell her the room improved when she arrived','Do not make me responsible for the atmosphere already.','flirt','kaede_arrival')
  ]),
  scene('daisy_route_bridge_4','daisy','A Name on the Door',54,64,'cafe',1,4,'daisy_route_3',[
   {speaker:'daisy',text:'I found a quiet corner in the café where nobody asks for a photo or a performance.'},
   {speaker:'Protagonist',text:'And you brought me there.'},
   {speaker:'daisy',text:'You have learned the difference between looking at me and actually paying attention.'},
   {speaker:'Protagonist',text:'That sounds like a difficult lesson.'},
   {speaker:'daisy',text:'It was. I used to think being noticed was the same as being known.'},
   {speaker:'Protagonist',text:'You do not have to be “on” with me.'}
  ],[
   choice('Ask what she wants people to know about her','That I choose my own image. The rest is earned, not assumed.','support','daisy_known'),
   choice('Tell her you respect the person behind the presentation','Good. Then keep talking to me like I am a person, not a story you invented.','honest','daisy_person'),
   choice('Say you like the version of her that surprises you','Careful. That sounds like you are getting to know me on purpose.','flirt','daisy_surprise')
  ])
 ];
 return Object.freeze({events});
});
