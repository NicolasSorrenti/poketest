'use strict';
// Everyday, low-stakes conversation beats. All are dialogue-only: no stat
// changes, time cost, or save mutations, and no spoilers for story routes.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgEverydayChats=api;
})(typeof window!=='undefined'?window:null,function(){
 const topics={
 "hana": [
  [
   "I accidentally labeled my basil plant 'basilisk.'",
   "Did you fix the label?",
   "No. I'm waiting to see whether it breathes fire."
  ],
  [
   "Someone put a terrible joke in the suggestion box.",
   "Did you laugh?",
   "For five minutes. I'm annoyed at how funny bad jokes are."
  ],
  [
   "My pancakes looked like maps of countries that don't exist.",
   "Did they taste okay?",
   "Fantastic. Breakfast was a journey of discovery."
  ],
  [
   "There's an unclaimed umbrella by the door.",
   "Maybe somebody forgot it.",
   "Or it belongs to the building now. I don't know umbrella law."
  ],
  [
   "You have a button stuck to your sleeve.",
   "Oh! It belongs to a coat I was repairing.",
   "Did you finish the coat?",
   "No, but I made a tiny button collection. Repairs keep becoming crafts.",
   "I think that's how hobbies begin."
  ],
  [
   "Is that a sketchbook?",
   "Yes. I draw people I see on the bus, but only their shoes.",
   "That page has a lot of boots.",
   "Winter is going to be my masterpiece.",
   "I'm looking forward to the summer sandals edition."
  ],
  [
   "I tried learning the harmonica.",
   "How far did you get?",
   "Three notes. The neighbor's dog can already sing along."
  ],
  [
   "I got invited to a costume party and misunderstood the theme.",
   "What did you wear?",
   "Everyone came as movie stars. I came dressed as the night sky."
  ]
 ],
 "reina": [
  [
   "A pigeon stared at me through my window this morning.",
   "What did you do?",
   "Stared back. I lost when it blinked first and flew off."
  ],
  [
   "I bought socks with little smiling strawberries.",
   "That's unexpected.",
   "The strawberries looked happy. What's your problem?"
  ],
  [
   "A stranger asked me to hold their dog for a moment.",
   "And?",
   "The dog fell asleep on my lap. I stayed for twenty minutes."
  ],
  [
   "I cried watching a movie about people fixing an old bicycle.",
   "Was it sad?",
   "It wasn't supposed to be. That's the embarrassing part."
  ],
  [
   "Don't laugh, but I signed up for a pottery class.",
   "That sounds fun.",
   "My cup has one handle shaped like an ear. I'm strangely proud of it.",
   "Does it hold tea?",
   "Mostly. I'm choosing to focus on the artistic achievement."
  ],
  [
   "I'm hiding from someone in a yellow raincoat.",
   "Why?",
   "I told an elderly neighbor I'd help choose curtains. She has brought twelve samples.",
   "Could be worse.",
   "She likes all of them. I am completely out of opinions."
  ],
  [
   "There's a song I only listen to when it rains.",
   "What kind of song?",
   "Old-fashioned, with a piano. It makes walking home feel like a movie."
  ],
  [
   "I went to the aquarium alone last weekend.",
   "Which tank was your favorite?",
   "The jellyfish. Everyone was quiet in there."
  ]
 ],
 "shiori": [
  [
   "I bought a cookbook because I liked its cover.",
   "Have you cooked anything?",
   "Not yet. Every recipe is written as a riddle."
  ],
  [
   "There's a cat outside that looks exactly like the librarian.",
   "Did you tell her?",
   "Absolutely not. I value my borrowing privileges."
  ],
  [
   "I found an old picnic photograph in a secondhand novel.",
   "Do you know the people?",
   "No. But they looked so happy that I kept the photograph safe."
  ],
  [
   "I tried drawing the view from my window.",
   "How did it go?",
   "My trees appear to have elbows. Nature is very forgiving."
  ],
  [
   "There's an old man near my building who feeds a crow every morning.",
   "Does the crow recognize him?",
   "I think so. Yesterday it brought him a blue bottle cap.",
   "Like a thank-you gift?",
   "Perhaps. I hope the crow has a whole collection."
  ],
  [
   "Have you ever listened to a whole album without doing anything else?",
   "Not in a while.",
   "I did last night. I forgot what a luxury that can be.",
   "Was it a good album?",
   "I think so. I was smiling when it ended."
  ],
  [
   "I bought a secondhand telescope.",
   "Have you found any planets?",
   "Mostly chimneys. I live in a very educational neighborhood."
  ],
  [
   "I tried baking a cake for a friend's birthday.",
   "How did it go?",
   "The icing spelled 'Hapy Brithday.' We kept it that way."
  ]
 ],
 "yuna": [
  [
   "I entered a pancake-flipping contest.",
   "How'd it go?",
   "Mine landed on the judge's hat. I got a ribbon for ambition."
  ],
  [
   "I bought a tiny plastic dinosaur from a machine.",
   "What's its name?",
   "Possibly Lizard. That's also what the label says."
  ],
  [
   "I tried learning a magic trick online.",
   "Show me.",
   "Pick a number. Wait, no—I've accidentally learned a sandwich recipe."
  ],
  [
   "There was a little frog on the sidewalk.",
   "What did you do?",
   "Escorted it to the grass like a very important guest."
  ],
  [
   "Look at this photograph. Tell me what you see.",
   "A duck in a shopping cart?",
   "Yes! Everyone else keeps saying it's a loaf of bread.",
   "Why was it in the cart?",
   "That is the mystery of the century."
  ],
  [
   "I thought my apartment was haunted.",
   "What happened?",
   "A mysterious tapping sound every night.",
   "Was it a ghost?",
   "A spoon rolling inside the washing machine. Less exciting, more expensive."
  ],
  [
   "I signed up for a beginner dance class.",
   "How did it go?",
   "I learned the ending before the beginning. Nobody was ready for my entrance."
  ],
  [
   "I found a four-leaf clover yesterday.",
   "Are you saving it?",
   "I gave it to a kid who looked like she really needed some luck."
  ]
 ],
 "akari": [
  [
   "My radio only picks up one station.",
   "Are you returning it?",
   "No. The jazz is excellent. I've become attached to the trumpet solo."
  ],
  [
   "I tried folding a paper crane.",
   "Can I see?",
   "It's somewhere between a crane and an optimistic napkin."
  ],
  [
   "I took the wrong bus on purpose yesterday.",
   "Why?",
   "To see where it ended. It ended near incredible cinnamon rolls."
  ],
  [
   "A child asked me to name a cloud.",
   "What did you choose?",
   "Barbara. The child insisted it was clearly a Kevin."
  ],
  [
   "This is going to sound strange. I like washing dishes.",
   "Because it's productive?",
   "No. Because I can listen to music and think about absolutely nothing.",
   "That is surprising.",
   "It's restful. Please don't turn it into a theory."
  ],
  [
   "I bought mystery-flavor candies.",
   "Did you like them?",
   "One tasted like lemon. One tasted like the idea of a cupboard.",
   "You're making that up.",
   "I would love to be making it up. Try one."
  ],
  [
   "A sparrow built a nest outside my window.",
   "Do you watch it?",
   "Every morning. The parents have a very demanding schedule."
  ],
  [
   "I watched a documentary about restoring old violins.",
   "Do you play?",
   "Not at all. I just liked hearing them find their voices again."
  ]
 ],
 "camila": [
  [
   "The grocer sold me a bag of terribly ugly pears.",
   "Were they any good?",
   "Delicious. I owe those pears an apology."
  ],
  [
   "I tried a new board game with friends.",
   "Did you win?",
   "No. I accidentally became mayor and spent the treasury on fountains."
  ],
  [
   "My pen exploded halfway through a birthday card.",
   "Did you get a new card?",
   "I finished with 'have a dramatic birthday' and drew fireworks."
  ],
  [
   "I bought a chipped cup with a smug goose painted on it.",
   "Does the goose have a name?",
   "Sir Honkington. He looks down on all my other mugs."
  ],
  [
   "I'm on my way to return a borrowed casserole dish.",
   "Empty?",
   "Of course not. It's filled with cookies.",
   "That seems generous.",
   "The original casserole was terrible. This is my diplomatic apology."
  ],
  [
   "There was a woman playing violin in the courtyard.",
   "Did you stop to listen?",
   "Yes. She missed one note and made the funniest face at herself.",
   "Did anyone else notice?",
   "Nobody. I felt like I'd been trusted with a secret."
  ],
  [
   "I tried an escape room.",
   "Did you get out?",
   "Only because someone accidentally leaned on the right wall."
  ],
  [
   "My grandmother used to make orange peel candy.",
   "Do you know how?",
   "I found the recipe and tried it. The whole apartment smelled like childhood."
  ]
 ],
 "marina": [
  [
   "I painted a bowl of oranges yesterday.",
   "How did it turn out?",
   "Like a gathering of worried little suns."
  ],
  [
   "Somebody swapped grocery bags with me by accident.",
   "What did you get?",
   "Four limes, birthday balloons, and a candle. I needed bread."
  ],
  [
   "I rode a bicycle with one of those tiny bells.",
   "Did you ring it?",
   "Accidentally, at every corner. One man waved like we were friends."
  ],
  [
   "I found a snow globe with a beach inside.",
   "Snow on palm trees?",
   "Exactly. I bought it because it made no sense."
  ],
  [
   "I have a confession: I don't know how to whistle.",
   "Not even a little?",
   "I can make the wind sound, but not a note.",
   "Want me to teach you?",
   "Yes, somewhere nobody can hear my first attempt."
  ],
  [
   "My neighbor started learning the trumpet.",
   "Is he any good?",
   "He's improved from 'frightened elephant' to 'optimistic elephant.'",
   "You sound fond of him.",
   "He practices every day. I admire that."
  ],
  [
   "I found a broken garden gnome by the bins.",
   "What was wrong with it?",
   "One ear was missing. I repaired it with modeling clay."
  ],
  [
   "I spent an afternoon remembering a childhood lullaby.",
   "Did you remember it?",
   "Only the last line. My mother sang the rest when I called."
  ]
 ],
 "kaede": [
  [
   "I bought a keychain shaped like a sad potato.",
   "Why a sad potato?",
   "The happy potato cost more. This one needed a home."
  ],
  [
   "I accidentally sent someone to a bakery while giving directions.",
   "Were they angry?",
   "They came back with bread and thanked me. I'm an accidental tour guide."
  ],
  [
   "I once cut my own hair.",
   "How bad was it?",
   "The hairdresser asked if I'd been in a wind tunnel."
  ],
  [
   "A cat fell asleep on my jacket at the park.",
   "So you waited?",
   "An hour. Then another cat arrived and I surrendered the jacket."
  ],
  [
   "I went to a miniature railway museum.",
   "That sounds unexpectedly wholesome.",
   "The tiny stations had tiny benches. I couldn't leave.",
   "Did you buy a souvenir?",
   "A tiny bench. Obviously."
  ],
  [
   "Have you ever ruined a surprise party by arriving early?",
   "You did that?",
   "I came to decorate. The guest of honor was already there.",
   "What happened?",
   "We pretended it was an elaborate ordinary Tuesday."
  ],
  [
   "The woman downstairs keeps giving me homemade jam.",
   "Do you know her?",
   "Barely. I leave her empty jars and drawings in return."
  ],
  [
   "I found an old photo of myself with a terrible haircut.",
   "Was it that bad?",
   "A triangle. My head was a triangle."
  ]
 ],
 "elio": [
  [
   "My new shoes squeak with every step.",
   "Is that annoying?",
   "Actually, it's the most confident entrance I've ever made."
  ],
  [
   "I lost my shopping list.",
   "Did you remember what you needed?",
   "I bought soap and a pear. Pretty sure I went out for batteries."
  ],
  [
   "I baked cookies for the first time.",
   "Can I try one?",
   "Sure, but soften it in tea first. I value your teeth."
  ],
  [
   "I heard a street musician playing a song I knew.",
   "Did you stop?",
   "For the whole song. It was nice not having to hurry."
  ]
 ],
 "alma": [
  [
   "My neighbor lent me a book and said I wouldn't like it.",
   "Did you?",
   "Stayed up half the night reading it. Don't tell my neighbor yet."
  ],
  [
   "I went to a pottery class once.",
   "What did you make?",
   "A very questionable bowl. It's excellent at holding keys."
  ],
  [
   "A dog visits my building every morning.",
   "Does it have a name?",
   "I call it Chairman. It only acknowledges me when I have a biscuit."
  ],
  [
   "I saw a children's play with a cardboard dragon.",
   "Was it good?",
   "Its head fell off and the actors kept going. Best show all year."
  ]
 ],
 "nereo": [
  [
   "My houseplant is growing sideways.",
   "Toward the window?",
   "Toward a picture of a sandwich. I think it's hungry."
  ],
  [
   "I wrote 'banana' on a crossword clue meaning 'regret.'",
   "Why banana?",
   "I'd skipped lunch. Apparently every answer was banana."
  ],
  [
   "A kid put a smiling-star sticker on my toolbox.",
   "Did you keep it?",
   "Of course. Repairs feel less miserable with a celebrity present."
  ],
  [
   "I found an old cassette tape that still plays.",
   "What's on it?",
   "An hour of someone identifying bird songs. I listened to all of it."
  ]
 ],
 "elena": [
  [
   "I bought a mushroom-shaped mug.",
   "Really?",
   "It's ridiculous. I love it. It does not leave my apartment."
  ],
  [
   "A sudden shower caught me without an umbrella.",
   "What did you do?",
   "Ran through a puddle in very expensive shoes. Do not tell anyone."
  ],
  [
   "A friend persuaded me to sing karaoke.",
   "How was it?",
   "Dreadful. Everyone was kind enough that I've agreed to go again."
  ],
  [
   "My fridge magnet is a dancing carrot saying 'rooting for you.'",
   "Is that really yours?",
   "Yes. Please allow me one dreadful pun in private."
  ]
 ],
 "jinx": [
  [
   "I've spent twenty minutes trying to fold a paper frog.",
   "Does it jump?",
   "It falls over with remarkable dignity. Want to try?"
  ],
  [
   "I bought flower seeds but forgot what kind.",
   "What's the plan?",
   "Plant them. Wait. Pretend the surprise was intentional."
  ],
  [
   "I made a playlist for a very quiet afternoon.",
   "What's on it?",
   "Piano, soft rain, and nothing anyone can shout over."
  ],
  [
   "My phone keeps changing 'okay' to 'okra.'",
   "Why not fix it?",
   "I've committed to the vegetable. My friends are concerned."
  ]
 ],
 "luna": [
  [
   "I learned to make dumplings this week.",
   "Any success?",
   "They came out beautifully. I saved two in case you passed by."
  ],
  [
   "The library gave away old magazines.",
   "Find anything interesting?",
   "An issue on tiny houses. Some have staircases in cupboards."
  ],
  [
   "I beat a rhythm game on the hardest setting.",
   "Seriously?",
   "Three times. I just like the music, so I don't mention it much."
  ],
  [
   "I tried a new hot sauce yesterday.",
   "Too spicy?",
   "Not at all. I bought another bottle. You look surprised."
  ]
 ],
 "rina": [
  [
   "I bought socks covered in little bananas.",
   "Why bananas?",
   "They looked cheerful, and I firmly support cheerful socks."
  ],
  [
   "I went to the market for one apple.",
   "Did you get it?",
   "No. Three peaches and an antique spoon. I forgot the apple."
  ],
  [
   "I made pasta sauce with a blender.",
   "How was it?",
   "Good! The ceiling got to taste it, too."
  ],
  [
   "I found a note in my coat that says 'remember the nice thing.'",
   "Did you remember?",
   "No. Now I have to find a new nice thing worthy of the note."
  ]
 ],
 "sierra": [
  [
   "I completed a thousand-piece puzzle yesterday.",
   "Every piece?",
   "The last one was in my sleeve. I framed the puzzle as evidence."
  ],
  [
   "I photographed a boring sidewalk.",
   "Why?",
   "A bicycle's shadow looked exactly like a giraffe."
  ],
  [
   "I invented a dinner recipe by accident.",
   "Any good?",
   "Spicy orange rice. Better if you leave out the orange juice."
  ],
  [
   "Someone gave me a cactus.",
   "Does it have a name?",
   "Professor Prickles. He silently judges my windowsill."
  ]
 ],
 "sol": [
  [
   "I made a paper kite and launched it yesterday.",
   "Did it fly?",
   "For four glorious seconds. Now the bush has a collection."
  ],
  [
   "I found a scarf embroidered with ducks wearing hats.",
   "You bought it?",
   "Obviously. Every outfit deserves more ducks."
  ],
  [
   "I followed a recipe for a fancy dessert.",
   "How was it?",
   "I invented dessert soup. A brave, terrible new genre."
  ],
  [
   "Someone taught me a handshake and I forgot the ending.",
   "What happens instead?",
   "Two claps, a spin, and complete social panic. Help me invent an ending."
  ]
 ],
 "laca": [
  [
   "There's a bakery making pastries shaped like moons.",
   "Have you tried them?",
   "Bought two. One disappeared on the walk here. Delicious mystery."
  ],
  [
   "I found a bookmark with a fox drawn on it.",
   "Where?",
   "Inside a secondhand book. Now I like the book even more."
  ],
  [
   "A paper airplane landed beside me earlier.",
   "What did you do?",
   "Folded it a little better and sent it back into the world."
  ],
  [
   "Someone drew a smiling sun in chalk on the sidewalk.",
   "Did you photograph it?",
   "Yes. I like keeping little things before the rain takes them."
  ]
 ],
 "jun": [
  [
   "I tried fixing a squeaky door hinge this morning.",
   "Did it work?",
   "The door is silent. The chair started squeaking. I think noise is following me."
  ],
  [
   "A child asked me which ice cream flavor was best.",
   "What did you recommend?",
   "Pistachio. She looked at me like I had recommended a tax return."
  ],
  [
   "I bought a houseplant and named it Tuesday.",
   "Why Tuesday?",
   "Because it arrived on Friday. I wanted it to have a little mystery."
  ],
  [
   "I found an old postcard with no address on it.",
   "What did it say?",
   "Just 'Wish you were here.' I hope somebody eventually was."
  ],
  [
   "I volunteered to judge a neighborhood pie contest.",
   "Why did they ask you?",
   "Apparently I look like someone who knows when a crust is done.",
   "Do you?",
   "Not remotely. I ate four slices and declared a tie."
  ],
  [
   "I got lost in a botanical garden.",
   "Isn't there a map?",
   "There was. I was looking at flowers and forgot to read it.",
   "Did you mind?",
   "Not even slightly. I found the rose garden by accident."
  ],
  [
   "A friend left a rubber duck on my desk.",
   "Did you keep it?",
   "It has a tiny detective hat. Of course I kept it."
  ],
  [
   "My mother sent me a recipe with no measurements.",
   "Did you make it?",
   "I tried. She said I'd know when it was enough. I didn't."
  ]
 ],
 "teo": [
  [
   "I ordered an enormous sandwich by mistake.",
   "How enormous?",
   "It came on a tray normally used for birthday cakes."
  ],
  [
   "My neighbor keeps singing the same line of a song.",
   "Do you know the rest?",
   "I do now. I learned it just to end the cliffhanger."
  ],
  [
   "I bought a little alarm clock shaped like a rocket.",
   "Does it work?",
   "It launches me out of bed, usually in a state of panic."
  ],
  [
   "I tried drawing my own portrait.",
   "Was it recognizable?",
   "People guessed three different cousins. I don't have cousins."
  ],
  [
   "My neighbor thinks I have a pet parrot.",
   "Do you?",
   "No. I practice funny voices while cooking.",
   "What does your neighbor think it says?",
   "Mostly 'where is the salt?' I should explain someday."
  ],
  [
   "I went to an amateur poetry night.",
   "Did you read something?",
   "A poem about the loneliness of the last slice of pizza.",
   "How was it received?",
   "Someone cried laughing. I'm counting that as success."
  ],
  [
   "I've started taking photos of funny-shaped clouds.",
   "Any favorites?",
   "One looked exactly like a giant shoe. Very fashionable."
  ],
  [
   "I helped my uncle move a sofa.",
   "Did it fit through the door?",
   "After carrying it up four flights, we learned it didn't."
  ]
 ],
 "iris": [
  [
   "I found a very tiny knitted hat in the street.",
   "For a doll?",
   "I hope so. I'd hate to meet the person who lost it."
  ],
  [
   "I entered a bread-baking competition by accident.",
   "How do you enter by accident?",
   "I signed the wrong sheet. Finished third with store-bought rolls."
  ],
  [
   "I tried to teach myself a card trick.",
   "Any luck?",
   "I can make one coin disappear. It turned up inside a shoe."
  ],
  [
   "There's a small dog who waits at the same corner every day.",
   "Do you know its name?",
   "Not yet. I call it Captain. It looks like it has a schedule."
  ],
  [
   "I promised to water a friend's flowers.",
   "How many?",
   "She said 'a few.' There are thirty-seven.",
   "Will you manage?",
   "They have names now. I can't let them down."
  ],
  [
   "I tried keeping a diary for a month.",
   "Did you stick with it?",
   "Mostly. Several entries say 'ate noodles, felt peaceful.'",
   "Seems like a good month.",
   "It was. That's what surprised me."
  ],
  [
   "A stranger gave me a paper crane at the bus stop.",
   "Why?",
   "The bus was late, so she taught everyone in the queue to fold one."
  ],
  [
   "I found a photo booth that still prints old-fashioned strips.",
   "Did you use it?",
   "Yes. Every photo shows me laughing at the previous one."
  ]
 ],
 "barb": [
  [
   "I found a ceramic frog at a street market.",
   "Did you buy it?",
   "Yes. It looks deeply unimpressed with my life choices."
  ],
  [
   "I went to buy bread and came home with three lemons.",
   "No bread?",
   "No bread. But I have big plans for lemonade."
  ],
  [
   "A stranger complimented my handwriting.",
   "Is it especially neat?",
   "Absolutely not. I think they mistook it for a secret code."
  ],
  [
   "I spent last night trying to solve a crossword.",
   "Did you finish it?",
   "Almost. One clue was 'four-letter word for calm.' I wrote 'nap.'"
  ]
 ]
};
 function hash(value){
  let h=2166136261;
  for(const ch of String(value))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;
  return h;
 }
 function shouldUse(state,npc){
  const day=Number(state?.day)||1,slot=Number(state?.slot)||0;
  return !!topics[npc]&&(day+slot+hash(npc))%4!==0;
 }
 function select(state,npc){
  const rows=topics[npc];if(!rows?.length)return null;
  const day=Number(state?.day)||1,slot=Number(state?.slot)||0;
  // Seven advances to a different topic every day, cycling all four.
  const index=(day*7+slot*3+hash(npc))%rows.length;
  return rows[index].map((text,i)=>({speaker:i%2?'Protagonist':npc,text}));
 }
 function validate(){
  const issues=[];
  for(const [npc,rows] of Object.entries(topics)){
   if(rows.length<4)issues.push(npc+': too few scenes');
   if(new Set(rows.map(r=>r[0])).size!==rows.length)issues.push(npc+': duplicate opener');
   if(rows.some(r=>r.length!==3||r.some(s=>typeof s!=='string'||!s.trim())))issues.push(npc+': malformed dialogue');
  }
  return issues;
 }
 return Object.freeze({topics,shouldUse,select,validate});
});
