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
