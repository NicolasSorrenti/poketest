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
   "Look, I finally grew something that isn't dead.",
   "Is that basil?",
   "Supposed to be. I labeled it 'basilisk' and didn't notice for a week.",
   "Are you changing it?",
   "Absolutely not. The basilisk has earned its name."
  ],
  [
   "Someone put a joke in the suggestion box.",
   "A complaint?",
   "Worse. 'Why did the card cross the table? To get to the other side deck.' I laughed. I'm ashamed."
  ],
  [
   "Have you ever managed to make a round pancake?",
   "Usually. Why?",
   "Mine turned into something shaped like a country on a map. I ate the border first."
  ],
  [
   "Whose umbrella is this?",
   "It's been here for days.",
   "I've put a note on it, but nobody's claimed it. At this point I'm considering giving it a staff badge."
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
   "I tried learning the harmonica this weekend.",
   "Let me guess: noisy?",
   "Three notes. Then the neighbor's dog started howling along.",
   "Did you stop?",
   "Eventually. The dog had better rhythm, and I needed to concede."
  ],
  [
   "I've got a costume-party problem.",
   "Don't tell me you forgot the costume.",
   "I dressed as the night sky. Everyone else came as movie stars.",
   "That's still a costume.",
   "Thank you! That's exactly what I told them."
  ],
  [
   "Do you know somewhere I can get a quiet breakfast?",
   "Is the café too busy?",
   "I love Alma's place, but sometimes I want to be a customer nobody knows.",
   "Did you find somewhere?",
   "A bakery with one little table. I spent an hour watching the street wake up."
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
   "The thunderstorm kept me inside all evening.",
   "Did you get bored?",
   "Not at all. Blanket on the couch, an old movie, and a teddy bear I've had since school.",
   "Sounds pretty good.",
   "It was. I think I needed the quiet."
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
   "There's a pigeon outside my window that seems to have a problem with me.",
   "A pigeon?",
   "It stared me down while I ate breakfast.",
   "Who won?",
   "I blinked first. Don't tell anyone."
  ],
  [
   "Are those strawberry socks?",
   "Yes. You can stop looking.",
   "I didn't say anything.",
   "You were going to.",
   "They're comfortable and I like them. End of discussion."
  ],
  [
   "I was late yesterday because of a dog.",
   "What happened?",
   "A stranger asked me to hold the leash. The dog sat on my feet and fell asleep.",
   "And you waited?",
   "Twenty minutes. He looked comfortable. What was I supposed to do?"
  ],
  [
   "That bicycle-repair movie made me cry.",
   "Why? Was it sad?",
   "No. The old man finally got his friend's bike running. Don't make it a thing."
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
   "I went to the aquarium by myself.",
   "Which part did you like?",
   "The jellyfish exhibit. Nobody talked in there, not even me."
  ],
  [
   "My grandmother made me help fold dumplings yesterday.",
   "How'd that go?",
   "She made perfect little crescents. Mine looked like crumpled envelopes.",
   "Did she complain?",
   "She ate six of mine and asked when I'd come back. I think I passed."
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
   "I tried skating once.",
   "Did you fall?",
   "Not once, technically. I never let go of the railing.",
   "That's cheating.",
   "That's risk management."
  ],
  [
   "My sister asked me to help decorate her birthday cake.",
   "What did you put on it?",
   "Little pink flowers. She said I had a steady hand.",
   "And?",
   "I liked being useful for something completely silly."
  ],
  [
   "I stayed up until two finishing a detective novel.",
   "Did you guess the culprit?",
   "Wrong person. Completely wrong.",
   "You sound annoyed.",
   "I reread chapter one to see what I'd missed. The clue was right there."
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
   "Can I ask you something? Does this look like a cookbook to you?",
   "It has soup on the cover.",
   "Exactly. Yet the recipes read like riddles. I think I've bought a literary experiment.",
   "Are you returning it?",
   "Certainly not. I want to see whether the soup is any good."
  ],
  [
   "Do you see the cat sitting by the library doors?",
   "The gray one?",
   "It looks exactly like the librarian when she's annoyed.",
   "Have you told her?",
   "Certainly not. I would like to keep my library card."
  ],
  [
   "A photograph fell out of the book I bought yesterday.",
   "Of whom?",
   "A family on a picnic. I don't know them, but they looked so pleased to be together.",
   "What will you do with it?",
   "Leave it in the book. Perhaps someone else will find it one day."
  ],
  [
   "I tried sketching the view from my window.",
   "Can I see?",
   "Only if you don't mind trees that seem to have elbows."
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
   "What can you see?",
   "Mostly rooftops so far. I'm waiting for a clear night before attempting anything ambitious."
  ],
  [
   "I tried decorating a birthday cake myself.",
   "How did it turn out?",
   "It said 'Hapy Brithday.' My friend insisted the spelling was its best feature."
  ],
  [
   "There is a courtyard near the library that's full of paper lanterns.",
   "Is there a festival?",
   "No. I asked. The residents simply like seeing them lit at night.",
   "I like that.",
   "So do I. I went back the next evening, just to look."
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
   "I found a lonely chess knight on the pavement.",
   "Did you hand it in?",
   "I asked around. Nobody knew where it came from.",
   "So you kept it?",
   "For now. It sits beside my kettle, looking surprisingly distinguished."
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
   "Promise you won't laugh at this picture.",
   "Why is there a pancake on that man's hat?",
   "He was judging the flipping contest. Mine took an ambitious route.",
   "Did you get disqualified?",
   "No! They gave me a ribbon for enthusiasm. I'm putting it on my deck box."
  ],
  [
   "This little dinosaur came out of a vending machine.",
   "Cute! What's its name?",
   "According to the packaging? Lizard. Very bold marketing choice."
  ],
  [
   "I wanted to learn a magic trick.",
   "What happened?",
   "I clicked the wrong video and learned how to make a sandwich instead.",
   "So, no magic?",
   "Not unless you count how fast I ate the sandwich."
  ],
  [
   "There was a little frog on the sidewalk.",
   "What did you do?",
   "Escorted it to the grass like a very important guest."
  ],
  [
   "Look at this picture and tell me what you see.",
   "A duck?",
   "THANK YOU. Teo says it's a loaf of bread.",
   "Are you sure?",
   "There's a beak! I'm sending him your expert testimony."
  ],
  [
   "I thought my apartment was haunted last night.",
   "What made you think that?",
   "Clanking noises from the laundry room. I went to investigate.",
   "And?",
   "A spoon had gotten into the washer. Ghost defeated."
  ],
  [
   "I joined a dance class yesterday.",
   "Did it go well?",
   "I learned the last step first and nearly crashed into the instructor.",
   "Did they throw you out?",
   "Nope. She laughed and showed me where to stand. I'm going back."
  ],
  [
   "I found a four-leaf clover yesterday.",
   "Are you saving it?",
   "I gave it to a kid who looked like she really needed some luck."
  ],
  [
   "Want to hear how I earned free ice cream?",
   "I'm almost afraid to ask.",
   "I followed a crowd, thinking it was a dessert line. Turns out it was a park cleanup.",
   "You helped?",
   "For two hours! Then they handed out ice cream. Best wrong turn ever."
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
   "I helped a friend move yesterday.",
   "Were you useful?",
   "I labeled every box for them.",
   "Nice.",
   "Except I wrote 'important stuff' on half of them. They made me relabel everything."
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
   "This old radio only gets one station.",
   "That sounds inconvenient.",
   "It plays jazz almost constantly. I've started leaving it alone.",
   "No attempt to repair it?",
   "I know. It's an unusual experiment in accepting things as they are."
  ],
  [
   "I tried folding a paper crane.",
   "How'd that turn out?",
   "It looks like a napkin trying very hard to become a bird."
  ],
  [
   "I got on a bus without checking where it went.",
   "You? Not planning ahead?",
   "That was the point. I wound up at a bakery with incredible cinnamon rolls."
  ],
  [
   "A child asked me what to name a cloud.",
   "What did you choose?",
   "Barbara. The child corrected me. Apparently it's a Kevin."
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
   "A sparrow's nesting outside my window.",
   "Does that distract you?",
   "Quite the opposite. The parents keep a stricter schedule than I do."
  ],
  [
   "I watched a violin-restoration documentary last night.",
   "Do you even play violin?",
   "Not a note. I just liked seeing something broken sound beautiful again."
  ],
  [
   "I may have overestimated my skill with children's chemistry kits.",
   "What happened?",
   "The box promised a sparkling crystal. I have produced a blue lump.",
   "Maybe it needs time?",
   "Possibly. I've named it Control Group One."
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
   "I took a painting class with no instructions.",
   "That must have driven you crazy.",
   "For the first ten minutes. Then I painted a giraffe. It was a wonderful giraffe."
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
   "The market vendor tried to apologize for these pears.",
   "They do look a little strange.",
   "Exactly why I bought them. Nobody wanted them, so he gave me a good price.",
   "And the taste?",
   "Fantastic. Looking respectable is terribly overrated."
  ],
  [
   "I played a new board game with friends.",
   "Did you win?",
   "No, I was elected mayor and bankrupted the town buying fountains.",
   "Why fountains?",
   "They looked charming on the board. It was a terrible administration."
  ],
  [
   "I ruined a birthday card with a leaky pen.",
   "Did you start over?",
   "No. I turned the ink blot into a firework and wrote 'Have a dramatic birthday.'"
  ],
  [
   "I found a chipped mug with a very smug goose on it.",
   "You bought it?",
   "At a discount. Naturally.",
   "Does the goose have a name?",
   "Sir Honkington. He looks down on all the expensive cups."
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
   "We tried an escape room for my friend's birthday.",
   "Did you solve it?",
   "Barely. Somebody leaned on a wall that turned out to be a door.",
   "Sounds lucky.",
   "Extremely. We're pretending it was strategy."
  ],
  [
   "My grandmother used to make orange peel candy.",
   "Do you know how?",
   "I found the recipe and tried it. The whole apartment smelled like childhood."
  ],
  [
   "My aunt has a card game where the winner does the dishes.",
   "That seems backwards.",
   "Exactly. I spent the evening trying to lose gracefully.",
   "Did it work?",
   "No. She's been practicing losing for forty years. The woman is a professional."
  ],
  [
   "The clock tower in the town I visited rings an hour late.",
   "Is it broken?",
   "The baker says nobody wants to fix it.",
   "That's strange.",
   "Maybe. But everyone still knows what time it is."
  ],
  [
   "I finally found my missing earring.",
   "Where was it?",
   "Caught in my coat's lining. I also found three receipts and a mint.",
   "What a haul.",
   "The mint expired last year. The earring is fine."
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
   "I tried painting a still life last night.",
   "Really? Can I see?",
   "Please don't laugh. The oranges look like tiny suns.",
   "I like it.",
   "Thanks. I wanted to make something that had nothing to do with the river."
  ],
  [
   "I got home from shopping and opened a bag full of party supplies.",
   "Had you bought party supplies?",
   "No. Someone had my bread; I had their balloons.",
   "Did you get it back?",
   "Yes. We met outside the market. She gave me a balloon for the trouble."
  ],
  [
   "I borrowed a bicycle with a tiny brass bell.",
   "Did you ring it?",
   "By accident, at every corner. A man waved like we knew each other."
  ],
  [
   "I found the strangest souvenir.",
   "What is it?",
   "A snow globe with a tropical beach inside. The palm trees have snow on them.",
   "Why did you buy it?",
   "Look at it. How could I not?"
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
   "There's a garden gnome in my yard with a missing ear.",
   "Did you buy it like that?",
   "Found it beside the bins and patched it with clay. Looks happier now."
  ],
  [
   "A lullaby from when I was little got stuck in my head.",
   "Did you remember the words?",
   "Only the ending. I called Mum and she sang me the whole thing."
  ],
  [
   "The rain sent me into the greenhouse by the old market.",
   "Was it worth getting soaked?",
   "Absolutely. Warm air, huge ferns, and nobody in a rush.",
   "Did you buy a plant?",
   "One tiny fern. So far it's doing better than my cooking."
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
   "A stranger asked me to photograph their dog.",
   "Was it cooperative?",
   "Perfectly, until I lifted the camera. Then it sneezed.",
   "Did you get the shot?",
   "A blur and a very surprised expression. They loved it."
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
   "Is this potato supposed to look disappointed?",
   "It does seem disappointed.",
   "Good. That's exactly why I bought it.",
   "What's its name?",
   "Management. Now Management can judge my life choices."
  ],
  [
   "I gave someone directions and sent them to the wrong street.",
   "Were they upset?",
   "They came back with fresh bread. Apparently I'd sent them to a bakery.",
   "Did you apologize?",
   "Yes. Then I asked whether the bread was any good."
  ],
  [
   "I cut my own hair once.",
   "Did that work?",
   "The hairdresser asked whether I'd fought a ceiling fan. I paid her to fix it."
  ],
  [
   "A cat fell asleep on my jacket at the park.",
   "So you waited?",
   "Forty minutes. Then another cat tried to climb in.",
   "Did you get your jacket back?",
   "Eventually. I considered charging rent."
  ],
  [
   "I went to a miniature railway museum.",
   "That sounds unexpectedly wholesome.",
   "The tiny stations had tiny benches. I couldn't leave.",
   "Did you buy a souvenir?",
   "A tiny bench. Obviously."
  ],
  [
   "I arrived early to help set up a surprise party.",
   "And the surprise?",
   "The guest of honor was already there.",
   "What did you do?",
   "We decorated anyway and pretended Tuesday was a special holiday."
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
   "I now know how to knit.",
   "That seems unexpected.",
   "I followed a sign offering free tea and ended up in a knitting circle.",
   "Did you stay?",
   "Made half a scarf. Apparently I have a talent for accidentally joining things."
  ],
  [
   "I've been writing down places I want to return to.",
   "Big trips?",
   "Not really. A bench with shade. A tiny noodle shop. A street where the lamps are always on.",
   "That's quite a list.",
   "Not everything worth visiting is far away."
  ],
  [
   "Someone on the train asked me to help with her baby.",
   "Did you?",
   "I took her shopping bags while she adjusted the stroller.",
   "Much safer?",
   "For both of us. Babies look extremely easy to drop."
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
   "Can you hear that?",
   "Your shoes?",
   "Every step sounds like a tiny rubber duck.",
   "Have you tried fixing them?",
   "I did. Now only the left shoe squeaks. I think it's trying to communicate."
  ],
  [
   "I think I've forgotten why I went shopping.",
   "What did you bring home?",
   "Soap and a pear. I found the list later; it only said 'batteries.'"
  ],
  [
   "I tried baking cookies. Want one?",
   "Sure. Why are you holding it with both hands?",
   "They're a little hard. You'll need a drink to go with it."
  ],
  [
   "A street musician was playing a song my family used to sing.",
   "Did you stop?",
   "Yeah. I missed my bus, but I remembered the whole chorus."
  ],
  [
   "You wouldn't believe what I found at the back of my cupboard.",
   "Something useful?",
   "A box of postcards I bought years ago and never sent.",
   "Are you going to mail them?",
   "I think so. One even has a stamp. Past me was halfway there."
  ],
  [
   "I took a beginner cooking class.",
   "What did you learn?",
   "That my omelet can look beautiful right until I try to flip it.",
   "Did you get to eat it?",
   "Eventually. We called it scrambled eggs."
  ],
  [
   "I tried a trivia quiz about ocean animals.",
   "Did you win?",
   "No, but I knew every octopus question.",
   "That's something.",
   "My team says I'm in charge of octopuses from now on."
  ],
  [
   "My neighbor gave me an old lamp.",
   "Does it work?",
   "Yes, but the shade has little stars punched in it. My ceiling looks magical."
  ],
  [
   "Mrs. Duarte left me in charge of her tomatoes.",
   "Are they surviving?",
   "I took pictures every morning, just in case.",
   "And how are they doing?",
   "Better than my houseplants. She gave me two tomatoes as a thank-you."
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
   "I'm trying to learn to juggle.",
   "How's it going?",
   "I can keep two oranges in the air for about a second.",
   "What about the third?",
   "It sits on the table and judges me."
  ],
  [
   "I painted a little wooden birdhouse.",
   "Do birds use it?",
   "Not yet. A spider has moved in. Someone likes my house."
  ]
 ],
 "alma": [
  [
   "My neighbor handed me a novel and said it wasn't my kind of book.",
   "Did you read it anyway?",
   "Finished it in two nights. The ending made me cry.",
   "Did you tell her?",
   "Yes. Now she wants to bring me another one. I may never sleep again."
  ],
  [
   "A friend talked me into a pottery class.",
   "Did you make anything?",
   "A bowl that won't stand straight. It's perfect for holding my keys."
  ],
  [
   "That dog is back at my front door.",
   "Does it have an owner?",
   "Oh, yes. It lives two buildings over. I call it Chairman because it only visits when there are biscuits."
  ],
  [
   "I went to my nephew's school play.",
   "How was it?",
   "The cardboard dragon's head fell off. They kept singing like nothing had happened.",
   "Sounds memorable.",
   "Best performance I've seen in years."
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
   "I went roller skating for the first time in ages.",
   "Did you remember how?",
   "My knees did. My feet had apparently resigned."
  ],
  [
   "My friend sent me a photo of a very old tree.",
   "What's special about it?",
   "We used to hide notes there when we were children. It is still standing."
  ],
  [
   "You won't believe what was hiding at the bottom of my suitcase.",
   "A fortune?",
   "My old yellow scarf. It was wrapped around a postcard from a trip with friends.",
   "That must have brought something back.",
   "It did. Mostly how much we laughed at the rain."
  ],
  [
   "Someone left a thank-you note under my door.",
   "Who from?",
   "They didn't sign it. It says I helped them on a bad day.",
   "Do you remember doing that?",
   "Not exactly. I'll have to keep treating people well and hope that covers it."
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
   "I finally visited the little museum down the road.",
   "Worth it?",
   "There's a whole room of antique toys. I nearly forgot to leave before closing."
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
   "Come here. Tell me what this plant is doing.",
   "Leaning toward the window?",
   "It has all the sunlight it could ask for. It's just being contrary.",
   "You could turn the pot.",
   "I did yesterday. It turned right back. We understand each other."
  ],
  [
   "I kept getting a crossword clue wrong last night.",
   "Which one?",
   "It meant 'regret.' I kept writing 'banana.' I really should've eaten before starting."
  ],
  [
   "Some kid put a smiling star sticker on my toolbox.",
   "Did you take it off?",
   "Why would I? It's the only employee around here that looks cheerful."
  ],
  [
   "I found a cassette of somebody identifying birdsongs.",
   "Sounds fascinating.",
   "Don't mock it. I listened all the way through and learned three birds."
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
   "I made lemonade yesterday.",
   "Is that why you're drinking water?",
   "I mistook the salt jar for the sugar jar. The lemonade was a learning experience."
  ],
  [
   "There's a squirrel who visits my window every morning.",
   "Do you feed it?",
   "No. It has a favorite branch. I just make sure to say good morning."
  ],
  [
   "You ever go fishing and hope nothing bites?",
   "Not usually.",
   "That's what happened yesterday. We just talked until sunset.",
   "Did you mind going home empty-handed?",
   "We weren't there for the fish. Don't tell him I said that."
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
   "Tried cooking rice without the timer.",
   "How was it?",
   "Crunchy on top, burnt underneath. I called Marina and got laughed at.",
   "Did she help?",
   "She told me to soak the pot. Sensible woman."
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
   "Please don't say anything about the mug.",
   "The one shaped like a mushroom?",
   "Yes. It was an entirely unnecessary purchase.",
   "It looks like you love it.",
   "I do. It holds exactly the right amount of tea. Please keep that to yourself."
  ],
  [
   "My shoes have survived a remarkable indignity.",
   "Should I ask?",
   "I had to run through a puddle in the rain.",
   "Are they ruined?",
   "No. I am simply embarrassed that I spent so much time avoiding puddles in the first place."
  ],
  [
   "A friend convinced me to try karaoke.",
   "I didn't know you sang.",
   "Neither did I. It was dreadful, but everyone was nice about it. I've agreed to go again."
  ],
  [
   "Please ignore the refrigerator magnet.",
   "The dancing carrot?",
   "Yes. It says 'rooting for you.'",
   "Did you buy it?",
   "My friend gave it to me. It's awful. I love it."
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
   "I made soup without a recipe for once.",
   "How was it?",
   "Edible. Then I added more salt, and it was actually good.",
   "Sounds simple.",
   "That's what surprised me. I didn't need a plan."
  ],
  [
   "My friend insisted on taking me to an outdoor film screening.",
   "That sounds pleasant.",
   "It was, until it started raining during the final scene.",
   "Did you leave?",
   "We stayed. We were already wet, and neither of us wanted to miss the ending."
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
   "I held the elevator for a man with six balloons.",
   "For a party?",
   "His grandmother's ninety-first birthday. He was worried about finding the address.",
   "Did he make it?",
   "I pointed him toward the correct street. I hope she liked the balloons."
  ],
  [
   "A child at the museum explained dinosaurs to me.",
   "Was he knowledgeable?",
   "Three new fossil facts and one fact about his dog."
  ],
  [
   "I made a playlist with no purpose whatsoever.",
   "What's it called?",
   "Walking Nowhere. I put it on when I leave the office without a destination."
  ],
  [
   "I bought flowers for myself yesterday.",
   "For a special reason?",
   "I liked their color. I've decided that's reason enough."
  ]
 ],
 "jinx": [
  [
   "Give me one reason this paper frog won't jump.",
   "You've folded one leg inside out.",
   "It's supposed to have two legs?",
   "You made a frog with one leg?",
   "I made a revolutionary new species. Don't judge it."
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
   "There was an old comedy playing at the little cinema.",
   "Did you go?",
   "Yeah. I laughed so hard I dropped my popcorn.",
   "Worth it?",
   "Totally. I went back for more and the guy at the counter said he'd heard me laughing from outside."
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
   "I brought something. Here.",
   "Dumplings? They look great.",
   "Thank you. I learned to fold them this week, but I wasn't sure they'd hold together.",
   "Have you tried one?",
   "Yes. I ate the ugly ones first so nobody else had to."
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
   "My aunt asked me to help with dinner again.",
   "More dumplings?",
   "So many. I lost count after the first tray.",
   "Were they good?",
   "The whole family ate them before I could sit down. I think that means yes."
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
   "These are my lucky rehearsal socks now.",
   "Bananas? Seriously?",
   "I know. I tried to buy plain ones, but these made me laugh.",
   "Does your manager know?",
   "Unfortunately. She says they don't match anything, which is kind of their charm."
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
   "I found a video from my first roller-skating lesson.",
   "Was it embarrassing?",
   "I spent most of it gripping a tree.",
   "Will you show me?",
   "Maybe. If you promise not to turn it into a reaction clip."
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
   "I've done something I haven't managed in months.",
   "Taken a day off?",
   "That too. I finished a thousand-piece puzzle without checking work messages.",
   "Was it satisfying?",
   "Very. The last piece had been under the couch the whole time."
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
   "I ducked into the science museum to get out of the rain.",
   "Any good exhibits?",
   "An entire room devoted to giant soap bubbles.",
   "Did you try it?",
   "Of course. I was the only adult waiting in line without a child."
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
   "Do you know how to rescue a kite from a tree?",
   "I take it yours got stuck.",
   "Within six seconds. That's a personal record.",
   "Did you get it down?",
   "A kid helped me with a very long stick. I let her name the kite afterward."
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
   "I promised Pilar I'd help with her carrots again.",
   "Pilar?",
   "We met at the community garden. She tells the best stories while I carry soil.",
   "Do you help her much?",
   "Some. Mostly she keeps catching me listening instead of planting."
  ],
  [
   "I got caught in the rain and hid inside a record shop.",
   "Did you buy anything?",
   "A record with an orange sunset on the cover.",
   "Was it good?",
   "Beautiful. I'm glad I got soaked."
  ],
  [
   "My neighbor taught me a handshake with two claps and a spin.",
   "Isn't that a bit much for a handshake?",
   "Absolutely. We had to rehearse it three times.",
   "Did you get it right?",
   "Not once. I'm still committed to teaching it to everyone I meet."
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
   "Che, take a look at these.",
   "Tiny moons?",
   "The bakery near my shift started selling them. I bought one for you.",
   "What's the occasion?",
   "No occasion. You owe me one if they're good, though."
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
   "I walked past the old swimming pool yesterday.",
   "The one we used to go by?",
   "Yeah. I remembered the gate being enormous.",
   "What changed?",
   "Mostly us, I think. The tree outside really has grown, though."
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
   "That door hinge has been bothering me for three days.",
   "You could ignore it.",
   "And let it win? Absolutely not.",
   "Did you fix it?",
   "Mostly. Now the door is silent, but I have oil on my tournament notes."
  ],
  [
   "A kid asked me which ice cream flavor was best.",
   "What did you say?",
   "Pistachio. She looked at me like I'd just assigned her homework."
  ],
  [
   "I bought a plant and named it Tuesday.",
   "Why Tuesday?",
   "It arrived on Friday. I thought it deserved some mystery."
  ],
  [
   "I found a postcard at the bottom of an old drawer.",
   "What did it say?",
   "Just 'Wish you were here.' No address.",
   "That's a little sad.",
   "Maybe. I hope somebody made it there eventually."
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
   "There's a rubber duck on my desk.",
   "From who?",
   "A colleague. It has a detective hat. I have decided to keep it."
  ],
  [
   "My mother sent me a recipe with no measurements.",
   "Did you ask her for them?",
   "She said I'd know when it looked right.",
   "And did you?",
   "Not remotely. She laughed and sent me a picture."
  ],
  [
   "I went to my neighbor's puppet show.",
   "How was it?",
   "One puppet lost an arm in the middle of the performance.",
   "Oh no.",
   "The puppeteer called it a shocking twist and carried on. I respect that level of composure."
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
   "There was a toy car under the bus seat.",
   "Did you take it?",
   "Gave it to the driver. He said a child had been looking for it all morning.",
   "Good timing.",
   "For a change, yes."
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
   "I think the café has mistaken me for a small family.",
   "What did you order?",
   "A sandwich. It arrived with its own horizon.",
   "Could you finish it?",
   "I gave it a heroic introduction. Then I asked Alma for a box."
  ],
  [
   "The person upstairs keeps singing the same line of a song.",
   "How long has that been happening?",
   "Four days. I learned the rest just to resolve the cliffhanger."
  ],
  [
   "I bought a rocket-shaped alarm clock.",
   "Does it work?",
   "Too well. Every morning feels like a launch countdown."
  ],
  [
   "I drew a self-portrait yesterday.",
   "How did it go?",
   "Three people asked which cousin it was. I don't even have cousins."
  ],
  [
   "My neighbor thinks I have a pet parrot.",
   "Do you?",
   "No. I practice funny voices while cooking.",
   "What does your neighbor think it says?",
   "Mostly 'where is the salt?' I should explain someday."
  ],
  [
   "I read a poem at an open-mic night.",
   "About what?",
   "The loneliness of the last slice of pizza.",
   "How did the room react?",
   "One person laughed so hard they had to sit down. I'll call it a standing ovation."
  ],
  [
   "I've started photographing clouds.",
   "Anything interesting?",
   "Yesterday one looked like a shoe. I've never seen such a fashionable sky."
  ],
  [
   "I helped my uncle move a sofa.",
   "Did it fit through the door?",
   "After carrying it up four flights, we learned it didn't."
  ],
  [
   "I tried a meditation class. Complete silence, forty minutes.",
   "Did you make it?",
   "Seven minutes. My stomach made a noise like a trumpet.",
   "Did anyone laugh?",
   "Nobody! I've never wanted an audience more in my life."
  ],
  [
   "I took a train to the end of the line on my day off.",
   "Why?",
   "I wanted to see the town there.",
   "Was it exciting?",
   "Not really. But there was a bakery that made perfect apple pie."
  ],
  [
   "I tried teaching my little brother a tongue twister.",
   "Did he get it?",
   "On the first try. I still get stuck halfway. It's humiliating."
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
   "Someone dropped a hat the size of a plum.",
   "Are you sure it's a hat?",
   "It has a tiny pom-pom. I'm going with hat.",
   "What will you do with it?",
   "Put it in lost and found. Imagine explaining that inventory entry."
  ],
  [
   "I signed up for what I thought was a baking workshop.",
   "What was it actually?",
   "A community bake-off. I made the world's quickest banana loaf.",
   "How did you do?",
   "Third place. Out of four. Still got a recipe out of it."
  ],
  [
   "I've been practicing a coin trick.",
   "Does it work?",
   "The coin disappears, but I spend ten minutes finding it afterward."
  ],
  [
   "That dog on the corner is there every morning.",
   "Does it have an owner?",
   "Yes. Its owner opens the bakery. I call the dog Captain; it looks like it's supervising."
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
   "Look at these photos.",
   "You went to a booth?",
   "The one near the station. I started laughing during the first picture and couldn't stop."
  ],
  [
   "I finally took a day off and went to the sculpture park.",
   "Anything good there?",
   "A metal bird taller than a house. I sat under it for an hour.",
   "No errands afterward?",
   "Not one. Please don't sound so amazed."
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
   "I found a little take-a-book shelf near the station.",
   "Did you take one?",
   "Yes. Left two books in return. One had a note inside recommending chapter four."
  ],
  [
   "I went for a walk and stumbled onto a parade.",
   "What was it celebrating?",
   "I still don't know. There were drums and somebody in a giant peach costume."
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
   "Tell me whether this belongs on my desk.",
   "A ceramic frog in a bow tie?",
   "Exactly. It's ugly in a very committed way.",
   "Are you buying it?",
   "Already did. I just wanted a second opinion before naming him."
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
   "That dress in the window stopped me in my tracks.",
   "Is it your style?",
   "Not quite. My mother wore something like it when she danced.",
   "Did you tell her?",
   "I called her on the way home. She laughed and started singing the old song."
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
