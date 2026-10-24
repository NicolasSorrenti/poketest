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
  ],
  [
   "I took a day off and spent it looking for a place to eat breakfast.",
   "Did you find one?",
   "Eventually. A tiny bakery with one table and a radio playing old songs.",
   "Sounds worth the trip.",
   "It was. I stayed long enough to watch the whole street wake up."
  ],
  [
   "Alma gave me a recipe for vegetable soup.",
   "Did you make it?",
   "Yes. I got distracted and accidentally made enough for eight people.",
   "What happened to the rest?",
   "I shared it with the neighbors. Somebody returned the container full of cookies."
  ],
  [
   "My little cousin has decided I'm an expert at insects.",
   "Why you?",
   "I once moved a beetle off a windowsill. Apparently that was my qualification."
  ],
  [
   "There was a thunderstorm last night, so I built a blanket nest on my couch.",
   "All by yourself?",
   "With three pillows and a very judgmental stuffed bear. Five stars. Highly recommend."
  ],
  [
   "I found a letter I'd written to my future self at thirteen.",
   "Was it embarrassing?",
   "Terribly. It asked whether I'd learned to dance.",
   "Well, have you?",
   "Not well. But I danced around the kitchen after reading it."
  ],
  [
   "I tried ordering lunch in a language I'm learning.",
   "How did it go?",
   "I asked for a spoon instead of a sandwich. The waiter was very kind."
  ],
  [
   "Two strangers started debating which dog on the street had the best name.",
   "Did you join in?",
   "I nominated 'Professor Waffles.' Neither dog was named that.",
   "So who won?",
   "A tiny terrier named Biscuit. Fair result."
  ],
  [
   "I bought a disposable camera for a weekend.",
   "Did the pictures turn out?",
   "Most of them are blurry. One perfectly caught a stranger's dog yawning.",
   "A masterpiece.",
   "I'm considering getting it framed."
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
  ],
  [
   "I promised my grandmother I'd learn one of her recipes.",
   "What did she teach you?",
   "How to make dumplings. Mine looked like exhausted little pillows.",
   "Did she approve?",
   "She ate six and asked when I was coming back. That's an approval."
  ],
  [
   "I went to an open-air concert without checking who was playing.",
   "Was the music good?",
   "Very. I didn't recognize a single song.",
   "Did that bother you?",
   "No. It was nice to just be in the crowd."
  ],
  [
   "There's an elderly cat that lives near my bus stop.",
   "Does it like you?",
   "It ignores me unless I sit on the curb. Then it climbs onto my shoe."
  ],
  [
   "I tried ice skating last winter.",
   "Were you good?",
   "I spent the first ten minutes holding the wall. Don't imagine anything heroic."
  ],
  [
   "My sister asked me to help decorate her birthday cake.",
   "What did you put on it?",
   "Little pink flowers. She said I had a steady hand.",
   "And?",
   "I liked being useful for something completely silly."
  ],
  [
   "I borrowed a mystery novel and guessed the ending wrong.",
   "Did you finish it?",
   "In one night. Then I reread the first chapter to see what I'd missed."
  ],
  [
   "Someone gave me a daisy while I was waiting in line.",
   "Who?",
   "A toddler who was handing them out to everyone.",
   "Did you keep it?",
   "Pressed it inside a book. I don't know why you're smiling."
  ],
  [
   "I've been practicing a song on an old keyboard.",
   "Can you play it yet?",
   "The beginning. The middle is a disaster.",
   "Play it for me sometime?",
   "Maybe. When I can survive the middle without laughing."
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
  ],
  [
   "I took a different route home and discovered a courtyard full of lanterns.",
   "Were they for a festival?",
   "No. Someone said the residents simply liked how they looked at night.",
   "That's a good enough reason.",
   "Exactly. Not everything needs an occasion."
  ],
  [
   "My neighbor taught me how to make paper flowers.",
   "Did yours look real?",
   "No. Mine look like creatures from a very polite alien planet.",
   "Would you make more?",
   "Yes. They look cheerful on the windowsill."
  ],
  [
   "I listened to an audiobook while walking and missed my turn.",
   "How far did you go?",
   "All the way to the river. I decided the ending deserved a view."
  ],
  [
   "I found a chess piece on the pavement.",
   "Which piece?",
   "A knight. I've placed it beside my kettle for company."
  ],
  [
   "I helped a child choose a book at the library.",
   "What did they choose?",
   "A book about whales. Then they taught me three whale facts.",
   "Did you know them already?",
   "Only one. It was a very successful exchange."
  ],
  [
   "Someone in the apartment above is learning the cello.",
   "Is the noise distracting?",
   "Not really. I can hear a little more of the melody each evening."
  ],
  [
   "I have an embarrassing weakness for brightly colored stationery.",
   "How bright?",
   "My new notebook is almost fluorescent.",
   "I thought you'd choose something plain.",
   "Apparently my inner self is a sunset-colored highlighter."
  ],
  [
   "I tried watching a silent film last weekend.",
   "Did you like it?",
   "I laughed so hard at one scene that I had to rewind.",
   "Even without dialogue?",
   "Especially without it. The actor's eyebrows did all the talking."
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
  ],
  [
   "I accidentally joined a neighborhood cleanup.",
   "How do you accidentally do that?",
   "I thought people were lining up for free ice cream.",
   "Did you stay?",
   "Of course. We cleaned the park and they gave us ice cream afterward."
  ],
  [
   "I have discovered I am excellent at parallel parking a shopping cart.",
   "That isn't a sport.",
   "Not with that attitude. Watch this.",
   "You missed the space.",
   "The cart has rejected my artistic vision."
  ],
  [
   "Teo dared me to write a serious poem.",
   "What did you write?",
   "Four lines about a very lonely sock.",
   "Did he like it?",
   "He read it in his announcer voice. We both nearly cried laughing."
  ],
  [
   "I babysat my aunt's rabbit yesterday.",
   "What was its name?",
   "Emperor.",
   "That sounds intimidating.",
   "It spent six hours afraid of a lettuce leaf."
  ],
  [
   "I went to a museum and expected to be bored.",
   "And?",
   "There was a whole room of mechanical birds. I stayed until closing."
  ],
  [
   "I tried helping a friend move house.",
   "Were you useful?",
   "I labeled every box. Unfortunately, they were all labeled 'treasure.'"
  ],
  [
   "A girl at the bus stop told me she was nervous about her first day at a new school.",
   "What did you tell her?",
   "That being new means nobody knows your bad jokes yet.",
   "Did she laugh?",
   "A little. Then she told me one. It was awful. I loved it."
  ],
  [
   "I've been trying to cook one meal without checking my phone.",
   "How's that going?",
   "The noodles are getting better. The silence is the hard part."
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
  ],
  [
   "I spent an afternoon trying to grow crystals from a kit.",
   "Did it work?",
   "Technically. I made a tiny blue lump.",
   "Did you keep it?",
   "It's on my desk. It's a very determined blue lump."
  ],
  [
   "A busker was playing violin outside the station.",
   "Did you stop?",
   "I had somewhere to be. I stopped anyway.",
   "Regrets?",
   "None. I missed the early bus, not the important thing."
  ],
  [
   "I found a handwritten cake recipe in a used book.",
   "Can you read it?",
   "Almost. One ingredient looks like 'love' or 'clove.'",
   "Which did you use?",
   "Both. It turned out surprisingly well."
  ],
  [
   "I tried an art class with no instructions.",
   "How did that feel?",
   "Uncomfortable for about ten minutes. Then I started painting a giraffe."
  ],
  [
   "A neighbor invited me over to meet her new puppy.",
   "And?",
   "It fell asleep on my lap. I forgot about the book I brought.",
   "Sounds like a good afternoon.",
   "It was. I think I needed an afternoon that wasn't useful."
  ],
  [
   "I've been learning the names of flowers on my walk.",
   "Favorite so far?",
   "Forget-me-nots. An unusually clear request from a plant."
  ],
  [
   "I made a little bird feeder from a cardboard tube.",
   "Any visitors?",
   "One sparrow and a very ambitious squirrel. The squirrel won."
  ],
  [
   "I went to a cooking demonstration by mistake.",
   "How?",
   "I thought it was a lecture on spices. It was. They just made lunch afterward.",
   "Better than expected?",
   "Significantly. The sample was enormous."
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
  ],
  [
   "My aunt taught me a card game with absolutely ridiculous rules.",
   "How ridiculous?",
   "The winner has to do the dishes.",
   "So you lost on purpose?",
   "I tried. My aunt has been perfecting her losing strategy for forty years."
  ],
  [
   "I visited a tiny town with a clock that chimes the wrong hour.",
   "Does nobody fix it?",
   "They like it that way. The baker says it makes every afternoon unpredictable."
  ],
  [
   "I lost an earring in the lining of my coat.",
   "Did you find it?",
   "Three days later. Along with a receipt and a mint.",
   "A treasure hunt.",
   "My coat apparently leads a separate life."
  ],
  [
   "I went to the theater with no idea what the play was about.",
   "Was it good?",
   "Funny and sad and completely impossible to explain.",
   "Do you recommend it?",
   "Absolutely. I'd take you, and still refuse to explain it."
  ],
  [
   "A little kid tried selling me a leaf at the park.",
   "Did you buy it?",
   "For one compliment. She said I had very shiny shoes.",
   "Fair price?",
   "A bargain. The leaf is on my fridge."
  ],
  [
   "I've started learning a few phrases in another language.",
   "For business?",
   "For a song I like. Not everything needs to be useful."
  ],
  [
   "I found a bakery that gives leftover pastries to the shelter.",
   "Did you buy anything?",
   "Yes, and offered to help carry the boxes afterward. I was late for nothing important."
  ],
  [
   "I tried to teach my niece a magic trick.",
   "Did it work?",
   "She spotted the secret instantly, then promised not to tell anyone.",
   "Can you trust her?",
   "Only if I pay her in chocolate."
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
  ],
  [
   "I spent a rainy afternoon in a greenhouse.",
   "What was it like?",
   "Warm, quiet, and full of plants taller than me.",
   "Did you buy anything?",
   "A tiny fern. It's doing better than my cooking."
  ],
  [
   "Nereo taught me a trick for repairing a squeaky gate.",
   "Did it work?",
   "Yes. Now I miss the noise a little. It used to greet me every morning."
  ],
  [
   "I keep a postcard from my grandmother on the fridge.",
   "What's on it?",
   "A badly drawn sailboat. She was never very good at drawing.",
   "Why keep it there?",
   "Because she was always happy when she tried."
  ],
  [
   "Someone asked me to photograph their dog by the river.",
   "Did it pose?",
   "It sat perfectly still until I raised the camera. Then it sneezed."
  ],
  [
   "I tried going a whole Sunday without making plans.",
   "How did it go?",
   "I had tea, read two chapters, and watched clouds.",
   "Did you get bored?",
   "Yes, for a moment. Then it felt lovely."
  ],
  [
   "A friend invited me to watch a meteor shower.",
   "Did you see any?",
   "Just one. We shouted so loudly we frightened ourselves."
  ],
  [
   "I made a little paper boat and put it in a puddle.",
   "Did it float?",
   "For a while. A passing bicycle created the great flood."
  ],
  [
   "I saw an old couple dancing beside a street musician.",
   "Did you watch?",
   "For one song. They looked like they'd danced that way for years."
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
  ],
  [
   "I accidentally went to a knitting club.",
   "How do you accidentally join one?",
   "I followed a sign for free tea.",
   "Did you stay?",
   "Yes. I made a scarf long enough for half the table."
  ],
  [
   "I bought a notebook and started writing down places I liked.",
   "Travel plans?",
   "No. Tiny places. A bench with shade, a quiet stairwell, a shop with friendly lights."
  ],
  [
   "A woman on the train asked whether I could hold her baby for a second.",
   "Could you?",
   "No, I held her groceries instead. I was terrified of dropping either."
  ],
  [
   "I learned how to make fried rice from a neighbor.",
   "What was the secret?",
   "Stop stirring it every two seconds. Apparently patience is edible."
  ],
  [
   "I found a little courtyard full of cats.",
   "Were they friendly?",
   "One sat next to me. The others observed from management.",
   "Did you go back?",
   "Of course. I need to file my weekly report."
  ],
  [
   "I tried to repair an old music player.",
   "Did you fix it?",
   "It plays tapes again, but only if I tap the side twice.",
   "A personality quirk.",
   "That's what I'm calling it."
  ],
  [
   "A friend asked me to help choose a birthday card.",
   "What did you pick?",
   "The plainest one. We spent an hour writing something that actually mattered."
  ],
  [
   "I keep a little stone from a beach in my coat pocket.",
   "Why?",
   "I picked it up on a good day. It's silly, but I like remembering it."
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
  ],
  [
   "My new shoes have stopped squeaking.",
   "Are you happy about that?",
   "Actually, I miss the noise. It was like having an entrance theme.",
   "Could you make one yourself?",
   "Maybe. I'll need something heroic but not too loud."
  ],
  [
   "I went to a beginner cooking class.",
   "What did you make?",
   "A beautiful omelet that stuck to the pan.",
   "At least you learned something.",
   "That a spatula can have personal enemies."
  ],
  [
   "I tried a trivia quiz about sea creatures.",
   "How did you do?",
   "I knew every octopus question. It may be my calling."
  ],
  [
   "My neighbor gave me an old lamp.",
   "Does it work?",
   "Yes, but the shade has little stars punched in it. My ceiling looks magical."
  ],
  [
   "A neighbor asked me to water her balcony garden.",
   "Did you manage?",
   "Mostly. Her tomato plants are enormous.",
   "You sound proud.",
   "I am. She gave me two tomatoes as a thank-you. I took photos."
  ],
  [
   "I found my grandfather's old radio in a closet.",
   "Does it still work?",
   "Only when the antenna points toward the ceiling.",
   "And what do you hear?",
   "A station playing songs he used to hum. I sat there for a while."
  ],
  [
   "I ordered a drink I couldn't pronounce.",
   "What did you get?",
   "Something pink with mint leaves.",
   "Did you like it?",
   "A lot. I'm ordering by accident more often."
  ],
  [
   "An elderly woman asked me to take her picture beside a mural.",
   "Did it turn out well?",
   "She said I made her look like a movie star.",
   "Maybe you did.",
   "I think the mural helped. She promised to send it to her sister."
  ],
  [
   "I joined a walk through a historical neighborhood.",
   "Learn anything?",
   "The oldest building used to be a bakery. I liked that part."
  ],
  [
   "I spent an evening listening to records with my cousin.",
   "What did you play?",
   "Old songs from family parties. We remembered every chorus."
  ],
  [
   "I'm teaching myself to juggle three oranges.",
   "How many can you catch?",
   "One reliably. Two if I stop trying to look cool."
  ],
  [
   "I painted a little wooden birdhouse.",
   "Do birds use it?",
   "Not yet. A spider has moved in. Someone likes my house."
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
  ],
  [
   "I've been taking a drawing class after hours.",
   "What do you draw?",
   "Mostly fruit. My pears look like worried little people.",
   "Are you enjoying it?",
   "Immensely. Nobody asks the pears to hurry."
  ],
  [
   "A regular left a handwritten poem for the cleaning staff.",
   "Was it good?",
   "Terrible rhyme, lovely gesture. We put it on the wall.",
   "Do people read it?",
   "Every day. Someone even added a tiny illustration."
  ],
  [
   "I tried roller skating again after twenty years.",
   "Did it come back to you?",
   "My knees remembered something my feet had forgotten."
  ],
  [
   "My friend sent me a photo of a very old tree.",
   "What's special about it?",
   "We used to hide notes there when we were children. It is still standing."
  ],
  [
   "I found the scarf I thought I'd lost years ago.",
   "Where was it?",
   "At the bottom of a suitcase, wrapped around a postcard.",
   "From somewhere special?",
   "A trip with old friends. I wore it all afternoon."
  ],
  [
   "There was a handwritten thank-you note slipped under my door.",
   "For what?",
   "Apparently I helped someone on a very bad day.",
   "Do you remember?",
   "Not really. That's what makes it so lovely."
  ],
  [
   "An old school friend called out of nowhere.",
   "How long had it been?",
   "Almost a decade. We spoke for two hours.",
   "Was it awkward?",
   "Only for the first minute. Then we were teenagers again."
  ],
  [
   "I watched the sunrise from the roof this morning.",
   "Couldn't sleep?",
   "No, I woke early and decided the sky deserved an audience.",
   "Was it beautiful?",
   "Very. And nobody asked me for a receipt."
  ],
  [
   "I joined a group learning traditional dances.",
   "Do you know the steps?",
   "Some. The instructor says enthusiasm counts for the rest."
  ],
  [
   "I finally visited a museum I've lived near for years.",
   "Any surprises?",
   "A room full of antique toys. I spent most of my time there."
  ],
  [
   "I baked a chocolate cake for no special occasion.",
   "Why not wait for a celebration?",
   "I think Tuesday deserves cake every now and then."
  ],
  [
   "My nephew asked if adults ever get scared.",
   "What did you say?",
   "Of course. We just get better at choosing who to tell."
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
  ],
  [
   "I bought an old record player at a yard sale.",
   "Does it work?",
   "Only one speaker, but the music sounds like it's coming from another decade.",
   "What records do you have?",
   "Two jazz albums and a mystery record labeled 'Dad's favorite.'"
  ],
  [
   "My niece asked me to teach her to skip stones.",
   "How did that go?",
   "She got six skips on her second try.",
   "And you?",
   "Three. She says I can practice with her next weekend."
  ],
  [
   "I tried making homemade lemonade.",
   "Was it good?",
   "It was good until I added salt instead of sugar."
  ],
  [
   "There's a squirrel outside my window every morning.",
   "Does it visit you?",
   "It has a favorite branch. I feel rude if I don't say hello."
  ],
  [
   "I went fishing with an old friend and caught absolutely nothing.",
   "Bad day?",
   "Best one I've had in weeks. We talked until sunset.",
   "About what?",
   "Everything and nothing. That's why I went."
  ],
  [
   "I found a postcard I'd never mailed.",
   "Where was it supposed to go?",
   "To my brother, years ago. It says 'wish you were here.'",
   "Are you sending it?",
   "I think I'll hand it to him myself and see if he laughs."
  ],
  [
   "A woman at the market taught me to pick ripe peaches.",
   "What's the trick?",
   "Smell them. I'd been buying fruit like a confused mechanic.",
   "Did it work?",
   "Best peach of my life. Don't make that dramatic."
  ],
  [
   "I repaired an old lamp for a neighbor.",
   "Was she happy?",
   "She turned it on and started crying.",
   "Why?",
   "It belonged to her father. I'm glad I fixed it."
  ],
  [
   "I tried to cook rice without a timer.",
   "How did it go?",
   "Crunchy on top, mysterious on the bottom. Never again."
  ],
  [
   "There's a stray dog that watches the morning ferry.",
   "Does it get on?",
   "No. It sees everyone off, then goes back to its bench."
  ],
  [
   "My niece made me a friendship bracelet.",
   "Are you wearing it?",
   "Under my sleeve. It's brighter than everything else I own."
  ],
  [
   "I found a place that sells homemade ice pops.",
   "Favorite flavor?",
   "Lemon. They're too sour. I buy one every week."
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
  ],
  [
   "I found an old tin of watercolor paints.",
   "Are you going to use them?",
   "I painted the view from my window. It looks almost nothing like it.",
   "Does that bother you?",
   "Surprisingly, no. I rather like the purple buildings."
  ],
  [
   "I went to a neighborhood fair and won a stuffed rabbit.",
   "How did you win?",
   "By throwing rings at bottles. I didn't think I could.",
   "Where's the rabbit now?",
   "On my sofa. I have named him Sir Percival."
  ],
  [
   "I have never been very good at telling jokes.",
   "Want to try one?",
   "What do you call a fish with no eyes? Fsh.",
   "That's terrible.",
   "I know. I've been looking forward to telling someone all week."
  ],
  [
   "I tried making soup without a recipe.",
   "How did it go?",
   "Quite well. The second bowl was better because I stopped worrying."
  ],
  [
   "A friend took me to an outdoor film screening.",
   "Did you enjoy it?",
   "I brought a blanket; she brought popcorn. Neither checked the weather.",
   "What happened?",
   "Rain during the final scene. We stayed through the credits."
  ],
  [
   "I found a photograph of myself at eight years old.",
   "What were you doing?",
   "Building a sandcastle in an enormous sunhat.",
   "You sound fond of it.",
   "I remember being furious when the tide came in. I still remember the castle."
  ],
  [
   "I asked a neighbor to teach me how to sew.",
   "How did it go?",
   "I made a handkerchief with a crooked border.",
   "Will you make another?",
   "Absolutely. I rather enjoyed making something imperfect."
  ],
  [
   "I spent Sunday reading in a public garden.",
   "Without a schedule?",
   "Not a single appointment.",
   "What did you read?",
   "A ridiculous romance novel. I bought the sequel."
  ],
  [
   "Someone in the elevator was carrying six balloons.",
   "A party?",
   "His grandmother's ninety-first birthday. I wished him luck."
  ],
  [
   "A child at the museum explained dinosaurs to me.",
   "Was he knowledgeable?",
   "Three new fossil facts and one fact about his dog."
  ],
  [
   "I made a playlist called 'walking nowhere.'",
   "And the destination?",
   "That's the point. There isn't one."
  ],
  [
   "I bought flowers for myself yesterday.",
   "For a special reason?",
   "I liked their color. I've decided that's reason enough."
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
  ],
  [
   "Someone left a tiny toy astronaut on a park bench.",
   "Did you take it?",
   "No. I sat it upright like it was waiting for a bus.",
   "You should've taken a photo.",
   "I did. It looks more patient than most people."
  ],
  [
   "I spent all night watching videos about deep-sea creatures.",
   "Why deep-sea creatures?",
   "I clicked one video and fell down the strangest rabbit hole.",
   "Any favorites?",
   "The dumbo octopus. It looks like it's constantly apologizing."
  ],
  [
   "I tried baking cinnamon rolls.",
   "Did it work?",
   "They turned into one enormous cinnamon continent."
  ],
  [
   "I found a little music box in a thrift shop.",
   "What does it play?",
   "A song I used to hear as a kid. I didn't realize I remembered it."
  ],
  [
   "I went to a tiny neighborhood cinema last night.",
   "Anything good?",
   "An old comedy where everything goes wrong at dinner.",
   "Did you laugh?",
   "So hard I spilled my popcorn. Great night."
  ],
  [
   "I helped a neighbor carry a cabinet upstairs.",
   "Did it fit?",
   "Not until we removed the legs.",
   "Was that your idea?",
   "No. I suggested removing the stairs. They chose the sensible option."
  ],
  [
   "A kid asked me to draw on their sidewalk chalk mural.",
   "What did you draw?",
   "A spaceship. They added an alien with twelve legs.",
   "Better than yours?",
   "Way better. I asked for an autograph."
  ],
  [
   "I borrowed an album from a friend I'd lost touch with.",
   "How was it?",
   "Great. More importantly, it gave us a reason to talk.",
   "Are you seeing them?",
   "We might get lunch. Feels good, actually."
  ],
  [
   "I adopted a tiny succulent.",
   "What's its name?",
   "Satellite. It listens for signals from my windowsill."
  ],
  [
   "I tried baking bread.",
   "Any luck?",
   "The first loaf was a brick. The third had an actual crust."
  ],
  [
   "Someone put a sign on a broken park bench.",
   "What did it say?",
   "'Resting bench, please give it space.' I laughed."
  ],
  [
   "I took my headphones off on the bus today.",
   "Why?",
   "I wanted to hear the city for once. It sounded pretty good."
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
  ],
  [
   "I went to an outdoor movie screening by myself.",
   "What were they showing?",
   "An old comedy. The audience laughed before I understood half the jokes.",
   "Did you enjoy it?",
   "I think I enjoyed the laughing as much as the movie."
  ],
  [
   "I made a paper star and put it above my desk.",
   "Why a star?",
   "I wanted something small to look at during long afternoons.",
   "Did it help?",
   "I made three more. It's becoming a little sky."
  ],
  [
   "I tried singing while cooking yesterday.",
   "Any good?",
   "The food? Yes. The singing? My neighbor hasn't complained yet."
  ],
  [
   "A stray cat followed me home in the rain.",
   "Did you keep it?",
   "It belonged to the family upstairs. We had a very polite reunion."
  ],
  [
   "I joined a beginner photography walk.",
   "Did you take good pictures?",
   "One lovely bicycle with flowers in its basket.",
   "And the others?",
   "Mostly my thumb. I'm learning to notice it."
  ],
  [
   "I rescued a broken wind chime from a market stall.",
   "Did you fix it?",
   "Yes. It makes a soft sound when the window opens.",
   "Doesn't it keep you awake?",
   "No. I like knowing there's a breeze."
  ],
  [
   "My aunt asked me to help make dumplings for dinner.",
   "How many?",
   "Nearly a hundred. I lost count after the first tray.",
   "Were they good?",
   "They disappeared before I sat down. That's a compliment."
  ],
  [
   "There was a free piano outside the community center.",
   "Did you play?",
   "A little. A stranger came over and joined in.",
   "Did you know them?",
   "No. We never introduced ourselves. It was nice anyway."
  ],
  [
   "I tried a poetry reading for the first time.",
   "Did you read anything?",
   "I listened. One poem about missing a bus made me cry."
  ],
  [
   "I started writing letters instead of messages to a friend.",
   "Isn't that slow?",
   "Yes. Maybe that's why we're telling each other more."
  ],
  [
   "A baker made little rolls shaped like hedgehogs.",
   "Did you buy one?",
   "Two. I had to admire them before eating them."
  ],
  [
   "I spent an afternoon on a puzzle with my cousin.",
   "Did you finish?",
   "No, but we invented stories about everyone in the picture."
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
  ],
  [
   "I spent yesterday helping a friend paint their kitchen.",
   "What color?",
   "We agreed on yellow. Somehow it turned out orange.",
   "Did they mind?",
   "They love it. They're calling it 'sunset surprise.'"
  ],
  [
   "I found an old wind-up music box.",
   "Does it still play?",
   "Yes, but the song stops right before the last note.",
   "Isn't that frustrating?",
   "A little. It makes me want to hum the ending myself."
  ],
  [
   "Someone taught me how to carve an apple into a little swan.",
   "Can you do it?",
   "Mine looks like a duck who has seen things."
  ],
  [
   "I tried making handmade candles.",
   "How did it go?",
   "The first one leaned sideways. It still smells wonderful."
  ],
  [
   "I found an old video of myself learning to roller skate.",
   "Can I see it?",
   "Only if you promise not to laugh.",
   "I can't promise that.",
   "Fair. I spend half the video clinging to a tree."
  ],
  [
   "I went looking for a raincoat and fell in love with the wrong one.",
   "Why was it wrong?",
   "Bright yellow, oversized, covered in tiny frogs.",
   "Did you buy it?",
   "Yes. I look forward to rainy days now."
  ],
  [
   "A friend showed me a shortcut through a garden.",
   "Was it faster?",
   "Not at all. We stopped to watch butterflies.",
   "Worth it?",
   "Completely. I take the longer route now."
  ],
  [
   "I helped a girl find her missing glove on the train.",
   "Did you find it?",
   "Inside her hat. We both looked relieved.",
   "That sounds sweet.",
   "She waved until the train pulled away."
  ],
  [
   "I repaired an old pair of jeans.",
   "What went wrong?",
   "Nothing! I stitched a tiny blue star over the tear."
  ],
  [
   "I keep ticket stubs from ordinary days.",
   "Not concerts?",
   "No. Bus rides to see friends. Little days count too."
  ],
  [
   "I saw a street performer teaching strangers to dance.",
   "Did you join?",
   "For one song. Forgot the steps and kept moving."
  ],
  [
   "My neighbor asked me to watch her parrot.",
   "Did it talk?",
   "It said 'good morning' at midnight and laughed at me."
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
  ],
  [
   "I went on a guided tour of an old lighthouse.",
   "Was the view worth it?",
   "Beautiful. We climbed so many stairs that everyone went quiet.",
   "What did you do at the top?",
   "Just looked out. It felt good not to take a picture."
  ],
  [
   "I bought a tiny notebook for things I don't want to forget.",
   "What's the first entry?",
   "The name of the song a taxi driver played yesterday.",
   "Did you ask him?",
   "Yes. He was so pleased somebody liked it."
  ],
  [
   "A small dog stole my seat at a picnic.",
   "What did you do?",
   "Sat on the grass. The dog was a better guest than I was."
  ],
  [
   "I tried growing strawberries on my balcony.",
   "Any fruit yet?",
   "One. I'm considering making it a little crown."
  ],
  [
   "I went into a science museum to escape the rain.",
   "Anything interesting?",
   "A room where you could make giant soap bubbles.",
   "Did you try?",
   "Three times. The last bubble was taller than me."
  ],
  [
   "A friend invited me to her family dinner.",
   "Did you know anyone else?",
   "No. By dessert, her grandmother had taught me recipes and a card trick.",
   "Did you fit in?",
   "They invited me back. I think so."
  ],
  [
   "I've been rereading a book I loved as a teenager.",
   "Still good?",
   "Better in some places, worse in others.",
   "Disappointing?",
   "Not really. I like noticing how I've changed."
  ],
  [
   "I helped a neighbor paint a bedroom.",
   "What color?",
   "Green. A very brave green.",
   "Did they like it?",
   "We opened the windows and danced while it dried."
  ],
  [
   "I made a terrible sketch of my own hand.",
   "Can I see?",
   "It has six fingers. Don't ask."
  ],
  [
   "There was a portrait artist on the sidewalk.",
   "Did you sit for one?",
   "Yes. He got my nose right and invented a new hairstyle."
  ],
  [
   "A teenager asked me to sign a scrap of paper.",
   "Did you?",
   "Yes, then we talked about her favorite music instead."
  ],
  [
   "I lost track of time watching fish in a pond.",
   "Why?",
   "They were there, and for once I didn't need to be elsewhere."
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
  ],
  [
   "I volunteered to help decorate a friend's birthday cake.",
   "What was the theme?",
   "Underwater adventure. I made a jellyfish with too many tentacles.",
   "How many?",
   "We stopped counting. It was an octopus by the end."
  ],
  [
   "I went to a planetarium for the first time.",
   "What did you think?",
   "I loved it. For once I could stare at the ceiling and call it learning.",
   "Did you have a favorite constellation?",
   "The one I made up when I connected the wrong stars."
  ],
  [
   "My neighbor's kid made me a friendship bracelet.",
   "Are you wearing it?",
   "Of course. The knots are impossible to undo anyway."
  ],
  [
   "I tried making a little herb garden.",
   "Any luck?",
   "The mint has taken over. It's not a garden, it's a mint kingdom."
  ],
  [
   "I volunteered at a neighborhood garden.",
   "Are you a gardener now?",
   "I mostly carried soil and met a woman named Pilar.",
   "Did she teach you anything?",
   "She told stories while I planted carrots. I owe her one now."
  ],
  [
   "I got caught in the rain and hid inside a record shop.",
   "Did you buy anything?",
   "A record with an orange sunset on the cover.",
   "Was it good?",
   "Beautiful. I'm glad I got soaked."
  ],
  [
   "I finally learned the ending of that ridiculous handshake.",
   "Show me.",
   "Two claps, a spin, and then a bow like performers.",
   "That actually works.",
   "I know! Try not to look so surprised."
  ],
  [
   "I want a day with no plans and no clock.",
   "Would you enjoy that?",
   "I think so. Or maybe I'm terrible at relaxing.",
   "We could find out.",
   "Perfect. There's only one way to know."
  ],
  [
   "Someone left a drawing on a park bench.",
   "Of what?",
   "A smiling whale in a crown. I left it for the next person."
  ],
  [
   "I tried making soap at a workshop.",
   "Was it difficult?",
   "Mine looks like a potato. A very fragrant potato."
  ],
  [
   "I watched a puppet show with a friend's little sister.",
   "Did she like it?",
   "She shouted advice at every puppet. They ignored her."
  ],
  [
   "I found a tiny book of poems at a stall.",
   "Any good ones?",
   "One about missing a train made me miss mine."
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
  ],
  [
   "I saw a tiny green lizard warming itself on a wall.",
   "Did it run away?",
   "Not at all. It just blinked at me like I was interrupting.",
   "Did you leave it alone?",
   "I did. It looked like it had a very full schedule."
  ],
  [
   "I found a photo of us from years ago in an old folder.",
   "What were we doing?",
   "Trying to build a blanket fort that kept falling over.",
   "Did we ever finish it?",
   "No. But I remember laughing so hard I couldn't hold the blanket."
  ],
  [
   "I tried making little embroidered patches.",
   "Any success?",
   "My first flower looks more like a fried egg."
  ],
  [
   "I bought a lemon tart from a bakery I've never visited.",
   "Was it good?",
   "So good I walked back to learn the baker's name."
  ],
  [
   "I passed the place where I used to take swimming lessons.",
   "Does it look the same?",
   "The gate is smaller, and the tree is enormous.",
   "Funny how things change.",
   "I stood there remembering those afternoons."
  ],
  [
   "I found a childhood list of things I wanted to do.",
   "Anything surprising?",
   "Whistle, ride a horse, eat a whole watermelon.",
   "Have you?",
   "Two and a half. The watermelon defeated me."
  ],
  [
   "Do you remember that awful song we used to make up on walks?",
   "Only the chorus.",
   "That's all I remember too. Maybe the verses never existed.",
   "We could write new ones.",
   "Only if they're just as awful."
  ],
  [
   "A child had drawn a map of town.",
   "Was it accurate?",
   "Not remotely. All the important places were snack shops.",
   "Sounds like a good map.",
   "Honestly, it was better than the real one."
  ],
  [
   "I tried painting a little clay bowl.",
   "Any success?",
   "Paint on everything but the bowl. Then I started over."
  ],
  [
   "A kitten fell asleep beside me on a bench.",
   "Did it belong to anyone?",
   "A woman came looking for it. It has a home and a loud purr."
  ],
  [
   "I went to a fair with my cousin.",
   "Best part?",
   "We painted little wooden boats shaped like strawberries."
  ],
  [
   "Someone wrote 'you'll be okay' outside a shop.",
   "Did it help?",
   "A little. I didn't know I needed to read it today."
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
  ],
  [
   "I watched an amateur puppet show yesterday.",
   "Why?",
   "My neighbor built the puppets. One of them lost an arm halfway through.",
   "What happened?",
   "The puppet declared it an exciting plot twist. Magnificent recovery."
  ],
  [
   "I've started going for walks without my watch.",
   "That sounds relaxing.",
   "At first I kept looking for it. Then I noticed a mural I'd passed a hundred times."
  ],
  [
   "A friend convinced me to take an introductory salsa class.",
   "How did you do?",
   "I counted the steps beautifully and still ended up facing the wrong wall."
  ],
  [
   "I borrowed a mystery novel from Alma.",
   "Was it good?",
   "She warned me the ending was strange. It was stranger than she promised.",
   "Did you like it?",
   "Very much. She knows me alarmingly well."
  ],
  [
   "I found a little toy car under the seat of my bus.",
   "What did you do?",
   "Gave it to the driver. He said someone had been asking for it all morning."
  ],
  [
   "My niece painted me a portrait.",
   "Does it look like you?",
   "Only if I've grown green hair. I've put it above my desk."
  ],
  [
   "I made a terrible decision at a bakery.",
   "What did you order?",
   "One of everything with cinnamon. I regret nothing except the stomachache."
  ],
  [
   "I tried teaching myself to identify birdsong.",
   "Any success?",
   "I can recognize exactly one bird. It turns out it's the neighbor's squeaky gate."
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
  ],
  [
   "I went to a silent meditation class.",
   "How was that for you?",
   "I lasted seven minutes before my stomach made a noise like a trumpet.",
   "Did anyone laugh?",
   "Nobody. That somehow made it worse."
  ],
  [
   "I took a train to the end of the line on my day off.",
   "Why?",
   "I wanted to see the town there.",
   "Was it exciting?",
   "Not really. But there was a bakery that made perfect apple pie."
  ],
  [
   "My younger brother asked me to teach him a tongue twister.",
   "Did he learn it?",
   "In two minutes. I still can't say it without laughing."
  ],
  [
   "I found a box of cassette tapes labeled by weather.",
   "By weather?",
   "Rainy Day, Sunny Day, Foggy Day. No names, just moods.",
   "Which did you choose?",
   "Foggy Day. It was unexpectedly cheerful."
  ],
  [
   "I got invited to host a neighborhood pet parade.",
   "How did you do?",
   "I announced every dog as if it were royalty. One cat walked off the stage."
  ],
  [
   "Someone at the cafe drew a cartoon of me on a napkin.",
   "Was it flattering?",
   "Big hair, bigger mouth. I framed it in my kitchen."
  ],
  [
   "I helped an elderly man carry groceries upstairs.",
   "Did he thank you?",
   "He offered me a chair and told me about the radio he built when he was young."
  ],
  [
   "I'm considering taking a day with no microphone, no music, nothing.",
   "Would you enjoy that?",
   "Maybe. I'd like to find out what my own thoughts sound like."
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
  ],
  [
   "I visited an outdoor sculpture park on my day off.",
   "Did you like it?",
   "There was a metal bird taller than a house. I sat under it for an hour."
  ],
  [
   "My aunt sent me a package with homemade jam.",
   "What flavor?",
   "Apricot. The lid was impossible to open.",
   "How'd you manage?",
   "Three neighbors and a rubber glove. Community effort."
  ],
  [
   "I taught a friend how to mend a tear in her jacket.",
   "Did she learn?",
   "She did, then decorated the patch with little embroidered stars."
  ],
  [
   "There was a tiny street library beside the station.",
   "Did you take a book?",
   "Yes, and left two behind. One had a note saying it made someone laugh."
  ],
  [
   "I went out for a walk and got caught in a parade.",
   "What kind of parade?",
   "I still don't know. There were drums and a person dressed as a giant peach."
  ],
  [
   "Someone handed me a cup of hot chocolate when it started raining.",
   "Who?",
   "An older lady from the market. She said I looked cold.",
   "Were you?",
   "Very. I thought about it all the way home."
  ],
  [
   "I tried making my own candles.",
   "Any luck?",
   "Three lopsided little things that smell like orange peel. They're perfect."
  ],
  [
   "A child at the bus stop asked me whether boats get lonely.",
   "What did you tell them?",
   "That they're happiest when they bring people home. The child seemed satisfied."
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
  ],
  [
   "I went to an outdoor flea market looking for a lamp.",
   "Did you find one?",
   "No. I found a music box shaped like a house.",
   "Does it work?",
   "Yes. It plays a waltz so softly you have to lean close."
  ],
  [
   "I tried making a birthday gift by hand.",
   "What did you make?",
   "A little fabric pouch. The seams aren't straight.",
   "Does that bother you?",
   "Not really. It's the first time I've made something that feels like mine."
  ],
  [
   "I found a little stray ribbon tied around a park fence.",
   "Did you take it?",
   "No. I liked the thought of someone leaving color behind."
  ],
  [
   "I tried teaching myself a new dance step.",
   "How's it going?",
   "I can do the first half. The second half currently involves falling on a pillow."
  ],
  [
   "I saw a dress in a window that reminded me of my mother.",
   "Did you go inside?",
   "No. I stood remembering how she danced in something similar.",
   "Good memories?",
   "Very. I called her afterward, just because."
  ],
  [
   "I bought a fern from a woman at the market.",
   "Where did you put it?",
   "Beside the window, as she suggested.",
   "Does it suit the room?",
   "The room feels more lived-in already."
  ],
  [
   "I tried painting a chair instead of replacing it.",
   "What color?",
   "Deep blue. I accidentally painted one leg gold.",
   "Did you fix it?",
   "No. It looks like the chair has a secret."
  ],
  [
   "A friend asked me to teach her a simple stitch.",
   "Did you?",
   "We spent the afternoon talking more than sewing.",
   "What did she make?",
   "One tiny crooked flower on her sleeve. She wore it home."
  ],
  [
   "I found a café with mismatched chairs.",
   "Do you like it?",
   "Every chair feels like it has a history. I chose green."
  ],
  [
   "A stranger complimented a scarf I'd made.",
   "What did you say?",
   "That it was handmade. She asked me to show her how."
  ],
  [
   "I went to an outdoor concert and danced by myself.",
   "Was it awkward?",
   "For one song. Then someone else started dancing too."
  ],
  [
   "I kept fabric from a childhood costume.",
   "Why keep it?",
   "It was the first thing I wore just because I loved it."
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
  // A small week offset prevents the 1-in-4 classic chat days from
  // permanently hiding some of the 16 topics in the 90-day season.
  const index=(day*7+Math.floor(day/4)+slot*3+hash(npc))%rows.length;
  return rows[index].map((text,i)=>({speaker:i%2?'Protagonist':npc,text}));
 }
 function validate(){
  const issues=[];
  for(const [npc,rows] of Object.entries(topics)){
   if(rows.length<16)issues.push(npc+': too few scenes');
   if(new Set(rows.map(r=>r[0])).size!==rows.length)issues.push(npc+': duplicate opener');
   if(rows.some(r=>![3,5].includes(r.length)||r.some(s=>typeof s!=='string'||!s.trim())))issues.push(npc+': malformed dialogue');
  }
  return issues;
 }
 return Object.freeze({topics,shouldUse,select,validate});
});
