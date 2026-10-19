'use strict';
/*
 * Neo Harbor narrative expansion: three recurring adult supporting cast members,
 * personal stories and crossroads involving the existing eight heroines.
 * Dialogue and appearance notes are data, not artwork or a second duel engine.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgNarrativePack=api;
})(typeof window!=='undefined'?window:null,function(){
 const cast={
  jun:{
   name:'Jun Arai',age:28,deck:'fossil_lab',style:'Fossil control · Deliberate play',
   intro:'Before you ask: I am off duty. You can call me Jun, and yes, I still check whether you shuffled.',
   repeat:'Good to see you. I was counting score slips, so this is an improvement.',
   talk:[
    'The best judges never become the story. That is harder than it sounds.',
    'I used to build decks around doing nothing. A lot can happen in a turn when you choose not to rush.',
    'That table has a loose leg. I have recorded it as a safety concern and as a personal insult.'
   ],
   flirt:'Flattering, but I am here for the cards. Try that line on someone who did not hear it from three challengers today.',
   duelWin:'Clean lines. You won because you left yourself options.',
   duelLose:'You rushed the final turn. I would like to show you why, if you have a minute.'
  },
  teo:{
   name:'Teo Álvarez',age:24,deck:'hotfoot',style:'Hotfoot · Fast tempo',
   intro:'The rookie! Give me one sentence for the announcer booth. No pressure. Okay, some pressure.',
   repeat:'Great timing. My microphone is working, which is more than I can say for my plan.',
   talk:[
    'A silent crowd can be a wonderful crowd. I am still learning not to fear it.',
    'Yuna says I make every match sound like the final. I say every match deserves a little drama.',
    'If I say a joke twice, that usually means the first time was an accident.'
   ],
   flirt:'That is going straight into my collection of things I wish I had said first.',
   duelWin:'Oof. That was a spectacularly quiet way to beat me. Respect.',
   duelLose:'That was fast, right? I know I am not supposed to be proud of the losing part.'
  },
  iris:{
   name:'Iris Navarro',age:26,deck:'cold_fusion',style:'Cold Fusion · Patient adaptability',
   intro:'If the boxes are late, blame the tide. If they are early, you can thank me.',
   repeat:'You look less lost than the last time we met. That is progress.',
   talk:[
    'A card box looks light until you carry twenty of them up the dock stairs.',
    'Marina knows when the river is changing. I only know how stubborn I have to be about it.',
    'Everyone likes the evening tournament. Not many people ask who puts the chairs away.'
   ],
   flirt:'You are charming, but first help me carry these. Then we will see if you are useful as well.',
   duelWin:'Good match. I should have read that current a turn earlier.',
   duelLose:'A slow start does not bother me. Being careless about it does.'
  }
 };
 const looks={
  hana:{silhouette:'Soft, layered pastel varsity cardigan over a pleated streetwear skirt, practical crossbody organizer',palette:'Cream, coral, warm teal',hair:'Chestnut shoulder-length waves tied half-up when working',details:'A dozen handmade enamel card pins and a slightly battered shop lanyard',expressions:'Bright social smile; tired, unguarded pause when alone'},
  reina:{silhouette:'Sharp cropped charcoal moto jacket, fitted tournament jersey and high-waist trousers',palette:'Black, garnet red, silver',hair:'Long ink-black hair with a severe side part and red underlayer',details:'Single silver ear cuff, neatly sleeved deck case',expressions:'Unblinking competitive stare; an almost imperceptible victorious grin'},
  shiori:{silhouette:'Elegant long coat, fitted turtleneck and asymmetric layered skirt with structured boots',palette:'Slate blue, pearl, muted violet',hair:'Straight dark-violet bob, tucked behind one ear',details:'Vintage watch, thin reading glasses worn only when checking old records',expressions:'Measured amusement; moments of unexpected vulnerability'},
  yuna:{silhouette:'Oversized graphic jacket, short streetwear layers, mismatched patterned tights and sneakers',palette:'Electric cyan, raspberry, ink blue',hair:'Spiky twin buns with dyed neon tips',details:'Lucky charm bracelet, portable music player, sticker-covered deck box',expressions:'Cartoonishly confident; brief flashes of insecurity after applause'},
  akari:{silhouette:'Angular utility blazer over a graphic mock-neck top and cargo skirt, clean geometric cuts',palette:'Indigo, mint, white',hair:'Glossy dark hair in a high angled ponytail',details:'Small tablet, color-coded tabs, square glasses',expressions:'Scientific composure, a visible blink when surprised'},
  camila:{silhouette:'Fashion-forward long wine-colored coat, fitted vest, tailored trousers, heeled boots',palette:'Burgundy, gold, black',hair:'Voluminous dark curls swept to one shoulder',details:'A gold card-case chain and rings that make a tiny sound when she shuffles',expressions:'Knowing half-smile; guarded concern when a deal hurts someone'},
  marina:{silhouette:'Loose linen jacket over fitted navy casualwear and river-ready sneakers',palette:'Seafoam, navy, sand',hair:'Soft blue-black side braid with loose strands',details:'Shell-shaped clip and canvas shoulder bag with handwritten notes',expressions:'Thoughtful gaze; earnest smile when she commits to something'},
  kaede:{silhouette:'Punk-inspired cropped leather jacket, layered asymmetrical tee, utility belts and combat boots',palette:'Acid green, charcoal, violet',hair:'Messy silver-gray shag cut with a dark root',details:'Safety-pin charms, old transit ticket tucked in phone case',expressions:'Provocative smirk; wary stillness when she is treated kindly'},
  jun:{silhouette:'Tall lean frame, tailored referee vest under loose rolled-sleeve jacket and straight trousers',palette:'Smoke navy, pale mint, brushed steel',hair:'Short dark brown with one natural silver streak near the temple',details:'Score slip tucked into shirt pocket, narrow rectangular watch',expressions:'Deadpan brow lift; eye contact when taking someone seriously'},
  teo:{silhouette:'Lively lean frame, cropped windbreaker and layered concert tees with relaxed trousers',palette:'Tangerine, violet, navy',hair:'Copper-dyed fringe over short dark sides',details:'Headphones at collar, clip-on mic, patched messenger bag',expressions:'Wide performance grin; nervous downward glance when microphone is off'},
  iris:{silhouette:'Athletic compact frame, weatherproof oversized jacket, fitted work trousers and heavy sneakers',palette:'Deep teal, rust orange, dark graphite',hair:'Short tight black curls with an undercut on the right',details:'Sun freckles, silver whistle on cord, patched courier satchel',expressions:'Dry sideways smile; fierce attention while listening'}
 };
 const schedules={
  jun:[['library','center','home'],['center','center','cafe'],['library','center','center'],['home','library','cafe'],['library','center','center'],['center','center','cafe'],['home','park','home']],
  teo:[['home','arcade','arcade'],['cafe','arcade','home'],['shop','arcade','cafe'],['home','shop','arcade'],['shop','arcade','arcade'],['center','shop','arcade'],['home','park','arcade']],
  iris:[['park','shop','home'],['home','shop','park'],['park','cafe','park'],['home','shop','cafe'],['park','shop','park'],['shop','center','park'],['home','park','home']]
 };
 const arrivals={jun:11,teo:5,iris:10};
 const deltas={
  support:{affection:2,trust:2,respect:0,attraction:0},
  honest:{affection:1,trust:1,respect:2,attraction:0},
  friend:{affection:2,trust:1,respect:0,attraction:0}
 };
 function C(label,reply,kind,flag){return {label,reply,kind,flag:flag||null,delta:{...deltas[kind]}};}
 // Speaker IDs are resolved to the full cast names at render time. No narrator
 // describes what the protagonist 'feels': dialogue leaves space for the player.
 function S(id,npc,title,start,end,place,slot,minBond,prerequisite,lines,choices){
  return {id,npc,title,start,end,place,slot,minBond,prerequisite:prerequisite||null,chapter:start<=30?1:start<=60?2:3,
   lines:lines.map(([speaker,text])=>({speaker,text})),choices:choices.map(x=>C(...x))};
 }
 const events=[
  S('jun_guest_1','jun','An Appeal to the Rules',11,25,'library',1,0,null,[
   ['jun','The ruling was correct. That does not mean it was kind.'],
   ['Protagonist','You can be both, can’t you?'],
   ['jun','I thought so. Then two children argued over a prize card, and I heard myself sound like a handbook.'],
   ['Protagonist','What happened afterward?'],
   ['jun','One stopped coming to the club. I kept the rulebook. I would rather have kept the player.'],
   ['jun','Sorry. That was a strange answer to “Is this chair taken?”']
  ],[
   ['Offer to talk to the player with him','I might take you up on that. I am better with rules than apologies.','support','jun_reach_out'],
   ['Tell him a fair ruling still needs an explanation','A fair point. I can explain a ruling without making someone feel small.','honest','jun_explain']
  ]),
  S('jun_guest_2','jun','The Table Nobody Books',37,52,'center',0,2,'jun_guest_1',[
   ['jun','Nobody signs up for the beginner table anymore.'],
   ['Protagonist','Have you asked why?'],
   ['jun','They say they are not ready. I used to tell them to practice.'],
   ['Protagonist','That is a fairly lonely way to learn.'],
   ['jun','Exactly. I have two spare decks and a stubborn habit I would like to break.'],
   ['jun','Will you play the first demonstration? Deliberately badly is also acceptable.']
  ],[
   ['Volunteer to lose gracefully to a beginner','I suspect you will find losing gracefully is the harder skill. Thank you.','support','jun_demo'],
   ['Suggest he let beginners teach the rules back','That is unexpectedly clever. I can stop lecturing and start listening.','honest','jun_learn']
  ]),
  S('jun_guest_3','jun','A Signature on the Slip',66,82,'cafe',2,4,'jun_guest_2',[
   ['jun','The table is full now. Last week they argued about which deck box was luckiest.'],
   ['Protagonist','Did you issue a ruling?'],
   ['jun','No. I have finally learned when not to interfere.'],
   ['jun','The child who stopped coming came back yesterday. I owe them an apology, not a trophy.'],
   ['Protagonist','Are you going to give it?'],
   ['jun','I wrote it down. Now I have to say it out loud.']
  ],[
   ['Tell him you will stay until he is ready','Stay for the coffee instead. I know what to say, and I should say it myself.','support','jun_accountable'],
   ['Encourage him to say the apology without a speech','One sentence, then listen. Right. I can do that.','honest','jun_direct']
  ]),
  S('teo_guest_1','teo','Dead Air',5,17,'arcade',1,0,null,[
   ['teo','There is a seven-second silence in yesterday’s recording. Seven. Entire. Seconds.'],
   ['Protagonist','People were watching the match.'],
   ['teo','They might have thought the mic died. Or that I did.'],
   ['Protagonist','Did you miss a play while you were talking?'],
   ['teo','...A really good one. Yuna noticed. I pretended I meant to.'],
   ['teo','All right. Maybe I need to learn the difference between filling air and saying something.']
  ],[
   ['Ask him to describe one turn without jokes','That was strangely thrilling. I could actually hear the cards.','support','teo_listen'],
   ['Point out that the players are the main attraction','That stings because it is correct. I will try being the frame, not the picture.','honest','teo_credit']
  ]),
  S('teo_guest_2','teo','The Highlight Reel',26,43,'shop',2,2,'teo_guest_1',[
   ['teo','I cut a montage of the qualifiers. It looks amazing.'],
   ['Protagonist','Why are you not posting it?'],
   ['teo','The funny parts make Kaede look like a bully. Out of context, that is an easy story to sell.'],
   ['Protagonist','Was she bullying anyone?'],
   ['teo','No. She stayed afterward and helped someone rebuild their deck. Nobody filmed that.'],
   ['teo','I can lose views, or I can let a lie become the thing everybody remembers.']
  ],[
   ['Help him recut the footage and ask Kaede first','That takes longer. It will also be hers to approve. Let us do that.','support','teo_permission'],
   ['Tell him to remove the misleading clips','I owe her the truth more than I owe the channel a punchline.','honest','teo_correction']
  ]),
  S('teo_guest_3','teo','A Mic Left on the Table',60,78,'arcade',2,4,'teo_guest_2',[
   ['teo','No one asked me to host the final. I took it personally for exactly three hours.'],
   ['Protagonist','And after three hours?'],
   ['teo','I found out the volunteer crew needed someone to teach new commentators.'],
   ['teo','I was ready to complain, then one of them asked how I know when to stop talking.'],
   ['Protagonist','I would pay to hear that answer.'],
   ['teo','You and me both. I think I am finally learning it.']
  ],[
   ['Offer to be the first practice audience','Only if you give me brutally useful notes. I trust you for those now.','support','teo_mentor'],
   ['Suggest the best commentary starts with curiosity','Not with my name in lights? You are ruining my brand. In a good way.','honest','teo_curiosity']
  ]),
  S('iris_guest_1','iris','The Unclaimed Box',10,24,'park',0,0,null,[
   ['iris','Three decks, no return address, and a note that says “for whoever needs them.”'],
   ['Protagonist','Sounds like a nice surprise.'],
   ['iris','Maybe. But the club keeps a record of donations. Otherwise things go missing and nobody knows who to ask.'],
   ['Protagonist','You think it is suspicious?'],
   ['iris','I think good intentions work better when people can count on them.'],
   ['iris','I will carry the box. Can you help me find out who should receive it?']
  ],[
   ['Offer to deliver the decks together','Good. Let us get them to the kids who have been sharing one old deck.','support','iris_deliver'],
   ['Suggest checking with the shop before giving them away','Paperwork first, generosity second. Boring, and probably wise.','honest','iris_record']
  ]),
  S('iris_guest_2','iris','Last Ferry',32,49,'shop',1,2,'iris_guest_1',[
   ['iris','I could make the delivery today, but I would miss my sister’s exhibition match.'],
   ['Protagonist','Can someone cover the route?'],
   ['iris','I trained a replacement. Then I kept answering every call instead of letting them work.'],
   ['Protagonist','Sounds familiar.'],
   ['iris','Yeah. Hana said the same thing, with considerably more tact.'],
   ['iris','My sister saved me a seat. I cannot keep telling her “next time.”']
  ],[
   ['Help write a handoff list, then send Iris to the match','You make a convincing argument for not being indispensable. I will go.','support','iris_delegate'],
   ['Tell her trusting a replacement is part of training them','They cannot learn while I hover. All right. Phone on silent.','honest','iris_trust']
  ]),
  S('iris_guest_3','iris','Low Tide, Full Tables',68,84,'park',2,4,'iris_guest_2',[
   ['iris','The club asked me to coordinate deliveries next season.'],
   ['Protagonist','You sound worried.'],
   ['iris','If I say yes, I will have to organize the work instead of doing it all myself.'],
   ['Protagonist','Do you want the job?'],
   ['iris','I do. I also want evenings with my family. Those things should not be enemies.'],
   ['iris','Do not give me an answer. Just remind me I said that if I forget.']
  ],[
   ['Promise to remind her to keep her evenings','Deal. I will write it on the schedule where I cannot ignore it.','support','iris_balance'],
   ['Ask her to make the boundaries part of the offer','Hours, backup crew, and weekends. I can ask for those without apologizing.','honest','iris_terms']
  ]),
  S('hana_cross_1','hana','The Extra Table',25,39,'shop',1,1,'hana_route_1',[
   ['hana','The beginners need a table, and Teo booked the last one for a livestream.'],
   ['teo','I booked it two weeks ago! But I did not know the new players were coming.'],
   ['Protagonist','Can either event move?'],
   ['hana','I could ask. I am just tired of being the person who disappoints someone.'],
   ['teo','You are allowed to disappoint me. I have experience with it.'],
   ['hana','That is not as comforting as you think.']
  ],[
   ['Propose a shorter stream and a longer beginner session','An actual compromise. I should have asked instead of worrying.','support','hana_shared_table'],
   ['Encourage Hana to tell Teo what she needs','Okay. Teo, I need that table by six. And I am asking, not apologizing.','honest','hana_boundary']
  ]),
  S('yuna_cross_1','yuna','The Match Without Applause',34,49,'arcade',2,2,'yuna_route_1',[
   ['yuna','Teo brought a microphone to our private testing night.'],
   ['teo','It was switched off! Emotionally it was still on, admittedly.'],
   ['Protagonist','Yuna, do you want an audience?'],
   ['yuna','Not tonight. If I lose, I want to know whether the deck is bad, not whether the joke worked.'],
   ['teo','I can sit down and shuffle instead.'],
   ['yuna','Good. You have two hands and a suspiciously empty bench.']
  ],[
   ['Offer to test the serious list with them','Nobody is recording it. Thank you. That is exactly the kind of pressure I need.','support','yuna_private_test'],
   ['Tell Teo that Yuna has already made her choice','Thanks. I was trying to say that without turning it into a performance.','honest','yuna_boundary']
  ]),
  S('camila_cross_1','camila','Inventory of Trust',36,52,'shop',1,1,'camila_route_1',[
   ['camila','The delivery manifest says eight prize decks. Iris brought seven.'],
   ['iris','The eighth was damaged. I separated it rather than hand someone a ruined prize.'],
   ['Protagonist','Is there a replacement?'],
   ['camila','There is. It is valuable, and I had been saving it for a trade.'],
   ['iris','The tournament is this weekend. If you need a witness, I will sign the report.'],
   ['camila','I believe you. I just did not expect the right choice to be so expensive.']
  ],[
   ['Suggest Camila lend the spare deck and document it','Lend, not give away. You are annoyingly good at finding a third option.','support','camila_lend'],
   ['Ask the organizers to decide openly','You are right. I should not turn a community decision into my private burden.','honest','camila_transparent']
  ]),
  S('marina_cross_1','marina','A Weather Window',39,55,'park',2,1,'marina_route_1',[
   ['marina','Iris says the water will rise again by morning. The tournament ferry is still scheduled.'],
   ['iris','I said the route may be delayed. There is a difference.'],
   ['Protagonist','Could the registration desk stay open longer?'],
   ['marina','I would hate for someone to miss a match because they live across the river.'],
   ['iris','Then call the organizers now, not tomorrow when the boats are already late.'],
   ['marina','I will. I think I am done waiting for someone else to speak first.']
  ],[
   ['Help Marina contact the organizers','They agreed to allow late arrivals. That is one less person left on the dock.','support','marina_access'],
   ['Encourage her to make the argument herself','I did not need anyone to speak for me. I just needed the nerve to call.','honest','marina_voice']
  ]),
  S('reina_cross_1','reina','A Correct Loss',47,63,'center',2,2,'reina_route_2',[
   ['reina','Jun ruled that my opponent could replay the attack. He was right.'],
   ['jun','That may be the least reassuring compliment I have heard today.'],
   ['Protagonist','Then why are you still angry?'],
   ['reina','Because I built the whole game around that mistake. It was a stupid plan, and now everyone has seen it.'],
   ['jun','You both agreed to the correction. The crowd will remember the match less than you think.'],
   ['reina','Easy for the man who does not have to play the rematch.']
  ],[
   ['Offer to test the corrected matchup with her','No sympathy games. Full strength. Good. You know me.','support','reina_rebuild'],
   ['Point out she admitted the error without excuses','Do not make a ceremony of it. ...But thank you for noticing.','honest','reina_own_error']
  ]),
  S('akari_cross_1','akari','A Model of Fairness',51,66,'library',1,2,'akari_route_2',[
   ['akari','Jun rejected my seating algorithm. It is statistically fair.'],
   ['jun','It seats the same beginner next to three champions in a row.'],
   ['Protagonist','Does your model measure whether people come back next week?'],
   ['akari','No. It measures match strength and waiting time.'],
   ['jun','Both are useful. Neither tells the whole story.'],
   ['akari','I hate when a missing variable turns out to be a person.']
  ],[
   ['Help her interview the new players','I kept treating discomfort as noise. It was data I should have asked about.','support','akari_interviews'],
   ['Ask her to publish the model’s limits before using it','A model should disclose what it cannot measure. I will add that.','honest','akari_limits']
  ]),
  S('kaede_cross_1','kaede','A Cut That Matters',62,77,'arcade',2,1,'kaede_route_1',[
   ['kaede','That clip of my match is everywhere. They edited out the handshake.'],
   ['teo','I did not cut it. But I amplified it before I watched the whole thing.'],
   ['Protagonist','You could both leave it alone.'],
   ['kaede','I could. Then people who have never met me would decide who I am.'],
   ['teo','I can post the complete recording and explain what I got wrong.'],
   ['kaede','Do it. And next time, ask the person you are filming.']
  ],[
   ['Support Kaede without speaking for her','I can defend myself. Still... it is easier with someone listening.','support','kaede_own_story'],
   ['Ask Teo to publish the correction with equal visibility','Good. An apology that nobody sees is just a private comfort.','honest','kaede_public_correction']
  ]),
  S('shiori_cross_1','shiori','The Second Opinion',60,76,'center',2,2,'shiori_route_2',[
   ['shiori','Jun found the score sheet from my last tournament.'],
   ['jun','It is not evidence of a bad player, only a disputed ruling.'],
   ['Protagonist','Would replaying the match change anything?'],
   ['shiori','No. That is what I needed to hear. I kept imagining one more game could undo it.'],
   ['jun','We can acknowledge what happened without inventing a different past.'],
   ['shiori','Then perhaps I can stop asking that match to decide who I am.']
  ],[
   ['Offer a friendly match with no audience','I would like that. A game with no burden on it. Just cards and company.','support','shiori_no_stakes'],
   ['Ask what she wants to teach the next generation','That learning to lose is not the same as learning to disappear.','honest','shiori_teaches']
  ])
 ];
 // Crossover participants have a real appointment at the story location.
 const crossoverGuests={hana_cross_1:'teo',yuna_cross_1:'teo',camila_cross_1:'iris',marina_cross_1:'iris',reina_cross_1:'jun',akari_cross_1:'jun',kaede_cross_1:'teo',shiori_cross_1:'jun'};
 for(const e of events)if(crossoverGuests[e.id])e.participants=[crossoverGuests[e.id]];
 // The first line of a later guest chapter remembers the preceding answer.
 // This is authored variation, not a generated dialogue or a rules change.
 const callbacks={
  jun_guest_2:{jun_reach_out:'The kid wrote back. Not to play yet. Just to say they got my message. That counts.',jun_explain:'I tried explaining the same rule without the lecture. They stayed for another game.'},
  jun_guest_3:{jun_demo:'A beginner beat me last week. Properly beat me. I could not have been happier.',jun_learn:'A beginner explained a timing rule to me. I did not interrupt once. I deserve a medal.'},
  teo_guest_2:{teo_listen:'I left an entire turn uncut in my last video. People noticed the players instead of me.',teo_credit:'I credited the players before the announcer for once. Nobody asked for their money back.'},
  teo_guest_3:{teo_permission:'Kaede approved the recut. She even suggested a better ending than mine.',teo_correction:'The correction got fewer views. It also got a thank-you from Kaede. That matters more.'},
  iris_guest_2:{iris_deliver:'The kids sent a drawing of a Pikachu riding a ferry. It is on my fridge now.',iris_record:'We found the anonymous donor. They asked us not to use their name, only to track the decks.'},
  iris_guest_3:{iris_delegate:'My replacement ran the route without a single call to me. I saw my sister play.',iris_trust:'I switched my phone off for the match. The deliveries happened anyway. Imagine that.'}
 };
 for(const e of events)if(callbacks[e.id])e.openingByFlag=callbacks[e.id];
 // Separate authoring file keeps this optional adult heroine's arc easy to extend.
 const SOL=typeof module==='object'&&module.exports?require('./rpg_sol_character'):window.NeoRpgSolCharacter;
 Object.assign(cast,SOL.cast);Object.assign(looks,SOL.looks);Object.assign(schedules,SOL.schedules);Object.assign(arrivals,SOL.arrivals);
 events.push(...SOL.events);
 // Every other pack is auto-registered from the generated JSON registry.
 // Sol remains exported under NeoRpgSolCharacter for existing tests and saves.
 const REGISTRY=typeof module==='object'&&module.exports?require('./rpg_character_packs.generated'):window.NeoRpgCharacterPacks;
 for(const entry of REGISTRY.packs){
  if(entry.id==='sol')continue;
  if(cast[entry.id])throw Error('Character pack conflicts with existing NPC: '+entry.id);
  cast[entry.id]=entry.cast;looks[entry.id]=entry.looks;schedules[entry.id]=entry.schedule;
  arrivals[entry.id]=entry.arrivalDay;events.push(...entry.events);
 }
 function validate(){
  const errors=[],ids=new Set(events.map(e=>e.id)),known=new Set([...Object.keys(cast),...Object.keys(looks)]);
  if(ids.size!==events.length)errors.push('Duplicate narrative event');
  for(const [id,c] of Object.entries(cast)){
   if(!looks[id]||!schedules[id]||!Number.isInteger(arrivals[id])||!c.deck)errors.push('Incomplete guest '+id);
  }
  for(const e of events){
   if(!known.has(e.npc)||!e.lines.length||e.choices.length<2)errors.push('Incomplete event '+e.id);
   if(e.prerequisite&&e.prerequisite===e.id)errors.push('Self-linked event '+e.id);
  }
  return errors;
 }
 return Object.freeze({cast,looks,schedules,arrivals,events,validate});
});
