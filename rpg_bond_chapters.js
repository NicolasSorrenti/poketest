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
   lines:lines.map((text,i)=>({speaker:i%2?'Protagonist':npc,text})),
   choices:answers.map(([label,reply,kind,flag])=>({
    label,reply,kind,flag,delta:{...deltas[kind]}
   }))};
 }
 const events=[
 E('jun_guest_4','jun','A Match Without a Whistle',83,'center',1,6,'jun_guest_3',[
  'No score slips today. No ruling desk. Just two seats, two decks, and a clock I promise not to stare at.',
  'You do know how to take a day off?',
  'Not yet. I am running an experiment. The hypothesis is that I can enjoy a match without being responsible for everybody in it.',
  'Then you will have to trust the other players to solve their own arguments.',
  'I used to confuse being needed with being helpful. Perhaps teaching someone to judge for themselves is the better job.'
 ],[
  ['Play without asking him to referee','That was the first match in years where I actually heard the music in the room.','support','jun_unofficiated'],
  ['Ask him to teach you how to judge fairly','You listened instead of hunting for a shortcut. That makes my work worth doing.','honest','jun_fair_play']
 ]),
 E('teo_guest_4','teo','The Quiet Broadcast',79,'arcade',2,6,'teo_guest_3',[
  'I have a new recording. No intro music. No dramatic zoom. I let the players talk, even when they pause for ages.',
  'You, not talking? The town might declare an emergency.',
  'I know. It turns out those silences are where you hear somebody deciding whether to risk everything.',
  'Did people stay to listen?',
  'Some left. Others stayed for the entire game. I think I finally know which audience I want.'
 ],[
  ['Encourage him to publish the uncut match','I did. Someone wrote that they felt like they were at the table. Best review of my life.','support','teo_real_match'],
  ['Offer to co-commentate without talking over players','Deal. If either of us interrupts a good decision, we owe everyone snacks.','challenge','teo_shared_mic']
 ]),
 E('iris_guest_4','iris','The Route Home',85,'park',0,6,'iris_guest_3',[
  'I took my first actual day off. Everyone got their cards. Nobody called me. The river remained exactly where I left it.',
  'And what did you do with the free afternoon?',
  'I watched my sister duel. I nearly told her how to play her first three turns.',
  'You stopped yourself?',
  'She lost, laughed, and asked for another game. I could have missed that trying to keep everything running.'
 ],[
  ['Celebrate that she was simply there','It is strange, being proud of something you did not arrange. I think I like it.','support','iris_present'],
  ['Suggest she make this a regular tradition','One afternoon every week. It is on the calendar now, and this time I will keep it.','honest','iris_weekly']
 ]),
 E('elio_bond_1','elio','A Seat at the Table',7,'shop',1,0,null,[
  'Every time I walk into the card shop, the tables look full. I know there is space, technically.',
  'You are holding your deck like it might escape.',
  'I keep waiting for someone to tell me I am at the wrong table. Is it embarrassing to ask to join?',
  'Most people are happy to have someone to play against.',
  'That is easy for someone who can make eye contact before shuffling.'
 ],[
  ['Offer to sit down beside him','If you are there, maybe I can concentrate on the cards instead of the room.','support','elio_companion'],
  ['Practice how to ask for a match','Hi, want to play? ...I said it. I actually said it without apologizing.','challenge','elio_invitation']
 ]),
 E('elio_bond_2','elio','The Practice Hand',30,'library',0,2,'elio_bond_1',[
  'I wrote down every mistake in my last three games. The notebook is getting heavy.',
  'How many good decisions did you write down?',
  'Good decisions do not need fixing. At least that is what I told myself.',
  'A good choice can lose to a lucky draw.',
  'So I should record what I was thinking, not just whether I won? That sounds less miserable.'
 ],[
  ['Help him identify a clever losing turn','I think that was the first time I felt proud of a game I lost.','honest','elio_good_loss'],
  ['Challenge him to write three things he did well','Three? You are ruthless. ...All right, I found four.','support','elio_small_wins']
 ]),
 E('elio_bond_3','elio','The Open Challenge',51,'center',1,4,'elio_bond_2',[
  'I signed up. It is only a friendly bracket, but my hands are shaking so much I almost dropped the registration slip.',
  'You can withdraw if you need to.',
  'I know. That is why staying means something.',
  'What would you like me to do?',
  'Stay and watch. Not to cheer every move. Just so there is one familiar face when I look up.'
 ],[
  ['Stay through the match, whatever the result','I lost game one and came back for game two. I did not know I could do that.','support','elio_stayed'],
  ['Remind him of the plan he practiced','I heard myself think instead of all the noise. That was enough.','challenge','elio_kept_calm']
 ]),
 E('elio_bond_4','elio','A Deck of His Own',73,'shop',1,6,'elio_bond_3',[
  'I peeled the old Champion sticker off the deck box. I kept it, just not on the lid anymore.',
  'Did you replace it?',
  'With my own handwriting. It says Elio. Slightly crooked, which seems fair.',
  'You could have kept the old name.',
  'I can still love where the cards came from without pretending I am the person who played them first.'
 ],[
  ['Ask him what his favorite card is now','Not even a rare. Just the one I picked because I wanted it there.','support','elio_own_name'],
  ['Offer to be the first challenger of his new deck','You are on. And I am not going to apologize for trying to beat you.','challenge','elio_first_challenge']
 ]),
 E('alma_bond_1','alma','The Table by the Window',8,'cafe',1,0,null,[
  'That table has been empty all week. People assume it is reserved because it is the best one.',
  'Is it reserved?',
  'Only for someone who needs a quiet place. Sometimes that is a champion. Sometimes it is someone who lost their first match.',
  'You make room for both?',
  'Someone has to remind them that a person does not become more valuable when the score changes.'
 ],[
  ['Help set up a welcoming table for newcomers','The first customer sat down without asking permission. Good. That is exactly what I hoped.','support','alma_open_table'],
  ['Suggest a no-pressure game night','A night where nobody keeps standings. I may put that on the chalkboard.','honest','alma_no_standings']
 ]),
 E('alma_bond_2','alma','After the Rush',29,'cafe',2,2,'alma_bond_1',[
  'I have reheated this tea three times. It has been an ambitious day.',
  'You always know when everyone else needs to stop.',
  'I have learned that I am considerably worse at noticing when I need to.',
  'The cafe can survive without you for an hour.',
  'Yes. I just need to believe it long enough to lock the door.'
 ],[
  ['Take the closing shift while she takes a break','I sat by the window. No receipts, no schedules. Just tea that was actually hot.','support','alma_rest'],
  ['Ask her what she misses doing for fun','I used to draw the strangest little card illustrations. Maybe I still have my pencils.','honest','alma_sketch']
 ]),
 E('alma_bond_3','alma','No Trophy Required',49,'cafe',1,4,'alma_bond_2',[
  'A regular asked whether the cafe will host the winners party. Then another asked if the losers could come too.',
  'What did you tell them?',
  'I said anybody who played has a seat. Apparently that answer was controversial.',
  'Do you want help explaining why?',
  'No. I want you to help arrange the chairs. A room can make the argument better than a speech.'
 ],[
  ['Arrange one long shared table','I watched two rivals trade advice over soup. Better than any trophy display.','support','alma_long_table'],
  ['Invite the shy competitors to choose seats first','Nobody had to announce that they felt out of place. They simply belonged.','honest','alma_first_seats']
 ]),
 E('alma_bond_4','alma','A Quiet Invitation',72,'cafe',2,6,'alma_bond_3',[
  'The sign says Closed. I am still pouring two cups of tea, so I suppose the sign is lying.',
  'Should I come back tomorrow?',
  'No. I wanted one evening where I did not have to be the host, the referee, or the person with the spare napkins.',
  'Then who do you want to be?',
  'Someone who is allowed to sit and enjoy a game with a friend. You brought your deck, yes?'
 ],[
  ['Offer a quiet game without stakes','Finally. A match where I do not have to clean up anybody else’s feelings afterward.','support','alma_quiet_game'],
  ['Ask her to pick the game and the music','You always notice when I am trying to work instead of enjoy myself. Thank you.','honest','alma_evening']
 ]),
 E('nereo_bond_1','nereo','A Different Kind of Weather',20,'park',0,0,null,[
  'The river rose overnight. By noon the ferry will still be running, but everybody will complain about the delay.',
  'You say that like a forecast.',
  'It is. People are more predictable than clouds. Unless there is a tournament.',
  'You ever play when you are off duty?',
  'Only when someone persuades me that a game is not another job with worse paperwork.'
 ],[
  ['Play a few casual hands by the dock','Well, that was unexpectedly relaxing. You did not once ask when the ferry leaves.','support','nereo_dock_game'],
  ['Ask him to teach you his defensive deck','At last, someone who understands that preparing for trouble is not pessimism.','challenge','nereo_defense']
 ]),
 E('nereo_bond_2','nereo','The Spare Battery',40,'shop',1,2,'nereo_bond_1',[
  'Somebody borrowed the spare batteries from my deck box. They left a thank-you note and three coins.',
  'That seems almost fair.',
  'It is not the money. It is that they thought I would say no if they asked.',
  'Maybe they are used to being told no.',
  'Then I would rather change that than spend another morning annoyed at a mystery thief.'
 ],[
  ['Help set up a labeled community supply box','Everyone started adding things to it. Even the shop. I did not see that coming.','support','nereo_supply'],
  ['Suggest asking people to return supplies themselves','Turns out they did. Apparently a direct question is still useful technology.','honest','nereo_trust']
 ]),
 E('nereo_bond_3','nereo','Against the Current',58,'park',2,4,'nereo_bond_2',[
  'The ferry will not run tonight. The wind is too strong. That is not a negotiable decision.',
  'Someone sounded angry at the dock.',
  'A kid promised to bring a deck to the evening match. I get why missing it hurts.',
  'Could we bring the match here instead?',
  'Here, under the shelter, with everybody watching? I would like to see the river try to stop that.'
 ],[
  ['Organize the sheltered match','The kid got the game they wanted. The river kept its temper. Everybody wins.','support','nereo_shelter'],
  ['Help announce a fair postponement','Nobody felt forgotten. That was worth more than forcing a dangerous crossing.','honest','nereo_safe']
 ]),
 E('nereo_bond_4','nereo','The Crossing',79,'park',0,6,'nereo_bond_3',[
  'It is calm today. Almost suspiciously calm. I brought my deck and no tools.',
  'That might be a first.',
  'Do not spread that around. I have a reputation to maintain.',
  'Are you heading somewhere?',
  'Not yet. For once there is no emergency. I thought we could have a game without asking what might go wrong.'
 ],[
  ['Challenge him to play the boldest line in his hand','Terrible idea. We should absolutely do that again sometime.','challenge','nereo_bold'],
  ['Play slowly and enjoy the morning','I used to call this wasting daylight. I think I was wrong.','support','nereo_still_water']
 ])
 ];
 return Object.freeze({events,validate:()=>{
  const errors=[],ids=new Set();
  for(const e of events){if(ids.has(e.id))errors.push('Duplicate '+e.id);ids.add(e.id);
   if(e.choices.length!==2||e.lines.length<4||e.end>90||e.start<1)errors.push('Incomplete '+e.id);}
  return errors;
 }});
});
