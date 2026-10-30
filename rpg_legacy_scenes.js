'use strict';
// Editorially-authored legacy social-link scenes. Short description beats are
// deliberate: a character's physical action belongs to Narrator, never in speech.
// Keep the route order, IDs, windows, flags, outcomes and choice kinds in rpg_story.js.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgLegacyScenes=api;
})(typeof window!=='undefined'?window:null,function(){
 const S={
 hana:[
  {
   lines:[
    ['Narrator','Before opening, stacks of deck boxes take up every free inch of the counter. Hana has a pencil tucked behind one ear and a roll of tape stuck to her sleeve.'],
    ['hana','Oh! You’re early. Good. Please tell me you know how to fold a cardboard stand.'],
    ['Protagonist','How many do you need?'],
    ['hana','Six. And a miracle. I told the junior players the tables would be ready before they got here.'],
    ['Narrator','Her phone buzzes. Another volunteer is running late. Hana turns the screen face down, still smiling.'],
    ['hana','We can start with the easy one. Unless you know a miracle I can borrow?']
   ],
   choices:[
    ['Help with the tables','You do that side; I’ll take this one. Oh, this might actually work!'],
    ['Ask why she never calls for help','I did. Then I said it was fine when everyone got busy. I know. Bad habit.'],
    ['Make her laugh before the doors open','If you make me drop this tape, you’re putting every sign back up yourself.']
   ]
  },
  {
   lines:[
    ['Narrator','At the café, two cups are waiting at a corner table. Hana has written a deck list on the back of a receipt, then crossed out half of it.'],
    ['hana','I ordered for you. Unless you hate lemon tea. Please don’t hate lemon tea.'],
    ['Protagonist','What happened to the list?'],
    ['hana','I wanted to enter the doubles event. Then I remembered who usually covers the shop that night.'],
    ['Narrator','She turns the receipt over. A team name is written on the other side, decorated with tiny stars.'],
    ['hana','It’s a silly name anyway. Go on, laugh.']
   ],
   choices:[
    ['Offer to practice as a team','You’d do that? All right. But I’m keeping the ridiculous team name.'],
    ['Ask who could cover the shop','Iris might know someone. I suppose I could actually ask instead of guessing.'],
    ['Call it a date with unusually good deckbuilding','A date? With this handwriting? You have impressively low standards.']
   ]
  },
  {
   lines:[
    ['Narrator','The last customer leaves. A chair remains pulled out across from the counter, next to a cold cup of tea.'],
    ['hana','You can go. I won’t be offended.'],
    ['Protagonist','I wasn’t planning to.'],
    ['hana','Well, there’s no one left to impress with my flawless customer service.'],
    ['Narrator','She switches off the display lights but leaves the lamp above the playing table on.'],
    ['hana','I’ve got one game in me. Maybe two, if you’re terrible at it.']
   ],
   choices:[
    ['Stay for a late game','Only one rule: no sweeping the floor until after we finish.'],
    ['Ask whether she ever takes the night off','Sometimes. Usually somebody has to drag me outside first.'],
    ['Tell her you came back to see her','...Well. You picked a pretty good night for that.']
   ]
  },
  {
   lines:[
    ['Narrator','The park is full of people packing away tournament banners. Hana has saved two paper cups from the refreshments table.'],
    ['hana','They gave us the leftovers. I think that makes this an official afterparty.'],
    ['Protagonist','The cup still says “Good luck.”'],
    ['hana','They ordered too many. I told them we could use them next season.'],
    ['Narrator','She takes a sip, then studies the second cup for a moment before handing it over.'],
    ['hana','Will you still come by when the brackets are gone?']
   ],
   choices:[
    ['Ask her out after the season','Yes. Somewhere I don’t have to carry a cash box.'],
    ['Promise to keep visiting as a friend','Good. I’m not letting my favorite practice partner disappear.'],
    ['Encourage her to enter the next doubles event','Then I’m signing up first. Someone else can worry about the tables.']
   ]
  }
 ],
 reina:[
  {
   lines:[
    ['Narrator','The community center is almost empty. Under the flickering lights, Reina deals the same opening hand again.'],
    ['reina','If you’re going to hover, pull up a chair.'],
    ['Protagonist','How many times have you tested that hand?'],
    ['reina','Enough to know the third turn’s bad. Not enough to fix it.'],
    ['Narrator','She slides a single card across the table and looks up.'],
    ['reina','Your move. Make it ugly.']
   ],
   choices:[
    ['Practice openings with her','Good. And don’t apologize when you find the weak spot.'],
    ['Ask which turn keeps bothering her','The one I thought was safe. Here, look at this draw.'],
    ['Tell her you stayed because of her','That line better be as good as your deck. Sit down.']
   ]
  },
  {
   lines:[
    ['Narrator','A few players crowd around the results sheet. Someone makes a joke about Reina getting lucky. Her pen stops halfway across the page.'],
    ['reina','Funny. They weren’t calling it luck when I lost last week.'],
    ['Protagonist','You going to say something?'],
    ['reina','No.'],
    ['Narrator','She folds the list into a neat square and drops it in her deck box.'],
    ['reina','I’ve got a better answer. Want to help me test it?']
   ],
   choices:[
    ['Test her revised deck','Fine. First to three wins. No excuses either way.'],
    ['Ask what she learned from the loss','I held the wrong card for two turns. That won’t happen twice.'],
    ['Suggest getting away from the crowd','After the match. And I’m choosing where we eat.']
   ]
  },
  {
   lines:[
    ['Narrator','Reina has reserved two tables at the center. The second holds a neatly sleeved copy of your usual deck.'],
    ['reina','You’ve been giving away your first turn lately.'],
    ['Protagonist','You built my deck?'],
    ['reina','Close enough. I wanted to see whether I could beat you using your own tricks.'],
    ['Narrator','One sleeve has a tiny red sticker on it. She notices you looking and turns the card over.'],
    ['reina','Don’t touch that. It’s the card you always forget to play.']
   ],
   choices:[
    ['Take the practice match seriously','There you go. That’s the turn I was waiting for.'],
    ['Ask why she studied your deck so closely','Because you’re worth preparing for. Don’t make me repeat myself.'],
    ['Invite her out without decks for once','...Dinner. One evening. But I’m still allowed to complain about the menu.']
   ]
  },
  {
   lines:[
    ['Narrator','Someone has left chalk marks from the tournament bracket on the park pavement. Reina rubs one out with the toe of her shoe.'],
    ['reina','I hate the day after a tournament. Everything suddenly goes quiet.'],
    ['Protagonist','You could take a break.'],
    ['reina','You say that like you’ve never seen me on a day off.'],
    ['Narrator','She nudges a pebble down the path, then falls into step beside you.'],
    ['reina','Well? Are we doing this again next season? You and me.']
   ],
   choices:[
    ['Ask her to be more than a rival','I thought you’d never say it. Don’t get smug.'],
    ['Promise plenty of rematches as friends','You’re going to regret that promise by next Tuesday.'],
    ['Let her choose the next challenge','All right. I’m picking something neither of us is good at.']
   ]
  }
 ],
 shiori:[
  {
   lines:[
    ['Narrator','At the café, Shiori watches a nearby game while her own deck remains untouched in its case.'],
    ['shiori','He had the knockout in hand three turns ago.'],
    ['Protagonist','Why didn’t he take it?'],
    ['shiori','Ask him afterward. I suspect he’ll remember the answer better than I would.'],
    ['Narrator','The players gather their cards. Shiori’s fingers rest on the clasp of her deck case without opening it.'],
    ['shiori','If you’d like a game, I could be persuaded.']
   ],
   choices:[
    ['Offer to play a quiet match','One game, then. You’ll have to forgive me if I’m rusty.'],
    ['Ask what she spotted in the last game','Watch his third turn. See the Energy he left unattached?'],
    ['Say you came to sit with her','Then perhaps we can keep the cards in their boxes a little longer.']
   ]
  },
  {
   lines:[
    ['Narrator','In the library, a recording of an old tournament pauses on a crowded board. The same minute has been replayed enough times to wear out the timestamp.'],
    ['shiori','I used to know exactly what the next move should be.'],
    ['Protagonist','And now?'],
    ['shiori','Now I know why she hesitated.'],
    ['Narrator','The pause icon glows. Shiori closes the laptop before the winning play.'],
    ['shiori','Could we look at something else? Anything else.']
   ],
   choices:[
    ['Find a newer match to watch together','Yes. Something where neither of us knows the ending.'],
    ['Ask about the player in the recording','Someone I knew quite well. I didn’t listen to her much back then.'],
    ['Suggest making a better memory this afternoon','There’s a little bakery near the water. I haven’t been in years.']
   ]
  },
  {
   lines:[
    ['Narrator','The community center doors are propped open. Shiori stops a few steps short as a cheer erupts inside.'],
    ['shiori','They changed the tables around.'],
    ['Protagonist','The games seem the same.'],
    ['shiori','No. The far wall used to have a clock.'],
    ['Narrator','She looks toward the wall, now covered with a children’s tournament poster.'],
    ['shiori','Come inside with me? Just until the first round finishes.']
   ],
   choices:[
    ['Go in beside her','Thank you. We can start by finding an empty chair.'],
    ['Ask whether she wants to leave instead','Not yet. Ask me again after the first game.'],
    ['Tell her you saved a seat for her','You remembered which side of the table I prefer. How unfairly thoughtful.']
   ]
  },
  {
   lines:[
    ['Narrator','Shiori has brought a small cake to the café. She sets down two forks before remembering to remove the paper wrapping.'],
    ['shiori','I asked for the smallest one. Apparently this is their idea of restraint.'],
    ['Protagonist','What are we celebrating?'],
    ['shiori','No occasion. That was rather the point.'],
    ['Narrator','She cuts an uneven slice, looks at it, and lets out a quiet laugh.'],
    ['shiori','Would you come with me next time? Wherever “next time” turns out to be.']
   ],
   choices:[
    ['Tell her you would like to date','I hoped you might say that. Here, take the larger slice.'],
    ['Ask to keep meeting as friends','Of course. I still owe you a rematch—and the rest of this cake.'],
    ['Encourage her to make the next plan','There’s an exhibition across town. Perhaps we could start there.']
   ]
  }
 ],
 yuna:[
  {
   lines:[
    ['Narrator','The arcade table is littered with dice, spare sleeves, and a deck list covered in question marks. Yuna holds up a card like a magician.'],
    ['yuna','Behold. The worst idea anyone has ever had with a perfectly legal deck.'],
    ['Protagonist','Does it actually work?'],
    ['yuna','I got it once yesterday. The other ninety-nine attempts are classified.'],
    ['Narrator','She drops the card into a sleeve backward, notices, and keeps her expression completely straight.'],
    ['yuna','Want to witness attempt one hundred? I’ll let you name the disaster.']
   ],
   choices:[
    ['Help test the combo','Excellent. I’m naming the deck after your inevitable defeat.'],
    ['Ask to see the math','Ah. You noticed the part where I stopped doing the math.'],
    ['Say the show is already entertaining','Flattery will not improve your odds. Mine, on the other hand…']
   ]
  },
  {
   lines:[
    ['Narrator','The arcade crowd is still laughing. Yuna takes a bow, then quietly gathers the cards nobody stayed to see.'],
    ['yuna','I had the winning play, you know.'],
    ['Protagonist','Why didn’t you make it?'],
    ['yuna','Because a misplay got more laughs. Pretty stupid, huh?'],
    ['Narrator','She pushes a chair out with her foot. The overhead game music keeps cycling through the same cheerful tune.'],
    ['yuna','Sit down. I’ll show you the version that actually wins.']
   ],
   choices:[
    ['Stay to see the serious version','Fair warning: the good version has fewer explosions.'],
    ['Ask who she wants to impress','Myself, ideally. I’m still working on making that answer stick.'],
    ['Tease her about saving her best tricks for you','Well, you’re the only audience member who stayed for the cleanup.']
   ]
  },
  {
   lines:[
    ['Narrator','At the shop, Yuna’s new deck sits in plain sleeves. Not a single one has a doodle or a joke written on it.'],
    ['yuna','Nobody laughed when I showed them this.'],
    ['Protagonist','That’s what you wanted, right?'],
    ['yuna','Mostly. I forgot how loud this place is when I’m not making all the noise.'],
    ['Narrator','She turns the top card sideways and gives it a small, ridiculous salute.'],
    ['yuna','You first. I’ve got an actual plan this time. Try not to faint.']
   ],
   choices:[
    ['Play the new deck seriously','Okay, yes, that’s the matchup I needed. Again!'],
    ['Ask about the nights she spent building it','Three nights, two cold pizzas, and one very angry calculator.'],
    ['Promise to watch the whole match','Then I’d better make the boring turns worth watching too.']
   ]
  },
  {
   lines:[
    ['Narrator','The arcade shutters are halfway down. Yuna turns off the last cabinet, leaving one blinking high-score screen.'],
    ['yuna','Look at that. We outlasted the electricity bill.'],
    ['Protagonist','You heading home?'],
    ['yuna','Eventually. There’s something I want to ask before the music comes back tomorrow.'],
    ['Narrator','She opens her mouth, then closes it. For once, the silence lasts longer than the joke.'],
    ['yuna','Would you still come by if I ran out of stupid ideas?']
   ],
   choices:[
    ['Ask her on a date','I have one very sensible idea for Saturday. Don’t tell anyone.'],
    ['Promise to keep inventing trouble as friends','Perfect. Our first mission is finding somewhere with decent snacks.'],
    ['Ask what she would do without an audience','Probably finish a game without showing off. You could help me try.']
   ]
  }
 ]
 };
 Object.assign(S,{"akari":[{"lines":[["Narrator","Akari has covered a library table with neatly written columns. One row is circled three times; your name is next to it."],["akari","That last draw should have put you behind. It didn't."],["Protagonist","Does that mean I played well?"],["akari","It means my model is missing something. I find that personally offensive."],["Narrator","She slides a pencil toward you, eraser first."],["akari","Explain your third turn. Slowly, please."]],"choices":[["Walk her through your decisions","Ah. I treated the switch as forced. That changes several things."],["Challenge her sample size","I knew you would say that. Unfortunately, you are right."],["Ask whether she studies everyone this closely","No. Other people usually become predictable before the second page."]]},{"lines":[["Narrator","At the café, three schedules are lined up beside Akari's untouched drink. Your arrival earns a long look at the clock."],["akari","You're eleven minutes earlier than the estimate."],["Protagonist","Should I come back?"],["akari","No. I already moved the other appointments."],["Narrator","She folds the schedules into a pocket, all at once, and finally takes a sip."],["akari","There. Now we have an entirely unallocated afternoon. ...Any suggestions?"]],"choices":[["Take a walk without planning the route","I reserve the right to complain if we get lost. But yes."],["Ask why she planned three versions of today","Because I wanted you to enjoy it. I may have overcomplicated that."],["Suggest an improvised date","I'm not sure what the experimental conditions would be. ...All right."]]},{"lines":[["Narrator","The results board has been updated. Akari's prediction sheet is folded small enough to fit beneath a card sleeve."],["akari","The winner wasn't in my top four."],["Protagonist","Does that happen often?"],["akari","It happens. The troubling part is that I wanted to be right more than I wanted to watch the match."],["Narrator","She takes the sheet out again, hesitates, then sets it aside without opening it."],["akari","Do you have the replay? I'd like to see what I missed."]],"choices":[["Watch the match with her","Pause there. That was the decision I kept overlooking."],["Ask her to guess the next move before watching","Not this time. I want to be surprised."],["Tease her about enjoying uncertainty","Careful. I might start making a habit of it around you."]]},{"lines":[["Narrator","Akari's notebook lies closed in the library. An envelope rests on top, with your name written carefully across it."],["akari","I wrote several drafts. They were all terrible."],["Protagonist","What is it?"],["akari","An invitation. But I'd rather ask properly."],["Narrator","She nudges the envelope aside without opening it."],["akari","Would you like to go somewhere with me after the season? No agenda. Just us."]],"choices":[["Tell her you want to date her","Excellent. That's... not the response I rehearsed, but excellent."],["Ask to keep spending time as friends","I'd like that. I have a list of places we haven't seen yet. A short list."],["Suggest picking the destination at random","Then I'm going to need a coin. No, wait. You pick."]]}],"camila":[{"lines":[["Narrator","At the shop, Camila holds an old card beneath the overhead light. A tiny crease catches it near the edge."],["camila","Beautiful printing. Awful corner. A collector's tragedy."],["Protagonist","You still want it?"],["camila","That depends on who owned it."],["Narrator","She turns the card over. The previous owner has left a message on the sleeve, signed with two initials."],["camila","Now that is interesting. Would you have kept the sleeve?"]],"choices":[["Offer a fair trade for the card","You came prepared. Let's make sure we both leave happy."],["Ask about the message on the sleeve","It was a gift after a tournament. I remember the player, actually."],["Say you came to see her rather than the card","Then I suppose the card can wait until we finish our coffee."]]},{"lines":[["Narrator","Two regulars go quiet when Camila approaches the café counter. A folded note sits beside her untouched cup."],["camila","Apparently I cheated someone on a trade I wasn't even present for."],["Protagonist","Who said that?"],["camila","The note didn't come with a signature. Convenient, isn't it?"],["Narrator","She slides it toward you. The handwriting is unfamiliar; the date is wrong by a week."],["camila","Would you believe it if the date were correct?"]],"choices":[["Ask her what actually happened","Thank you. I can explain the trade, if you want to hear it."],["Suggest talking to the other collector","I was hoping you'd say that. I'd rather clear it up than collect enemies."],["Offer to leave the rumor behind and get coffee","A tempting proposal. Especially since mine has gone cold."]]},{"lines":[["Narrator","At closing, a younger collector presses worn cards into Camila's palm. A valuable holo sits on top."],["camila","You're sure you want to swap all of these?"],["Protagonist","That seems like a lot for one card."],["camila","It is."],["Narrator","She lays the holo back on the counter and spreads the worn cards where their owner can see them."],["camila","Let's look at what you already have before we start bargaining."]],"choices":[["Help explain the values without pressure","Thank you. It's easier to say no to a bad deal when there are two of us."],["Let the collector decide after hearing the details","Good. They deserve to know what they're giving up."],["Tell Camila the honest approach suits her","Careful, darling. I might start taking compliments in place of payment."]]},{"lines":[["Narrator","Camila has left her usual card case at home. At the café she turns a sugar packet over and over between her fingers."],["camila","I've spent ten minutes trying to think of a clever opening."],["Protagonist","Any luck?"],["camila","None. It's becoming embarrassing."],["Narrator","She leaves the sugar packet untouched and meets your eyes."],["camila","Would you join me for dinner next week? No cards, no trades. We could just eat."]],"choices":[["Ask her out properly","Yes. Although now I'm annoyed you said it first."],["Suggest making it a friendly dinner instead","That sounds lovely. I know a place with far too many desserts."],["Tell her she can take her time","You're very patient. I may have to find a way to test that."]]}]});
 Object.assign(S,{"marina":[{"lines":[["Narrator","The last ferry cuts a silver trail across the water. Marina has two spare tickets tucked into a small notebook."],["marina","The river's calmer after the last crossing."],["Protagonist","You come here often?"],["marina","Most evenings. The ferry captain keeps offering me a job."],["Narrator","She slips one ticket back into the notebook and rests the other on the bench between you."],["marina","Do you have anywhere you need to be?"]],"choices":[["Sit with her until the ferry disappears","The light gets better just before it's gone. Watch the water."],["Ask about the tournament flyer in her notebook","I picked one up. Haven't quite convinced myself to sign it."],["Tell her you like being here with her","Then maybe we can catch the last ferry another evening."]]},{"lines":[["Narrator","A registration form sticks out from Marina's bag at the café. Its edges are worn soft from being folded and unfolded."],["marina","The deadline's Friday."],["Protagonist","For the qualifier?"],["marina","Mm-hm. I know the deck I'd bring. Even what I'd change if I lost."],["Narrator","A drop of tea lands on the unchecked registration box. She reaches for a napkin, leaving the pen where it is."],["marina","It's silly, isn't it? I've done every part except sign my name."]],"choices":[["Offer to practice before she decides","Thank you. Bring something aggressive. I need to test the bad matchup."],["Ask what would happen if she entered","I might lose. But then I'd finally know what the room feels like."],["Offer to wait while she signs","All right. Don't look. My handwriting gets awful when I'm nervous."]]},{"lines":[["Narrator","At the community center, Marina keeps smoothing the same corner of her badge. The players ahead of her are being called to their tables."],["marina","I should've brought a different deck box. This one doesn't close properly."],["Protagonist","You've checked it four times."],["marina","Five."],["Narrator","Her name is called. She pockets the badge, straightens the cards and takes a step forward."],["marina","Will you watch the first game? You don't have to stay for the whole thing."]],"choices":[["Stay for the opening game","I'll look up when I can. No exaggerated cheering, please."],["Remind her of the last practice match","Right. One turn at a time. Thank you."],["Suggest celebrating over tea afterward","Even if I lose? ...Especially then, actually."]]},{"lines":[["Narrator","On the riverbank, Marina unfolds a tournament bracket with her name printed near the bottom. The sheet has been smoothed flat."],["marina","I kept it. Even though I didn't make the final."],["Protagonist","You played some good matches."],["marina","And one truly terrible turn. I think I'll remember that one longest."],["Narrator","She folds the bracket and puts it away, then offers you the second ferry ticket."],["marina","I'd like to take the long way home. Would you come?"]],"choices":[["Ask if you can be together beyond the tournament","Yes. I'd like to keep taking the long way with you."],["Promise to keep showing up as her friend","Thank you. Next time I'll save you a seat closer to the table."],["Ask where she wants to go next","There's a tournament upriver in the spring. I might enter that one too."]]}],"kaede":[{"lines":[["Narrator","At the arcade, a stranger in a patched jacket has taken the machine's top score. The regulars pretend not to watch."],["kaede","You all look like someone stole your lunch."],["Protagonist","That score belonged to the local champion."],["kaede","Then they can have it back. If they beat it."],["Narrator","She tucks a train ticket into her phone case and glances toward the empty card table."],["kaede","That yours? The deck with the terrible sleeves?"]],"choices":[["Show her where the card players meet","Thanks. I was about to ask the vending machine for directions."],["Ask how long she plans to stay","Long enough to find someone interesting. Maybe I already have."],["Tease her about making a scene","That was a quiet entrance. You should see me when I try."]]},{"lines":[["Narrator","At the center, two players break off their conversation when Kaede arrives. She catches the end of a familiar rumor."],["kaede","Go on. I missed the part where I supposedly cheated."],["Protagonist","You could tell them what happened."],["kaede","I could. They could ask."],["Narrator","One player leaves without meeting her eyes. Kaede pretends to examine the tournament board."],["kaede","You here for the story too, or do you actually want a game?"]],"choices":[["Hear her side first","There's less to it than people hope. I left a team. That's all."],["Ask what she would say to the others","If they want a match, they can ask me to my face."],["Challenge her without asking about the rumor","Finally. Someone who brought cards instead of questions."]]},{"lines":[["Narrator","A train passes on the far side of the park. Kaede checks the departure board on her phone, then locks the screen."],["kaede","The last train's in forty minutes."],["Protagonist","Are you taking it?"],["kaede","Haven't decided. My stuff's packed."],["Narrator","She pockets the phone but stays at the railing, watching another carriage slide past."],["kaede","Funny. Usually I'd be on the platform already."]],"choices":[["Invite her for another match tomorrow","There's a good reason. I might even unpack the deck properly."],["Tell her she doesn't owe anyone an explanation","I know. But maybe this time I want to give one."],["Admit that you'd miss her","...Don't say that like it's easy."]]},{"lines":[["Narrator","At the arcade, Kaede's bag rests beneath an empty table. The train ticket in her phone case has expired."],["kaede","Turns out the station doesn't give refunds for indecision."],["Protagonist","You missed your train?"],["kaede","On purpose, which is somehow worse."],["Narrator","She pulls out a second deck box and sets it opposite yours. This one is clearly new."],["kaede","There's a tournament next month. If I stay, are you going to make it worth the trouble?"]],"choices":[["Ask her to stay with you","I was hoping you'd ask. I wasn't going to make it easy."],["Offer to keep in touch whatever she decides","You'd better. I'll call to complain about your next deck list."],["Tell her the choice is hers","It is. That's why I bought a second deck box here."]]}]});
 function parseLine([speaker,text]){return {speaker,text};}
 const scenes={};
 for(const [npc,chapters] of Object.entries(S)){
  chapters.forEach((chapter,index)=>{
   scenes[npc+'_route_'+(index+1)]={lines:chapter.lines.map(parseLine),choices:chapter.choices.map(([label,reply])=>({label,reply}))};
  });
 }
 return Object.freeze({scenes,byId:id=>scenes[id]||null});
});
