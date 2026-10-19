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
      "I am.",
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
 function storyLines(id,base){
  if(!Array.isArray(base)||base.length<2)return base;
  const match=/^([a-z]+)_route_([1-3])$/.exec(id);
  const add=match&&route[match[1]]?.[Number(match[2])-1];
  if(!add)return base;
  return [...base,{speaker:'Protagonist',text:add[0]},{speaker:match[1],text:add[1]}];
 }
 return Object.freeze({talkLines,flirtLines,storyLines});
});
