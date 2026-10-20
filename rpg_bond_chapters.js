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
  ['Play without asking him to referee','Good match. I nearly reached for the score slip twice. Didn\'t need it.','support','jun_unofficiated'],
  ['Ask him to teach you how to judge fairly','All right, deal again. Then I\'ll show you why I ruled that other turn the way I did.','honest','jun_fair_play']
 ]),
 E('teo_guest_4','teo','The Quiet Broadcast',79,'arcade',2,6,'teo_guest_3',[{"speaker":"Narrator","text":"The arcade speaker crackles, then falls silent. Teo has set out a recording without his usual introduction."},{"speaker":"teo","text":"Tell me if this is boring. I left the whole third turn in."},{"speaker":"Protagonist","text":"The bit where nobody says anything?"},{"speaker":"Narrator","text":"On the screen, one player reaches for a card, stops, and sits back. Teo lets the silence run."},{"speaker":"teo","text":"Yeah. That bit. I nearly cut it three times."}],[
  ['Encourage him to publish the uncut match','I posted it. Someone asked where to find the full match. Nobody\'s ever asked me that before.','support','teo_real_match'],
  ['Offer to co-commentate without talking over players','Deal. But if either of us talks over a good play, we owe the players snacks.','challenge','teo_shared_mic']
 ]),
 E('iris_guest_4','iris','The Route Home',85,'park',0,6,'iris_guest_3',[{"speaker":"Narrator","text":"At the riverside bench, Iris has left her delivery bag at home. In her hand is a tournament ticket creased along every edge."},{"speaker":"iris","text":"My sister lost in the first round. Asked for another match before we'd even left the room."},{"speaker":"Protagonist","text":"Did you give her advice?"},{"speaker":"Narrator","text":"Iris shakes her head and folds the ticket into a small square."},{"speaker":"iris","text":"For once, no. I bought us ice cream. She talked the whole way home."}],[
  ['Celebrate that she was simply there','She played three more games before we went home. I spent the afternoon passing the sleeves.','support','iris_present'],
  ['Suggest she make this a regular tradition','Next Saturday. It\'s on the calendar. And no, I won\'t volunteer to run registration.','honest','iris_weekly']
 ]),
 E('elio_bond_1','elio','A Seat at the Table',7,'shop',1,0,null,[{"speaker":"Narrator","text":"The shop's last free chair sits across from a noisy four-player table. Elio stops just short of it."},{"speaker":"elio","text":"I think they're playing doubles. Or maybe there's room for one more."},{"speaker":"Protagonist","text":"We could ask."},{"speaker":"Narrator","text":"He checks the deck in his hands, squares its edges, and steps closer."},{"speaker":"elio","text":"Hi. Is anyone using this chair?"}],[
  ['Offer to sit down beside him','Please stay for the first game. I think I can manage the rest if you\'re here.','support','elio_companion'],
  ['Practice how to ask for a match','Hi, want a game? ...That sounded normal, right? Tell me it sounded normal.','challenge','elio_invitation']
 ]),
 E('elio_bond_2','elio','The Practice Hand',30,'library',0,2,'elio_bond_1',[{"speaker":"elio","text":"I filled two pages with mistakes. See? Red ink everywhere."},{"speaker":"Protagonist","text":"You won a prize on turn three. That's not on here."},{"speaker":"elio","text":"That's because I lost the next turn."},{"speaker":"Narrator","text":"He turns the page back, finds the turn, and adds one short line in blue."},{"speaker":"elio","text":"Okay. I did one thing right. Can you help me find another?"}],[
  ['Help him identify a clever losing turn','I lost the match. That switch still bought me another turn, though. I\'m writing it down.','honest','elio_good_loss'],
  ['Challenge him to write three things he did well','I found four. Four good moves. Why was that harder than listing the mistakes?','support','elio_small_wins']
 ]),
 E('elio_bond_3','elio','The Open Challenge',51,'center',1,4,'elio_bond_2',[{"speaker":"elio","text":"I put my name on the bracket. It's there. In actual ink."},{"speaker":"Protagonist","text":"You're holding the registration slip upside down."},{"speaker":"elio","text":"Oh. Right. Good catch."},{"speaker":"Narrator","text":"He turns it around, checks the number, and steps toward the tables as his name is called."},{"speaker":"elio","text":"Could you watch the first game? You don't have to cheer. Just... be there."}],[
  ['Stay through the match, whatever the result','You stayed? Thanks. I actually asked for game two instead of going home.','support','elio_stayed'],
  ['Remind him of the plan he practiced','I heard you say \'one turn at a time.\' That\'s what I did. It helped.','challenge','elio_kept_calm']
 ]),
 E('elio_bond_4','elio','A Deck of His Own',73,'shop',1,6,'elio_bond_3',[{"speaker":"elio","text":"New deck box. Same cards, mostly. Different name on top."},{"speaker":"Protagonist","text":"You wrote your own?"},{"speaker":"elio","text":"A bit crooked, but I wasn't going to redo it."},{"speaker":"Narrator","text":"The old Champion sticker is tucked carefully inside the lid, not thrown away."},{"speaker":"elio","text":"Want the first game against it? I'm not giving you a free win."}],[
  ['Ask him what his favorite card is now','That old common? Yes. I picked it myself. It\'s staying in the deck.','support','elio_own_name'],
  ['Offer to be the first challenger of his new deck','You\'re on. And I\'m not going to apologize if I beat you.','challenge','elio_first_challenge']
 ]),
 E('alma_bond_1','alma','The Table by the Window',8,'cafe',1,0,null,[{"speaker":"Narrator","text":"The table by the café window is empty. Alma wipes an invisible spot from the wood while a new player peers in through the door."},{"speaker":"alma","text":"Everyone thinks that one's reserved. I should probably take the little sign down."},{"speaker":"Protagonist","text":"Would you like me to move it?"},{"speaker":"Narrator","text":"The newcomer steps inside, still holding a deck box against their chest."},{"speaker":"alma","text":"Leave the sign. Turn it around so it says 'Take a seat.'"}],[
  ['Help set up a welcoming table for newcomers','First visitor took the window seat without asking. I finally got the sign right.','support','alma_open_table'],
  ['Suggest a no-pressure game night','No standings, just cards and something to eat. I\'ll put it on the board.','honest','alma_no_standings']
 ]),
 E('alma_bond_2','alma','After the Rush',29,'cafe',2,2,'alma_bond_1',[{"speaker":"alma","text":"I've reheated this tea three times. I should charge myself rent for the kettle."},{"speaker":"Protagonist","text":"You could take the next hour off."},{"speaker":"alma","text":"And leave the café to survive without its fearless leader?"},{"speaker":"Narrator","text":"She reaches for the cup, checks the time, and finally sits at the empty window table."},{"speaker":"alma","text":"All right. One hour. You're in charge of the mugs. Just the mugs."}],[
  ['Take the closing shift while she takes a break','I sat there for an hour. My tea was still hot when I finished it.','support','alma_rest'],
  ['Ask her what she misses doing for fun','I found my old pencils. Some of the sketches are worse than I remember. Want to see?','honest','alma_sketch']
 ]),
 E('alma_bond_3','alma','No Trophy Required',49,'cafe',1,4,'alma_bond_2',[{"speaker":"alma","text":"One player asked if the losers are invited to the café night. I couldn't believe the question."},{"speaker":"Protagonist","text":"What did you tell them?"},{"speaker":"alma","text":"They can pay for their own soup like everybody else."},{"speaker":"Narrator","text":"She pulls two smaller tables together, then steps back to judge the space."},{"speaker":"alma","text":"Help with this one? The whole bracket ought to fit."}],[
  ['Arrange one long shared table','They\'ve all ended up at the same table. Now I need twice as many bowls.','support','alma_long_table'],
  ['Invite the shy competitors to choose seats first','Good idea. The first-timers picked seats before the regulars arrived.','honest','alma_first_seats']
 ]),
 E('alma_bond_4','alma','A Quiet Invitation',72,'cafe',2,6,'alma_bond_3',[{"speaker":"alma","text":"The sign says closed. Don't tell the regulars I let you in."},{"speaker":"Protagonist","text":"I can leave if it's a bad time."},{"speaker":"alma","text":"It's fine. I set a second cup out, didn't I?"},{"speaker":"Narrator","text":"Alma pulls out a chair, sets her apron behind the counter, and opens a deck box."},{"speaker":"alma","text":"Pick a side. No customers, no complaints, and you're not allowed to order anything."}],[
  ['Offer a quiet game without stakes','One game. No score sheets. I might even forget to turn the lights off.','support','alma_quiet_game'],
  ['Ask her to pick the game and the music','I\'ll choose the music. You choose which side of the table doesn\'t wobble.','honest','alma_evening']
 ]),
 E('nereo_bond_1','nereo','A Different Kind of Weather',20,'park',0,0,null,[{"speaker":"Narrator","text":"The ferry noticeboard lists a thirty-minute delay. Nereo has taped the corners down against the wind."},{"speaker":"nereo","text":"I'll get a dozen questions about that before lunch. The sea's not taking complaints."},{"speaker":"Protagonist","text":"Do you ever get to play when you're off duty?"},{"speaker":"Narrator","text":"Nereo digs a worn deck box out from beneath a stack of boarding slips."},{"speaker":"nereo","text":"Only when somebody convinces me not to call it overtime."}],[
  ['Play a few casual hands by the dock','You didn\'t ask when the next ferry leaves once. That\'s a record.','support','nereo_dock_game'],
  ['Ask him to teach you his defensive deck','All right, then. Cut the deck. I promise not to give you a safety briefing.','challenge','nereo_defense']
 ]),
 E('nereo_bond_2','nereo','The Spare Battery',40,'shop',1,2,'nereo_bond_1',[{"speaker":"nereo","text":"Someone borrowed the spare batteries from my deck box. Left three coins and a thank-you note."},{"speaker":"Protagonist","text":"Better than leaving nothing, I suppose."},{"speaker":"nereo","text":"They could've asked. I always keep more than I need."},{"speaker":"Narrator","text":"He turns the handwritten note over once, folds it and puts it in his pocket."},{"speaker":"nereo","text":"Could we put a labeled supply box by the counter? Maybe they'll ask next time."}],[
  ['Help set up a labeled community supply box','Even the shop\'s started putting spare sleeves in the supply box. Who knew?','support','nereo_supply'],
  ['Suggest asking people to return supplies themselves','They brought it all back. No extra coins, just a note. Works for me.','honest','nereo_trust']
 ]),
 E('nereo_bond_3','nereo','Against the Current',58,'park',2,4,'nereo_bond_2',[{"speaker":"nereo","text":"Ferry's not running tonight. I put the notice up before the wind took it out of my hands."},{"speaker":"Protagonist","text":"The kids were expecting their match across the river."},{"speaker":"nereo","text":"I know. One's been staring at the empty landing for an hour."},{"speaker":"Narrator","text":"The covered seating area is dry; two benches are already arranged across from one another."},{"speaker":"nereo","text":"Think we can get a game going under there? I'll fetch the spare playmat."}],[
  ['Organize the sheltered match','Look at those kids. They barely noticed the ferry never arrived.','support','nereo_shelter'],
  ['Help announce a fair postponement','They showed up the next morning for the postponed round. Thanks for helping with the notices.','honest','nereo_safe']
 ]),
 E('nereo_bond_4','nereo','The Crossing',79,'park',0,6,'nereo_bond_3',[{"speaker":"nereo","text":"Look. Empty tool bag. I brought a deck instead."},{"speaker":"Protagonist","text":"Should I be worried?"},{"speaker":"nereo","text":"Probably. I might do something wildly irresponsible, like take a morning off."},{"speaker":"Narrator","text":"He sits beneath the ferry schedule without glancing up at it."},{"speaker":"nereo","text":"Deal. If anyone asks about the tide, I'm blaming you."}],[
  ['Challenge him to play the boldest line in his hand','Terrible idea. Play it again. I want to see if it works twice.','challenge','nereo_bold'],
  ['Play slowly and enjoy the morning','It\'s nice not checking the river every five minutes. Deal another hand?','support','nereo_still_water']
 ])
 ];
 // Follow-up dialogue responds to the player's previous decision without changing
 // eligibility or replacing any existing character route.
 const openingByFlag={
  elio_bond_2:{
   elio_companion:'I sat down without asking you to come in with me this time. Took a while, but I did.',
   elio_invitation:'I asked a stranger for a match yesterday. They said yes before I could change my mind.'
  },
  elio_bond_3:{
   elio_good_loss:'I lost again, but I kept the turn we reviewed. That\'s why I signed up.',
   elio_small_wins:'My notebook has four good plays on the first page. I signed up before I could talk myself out of it.'
  },
  elio_bond_4:{
   elio_stayed:'You watched the whole match, even when I was behind. I noticed.',
   elio_kept_calm:'I used the opening we tested. My hands almost stopped shaking after turn two.'
  },
  alma_bond_2:{
   alma_open_table:'The window table filled up yesterday. I\'m going to need a second one soon.',
   alma_no_standings:'They played all evening without a bracket. Took me hours to wash the cups afterward.'
  },
  alma_bond_3:{
   alma_rest:'I took another afternoon off. Nobody burned the place down. Remarkable, really.',
   alma_sketch:'Found my pencils. The regulars keep asking which Pokémon I\'m drawing next.'
  },
  alma_bond_4:{
   alma_long_table:'The long tables are still together. Nobody\'s bothered separating them since.',
   alma_first_seats:'New players started picking their own seats. I don\'t have to rescue anyone from the door.'
  },
  nereo_bond_2:{
   nereo_dock_game:'I kept the deck in my jacket last week instead of my toolbox. Strange feeling.',
   nereo_defense:'Your defensive line worked until I forgot that Trainer existed. Back to the drawing board.'
  },
  nereo_bond_3:{
   nereo_supply:'The supply box is full already. Half the stuff came from people I didn\'t even ask.',
   nereo_trust:'The batteries came back. With a note, no coins. That\'s more like it.'
  },
  nereo_bond_4:{
   nereo_shelter:'They\'re still talking about that match under the shelter. Not a word about the ferry.',
   nereo_safe:'The postponed players all came back the next morning. The weather was better; so were their moods.'
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
