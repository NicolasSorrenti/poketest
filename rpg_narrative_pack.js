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
   talk:["A player gave me a trophy for 'Most Annoying Ruling.' It's on my desk.","I once won a match by passing three turns in a row. The spectators hated me.","That table has a loose leg. I consider it a personal insult."],
   flirt:'Flattering, but I am here for the cards. Try that line on someone who did not hear it from three challengers today.',
   duelWin:'Clean lines. You won because you left yourself options.',
   duelLose:'You rushed the final turn. I would like to show you why, if you have a minute.'
  },
  teo:{
   name:'Teo Álvarez',age:24,deck:'hotfoot',style:'Hotfoot · Fast tempo',
   intro:'The rookie! Give me one sentence for the announcer booth. No pressure. Okay, some pressure.',
   repeat:'Great timing. My microphone is working, which is more than I can say for my plan.',
   talk:["My microphone died during the best play of the match. The crowd noticed before I did.","Yuna says I make every match sound like the final. She's only slightly exaggerating.","If I tell a joke twice, that means the first time was probably an accident."],
   flirt:'That is going straight into my collection of things I wish I had said first.',
   duelWin:'Oof. That was a spectacularly quiet way to beat me. Respect.',
   duelLose:'That was fast, right? I know I am not supposed to be proud of the losing part.'
  },
  iris:{
   name:'Iris Navarro',age:26,deck:'cold_fusion',style:'Cold Fusion · Patient adaptability',
   intro:'If the boxes are late, blame the tide. If they are early, you can thank me.',
   repeat:'You look less lost than the last time we met. That is progress.',
   talk:["A card box looks light until you carry twenty of them up the dock stairs.","Marina called the high tide before the ferry captain did. I owe her lunch.","Everyone likes the evening tournament. Guess who puts the chairs away."],
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
  S('jun_guest_1','jun','An Appeal to the Rules',11,25,'library',1,0,null,[["Narrator","At the library, Jun closes a rulebook beside a tournament slip. Someone has circled a disputed ruling in red."],["jun","I made the right call. You'd think I'd be happier about it."],["Protagonist","What happened after the match?"],["jun","One of the kids packed up and left before I could explain."],["Narrator","Jun taps the folded slip against the book, then leaves it there without filing it."],["jun","Next time I see them, I'm going to ask how they're doing before I mention the rule."]],[
   ['Offer to talk to the player with him','I hope they\'ll talk to me. Can you help me find out when they\'re next at the club?','support','jun_reach_out'],
   ['Tell him a fair ruling still needs an explanation','You\'re right. I should have said why I made the call, not just quoted a rule.','honest','jun_explain']
  ]),
  S('jun_guest_2','jun','The Table Nobody Books',37,52,'center',0,2,'jun_guest_1',[["jun","The beginner table is empty again. I even straightened the chairs."],["Protagonist","Did anyone sign up?"],["Narrator","Two untouched starter decks sit beside a handwritten 'Anyone welcome' sign."],["jun","Three people came over, looked at the sign, and walked away."],["Protagonist","Want me to sit down first?"],["jun","Please. And if someone makes a mistake, let them finish their turn before we jump in."]],[
   ['Volunteer to lose gracefully to a beginner','Sit opposite me. I\'ll play the first game badly so you don\'t have to.','support','jun_demo'],
   ['Suggest he let beginners teach the rules back','They get to explain the turn back to me? Good. I might learn something too.','honest','jun_learn']
  ]),
  S('jun_guest_3','jun','A Signature on the Slip',66,82,'cafe',2,4,'jun_guest_2',[["jun","The beginner table is full. Someone's arguing about which deck box brings luck."],["Protagonist","You going to make a ruling?"],["Narrator","Jun sets a score slip on the table. The child's name is written carefully on the back."],["jun","No. But there's somebody here I owe an apology to."],["Protagonist","Want some company?"],["jun","Afterward, maybe. I need to go over there myself."]],[
   ['Tell him you will stay until he is ready','After coffee, yes. But I should speak to them on my own first.','support','jun_accountable'],
   ['Encourage him to say the apology without a speech','One sentence, then let them answer. All right. Here goes.','honest','jun_direct']
  ]),
  S('teo_guest_1','teo','Dead Air',5,17,'arcade',1,0,null,[["Narrator","Teo replays seven seconds of silence on his recording. The red recording light stays on long after the clip ends."],["teo","There. Right after the third turn. I thought the microphone died."],["Protagonist","You can hear the players talking about their hands."],["teo","Yeah. And then I shouted over the best move of the game."],["Narrator","He rewinds to the same moment, this time without turning up the volume."],["teo","Okay. This one stays in the edit. My commentary can go."]],[
   ['Ask him to describe one turn without jokes','All right, turn three, no jokes. ...That\'s harder than it sounds.','support','teo_listen'],
   ['Point out that the players are the main attraction','The players did all the work. I\'ll try letting people hear it.','honest','teo_credit']
  ]),
  S('teo_guest_2','teo','The Highlight Reel',26,43,'shop',2,2,'teo_guest_1',[["teo","I made a highlight reel. Kaede looks terrifying in it."],["Protagonist","Isn't that what she wanted?"],["Narrator","The paused footage shows her laughing. An earlier shot catches someone else turning away from the camera."],["teo","Not if I cut out the bit where she helps that player afterward."],["Protagonist","Did you ask her to look at the edit?"],["teo","Not yet. I should. Before I post a version of her she won't recognize."]],[
   ['Help him recut the footage and ask Kaede first','I\'ll send Kaede the new cut before it goes up. Will you watch it with me?','support','teo_permission'],
   ['Tell him to remove the misleading clips','You\'re right. I\'ll take those shots out and tell her why.','honest','teo_correction']
  ]),
  S('teo_guest_3','teo','A Mic Left on the Table',60,78,'arcade',2,4,'teo_guest_2',[["teo","They didn't ask me to host the final. I wrote half a complaint before I saw the volunteer sheet."],["Protagonist","What was on the sheet?"],["Narrator","A second column lists training for new commentators. Teo's name has been penciled beside it."],["teo","Someone asked if I could teach them to call a match."],["Protagonist","You can do that?"],["teo","I can teach them when to stop talking. Possibly. I'm still testing that lesson on myself."]],[
   ['Offer to be the first practice audience','Brutal notes? Wonderful. My ego needs a few good bruises.','support','teo_mentor'],
   ['Suggest the best commentary starts with curiosity','Not my name in lights? Fine. Maybe the match deserves the headline.','honest','teo_curiosity']
  ]),
  S('iris_guest_1','iris','The Unclaimed Box',10,24,'park',0,0,null,[["Narrator","Three donated deck boxes sit on the dock office counter. The attached note reads 'for whoever needs them.'"],["iris","No return address. The kids will love these, if the club can record where they go."],["Protagonist","Do you know who they're for?"],["iris","Not yet. We have six children waiting for a practice deck."],["Narrator","She places the note in a clear sleeve and sets two boxes by the delivery ledger."],["iris","Help me check the list? I'd rather nobody end up empty-handed."]],[
   ['Offer to deliver the decks together','The club\'s beginner list is in the office. Come on, let\'s check the names.','support','iris_deliver'],
   ['Suggest checking with the shop before giving them away','Paperwork first. Then the kids can play. I\'ll get the pen.','honest','iris_record']
  ]),
  S('iris_guest_2','iris','Last Ferry',32,49,'shop',1,2,'iris_guest_1',[["iris","I could take this delivery, but my sister's match is this afternoon."],["Protagonist","Didn't you train someone to cover for you?"],["Narrator","Her phone lights up. A message from the new driver says the route is already loaded."],["iris","I keep checking whether they need me. They haven't asked once."],["Protagonist","Will you go to the match?"],["iris","Yeah. They saved me a seat. I'm going to try actually sitting in it."]],[
   ['Help write a handoff list, then send Iris to the match','There\'s the handoff sheet. The new driver\'s already on the road. I\'m going to the match.','support','iris_delegate'],
   ['Tell her trusting a replacement is part of training them','Phone on silent. If something breaks, they\'ll know how to call the office.','honest','iris_trust']
  ]),
  S('iris_guest_3','iris','Low Tide, Full Tables',68,84,'park',2,4,'iris_guest_2',[["iris","The club offered me next season's delivery schedule. Coordinator, not driver."],["Protagonist","That's good news, isn't it?"],["Narrator","A fresh timetable has an empty column marked 'Backup crew.' Iris runs her finger along it."],["iris","If I take it, I'm filling that column before I agree to anything."],["Protagonist","And the evenings?"],["iris","Mine. My sister's already asked me to come to the next event."]],[
   ['Promise to remind her to keep her evenings','Put it in writing. If I start booking every evening again, point to the timetable.','support','iris_balance'],
   ['Ask her to make the boundaries part of the offer','Backup crew, set hours, weekends off. All right. I\'ll ask for that.','honest','iris_terms']
  ]),
  S('hana_cross_1','hana','The Extra Table',25,39,'shop',1,1,'hana_route_1',[["Narrator","The shop's last empty table bears a handwritten 'BEGINNERS' sign. Beside it, Teo has already unpacked a microphone."],["hana","I need that table by six. The kids are bringing their starter decks."],["teo","And my stream starts at six. I've advertised it for two weeks."],["Protagonist","Could you shorten the stream and let them use the table afterward?"],["Narrator","Teo studies his schedule. Hana waits, one hand still on the back of the chair."],["hana","I can help set up the camera if we can clear the space by seven."]],[
   ['Propose a shorter stream and a longer beginner session','Teo, seven o\'clock. I\'ll help you pack the camera, but I need the table afterward.','support','hana_shared_table'],
   ['Encourage Hana to tell Teo what she needs','Teo, I need that table for the kids by seven. Can we do that?','honest','hana_boundary']
  ]),
  S('yuna_cross_1','yuna','The Match Without Applause',34,49,'arcade',2,2,'yuna_route_1',[["Narrator","At the arcade, Teo has brought a microphone to Yuna's private test table. The cable is coiled neatly beneath his chair."],["yuna","I don't want a recording tonight. I've got a deck to fix."],["teo","It's switched off. See? No light."],["Protagonist","Then you could both play a few hands."],["Narrator","Yuna slides a sleeved deck toward Teo without looking at the microphone."],["yuna","Here. It's awful against Water. Show me why."]],[
   ['Offer to test the serious list with them','Thank you. Deal the ugly hands first. I want to know how badly this list loses.','support','yuna_private_test'],
   ['Tell Teo that Yuna has already made her choice','It\'s fine, Teo. Just take the microphone home after the match.','honest','yuna_boundary']
  ]),
  S('camila_cross_1','camila','Inventory of Trust',36,52,'shop',1,1,'camila_route_1',[["Narrator","Seven prize decks lie across the shop counter. The delivery manifest, pinned beneath a paperweight, calls for eight."],["camila","We're a deck short. Iris, tell me that's a printing error."],["iris","The eighth box was damaged. I didn't want to pass it on as a prize."],["Protagonist","There's a spare deck in the display case, isn't there?"],["Narrator","Camila unlocks the case, pauses over the price tag, and takes out the box."],["camila","I'll lend it if we put the replacement in writing. Someone hand me a pen."]],[
   ['Suggest Camila lend the spare deck and document it','A loan, not a gift. Now that I can put in the ledger.','support','camila_lend'],
   ['Ask the organizers to decide openly','Let\'s let the tournament staff choose. It\'s their event, after all.','honest','camila_transparent']
  ]),
  S('marina_cross_1','marina','A Weather Window',39,55,'park',2,1,'marina_route_1',[["Narrator","The ferry timetable rattles in its frame. Marina watches the waves climbing higher than the steps at the landing."],["marina","The qualifier starts before some players will get here if the boats run late."],["iris","I warned the organizers. They're still using the old start time."],["Protagonist","Can the registration desk stay open longer?"],["Narrator","Marina takes out her phone. The organizer's number is on the back of her event flyer."],["marina","I'm calling them. Can you help me explain what the crossing's like today?"]],[
   ['Help Marina contact the organizers','They said late arrivals can register. I\'ll put a note at the landing.','support','marina_access'],
   ['Encourage her to make the argument herself','They agreed! I\'ll tell the ferry captain before the next crossing.','honest','marina_voice']
  ]),
  S('reina_cross_1','reina','A Correct Loss',47,63,'center',2,2,'reina_route_2',[["Narrator","At the community center, Reina folds a corrected match slip so tightly that its edges crease."],["reina","Jun let the attack be replayed. He was right. I still hate it."],["jun","You agreed to the correction before the next turn. That's all anyone asked."],["Protagonist","Want to test the matchup again without the mistake?"],["Narrator","Reina unfolds the slip, notices the crease, and smooths it against the table."],["reina","Yes. Same decks. No favors. I want to know what the game should've looked like."]],[
   ['Offer to test the corrected matchup with her','Full strength. The corrected matchup. No shortcuts.','support','reina_rebuild'],
   ['Point out she admitted the error without excuses','I admitted the mistake. Now let me do something about it. Cut the deck.','honest','reina_own_error']
  ]),
  S('akari_cross_1','akari','A Model of Fairness',51,66,'library',1,2,'akari_route_2',[["Narrator","Akari's seating chart fills an entire noticeboard. Jun points to three consecutive rows with the same name highlighted."],["akari","It's a fair distribution by ranking. I checked twice."],["jun","That beginner has been paired against three champions."],["Protagonist","Does the model track who comes back the following week?"],["Narrator","Akari checks the small print at the bottom of the chart. Her pencil stays in place above an empty column."],["akari","No. It doesn't. I should ask the beginner before I revise anything."]],[
   ['Help her interview the new players','We\'ll ask whether the pairings felt fair. That\'s missing from my sheet.','support','akari_interviews'],
   ['Ask her to publish the model’s limits before using it','I\'ll add a note on the board. The numbers don\'t say everything.','honest','akari_limits']
  ]),
  S('kaede_cross_1','kaede','A Cut That Matters',62,77,'arcade',2,1,'kaede_route_1',[["Narrator","At the arcade, a clip of Kaede's last match plays on three phones. The handshake at the end has been cut."],["kaede","Now everybody thinks I stormed off. You shared that, Teo."],["teo","I did. I should've watched the whole match first."],["Protagonist","Can you post the full recording alongside the clip?"],["Narrator","Teo opens the upload screen and passes the phone toward Kaede."],["kaede","Show the correction as loudly as the mistake. Then we're square."]],[
   ['Support Kaede without speaking for her','I\'m not asking you to fight my battles. Just don\'t share that clip again.','support','kaede_own_story'],
   ['Ask Teo to publish the correction with equal visibility','Same audience, same volume. Thanks. That\'s all I wanted.','honest','kaede_public_correction']
  ]),
  S('shiori_cross_1','shiori','The Second Opinion',60,76,'center',2,2,'shiori_route_2',[["Narrator","Jun brings an old score sheet to the library. Shiori opens it at a corner worn thin from being folded."],["shiori","That's the tournament I keep talking about. I remember the last turn too clearly."],["jun","The ruling was disputed. It doesn't tell us whether you played well."],["Protagonist","Would you want to play a match here, without a crowd?"],["Narrator","Shiori closes the folder but leaves her deck case on the table."],["shiori","I think I would. Just one game. And please don't ask about the score sheet again tonight."]],[
   ['Offer a friendly match with no audience','I\'d like that. No bracket. Just one game after tea.','support','shiori_no_stakes'],
   ['Ask what she wants to teach the next generation','I might run a beginner table again. One step at a time.','honest','shiori_teaches']
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
