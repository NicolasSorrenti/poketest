'use strict';
// Supplemental authored chapters. Existing heroine and character-pack routes remain intact.
// No generated registry is edited; chapter IDs are stable across saved games.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgBondChapters=api;
})(typeof window!=='undefined'?window:null,function(){
 const deltas={
  support:{affection:2,trust:2,respect:0,attraction:0},
  honest:{affection:2,trust:1,respect:2,attraction:0},
  challenge:{affection:2,trust:1,respect:2,attraction:0}
 };
 function E(id,npc,title,start,place,slot,minBond,previous,lines,answers){
  return {id,npc,title,start,end:90,place,slot,minBond,
   prerequisite:previous||null,evergreen:true,chapter:start<=30?1:start<=60?2:3,
   lines:lines.map((value,i)=>typeof value==='string'?{speaker:i%2?'Protagonist':npc,text:value}:value),
   choices:answers.map(([label,reply,kind,flag])=>({
    label,reply,kind,flag,delta:{...deltas[kind]}
   }))};
 }
 const events=[
 E('jun_guest_4','jun','A Match Without a Whistle',83,'center',1,6,'jun_guest_3',[{"speaker":"Narrator","text":"At the empty community center, Jun removes his judge badge and sets it beneath the scorekeeper's clipboard."},{"speaker":"jun","text":"There. Now nobody can ask me to settle anything for an hour."},{"speaker":"Protagonist","text":"Want me to put the clock away too?"},{"speaker":"Narrator","text":"Jun eyes the clock, then slides it into a drawer with the tournament slips."},{"speaker":"jun","text":"You read my mind. Just cards this time. Cut the deck."}],[["Play without asking him to referee","I almost reached for a penalty sheet twice. Good game, though. Just a game.","support","jun_unofficiated"],["Ask him to teach you how to judge fairly","All right. After this hand, I'll show you the rule that everyone keeps reading backward.","honest","jun_fair_play"]]),
 E('teo_guest_4','teo','The Quiet Broadcast',79,'arcade',2,6,'teo_guest_3',[{"speaker":"Narrator","text":"At the arcade, Teo has left his microphone unplugged. A recording of two players thinking through a slow turn plays on his phone."},{"speaker":"teo","text":"This is the part I would've cut last month. Fourteen seconds of absolutely nothing."},{"speaker":"Protagonist","text":"One of them nearly reaches for a card, then stops."},{"speaker":"Narrator","text":"Teo rewinds those fourteen seconds instead of skipping ahead. He holds the phone out so you can see both players."},{"speaker":"teo","text":"Exactly. I never noticed what happened before the attack."}],[["Encourage him to publish the uncut match","Put it up, then. I'll keep the whole turn. It's better than the noisy edit.","support","teo_real_match"],["Offer to co-commentate without talking over players","Deal. If I start narrating your draw, you can confiscate the microphone.","challenge","teo_shared_mic"]]),
 E('iris_guest_4','iris','The Route Home',85,'park',0,6,'iris_guest_3',[{"speaker":"Narrator","text":"On the riverside bench, Iris turns a tournament ticket over in her hands. Her delivery bag is nowhere in sight."},{"speaker":"iris","text":"My sister lost her first match. She tried to find the next round on the schedule anyway."},{"speaker":"Protagonist","text":"Did you help her work out where to go?"},{"speaker":"Narrator","text":"Iris folds the ticket once, then leaves it open again. A faint ice-cream stain marks one corner."},{"speaker":"iris","text":"I bought us cones and listened. She talked about the match all the way home."}],[["Celebrate that she was simply there","She played three more games after that. I spent the afternoon fetching sleeves. Best use of my time in weeks.","support","iris_present"],["Suggest she make this a regular tradition","Next Saturday. I've already told the shop we'll be there. No, I'm not running the registration desk.","honest","iris_weekly"]]),
 E('elio_bond_1','elio','A Seat at the Table',7,'shop',1,0,null,[{"speaker":"Narrator","text":"The shop's last free chair has been left half-under a crowded play table. Elio stops just short of the noise."},{"speaker":"elio","text":"Think there's room for another? I can't tell if it's doubles."},{"speaker":"Protagonist","text":"Could just ask."},{"speaker":"Narrator","text":"He squares the deck in his hands, takes one step toward the table, then another."},{"speaker":"elio","text":"Sorry. Is anyone using that chair?"}],[["Offer to sit down beside him","You don't have to play every turn for me. Just stay for the first one, okay?","support","elio_companion"],["Practice how to ask for a match","Hi. Want a game? ...That sounded all right, didn't it?","challenge","elio_invitation"]]),
 E('elio_bond_2','elio','The Practice Hand',30,'library',0,2,'elio_bond_1',[{"speaker":"elio","text":"Two pages of mistakes from one game. Personal best."},{"speaker":"Protagonist","text":"Did you write down anything that worked?"},{"speaker":"elio","text":"I was going to. Then I saw how much red ink I'd used."},{"speaker":"Narrator","text":"Elio turns back three pages, finds an overlooked prize, and writes a short note beside it in blue."},{"speaker":"elio","text":"All right, that's one. Do you remember another?"}],[["Help him identify a clever losing turn","Right. That switch bought me a turn. I circled it this time instead of the mistake.","honest","elio_good_loss"],["Challenge him to write three things he did well","Four things. I found four. I'm keeping the blue pen for the next match.","support","elio_small_wins"]]),
 E('elio_bond_3','elio','The Open Challenge',51,'center',1,4,'elio_bond_2',[{"speaker":"elio","text":"I signed up. My name's actually on the bracket."},{"speaker":"Protagonist","text":"You still have the registration slip?"},{"speaker":"elio","text":"Every time I put it away, I take it out to check."},{"speaker":"Narrator","text":"A volunteer calls his name. Elio folds the slip, misses his pocket once, and walks toward the table."},{"speaker":"elio","text":"You don't have to cheer. Just... could you watch the first game?"}],[["Stay through the match, whatever the result","Thanks for staying. I lost game one, then asked for game two. That's new.","support","elio_stayed"],["Remind him of the plan he practiced","You were right about the opening. I remembered the first turn even with everyone watching.","challenge","elio_kept_calm"]]),
 E('elio_bond_4','elio','A Deck of His Own',73,'shop',1,6,'elio_bond_3',[{"speaker":"elio","text":"Look. New deck box. No Champion sticker on the lid."},{"speaker":"Protagonist","text":"Did you keep the old one?"},{"speaker":"elio","text":"Of course. My cousin's name's still on it."},{"speaker":"Narrator","text":"Inside the new lid is a crooked handwritten label. Elio runs a finger over it, then snaps the case shut."},{"speaker":"elio","text":"Cut the deck? I want you to play against this one first."}],[["Ask him what his favorite card is now","The common with the bent corner. It's still my favorite, even if nobody else wants it.","support","elio_own_name"],["Offer to be the first challenger of his new deck","Deal seven. If you beat me, don't apologize. And if I win, I'm telling everyone.","challenge","elio_first_challenge"]]),
 E('alma_bond_1','alma','The Table by the Window',8,'cafe',1,0,null,[{"speaker":"Narrator","text":"At the café, a new player pauses by the window table. A RESERVED sign is still standing beside an empty mug."},{"speaker":"alma","text":"That sign's older than half the regulars. I should've thrown it out."},{"speaker":"Protagonist","text":"Could we turn it around instead?"},{"speaker":"Narrator","text":"The newcomer edges inside, watching the tables. Alma reaches for the marker beside the till."},{"speaker":"alma","text":"Good idea. What do you think of 'Sit down, there's room'?"}],[["Help set up a welcoming table for newcomers","That sign did it. A kid sat down before I even reached the door. I nearly applauded.","support","alma_open_table"],["Suggest a no-pressure game night","No brackets. Everyone brought one deck. Nobody wanted to leave before closing.","honest","alma_no_standings"]]),
 E('alma_bond_2','alma','After the Rush',29,'cafe',2,2,'alma_bond_1',[{"speaker":"alma","text":"I reheated this tea three times. At this point I'm just cooking leaves."},{"speaker":"Protagonist","text":"You ever get to sit at the window table?"},{"speaker":"alma","text":"When it's empty. Which tends to be when I'm washing the last cup."},{"speaker":"Narrator","text":"She takes the apron off, hangs it by the till, and sits down with the still-warm mug."},{"speaker":"alma","text":"Give me an hour. If anyone asks, I'm part of the furniture."}],[["Take the closing shift while she takes a break","I finished a whole cup without getting up. That might be a café record.","support","alma_rest"],["Ask her what she misses doing for fun","I found my old sketchbook. You've got to see how badly I used to draw hands.","honest","alma_sketch"]]),
 E('alma_bond_3','alma','No Trophy Required',49,'cafe',1,4,'alma_bond_2',[{"speaker":"alma","text":"Someone asked whether the losers can come to the café night. Imagine asking me that."},{"speaker":"Protagonist","text":"Did they take a seat?"},{"speaker":"alma","text":"Not yet. The regulars have claimed both long tables again."},{"speaker":"Narrator","text":"She pushes two smaller tables together and measures the gap to the doorway with her eyes."},{"speaker":"alma","text":"Help me move this one? We can fit everybody if the aisle stays open."}],[["Arrange one long shared table","Look at that. The whole bracket at one table. I'll need a bigger soup pot.","support","alma_long_table"],["Invite the shy competitors to choose seats first","Good call on letting the new players choose first. The regulars didn't even complain.","honest","alma_first_seats"]]),
 E('alma_bond_4','alma','A Quiet Invitation',72,'cafe',2,6,'alma_bond_3',[{"speaker":"alma","text":"Shop's closed. Don't tell the regulars I let you in."},{"speaker":"Protagonist","text":"Want me to help with the last few mugs?"},{"speaker":"alma","text":"Nope. They're done. I set a second cup out for a reason."},{"speaker":"Narrator","text":"Alma switches off the display lights. The lamp above the window table stays on beside two neatly sleeved decks."},{"speaker":"alma","text":"Come on. Pick a side before the tea goes cold."}],[["Offer a quiet game without stakes","One game. No score slips. I might even remember to turn the lights off when we're finished.","support","alma_quiet_game"],["Ask her to pick the game and the music","I'll choose the music. You choose the chair that doesn't wobble. Seems fair.","honest","alma_evening"]]),
 E('nereo_bond_1','nereo','A Different Kind of Weather',20,'park',0,0,null,[{"speaker":"Narrator","text":"The ferry noticeboard reports a half-hour delay. Nereo tapes down the last corner as wind whips across the landing."},{"speaker":"nereo","text":"Twelve people have asked me when it'll arrive. Same answer for all twelve."},{"speaker":"Protagonist","text":"Do you ever get a game in between ferries?"},{"speaker":"Narrator","text":"He digs a worn deck box out from under a stack of boarding slips. There's a spare battery tucked under the strap."},{"speaker":"nereo","text":"Only if you promise not to ask me for a timetable in the middle of it."}],[["Play a few casual hands by the dock","I didn't look at my watch once. All right, that's a lie. Only twice.","support","nereo_dock_game"],["Ask him to teach you his defensive deck","I'll show you the list. But if you beat me with my own trick, we never speak of it.","challenge","nereo_defense"]]),
 E('nereo_bond_2','nereo','The Spare Battery',40,'shop',1,2,'nereo_bond_1',[{"speaker":"nereo","text":"Somebody took the spare batteries from my deck box. Left three coins."},{"speaker":"Protagonist","text":"Did they leave a note?"},{"speaker":"nereo","text":"A thank-you. They could have asked. I've got plenty."},{"speaker":"Narrator","text":"He smooths the folded note against the counter, then slips it inside an empty battery tin."},{"speaker":"nereo","text":"Think the shop would let me leave this by the register? Put a proper label on it."}],[["Help set up a labeled community supply box","The tin's full of spare sleeves now, too. Apparently everyone had something to share.","support","nereo_supply"],["Suggest asking people to return supplies themselves","All the batteries came back. No coins this time. I can live with that.","honest","nereo_trust"]]),
 E('nereo_bond_3','nereo','Against the Current',58,'park',2,4,'nereo_bond_2',[{"speaker":"nereo","text":"The ferry's canceled tonight. Wind's too strong even for the last crossing."},{"speaker":"Protagonist","text":"What about the kids waiting for the match?"},{"speaker":"nereo","text":"Still here. One's been watching that empty landing for an hour."},{"speaker":"Narrator","text":"Under the shelter, two dry benches face each other. A forgotten playmat is rolled up on one end."},{"speaker":"nereo","text":"Think we could make those into tables? I'll get the spare decks."}],[["Organize the sheltered match","They never even asked where the ferry was. Too busy arguing over their opening hands.","support","nereo_shelter"],["Help announce a fair postponement","They all came back the next morning. I kept the notices up till everyone got there.","honest","nereo_safe"]]),
 E('nereo_bond_4','nereo','The Crossing',79,'park',0,6,'nereo_bond_3',[{"speaker":"nereo","text":"No toolkit today. I brought a deck, and that's it."},{"speaker":"Protagonist","text":"You actually got the morning off?"},{"speaker":"nereo","text":"I did. The river can do whatever it likes for two hours."},{"speaker":"Narrator","text":"He settles under the ferry schedule, turns his chair so he can't see the clock, and puts the deck on the table."},{"speaker":"nereo","text":"Deal. If anybody asks about the tide, I don't know a thing."}],[["Challenge him to play the boldest line in his hand","Terrible play. I love it. Can we try it again and see if it works twice?","challenge","nereo_bold"],["Play slowly and enjoy the morning","A whole game without checking the river. If we're lucky, we can fit another in.","support","nereo_still_water"]])
 ];
 // Follow-up dialogue responds to the player's previous decision without changing
 // eligibility or replacing any existing character route.
 const openingByFlag={
  "elio_bond_2": {
    "elio_companion": "I sat down at the crowded table without asking you to come with me. Wrote everything down afterward.",
    "elio_invitation": "I asked a stranger for a match. My notebook's full of red ink from it."
  },
  "elio_bond_3": {
    "elio_good_loss": "That last loss didn't stop me. I signed up for the next event. Look, there's my name.",
    "elio_small_wins": "I found four good plays in my notes, then signed up before I could change my mind."
  },
  "elio_bond_4": {
    "elio_stayed": "You stayed for the whole tournament, so I wanted to show you this new deck box.",
    "elio_kept_calm": "The opening we practiced worked. I finally got a deck box with my own name on it."
  },
  "alma_bond_2": {
    "alma_open_table": "The window table filled up yesterday. I barely had time to finish one cup.",
    "alma_no_standings": "They played until closing without a bracket. I reheated this tea three times."
  },
  "alma_bond_3": {
    "alma_rest": "I took the afternoon off. Came back to a sign-up sheet for another club night.",
    "alma_sketch": "The regulars asked me to draw a poster for the next café night. Might need an extra table, too."
  },
  "alma_bond_4": {
    "alma_long_table": "The long tables are still together from last week. Don't tell anyone I let you in after closing.",
    "alma_first_seats": "The new players took the window seats without asking. I've closed early tonight; don't tell the regulars."
  },
  "nereo_bond_2": {
    "nereo_dock_game": "After our game at the dock, somebody took the spare batteries from my deck box.",
    "nereo_defense": "I finally found an answer to that defensive deck. Then somebody borrowed the batteries from my card case."
  },
  "nereo_bond_3": {
    "nereo_supply": "The supply tin is full, which is good. Tonight's ferry is canceled and the club kids are waiting.",
    "nereo_trust": "All my batteries came back. Just in time for the ferry to be canceled and the kids to get stranded."
  },
  "nereo_bond_4": {
    "nereo_shelter": "They haven't stopped talking about that match under the shelter. I've got the morning off, for once.",
    "nereo_safe": "Everyone returned for the postponed game. And I finally booked a morning off for myself."
  }
};
 for(const e of events)if(openingByFlag[e.id])e.openingByFlag=openingByFlag[e.id];
 return Object.freeze({events,validate:()=>{
  const errors=[],ids=new Set();
  for(const e of events){if(ids.has(e.id))errors.push('Duplicate '+e.id);ids.add(e.id);
   if(e.choices.length!==2||e.lines.length<4||e.end>90||e.start<1)errors.push('Incomplete '+e.id);}
  return errors;
 }});
});
