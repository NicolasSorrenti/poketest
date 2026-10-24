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
  // Personal character packs receive the same real conversations as the base cast.
  laca:[
 [
  "You never told me what the last step was.",
  "Because you never showed up for rehearsal. We made it up on the spot.",
  "So that's why it ended with us falling over?",
  "Exactly. Beautiful choreography. No notes."
 ],
 [
  "I remember that look. You're about to say something.",
  "I'm about to ask if you're still this easy to tease.",
  "Only when you want something from me?",
  "Nah. It's free for you. Old-friend privilege."
 ],
 [
  "Sand in sleeves sounds miserable.",
  "It gets into everything. Even the bag I keep away from the pool.",
  "Want help sorting them?",
  "Only if you promise not to ask why one of them has a tiny shell inside."
 ],
 [
  "I know. You get quiet when someone's in trouble.",
  "Yeah. Jokes can wait; keeping people safe can't.",
  "Does the change surprise the kids?",
  "Sometimes. Then they see I'm serious and listen. That's what matters."
 ],
 [
  "That is not how I remember my first deck.",
  "You literally kept a card because the picture was cute.",
  "You were the one who taught me to play it.",
  "True. And you still owe me for the terrible advice I gave."
 ],
 [
  "That must have felt good.",
  "It did. She was scared to let go of the edge.",
  "What finally helped?",
  "I showed her she could stand up whenever she wanted. She worked out the rest herself."
 ],
 [
  "I thought we settled that debt when we were twelve.",
  "You thought wrong. I have a very sophisticated accounting system.",
  "Does it include interest?",
  "Only ice cream. Two scoops per year, I think."
 ],
 [
  "I'd have guessed you enjoy organizing things.",
  "Only if the things are people at a swimming lesson.",
  "So not a two-hour planning meeting?",
  "Please. Put me back in the pool before I start counting ceiling tiles."
 ],
 [
  "If I'm being ridiculous, you'll hear it.",
  "Good. Because I need someone who won't just agree with me.",
  "Even when we're arguing?",
  "Especially then. We can be mad and still split fries afterward."
 ],
 [
  "Are those the sunglasses you nearly lost in the water?",
  "Different pair. These ones are even less practical.",
  "How are you planning to keep them?",
  "By not wearing them at work. Look, I can learn."
 ],
 [
  "You're making me guess on purpose.",
  "Obviously. It's a longstanding tradition.",
  "Does the tradition come with clues?",
  "Maybe. Start by asking me to get a snack after my shift."
 ],
 [
  "I wasn't trying to cheat with that trade.",
  "You said my rare looked lonely in its binder.",
  "That almost worked.",
  "It would've worked if you hadn't offered me the same common twice."
 ]
],
  barb:[
 [
  "What makes a deck box feel like yours?",
  "A little detail that says somebody made a choice, not just followed a pattern.",
  "So the corners matter as much as the colors?",
  "Sometimes more. Bad corners ruin a beautiful box."
 ],
 [
  "So the hearts are a warning label?",
  "Not deliberately. But I do enjoy watching people underestimate the deck.",
  "Do you design for a particular strategy?",
  "For the person carrying it. The nasty surprises are their department."
 ],
 [
  "Copying the list doesn't teach you why it works.",
  "Exactly. I want people to know what they'd change when things go wrong.",
  "Do you change other people's designs, too?",
  "Only when they ask. And I try not to move the parts they love."
 ],
 [
  "Did it look like it had a story?",
  "The seller said it belonged to someone who traveled a lot.",
  "And that's why you kept it?",
  "Partly. The clasp was broken. I wanted to make it wearable again."
 ],
 [
  "How did the glitter ban happen?",
  "One little jar tipped over during a workshop.",
  "How much glitter are we talking about?",
  "Enough that Hana found some under the counter three weeks later."
 ],
 [
  "You always put the cap back on after losing?",
  "Yes. My personal way of saying 'fine, I need five minutes.'",
  "Does it help?",
  "A little. It's better than saying something I'll regret."
 ],
 [
  "What if they love it but don't use it?",
  "That's possible. I know not everything needs to be practical.",
  "But you'd still ask?",
  "Gently. Sometimes I just want to know what happened to something I made."
 ],
 [
  "Have the glasses actually saved a misread?",
  "More than once. Tiny rule text and bad lighting are a terrible combination.",
  "Are you showing off?",
  "Only a little. I did read the rulebook before the glasses arrived."
 ]
],
  // Character-pack conversations: each follow-up responds to that character's
  // actual topic instead of falling back to a generic question and random next line.
  jinx:[
   ["So what's the play when your first hand is terrible?","You make a plan with the five cards you wanted to throw away.","That sounds like experience.","It sounds like a very expensive series of mistakes."],
   ["And if somebody does have an opinion?","They can say it. I can ignore it. We're both having a wonderful day.","You make it sound easy.","It took practice. So did these boots."],
   ["You're offering coaching, then?","I'm offering to beat you until you stop making the same mistake.","That is a strange sales pitch.","Good thing I'm not charging. Yet."],
   ["I'd be embarrassed by that misplay too.","I replayed it in my head all night. The crowd forgot in ten minutes.","Did you find the better move?","Three of them. I hate that part."],
   ["Even you?","Especially me. I just refuse to let strangers write my whole personality.","Is that why you tease them first?","Sometimes. Don't look so pleased with yourself."],
   ["What about the people who stay after the bracket's done?","They're harder to rank. Usually worth more, too.","That sounded almost sentimental.","You heard nothing. Shuffle." ]
  ],
  luna:[
   ["Did the cards survive?","All but one sleeve. I found it stuck to my shoe on the way home.","You can practice with my deck sometime.","Could we use a playmat? The floor has seen enough of my cards."],
   ["It's all right to accept help sometimes.","I know. I just want people to ask before taking everything out of my hands.","Then I'll ask. Want a hand?","Yes, please. With the top box. I can carry the rest."],
   ["Maybe the shelf is just badly designed.","Do you think so? I was blaming the sweater again.","We could ask them to move the boxes lower.","That would help everyone, wouldn't it? Oh. I like that idea."],
   ["Were you hurt?","Only my pride. Someone found my missing deck box under the stairs.","At least it came back.","With all sixty cards. I counted them twice."],
   ["What do you read when you're not rearranging the shelves?","Old tournament reports. I like seeing how a match turns on one small choice.","You keep notes?","Little ones. I'm trying to learn rather than just apologize for losing."],
   ["You do seem to have a rivalry with gravity.","And it keeps winning. But I managed a whole match without dropping a card.","That's worth celebrating.","Quietly, please. I might knock over the celebration." ]
  ],
  sol:[
   ["What have you found so far?","A move called Tail Whip. Not romantic, but it has potential.","You cannot use a card name as a pickup line.","Not with that attitude you can't."],
   ["What about weather-appropriate shoes?","A shocking attack on my personal brand.","So you'll bring shoes next time?","Of course. I've lost enough sandals to the harbor."],
   ["Maybe we could just do nothing for a bit.","Nothing? Do I need to bring snacks for nothing?","Only if you want them.","Oh. That sounds suspiciously nice."],
   ["I used to think I was letting someone down by saying no.","And then you met people with actual lives and bedtimes.","Still learning?","I'm trying. You can turn down my next idea without a three-page apology."],
   ["Should I start counting again?","Please don't. The pressure is unbearable.","We could walk instead.","Walking is sitting still with better scenery. Approved."],
   ["I bet Jun had something to say about the rest of it.","He said I'd get cold after sunset. He was right. Infuriating man.","So you borrowed a coat?","No. I took his. He knows where to find it." ]
  ],
  rina:[
   ["You say that as if collecting is a secret identity.","It sort of is! My stage bag has a false bottom for my deck.","Is that really necessary?","Not remotely. But it feels like a spy movie, so I'm keeping it."],
   ["Which promo are you proudest of finding?","The one with the bent corner. I traded for it when I was little.","A bent card?","The kid who traded it taught me how to play. I couldn't replace that memory."],
   ["What's your favorite part of that opening?","When the second Pokémon lands and I know the deck is doing what I built it to do.","Even when the next draw is awful?","Especially then. That's when I find out whether my plan was any good."],
   ["Did you remember to sleep at all?","Barely. I accidentally sang my matchup notes during warm-ups.","Did anyone notice?","My pianist did. She wants a rematch now."],
   ["Have you ever signed a card in the wrong place?","Once. I wrote my name across the attack text. I felt terrible.","What did the fan say?","She laughed and asked me to sign the sleeve instead. Much smarter."],
   ["And what would you put next to the display case?","A tiny practice table. One that doesn't wobble when I shuffle.","That sounds more useful than a trophy.","Don't tell my manager. She already has a shelf picked out." ]
  ],
  elena:[
   ["Does the schedule ever change?","Frequently. That's why I leave room for contingencies.","Including conversations like this?","I have recently begun to reserve a small amount of time for those."],
   ["So you never lose your temper at work?","Of course I do. I simply wait until the client has left.","Then what happens?","I take a walk. Occasionally a very long one."],
   ["You make it sound like armor.","In a sense. But I also happen to enjoy dressing well.","Fair point.","Thank you. I dislike being turned into somebody else's metaphor."],
   ["What if your opponent does something absurd?","Then I check whether it's genuinely absurd or whether I missed a line.","And if you missed it?","I write it down. Pride is a poor substitute for learning the matchup."],
   ["Is that why you're here tonight?","I finished my work. I could have gone home.","But you didn't.","No. I am allowing myself to enjoy that decision."],
   ["You caught me. I was trying to read your reaction.","How disappointing. I was hoping you were listening to the point.","I was. I disagree with one part.","Good. That is much more interesting." ]
  ],
  sierra:[
   ["You can like the job and still need a break.","Exactly. I just wish people stopped treating a good paycheck like it answered every question.","Is your next shoot nearby?","Unfortunately. There's sand in my deck sleeves again."],
   ["Does letting them underestimate you help at the table?","Sometimes. Then they see a hand disruption play and suddenly remember my name.","And if they still don't?","Their loss. I still get to play my turn."],
   ["What would your dream booking look like?","An actual day off after it. Maybe a tournament where nobody asks for a photo mid-match.","No glamorous backdrop?","Give me a folding table with enough room for both decks. Luxury."],
   ["Nervous about losing?","About forgetting a play I know. The camera doesn't care about misplays; my opponent does.","You rehearse openings?","On the train. My manager thinks I'm learning lines."],
   ["You could tell them what you care about.","I do. The decent ones remember. The others get one polite correction.","That sounds exhausting.","Sometimes. Then I sit down and shuffle. That part's mine."],
   ["What's the card you never leave behind?","A beat-up Trainer from my first deck. Not worth much on paper.","Why keep it?","Because I won my first match with it. You can't put a price on that." ]
  ],
  hana:[["You took one out of your own deck?","Just for tonight. Wigglytuff will have to manage.","And if it loses?","Then I can blame the table that borrowed my best card. Convenient, right?"],["Did you check the registration?","Twice. The handwriting is terrible.","Who do you think it is?","Yuna says it isn't her. That makes her my first suspect."],["Were you enjoying those five minutes?","I was. The tea was even still hot.","I could come back later.","No, stay. Just help me find the sleeves when the rush starts."]],
  reina:[["Bad shuffle?","Bad list. Shuffling doesn't put Basics into a deck that doesn't have enough.","You already changed it?","Twice. I want another test before I pretend I fixed it."],["Barely. It almost worked, though.","That's what she says about everything.","You watched us?","I could hear her from across the center. So could everyone else."],["You remember which Trainer I played?","I remember mistakes. Especially expensive ones.","That's almost flattering.","Then don't give me the same mistake twice."]],
  shiori:[["He was protecting his Active?","That was part of it. Watch when he finally used it.","He waited for the bench to fill.","Precisely. I wish I had spotted it sooner."],["Can I see it?","Maybe another time. Some of the handwriting is a little painful to read.","Then why carry it?","I keep meaning to put it away. Perhaps today isn't the day."],["What are you reading?","A tournament account from a few years ago. It's rather dramatic.","More dramatic than this café?","Considerably. Nobody in the book has spilled tea yet."]],
  yuna:[["Did it win?","No! But it made an excellent noise when it failed.","You're putting that in the next deck?","Obviously. I can't abandon a card with such stage presence."],["Was the replay that bad?","I missed a knockout. A whole knockout! It was sitting there waving at me.","Are you fixing the line?","Right after I finish being furious at myself for ten minutes."],["Does the deck work?","Define 'work.' It produces a memorable experience.","So not yet.","Rude. Accurate, but rude. Help me shuffle."]],
  akari:[["Lunch?","You were distracted by the snack cart. It's a legitimate variable.","What are the other theories?","One is a bluff. The other makes you look very clever, so I won't spoil it."],["How long did it take?","Long enough for the library to close around me.","Was it worth it?","Ask me after I play ten games. I refuse to celebrate a sample of one."],["Am I on it?","You are in the untitled column.","That sounds ominous.","You keep changing sleeves. I'm waiting until you commit."]],
  camila:[["You'd buy a damaged card?","If it has a good story. And a suitably damaged price.","You always haggle this much?","Only when I think I can win. Which is most days, darling."],["Was the trade unfair?","Very. They didn't know what they had.","You could have taken it.","And I would have had to see them every Saturday. Terrible for business."],["I was trying not to look disappointed.","You nearly succeeded.","Nearly?","Your fingers stopped shuffling. Small detail. Very revealing."]],
  marina:[["How late?","Twenty minutes. The captain said the tide wasn't helping.","Did you miss anything?","Only the quiet part of my morning. I could still use some tea."],["Have you signed it yet?","Not yet. I know, I know.","You brought a pen.","I did. I thought if I brought the pen, the rest might follow."],["Does that change how the ferry runs?","It changes how everyone walks along the dock.","You know the weather that well?","Not well enough to trust it without looking twice."]],
  kaede:[["Was it you?","Of course. But I wanted to see whether they'd ask a second question.","Did they?","Nope. People are disappointingly easy to frighten."],["You beat the score?","Briefly. A kid took it back before I finished my soda.","Going to try again?","I'm deciding whether the soda was the problem."],["Did you tell your opponent?","I almost did. Then I remembered they had a train to catch too.","Will you show me instead?","Only if you're willing to tell me when I'm wrong."]],
  iris:[["Want a hand with the last few?","Sure. Take the one with the green tape. That's the light one.","You say that too quickly.","I said it was light. I didn't say it was small."],["Did she warn you in time?","Just. We moved the boxes before the water reached the bottom step.","How are you repaying her?","Hot noodles. She insists on the expensive broth."],["The players leave that to you?","Most of them. Some stay.","Can I help?","There's a broom behind the counter. You have impeccable timing."]],
  elio:[["Did your cousin mind?","She laughed and gave me a better pen.","So you'll keep the old box?","Of course. It holds the cards I'm not brave enough to trade."],["Did they hand it back?","Yes. They looked surprised.","How did that feel?","A little embarrassing. Then I actually finished the match."],["Did it cost you the game?","One prize card and my dignity.","Going to bench it next time?","Probably. But I'm not taking it out of the deck."]],
  alma:[["Need a hand moving them back?","Yes. Please start with the one wedged against the window.","How do they even manage that?","I think they play a separate game with furniture after midnight."],["Is she coming back?","She was here for breakfast. Stayed an hour longer than usual.","That's good news.","The best part was nobody made a fuss when she arrived."],["Was it under a cup?","Under somebody's deck box, I think.","Could belong to a player.","Then it goes in the lost-and-found tin. Unless the tin charges rent."]],
  nereo:[["Ever needed all of them?","Once. The radio, the light, and a kid's toy Pikachu. Busy night.","A toy Pikachu?","It was crying louder than the ferry horn. The kid, not Pikachu."],["Did you print more?","On heavier paper. The wind is welcome to try again.","What if the schedule changes?","Then I'll be annoyed in heavier paper."],["Because nobody knows what happens next?","Exactly. One minute you're on the right side of the river...","And the next?","You're paying a fare you didn't expect. Awful card. Great game."]],
  teo:[["How did you know it stopped?","A kid in the front row started doing my commentary for me.","Was he any good?","Better than me. I'm considering early retirement."],["You do shout quite a bit.","It's called projecting.","The players can hear you through their sleeves.","Then the acoustic system is excellent."],["Have you tried rehearsing the jokes?","I have. Those are somehow worse.","Maybe improvise fewer of them.","You sound like my editor. Come on, one more."]],
  jun:[["Did you deserve it?","Absolutely. I'd make the same call tomorrow.","Are you keeping the trophy?","It's holding down a stack of unsigned score sheets."],["Was passing actually the plan?","It wasn't the exciting part of the plan.","Did the opponent catch on?","A turn too late. The room has never forgiven me."],["Need a screwdriver?","And a better table. But start with the screwdriver.","Can I help?","If you can hold that corner still for twenty seconds, you're hired."]]
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
 // Keep the explicitly paired character-pack dialogue above. Older supplemental
 // arrays are only fallbacks for supporting NPCs without a direct topic map.
 for(const [id,beats] of Object.entries(extendedTalk)){
  if(!Object.prototype.hasOwnProperty.call(talk,id))talk[id]=beats;
 }
 const flirt={
  laca:["Is the ice-cream debt still payable in actual dates?","I'd like to spend time with you even if I don't owe you anything.","Che. That's a better answer than I expected."],
  barb:["What if I said I came to see you, not the new designs?","Would you believe me if I meant it?","Maybe. Sit down and let me see how long you can keep that up."],
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
  laca:["You really remember that old rematch?","Of course. I've only been keeping the rematch score for years."],
  barb:["Nice to meet you. I made that deck box myself.","You did? Okay, we're definitely talking about how you finished those corners."],
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
      "You make everybody prove they're worth your time?",
      "Only the people who look like they'd enjoy proving me wrong."
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
      "Sounds like you found the words when it mattered.",
      "I almost handed the deck back anyway. But I finished my turn first."
    ],
    [
      "If you drop your deck, I'll help pick it up. I won't play your turns for you.",
      "That's exactly what I want. Someone who laughs with me and lets me make my own calls."
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
      "I like that you remembered rehearsal and still made time to play.",
      "That's why I brought the timer. If I'm late, my drummer will kill me."
    ],
    [
      "Sounds like the stage and your deck are starting to share ideas.",
      "They are! My bandmates keep sneaking Pokémon jokes into the lyrics."
    ],
    [
      "You don't have to prove either one to me.",
      "Then I can just enjoy the song, the cards and the company."
    ],
    [
      "And what if the charity show goes wrong?",
      "Then we'll laugh about it, try again, and I'll still be glad I played."
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
      "Are you sure you're all right leaving next Friday open?",
      "No. That's part of why I want to try it."
    ]
  ],
  "sierra": [
    [
      "That sounds like an annoying deck to play against.",
      "It is. That's the point. I spent weeks tuning it on the train."
    ],
    [
      "You said you were burning your hand too early. Want to try a slower opening?",
      "Yes. I've been rushing the draw because I hate passing with cards in hand."
    ],
    [
      "Do you want me to repeat exactly what that kid played?",
      "Please. I keep hearing that same mistake in my head. Give me a chance to fix it."
    ],
    [
      "I'm glad you kept both things instead of having to pick one.",
      "Turns out I can handle both if I stop letting other people book all my time."
    ],
    [
      "So dinner's on whether or not you make it past the first round?",
      "Exactly. And don't give me that pity smile if I lose. I want a rematch."
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
  // Narration-led legacy chapters are complete scenes. Do not append the old
  // generic two-line moral after a carefully staged final question.
  if(base.some(line=>line.speaker==='Narrator'))return base;
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
