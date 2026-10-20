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
 E('jun_guest_4','jun','A Match Without a Whistle',83,'center',1,6,'jun_guest_3',[{"speaker":"Narrator","text":"The community center has closed its registration desk. Jun sets two decks on the only table without a rulebook."},{"speaker":"jun","text":"I even took my judge badge off. Apparently I'm allowed to do that."},{"speaker":"Protagonist","text":"Does the clock need to stay on the table?"},{"speaker":"Narrator","text":"Jun looks at it, then puts it face down beside his keys."},{"speaker":"jun","text":"Good catch. Cut my deck before I change my mind."}],[
  ['Play without asking him to referee','That was the first match in years where I actually heard the music in the room.','support','jun_unofficiated'],
  ['Ask him to teach you how to judge fairly','You listened instead of hunting for a shortcut. That makes my work worth doing.','honest','jun_fair_play']
 ]),
 E('teo_guest_4','teo','The Quiet Broadcast',79,'arcade',2,6,'teo_guest_3',[{"speaker":"Narrator","text":"The arcade speaker crackles, then falls silent. Teo has set out a recording without his usual introduction."},{"speaker":"teo","text":"Tell me if this is boring. I left the whole third turn in."},{"speaker":"Protagonist","text":"The bit where nobody says anything?"},{"speaker":"Narrator","text":"On the screen, one player reaches for a card, stops, and sits back. Teo lets the silence run."},{"speaker":"teo","text":"Yeah. That bit. I nearly cut it three times."}],[
  ['Encourage him to publish the uncut match','I did. Someone wrote that they felt like they were at the table. Best review of my life.','support','teo_real_match'],
  ['Offer to co-commentate without talking over players','Deal. If either of us interrupts a good decision, we owe everyone snacks.','challenge','teo_shared_mic']
 ]),
 E('iris_guest_4','iris','The Route Home',85,'park',0,6,'iris_guest_3',[{"speaker":"Narrator","text":"At the riverside bench, Iris has left her delivery bag at home. In her hand is a tournament ticket creased along every edge."},{"speaker":"iris","text":"My sister lost in the first round. Asked for another match before we'd even left the room."},{"speaker":"Protagonist","text":"Did you give her advice?"},{"speaker":"Narrator","text":"Iris shakes her head and folds the ticket into a small square."},{"speaker":"iris","text":"For once, no. I bought us ice cream. She talked the whole way home."}],[
  ['Celebrate that she was simply there','It is strange, being proud of something you did not arrange. I think I like it.','support','iris_present'],
  ['Suggest she make this a regular tradition','One afternoon every week. It is on the calendar now, and this time I will keep it.','honest','iris_weekly']
 ]),
 E('elio_bond_1','elio','A Seat at the Table',7,'shop',1,0,null,[{"speaker":"Narrator","text":"The shop's last free chair sits across from a noisy four-player table. Elio stops just short of it."},{"speaker":"elio","text":"I think they're playing doubles. Or maybe there's room for one more."},{"speaker":"Protagonist","text":"We could ask."},{"speaker":"Narrator","text":"He checks the deck in his hands, squares its edges, and steps closer."},{"speaker":"elio","text":"Hi. Is anyone using this chair?"}],[
  ['Offer to sit down beside him','If you are there, maybe I can concentrate on the cards instead of the room.','support','elio_companion'],
  ['Practice how to ask for a match','Hi, want to play? ...I said it. I actually said it without apologizing.','challenge','elio_invitation']
 ]),
 E('elio_bond_2','elio','The Practice Hand',30,'library',0,2,'elio_bond_1',[{"speaker":"elio","text":"I filled two pages with mistakes. See? Red ink everywhere."},{"speaker":"Protagonist","text":"You won a prize on turn three. That's not on here."},{"speaker":"elio","text":"That's because I lost the next turn."},{"speaker":"Narrator","text":"He turns the page back, finds the turn, and adds one short line in blue."},{"speaker":"elio","text":"Okay. I did one thing right. Can you help me find another?"}],[
  ['Help him identify a clever losing turn','I think that was the first time I felt proud of a game I lost.','honest','elio_good_loss'],
  ['Challenge him to write three things he did well','Three? You are ruthless. ...All right, I found four.','support','elio_small_wins']
 ]),
 E('elio_bond_3','elio','The Open Challenge',51,'center',1,4,'elio_bond_2',[{"speaker":"elio","text":"I put my name on the bracket. It's there. In actual ink."},{"speaker":"Protagonist","text":"You're holding the registration slip upside down."},{"speaker":"elio","text":"Oh. Right. Good catch."},{"speaker":"Narrator","text":"He turns it around, checks the number, and steps toward the tables as his name is called."},{"speaker":"elio","text":"Could you watch the first game? You don't have to cheer. Just... be there."}],[
  ['Stay through the match, whatever the result','I lost game one and came back for game two. I did not know I could do that.','support','elio_stayed'],
  ['Remind him of the plan he practiced','I heard myself think instead of all the noise. That was enough.','challenge','elio_kept_calm']
 ]),
 E('elio_bond_4','elio','A Deck of His Own',73,'shop',1,6,'elio_bond_3',[{"speaker":"elio","text":"New deck box. Same cards, mostly. Different name on top."},{"speaker":"Protagonist","text":"You wrote your own?"},{"speaker":"elio","text":"A bit crooked, but I wasn't going to redo it."},{"speaker":"Narrator","text":"The old Champion sticker is tucked carefully inside the lid, not thrown away."},{"speaker":"elio","text":"Want the first game against it? I'm not giving you a free win."}],[
  ['Ask him what his favorite card is now','Not even a rare. Just the one I picked because I wanted it there.','support','elio_own_name'],
  ['Offer to be the first challenger of his new deck','You are on. And I am not going to apologize for trying to beat you.','challenge','elio_first_challenge']
 ]),
 E('alma_bond_1','alma','The Table by the Window',8,'cafe',1,0,null,[{"speaker":"Narrator","text":"The table by the café window is empty. Alma wipes an invisible spot from the wood while a new player peers in through the door."},{"speaker":"alma","text":"Everyone thinks that one's reserved. I should probably take the little sign down."},{"speaker":"Protagonist","text":"Would you like me to move it?"},{"speaker":"Narrator","text":"The newcomer steps inside, still holding a deck box against their chest."},{"speaker":"alma","text":"Leave the sign. Turn it around so it says 'Take a seat.'"}],[
  ['Help set up a welcoming table for newcomers','The first customer sat down without asking permission. Good. That is exactly what I hoped.','support','alma_open_table'],
  ['Suggest a no-pressure game night','A night where nobody keeps standings. I may put that on the chalkboard.','honest','alma_no_standings']
 ]),
 E('alma_bond_2','alma','After the Rush',29,'cafe',2,2,'alma_bond_1',[{"speaker":"alma","text":"I've reheated this tea three times. I should charge myself rent for the kettle."},{"speaker":"Protagonist","text":"You could take the next hour off."},{"speaker":"alma","text":"And leave the café to survive without its fearless leader?"},{"speaker":"Narrator","text":"She reaches for the cup, checks the time, and finally sits at the empty window table."},{"speaker":"alma","text":"All right. One hour. You're in charge of the mugs. Just the mugs."}],[
  ['Take the closing shift while she takes a break','I sat by the window. No receipts, no schedules. Just tea that was actually hot.','support','alma_rest'],
  ['Ask her what she misses doing for fun','I used to draw the strangest little card illustrations. Maybe I still have my pencils.','honest','alma_sketch']
 ]),
 E('alma_bond_3','alma','No Trophy Required',49,'cafe',1,4,'alma_bond_2',[{"speaker":"alma","text":"One player asked if the losers are invited to the café night. I couldn't believe the question."},{"speaker":"Protagonist","text":"What did you tell them?"},{"speaker":"alma","text":"They can pay for their own soup like everybody else."},{"speaker":"Narrator","text":"She pulls two smaller tables together, then steps back to judge the space."},{"speaker":"alma","text":"Help with this one? The whole bracket ought to fit."}],[
  ['Arrange one long shared table','I watched two rivals trade advice over soup. Better than any trophy display.','support','alma_long_table'],
  ['Invite the shy competitors to choose seats first','Nobody had to announce that they felt out of place. They simply belonged.','honest','alma_first_seats']
 ]),
 E('alma_bond_4','alma','A Quiet Invitation',72,'cafe',2,6,'alma_bond_3',[{"speaker":"alma","text":"The sign says closed. Don't tell the regulars I let you in."},{"speaker":"Protagonist","text":"I can leave if it's a bad time."},{"speaker":"alma","text":"It's fine. I set a second cup out, didn't I?"},{"speaker":"Narrator","text":"Alma pulls out a chair, sets her apron behind the counter, and opens a deck box."},{"speaker":"alma","text":"Pick a side. No customers, no complaints, and you're not allowed to order anything."}],[
  ['Offer a quiet game without stakes','Finally. A match where I do not have to clean up anybody else’s feelings afterward.','support','alma_quiet_game'],
  ['Ask her to pick the game and the music','You always notice when I am trying to work instead of enjoy myself. Thank you.','honest','alma_evening']
 ]),
 E('nereo_bond_1','nereo','A Different Kind of Weather',20,'park',0,0,null,[{"speaker":"Narrator","text":"The ferry noticeboard lists a thirty-minute delay. Nereo has taped the corners down against the wind."},{"speaker":"nereo","text":"I'll get a dozen questions about that before lunch. The sea's not taking complaints."},{"speaker":"Protagonist","text":"Do you ever get to play when you're off duty?"},{"speaker":"Narrator","text":"Nereo digs a worn deck box out from beneath a stack of boarding slips."},{"speaker":"nereo","text":"Only when somebody convinces me not to call it overtime."}],[
  ['Play a few casual hands by the dock','Well, that was unexpectedly relaxing. You did not once ask when the ferry leaves.','support','nereo_dock_game'],
  ['Ask him to teach you his defensive deck','At last, someone who understands that preparing for trouble is not pessimism.','challenge','nereo_defense']
 ]),
 E('nereo_bond_2','nereo','The Spare Battery',40,'shop',1,2,'nereo_bond_1',[{"speaker":"nereo","text":"Someone borrowed the spare batteries from my deck box. Left three coins and a thank-you note."},{"speaker":"Protagonist","text":"Better than leaving nothing, I suppose."},{"speaker":"nereo","text":"They could've asked. I always keep more than I need."},{"speaker":"Narrator","text":"He turns the handwritten note over once, folds it and puts it in his pocket."},{"speaker":"nereo","text":"Could we put a labeled supply box by the counter? Maybe they'll ask next time."}],[
  ['Help set up a labeled community supply box','Everyone started adding things to it. Even the shop. I did not see that coming.','support','nereo_supply'],
  ['Suggest asking people to return supplies themselves','Turns out they did. Apparently a direct question is still useful technology.','honest','nereo_trust']
 ]),
 E('nereo_bond_3','nereo','Against the Current',58,'park',2,4,'nereo_bond_2',[{"speaker":"nereo","text":"Ferry's not running tonight. I put the notice up before the wind took it out of my hands."},{"speaker":"Protagonist","text":"The kids were expecting their match across the river."},{"speaker":"nereo","text":"I know. One's been staring at the empty landing for an hour."},{"speaker":"Narrator","text":"The covered seating area is dry; two benches are already arranged across from one another."},{"speaker":"nereo","text":"Think we can get a game going under there? I'll fetch the spare playmat."}],[
  ['Organize the sheltered match','The kid got the game they wanted. The river kept its temper. Everybody wins.','support','nereo_shelter'],
  ['Help announce a fair postponement','Nobody felt forgotten. That was worth more than forcing a dangerous crossing.','honest','nereo_safe']
 ]),
 E('nereo_bond_4','nereo','The Crossing',79,'park',0,6,'nereo_bond_3',[{"speaker":"nereo","text":"Look. Empty tool bag. I brought a deck instead."},{"speaker":"Protagonist","text":"Should I be worried?"},{"speaker":"nereo","text":"Probably. I might do something wildly irresponsible, like take a morning off."},{"speaker":"Narrator","text":"He sits beneath the ferry schedule without glancing up at it."},{"speaker":"nereo","text":"Deal. If anyone asks about the tide, I'm blaming you."}],[
  ['Challenge him to play the boldest line in his hand','Terrible idea. We should absolutely do that again sometime.','challenge','nereo_bold'],
  ['Play slowly and enjoy the morning','I used to call this wasting daylight. I think I was wrong.','support','nereo_still_water']
 ])
 ];
 // Follow-up dialogue responds to the player's previous decision without changing
 // eligibility or replacing any existing character route.
 const openingByFlag={
  elio_bond_2:{
   elio_companion:'I saved you a seat yesterday. Then I realized I was allowed to sit there even if you were late.',
   elio_invitation:'I asked a stranger to play. My voice shook, but they said yes. I think that counts as progress.'
  },
  elio_bond_3:{
   elio_good_loss:'I looked back at that losing turn. I still think it was the right play. So I finally registered for the bracket.',
   elio_small_wins:'My notebook has four good decisions on the first page now. I signed up for the bracket before I could talk myself out of it.'
  },
  elio_bond_4:{
   elio_stayed:'You watched the whole match even after I fell behind. I did not need you to fix anything. That was new.',
   elio_kept_calm:'I used the opening we practiced while everybody was watching. For once my hands remembered what my head knew.'
  },
  alma_bond_2:{
   alma_open_table:'The window table filled with new faces today. I nearly forgot to eat because I was pleased with myself.',
   alma_no_standings:'The first no-standings night was a success. Then I spent three hours washing cups.'
  },
  alma_bond_3:{
   alma_rest:'I took another hour off last week. Nothing caught fire. That will sound less remarkable someday.',
   alma_sketch:'I found my old pencils. The napkins are now full of Pokémon drawings that customers keep trying to buy.'
  },
  alma_bond_4:{
   alma_long_table:'Those long tables are still together. Nobody has asked to separate winners from losers since.',
   alma_first_seats:'The shy players keep choosing their own seats now. I hardly recognize the place, in the best way.'
  },
  nereo_bond_2:{
   nereo_dock_game:'I kept my deck in my jacket last week. It was nice having something to reach for that was not a wrench.',
   nereo_defense:'I tried that defensive line you suggested. It worked beautifully right up until my opponent played a card I forgot existed.'
  },
  nereo_bond_3:{
   nereo_supply:'The community supply box is full already. Nobody asked me to organize it, which might be the nicest part.',
   nereo_trust:'The batteries came back with a note. No coins this time. A direct conversation really is an underrated invention.'
  },
  nereo_bond_4:{
   nereo_shelter:'That match under the shelter is still the only tournament I have seen where the weather got zero complaints.',
   nereo_safe:'The postponed players showed up smiling the next morning. Nobody was left behind or sent into bad weather.'
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
