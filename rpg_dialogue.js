'use strict';
/* Additional, explicitly authored visual-novel lines. This module presents dialogue
   only: it does not apply rewards, advance campaign time, or resolve choices. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgDialogue=api;
})(typeof window!=='undefined'?window:null,function(){
 // Each daily topic starts with the NPC's existing line. These four lines
 // turn that line into a conversation rather than a one-line stat interaction.
 const talk={
  hana:[
   ["Sounds like you want everyone to have a chance.","Exactly. Sometimes winning feels better when everybody gets to play.","Even if it makes the deck less efficient?","Maybe not every game has to be the championship final."],
   ["Is the next cup making you nervous?","A little. I keep smiling so everyone else can relax.","Who helps you relax?","You just asked a surprisingly difficult question."],
   ["You like the quiet shop?","It is the only time I can hear myself think between shuffling cards.","Then why invite me over?","Because quiet doesn't have to mean being alone."]
  ],
  reina:[
   ["And what about when the opening goes wrong?","Then you find out whether you brought a strategy or just a good hand.","You say that like you've lost on purpose.","I don't lose on purpose. I do remember why I lost."],
   ["You noticed me talking to people?","I notice when someone spends more time socializing than practicing.","Maybe listening to people is practice, too.","...Fine. That is at least an argument worth considering."],
   ["Have I earned anything yet?","You have earned the right to sit across from me again.","That almost sounded friendly.","Don't let it go to your head."]
  ],
  shiori:[
   ["So what did you learn from my last match?","That you listen to what the cards are telling you, even when you don't like it.","I thought I was just improvising.","Sometimes that is what listening looks like."],
   ["Do you ever miss sitting at the table?","More often than I admit.","Then why stay behind the crowd?","Because watching is safe. Playing makes your choices real."],
   ["Does silence bother you?","Only when someone fills it because they are frightened of it.","And if I stay a while without talking?","I think that would be lovely."]
  ],
  yuna:[
   ["Does your surprise plan ever survive turn three?","Not often, but when it does you should see their faces!","I want a front-row seat for that.","Then you are officially part of the audience. No refunds."],
   ["What happens when the joke stops being funny?","I come up with a louder one. It's a terrible system.","You could just tell people you're disappointed.","Whoa. You really do go straight for the boss fight."],
   ["What's the latest unreasonable combo?","One part brilliance, two parts bad decisions.","And the fourth part?","You, apparently. You're helping me test it."]
  ],
  akari:[
   ["What assumption does mine reveal?","That you believe a surprising play can compensate for imperfect consistency.","And do you think I'm wrong?","I think I'd like to collect more evidence."],
   ["Would you change anything about my last deck?","Three cards. But I would rather you discover why.","That's a very specific kind of cruelty.","I prefer to call it guided research."],
   ["Are you running numbers on me right now?","Only in a very informal sense.","That sounds suspiciously like yes.","It is a statistically defensible yes."]
  ],
  camila:[
   ["Do you have a story for every card?","The interesting ones. Nobody remembers a price tag forever.","What about a trade you regret?","Oh, darling. Those are usually the best stories."],
   ["Is there such a thing as a fair trade?","Of course. The problem is getting two people to agree on what fair means.","So what matters to you?","That neither person wishes they'd never met."],
   ["You're accusing me of bluffing?","I'm complimenting your composure.","How would I know the difference?","You wouldn't. That's why it's fun."]
  ],
  marina:[
   ["Does the river help you think?","It reminds me there's a world beyond tomorrow's match.","Maybe we could walk here after a tournament.","I'd like that. Even if we don't win anything."],
   ["You sound like you've been waiting.","I have. Sometimes I mistake patience for courage.","How do you tell the difference?","I think you have to actually take the first step."],
   ["What would you try if nobody were watching?","Something I'm not already good at.","And if somebody was cheering for you?","That might make it a little easier."]
  ],
  kaede:[
   ["And what about the stories you tell about yourself?","Those are the dangerous ones. You start believing them.","Is that why you came here?","Maybe I wanted to see who I am somewhere new."],
   ["Then what are you looking for?","A player who makes me put away all my excuses.","That's a high bar.","Good. I didn't travel all this way for an easy match."],
   ["Is it always about the unexpected move?","It's about making a choice you can actually own.","Even when it costs you the match?","Especially then."]
  ],
  elio:[["You don't have to impress everyone.","I know that in theory. My hands haven't caught up.","Want to run a few turns together?","Only if you promise not to laugh at the opening hand."]],
  alma:[["Does running the café ever get quiet?","Once in a while, just after the morning rush.","And what do you do then?","Sit down for five minutes before someone finds me."]],
  nereo:[["Is there a trick to staying calm?","There's a trick to looking calm. That's different.","Care to share it?","You start by breathing before you draw."]],
  teo:[["Do you ever get tired of narrating everything?","Only when nobody is listening.","Well, you've got an audience.","Then I'd better make this one count."]],
  jun:[["You watch a lot of matches, don't you?","More than I play. You see a different side of people.","What have you learned?","That fairness matters most when someone is upset."]],
  sol:[["Do you ever stop making plans?","Sometimes. Those tend to be my best days.","Maybe today could be one of those days.","You're a bad influence on my calendar."]]
 };
 // Two authored beats after the existing protagonist/NPC exchange.
 // Preserves the event's original final question and all outcome flags.
 const route={
  hana:[
   ["You could say no to one thing, you know.","I keep thinking someone will be disappointed. Maybe I need to let them be."],
   ["What would you choose if nobody else had a say?","That's what I was hoping you might help me figure out."],
   ["You're allowed to want something for yourself.","Then maybe I should start by telling you what that is."]
  ],
  reina:[
   ["And what are you trying to improve tonight?","The part of my game that refuses to ask for help."],
   ["Even the best players have an unlucky night.","I know. I just wish other people knew it too."],
   ["Then let's treat it like any other match: one turn at a time.","For once, that actually sounds like a good plan."]
  ],
  shiori:[
   ["But you're here talking to me now.","Yes. That wasn't part of my plan, and I'm glad of it."],
   ["You can't replay everything until it's perfect.","I wonder how long I've needed someone to say that."],
   ["You don't have to walk through it alone.","I think I'm finally willing to believe that."]
  ],
  yuna:[
   ["And what happens the other ninety-nine times?","We laugh, shuffle, and try something even stranger."],
   ["I came to watch you play, not to laugh at you.","Then maybe it's time I let them see the player."],
   ["You don't have to stop being yourself to play seriously.","Good, because I have no idea how to be anyone else."]
  ],
  akari:[
   ["You could just ask me what I was thinking.","And lose the chance to deduce it? ...All right. What were you thinking?"],
   ["Maybe the afternoon doesn't need a plan.","You make spontaneity sound almost reasonable."],
   ["Are you going to try to predict what happens next?","No. This time I'd like to find out with you."]
  ],
  camila:[
   ["Then tell me what matters to you.","The things I can't put in a binder, unfortunately."],
   ["Would you rather I heard it from you?","Yes. Although honesty is not a habit I wear comfortably."],
   ["You can still make a different choice.","That is the most inconveniently hopeful thing you've said to me."]
  ],
  marina:[
   ["Does it ever feel like the river is keeping your secrets?","Every day. I wish it could tell me which ones to let go."],
   ["Ready might be something that happens afterward.","You make it sound possible to be afraid and try anyway."],
   ["Shaking doesn't mean you made the wrong choice.","Then stay a little. I'd like to enjoy making the right one."]
  ],
  kaede:[
   ["Maybe they want to know you first.","They can try. Most people stop at the reputation."],
   ["I came because I wanted to hear your side.","Then maybe I owe you an honest answer for once."],
   ["You don't sound like someone who wants to leave.","That's the problem. I've never had to be good at staying."]
  ]
 };

 // Authored five-line conversations for all additional playable NPCs.
 const extendedTalk={
  "iris": [
    [
      "That sounds heavier than any starter deck.",
      "The actual cards are the light part. Try moving the tables first.",
      "Can I carry the next batch?",
      "Only if you promise to bend your knees. I need helpers, not patients."
    ],
    [
      "You trust Marina's sense for the current?",
      "More than a printed schedule. The river has its own priorities.",
      "And your priorities?",
      "Getting everyone home dry, if I can manage it."
    ],
    [
      "Could I stay to help clean up?",
      "You're the first player to offer all evening.",
      "Does that mean yes?",
      "It means you've earned the good pair of work gloves."
    ]
  ],
  "elio": [
    [
      "So Energy actually matters?",
      "Apparently my Charizard cannot attack on enthusiasm alone.",
      "Want to count the opening hand together?",
      "I'd like that. I can stop panicking long enough to do arithmetic."
    ],
    [
      "You notice how people handle each other's cards?",
      "It's easier to notice kindness when you're nervous.",
      "Has anyone been unkind to you here?",
      "Not really. My brain keeps expecting it anyway."
    ],
    [
      "I can stand somewhere else if an audience is hard.",
      "No, stay. It's less scary when at least one person wants me to win.",
      "And if you lose?",
      "I'd still like you to stay for the rematch."
    ]
  ],
  "alma": [
    [
      "Do people talk about losses here?",
      "Usually after the first sip. Before that, they pretend they only want sugar.",
      "Do you mind being the place they land?",
      "No. Just wish they'd remember to eat something too."
    ],
    [
      "And what have you noticed about this room?",
      "People relax when someone makes space without asking them to prove they belong.",
      "Do you ever need that yourself?",
      "More often than I let my regulars see."
    ],
    [
      "Even when a table doesn't spend much?",
      "A chair isn't an invitation only if you order something.",
      "How can I help?",
      "Tell the new player at the door there's room for one more."
    ]
  ],
  "nereo": [
    [
      "Have you actually used those batteries?",
      "Once for the dock light and twice for the radio.",
      "And in a duel?",
      "Only as a reminder that preparation is not a personality flaw."
    ],
    [
      "So you don't take bad weather personally?",
      "I complain about it loudly. That's not the same thing.",
      "Has complaining ever helped?",
      "It makes the walk home shorter, at least in my head."
    ],
    [
      "Unless someone plays Chaos Gym.",
      "Then the current changes in the middle of my turn. You're proving my point.",
      "Want to practice that matchup?",
      "Yes, but we're staying where it's dry."
    ]
  ],
  "jun": [
    [
      "Have you ever had to step in?",
      "Yes. And it feels worse when the crowd remembers you instead of the match.",
      "What makes a good call?",
      "The same rules for your friend and a stranger."
    ],
    [
      "So passing can be part of the strategy?",
      "Absolutely. Leaving yourself options is a form of courage.",
      "Would you trust me to wait?",
      "If you stop fidgeting with those sleeves."
    ],
    [
      "Can I help fix it?",
      "You noticed the wobble. That puts you ahead of half the staff.",
      "I can get a screwdriver.",
      "Excellent. I will put you on the very unofficial maintenance roster."
    ]
  ],
  "teo": [
    [
      "You don't need to fill every silence.",
      "I'm trying to learn that. The microphone makes it difficult.",
      "Would you enjoy watching a match quietly?",
      "With a friend? Probably more than I expect."
    ],
    [
      "Doesn't every match deserve its own tone?",
      "It does. I sometimes mistake volume for excitement.",
      "What made the last game exciting?",
      "The way one player waited for the other to find their footing."
    ],
    [
      "You could keep the accidental version.",
      "You are proposing an artistic philosophy based on my mistakes.",
      "Is it a bad philosophy?",
      "I could announce a tournament with worse ones."
    ]
  ],
  "jinx": [
    [
      "You never second-guess a risky play?",
      "Sure I do. I just do it after I've committed.",
      "And when it goes badly?",
      "I own it. Then I come back with a better list."
    ],
    [
      "Would you prefer I looked away?",
      "I prefer you tell me what you're thinking instead of acting embarrassed.",
      "I was thinking your deck is faster than mine.",
      "See? That's an interesting answer. Keep going."
    ],
    [
      "You can be sharp and still let people in.",
      "Not everybody deserves to get close.",
      "How would someone earn it?",
      "By staying when winning stops being the easy part."
    ],
    [
      "So you don't mind losing?",
      "I mind looking like I didn't learn anything.",
      "Want to review the turn that cost you?",
      "Only if you're ready for the unedited commentary."
    ],
    [
      "Does that include your own opinions?",
      "Obviously. I still hear them sometimes.",
      "And what do you do with them?",
      "Turn them into fuel. Most days, anyway."
    ],
    [
      "You forgot the people who show up just to cheer.",
      "I didn't forget. I just pretend I don't keep track.",
      "Want to tell me who you're cheering for?",
      "Don't push your luck. Sit beside me and find out."
    ]
  ],
  "luna": [
    [
      "Did anyone get hurt?",
      "Only my pride. And maybe a very innocent deck box.",
      "Want to practice at a bigger table?",
      "Could we? You make it sound like a plan instead of a disaster."
    ],
    [
      "You don't have to carry everything alone.",
      "I know. I just want to prove I can do something without making trouble.",
      "Helping isn't the same as taking over.",
      "That's... a much nicer way to think about it."
    ],
    [
      "You could try a size that lets you move comfortably.",
      "I keep buying the same thing out of habit.",
      "Want me to help find a shop?",
      "Maybe. But you have to promise not to laugh at how indecisive I get."
    ],
    [
      "That must have been frightening.",
      "Mostly confusing. Everyone rushed over before I knew what happened.",
      "Did they make sure you were okay?",
      "They did. I should remember that part first."
    ],
    [
      "Want me to pick up the books while you straighten the shelf?",
      "Please. I keep making it worse when I rush.",
      "No hurry. One at a time.",
      "Thanks. Quiet suddenly sounds really good."
    ],
    [
      "Maybe you and the ground need a truce.",
      "I'd sign that agreement immediately.",
      "What would your first condition be?",
      "No surprise stairs before breakfast."
    ]
  ],
  "sol": [
    [
      "Can I join the jury for that contest?",
      "Only if you promise to applaud the terrible entries.",
      "What does the winner get?",
      "A paper crown and unconditional respect. For one afternoon."
    ],
    [
      "Have you ever worn boring pants as an experiment?",
      "Once. Nobody recognized me without an invitation to an activity.",
      "Maybe the point is that you're still you.",
      "Good answer. You can stay on my investigation team."
    ],
    [
      "What would you tell someone else on a sad day?",
      "That they don't have to turn it into an event.",
      "Could you tell yourself that?",
      "I am trying. Stay for the quiet part?"
    ],
    [
      "Did someone help you learn that?",
      "A friend who told me honestly they needed to go home.",
      "And you let them?",
      "I did. The next invitation meant a lot more."
    ],
    [
      "Can I count with you?",
      "Absolutely. But if I move at six you're not allowed to tease.",
      "One, two, three...",
      "Okay, maybe I should practice this sitting-still thing with company."
    ],
    [
      "Jun recognized the effort, at least.",
      "He did! That's practically a standing ovation from him.",
      "Will you wear the jacket again?",
      "If I choose to. Not because I need an excuse for showing up."
    ]
  ],
  "rina": [
    [
      "Does anyone on the crew know that?",
      "My choreographer suspects it. She caught me practicing a shuffle between sets.",
      "Do you feel you have to choose one life?",
      "I used to. Now I'm working on making room for both."
    ],
    [
      "Which one was hardest to find?",
      "The Grass promo that came from a tiny shop event.",
      "What makes it special?",
      "Someone traded it to me because they wanted me to keep playing."
    ],
    [
      "You light up when you talk about evolution.",
      "It's like choreography, except every turn changes the music.",
      "Do you ever plan the whole line?",
      "I do, and the deck always finds a way to surprise me."
    ],
    [
      "So the deck got more rehearsal than the wink?",
      "Please don't tell my manager that.",
      "Your secret is safe.",
      "Great. Now promise to test my opening hand."
    ],
    [
      "Do you like signing cards?",
      "When fans bring something they actually played with, yes.",
      "That's different from a poster.",
      "Exactly! We have a story to talk about together."
    ],
    [
      "What would the first display case hold?",
      "The cards friends gave me before anyone knew my stage name.",
      "That's a better collection than a trophy.",
      "Don't make me emotional in the middle of the shop."
    ]
  ],
  "elena": [
    [
      "Does it ever feel like too much planning?",
      "The alternative usually makes more work for everyone.",
      "What do you do when something surprises you?",
      "I revise the plan. Quietly, if possible."
    ],
    [
      "But there's room for emotion when the doors close?",
      "There is. I simply don't like it deciding for me.",
      "Is that difficult?",
      "More difficult than I make it look."
    ],
    [
      "And when you're not representing the bank?",
      "I still appreciate presenting myself well.",
      "For yourself?",
      "Precisely. You are listening more closely than most people."
    ],
    [
      "Even when an opponent does something irrational?",
      "Especially then. Their unpredictability becomes another variable.",
      "Sounds exhausting.",
      "It can be. Which is why I value a worthy conversation afterward."
    ],
    [
      "So would tonight count as an exception?",
      "That depends on whether you have something meaningful to say.",
      "What if I want to listen instead?",
      "That would be an unexpectedly good use of the hour."
    ],
    [
      "Would you rather I looked at the deck?",
      "No. I only wanted to know if you were paying attention.",
      "I am, and I am practicing saying it without apologizing.",
      "Then you may continue."
    ]
  ],
  "sierra": [
    [
      "What makes the game different?",
      "Nobody cares how you pose when you draw a bad hand.",
      "And when you win?",
      "I know the decision was mine. That's the part I love."
    ],
    [
      "Do you ever correct them?",
      "If we're sitting across a table, absolutely.",
      "How does that go?",
      "Some people learn faster after their third prize card."
    ],
    [
      "Would you take the booking if it paid well?",
      "Maybe. But I'm done rearranging my whole life for other people's schedules.",
      "What do you want that time for?",
      "A real tournament. And maybe coffee afterward."
    ],
    [
      "Nervous in a match after handling cameras all day?",
      "The camera expects a smile. A smart opponent expects a plan.",
      "Does the pressure bother you?",
      "It reminds me I'm doing something I chose."
    ],
    [
      "I'm asking now.",
      "I noticed. It shouldn't be unusual, but it is.",
      "Then tell me what you care about.",
      "The game. The friends. The freedom to decide how I'm seen."
    ],
    [
      "Do you let anyone borrow them?",
      "Only if they understand why they're sleeved twice.",
      "What if we build a deck together?",
      "That's an offer worth putting the binder down for."
    ]
  ]
};
 Object.assign(talk,extendedTalk);
 const flirt={
  hana:["I was hoping I'd run into you today.","Should I give you a warning next time?","No. Just give me a moment to stop blushing."],
  reina:["You know, you look good when you're determined.","Only when you keep listening.","Then you'd better give me something worth listening to."],
  shiori:["I was hoping you'd save a quiet moment for me.","Then I'll be direct again: I like being here with you.","...You may stay as long as you like."],
  yuna:["I think you're the most entertaining person in town.","Finally, a combo that worked on the first try.","Careful. I may expect that kind of confidence from now on."],
  akari:["I wanted to see if I could surprise you.","For the record, I like the way you look at me.","That is an observation I need more time to evaluate."],
  camila:["For once, I'm not interested in making a trade.","I was hoping for your company.","Then the evening might be more valuable than I expected."],
  marina:["The river isn't the only nice thing about this place.","I meant that I'm happy you're here.","Oh. Well, then I'm happy you're here too."],
  kaede:["You make getting into trouble sound tempting.","Maybe I do want to be trouble with you.","That's the kind of offer I could get used to."]
 };

 const extraFlirt={
  "jinx": [
    "Is there room beside you, or is that seat a challenge?",
    "I came for the match. Staying to talk is the surprise.",
    "Huh. Fine. But you're buying the post-match fries."
  ],
  "luna": [
    "I was hoping we'd find a quieter corner.",
    "Not to rescue you. Just to spend some time together.",
    "Oh... then I'd really like that. I'll try not to spill anything."
  ],
  "sol": [
    "What if we skipped the big event and just took a walk?",
    "Only if you want to. No surprise obstacle course.",
    "Then yes! Though I make no promises about the conversation."
  ],
  "rina": [
    "Can I ask for an encore without the stage lights?",
    "The part where you're yourself, not performing.",
    "That's my favorite version too. I'd love to share it."
  ],
  "elena": [
    "I'd like to see you when the schedule isn't the boss.",
    "I wanted to ask about dinner, not an appointment.",
    "You have my attention. Present your very informal proposal."
  ],
  "sierra": [
    "You have a minute before your next shoot?",
    "I wanted to talk to you, not the camera.",
    "That answer is rarer than you think. I'll make time."
  ],
  "iris": [
    "You're always carrying half the town on your shoulders.",
    "Then let me carry a box while you pick where we get tea.",
    "A useful offer and a pleasant one. Careful, I may accept both."
  ],
  "jun": [
    "You aren't on duty right now, are you?",
    "Then I'd like your opinion on something other than my deck.",
    "That's unexpected. Sit down and ask me properly."
  ],
  "teo": [
    "Could you keep this off the microphone?",
    "I like hearing you talk when the audience isn't listening.",
    "For once I genuinely don't have a prepared line."
  ],
  "elio": [
    "Your sleeves are fine. I was hoping you might stay.",
    "Only if you're comfortable. We can just compare collections.",
    "I think I'd like that. That sounds really nice."
  ],
  "alma": [
    "Is this a terrible time to ask for company?",
    "Not as a customer. As someone who enjoys talking to you.",
    "Then wait until the lunch crowd clears. I'll save a chair."
  ],
  "nereo": [
    "You look like you could use a better day.",
    "I'd offer you the company, if the weather cooperates.",
    "It doesn't have to. I'm starting to like your company anyway."
  ]
};
 Object.assign(flirt,extraFlirt);
 // Introduction and repeat greetings also let the protagonist answer naturally.
 const greetings={
  "hana": [
    "You always make the shop feel welcoming.",
    "I try. It's easier when familiar faces actually stop to talk."
  ],
  "reina": [
    "I figured you'd have something to say about my last match.",
    "Only if you're prepared to hear what I noticed."
  ],
  "shiori": [
    "Is this a good time to join you?",
    "Yes. I was hoping you'd stay long enough for a proper conversation."
  ],
  "yuna": [
    "Should I be worried about what you're planning?",
    "Very worried. Or thrilled. I'm working on the distinction."
  ],
  "akari": [
    "Do you have a theory about why I'm here?",
    "Several. But perhaps you could save me the work and tell me."
  ],
  "camila": [
    "Do I need an appointment to talk to you?",
    "Only if you're selling something. For a friend, I have a minute."
  ],
  "marina": [
    "Mind if I stay a moment?",
    "Not at all. I like watching the river with someone who doesn't rush."
  ],
  "kaede": [
    "Is this a challenge or a greeting?",
    "Whichever one you're brave enough to answer."
  ],
  "jinx": [
    "I was going to ask you about your deck.",
    "Good. Skip the awkward part and show me what you've got."
  ],
  "luna": [
    "I'm fine. Are you okay?",
    "Oh! Yes, I think so. Thanks for asking instead of assuming."
  ],
  "sol": [
    "I should have guessed you were planning something.",
    "I have three ideas. You get to veto every one of them."
  ],
  "rina": [
    "I'm here for the cards, actually.",
    "Really? Then let's get somewhere we can talk without a spotlight."
  ],
  "elena": [
    "No account questions. Promise.",
    "A refreshing change. Then I can afford a few minutes."
  ],
  "sierra": [
    "I was hoping to talk about deck choices.",
    "You have no idea how good it feels to hear that first."
  ],
  "jun": [
    "Off the clock?",
    "Off the clock. Which means I might actually relax while we talk."
  ],
  "teo": [
    "Can I interview the interviewer?",
    "For once? Sure. But don't expect a polished answer."
  ],
  "iris": [
    "Do you need a hand before we talk?",
    "You noticed the boxes. That already makes this a better day."
  ],
  "elio": [
    "You're not bothering me. I came to say hi.",
    "Really? Okay. I'd like to talk for a while, then."
  ],
  "alma": [
    "Could we sit where it's quieter?",
    "Of course. There is always room for a conversation here."
  ],
  "nereo": [
    "Do you have a minute?",
    "If the tide gives us one. I can spare two."
  ]
};
 function greetingLines(npc,opening){
  const beats=greetings[npc];
  return beats?[{speaker:npc,text:opening},{speaker:'Protagonist',text:beats[0]},
   {speaker:npc,text:beats[1]}]:[{speaker:npc,text:opening}];
 }
 function flirtLines(npc,reply){
  const beats=flirt[npc];
  if(!beats)return [{speaker:npc,text:reply}];
  return [{speaker:'Protagonist',text:beats[0]},{speaker:npc,text:reply},
   {speaker:'Protagonist',text:beats[1]},{speaker:npc,text:beats[2]}];
 }
 function talkLines(npc,topicIndex,opening){
  const options=talk[npc],beats=options?.[topicIndex%options.length];
  if(!beats)return [{speaker:npc,text:opening}];
  return [{speaker:npc,text:opening},...beats.map((text,i)=>({speaker:i%2?'npc':'Protagonist',text})).map(x=>({...x,speaker:x.speaker==='npc'?npc:x.speaker}))];
 }

 // These paired beats deepen every character-pack route without changing its choices.
 const guestRouteBeats={
  "jinx": [
    [
      "A reputation is a lot to carry into a conversation.",
      "You should see how much easier it is to carry when people stop pretending to be polite."
    ],
    [
      "Have you ever wanted to play without an audience?",
      "More than I admit. It might be nice to lose or win without a hundred comments."
    ],
    [
      "You don't have to be impressive every minute.",
      "That's a dangerous thing to say to me. I might actually test it."
    ],
    [
      "I'm not here to watch you prove yourself to everyone.",
      "Good. Because what I want to know is whether you'll keep showing up when nobody's keeping score."
    ],
    [
      "I don't need you to be invincible.",
      "That's lucky. I'm getting tired of pretending that I am."
    ]
  ],
  "luna": [
    [
      "I can stand where you have a little privacy.",
      "You'd do that? Thank you. I hate making everybody stop what they're doing."
    ],
    [
      "You're allowed to ask for a hand.",
      "I know. I just always worry I'm making someone's day more difficult."
    ],
    [
      "Let's figure out what you need first.",
      "You always make the next step feel smaller. I appreciate that."
    ],
    [
      "Nobody needs you to have an answer right away.",
      "Even if I keep overthinking it? ...Okay. I'll try being patient with myself."
    ],
    [
      "I can't promise to stop every stumble.",
      "I know. It matters more that you'll laugh with me afterward, not at me."
    ]
  ],
  "sol": [
    [
      "Do people ever get to say no to your games?",
      "They should. I'm starting to think a good invitation is one people can decline."
    ],
    [
      "Maybe two people can still make a good evening.",
      "That is suspiciously sensible. I like it much more than I expected."
    ],
    [
      "It doesn't have to be spectacular to matter.",
      "Then perhaps we can just stay here until the lemonade gets warm."
    ],
    [
      "You're still giving everyone something fun to look forward to.",
      "Only this time I'm remembering to tell them what it actually is."
    ],
    [
      "I like you just as much when nothing is happening.",
      "Then maybe this quiet moment deserves its own place on the calendar."
    ]
  ],
  "rina": [
    [
      "I brought a deck too, if you'd rather skip the fan talk.",
      "Oh, I would love that. Everyone else has already asked about the last song."
    ],
    [
      "You don't have to make this a performance.",
      "Good. Because the game is the one place I can forget whether anybody's watching."
    ],
    [
      "The quiet version of you can be excited too.",
      "She is. She's just a little afraid the world won't recognize her."
    ],
    [
      "You don't have to prove either one to me.",
      "Then I can just enjoy the song, the cards and the company."
    ],
    [
      "What if we make room for the stage and the table?",
      "That's what I want. I don't want to lose one part of myself to keep the other."
    ]
  ],
  "elena": [
    [
      "Five minutes is plenty if we both mean what we say.",
      "Interesting. Most people would ask for another ten."
    ],
    [
      "You don't have to account for every pleasant moment.",
      "I do not know how to stop counting. But perhaps I can try."
    ],
    [
      "You don't need to call every unexpected thing a mistake.",
      "That suggestion is irritatingly reasonable. I may consider it."
    ],
    [
      "Would it help if we walked without choosing a destination?",
      "In theory, no. In practice... keep walking."
    ],
    [
      "You don't have to organize how this turns out.",
      "A rare offer. Uncertainty is easier to face when someone chooses to remain."
    ]
  ],
  "sierra": [
    [
      "It must be tiring being recognized for only one thing.",
      "It is. Which is why hearing you ask about my deck catches me off guard."
    ],
    [
      "Can I ask what you want, not what they booked you for?",
      "A real match. Maybe a quiet meal. Nothing anyone needs to photograph."
    ],
    [
      "Then this room can belong to you.",
      "I like that. The cards don't care how I look under studio lights."
    ],
    [
      "I'm interested in you, not the version people buy tickets to see.",
      "That's what I've been hoping you'd say. I wasn't sure I believed it."
    ],
    [
      "You don't have to hide the part that loves this game.",
      "I won't. Whatever happens with us, I'm done pretending the deck box is just an accessory."
    ]
  ]
};
 const finalLegacyBeats={
  "hana": [
    "And what do you want after everybody goes home?",
    "A day when I choose who to be with, instead of who needs my help."
  ],
  "reina": [
    "If we don't turn this into a contest, would that be so bad?",
    "It might be the first challenge I can't solve by practicing harder."
  ],
  "shiori": [
    "What if the future isn't another version of the past?",
    "Then perhaps I'll finally be willing to meet it without fear."
  ],
  "yuna": [
    "You don't have to be funny every time I look at you.",
    "Then I might have to learn another way to tell you I'm happy."
  ],
  "akari": [
    "Could we make a choice without calculating the odds?",
    "For this one? Yes. I think I finally can."
  ],
  "camila": [
    "And if nobody is trying to win this conversation?",
    "Then maybe we can both afford to be honest."
  ],
  "marina": [
    "The decision is yours, even if I'm standing beside you.",
    "It helps more than you know to have someone say that."
  ],
  "kaede": [
    "Staying doesn't mean you lose the freedom to leave.",
    "No. But it might mean I finally find something worth returning to."
  ]
};
 function storyLines(id,base){
  if(!Array.isArray(base)||base.length<2)return base;
  const match=/^([a-z]+)_route_([1-5])$/.exec(id);
  if(!match)return base;
  const [,npc,num]=match,index=Number(num)-1;
  const extended=guestRouteBeats[npc]?.[index];
  const legacy=route[npc]?.[index]||(index===3?finalLegacyBeats[npc]:null);
  if(extended){
   // Character-pack routes already end with the NPC's question to the player.
   // Insert the exchange before that question so the decision still makes sense.
   const beat=[{speaker:'Protagonist',text:extended[0]},{speaker:npc,text:extended[1]}];
   return [...base.slice(0,-1),...beat,base[base.length-1]];
  }
  if(!legacy)return base;
  return [...base,{speaker:'Protagonist',text:legacy[0]},{speaker:npc,text:legacy[1]}];
 }
 return Object.freeze({talkLines,flirtLines,greetingLines,storyLines});
});
