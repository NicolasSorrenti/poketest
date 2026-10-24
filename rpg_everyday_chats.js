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
   "Did you and the dog finish the duet?",
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
   "Please tell me you at least got lunch.",
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
  ],
  [
   "Can I ask you to settle an argument?",
   "Depends. About what?",
   "Whether a crooked handmade sign has more charm than a perfectly printed one.",
   "You made the crooked sign, didn't you?",
   "Possibly. Camila called it 'aggressively welcoming.' I think that's a compliment."
  ],
  [
   "Look, someone left a thank-you card for the volunteers.",
   "That's sweet. Who wrote it?",
   "No name. Just a little drawing of our front door.",
   "You're going to put it up?",
   "Once I find a place where the sun won't fade it. It's too good for the suggestion box."
  ],
  [
   "I almost threw out a box of mismatched sleeves.",
   "What stopped you?",
   "A kid asked if they could use them for a practice deck.",
   "Did they take the whole box?",
   "Half of it. And now our beginner table looks like a rainbow. Honestly, I like it."
  ],
  [
   "I need an opinion on these two posters.",
   "The colorful one or the simple one?",
   "Exactly. The colorful one is mine; the simple one is from a new volunteer.",
   "Which do they prefer?",
   "The simple one. I think I'll hang both and let them choose the next event's design."
  ],
  [
   "Someone brought a little cake to thank the shop staff.",
   "What's the occasion?",
   "That's the thing. Apparently it doesn't have to be a special day.",
   "Are you keeping some for yourself?",
   "I put a slice aside before anyone noticed. I've learned at least one thing from Camila."
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
   "How does a dog make Reina late?",
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
   "Who are you trying to avoid?",
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
   "Did she like the drawings?",
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
   "Is the little flower still with you?",
   "Pressed it inside a book. I don't know why you're smiling."
  ],
  [
   "I've been practicing a song on an old keyboard.",
   "Can you play it yet?",
   "The beginning. The middle is a disaster.",
   "Play it for me sometime?",
   "Maybe. When I can survive the middle without laughing."
  ],
  [
   "Yuna thinks I need a victory pose.",
   "What's your opinion of victory poses?",
   "That winning the match is the victory pose.",
   "Did she listen?",
   "She demonstrated four poses anyway. I admit one was pretty good."
  ],
  [
   "I was watching a beginner practice shuffling.",
   "Were they having trouble?",
   "They kept dropping cards, so I sat down and showed them.",
   "You were patient?",
   "Don't sound surprised. They were trying. That's all I ask."
  ],
  [
   "There's a bakery near the center with the worst name.",
   "How bad?",
   "'Dough or Die.'",
   "Are the pastries good?",
   "Very. That's what makes it so irritating."
  ],
  [
   "I lost a match yesterday and didn't immediately rewrite my deck.",
   "That sounds unusual for you.",
   "I went home, made dinner, and watched a movie first.",
   "Was it easier to review the match afterward?",
   "Yes. I spotted the mistake this morning without being angry at myself."
  ],
  [
   "See this crooked little trophy?",
   "It looks homemade.",
   "My sister made it when we were kids, for a game I barely remember.",
   "Why keep it?",
   "She was so proud of me. I'd rather have that on my shelf than another medal."
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
   "Was there a scene worth remembering?",
   "I laughed so hard at one scene that I had to rewind.",
   "Even without dialogue?",
   "Especially without it. The actor's eyebrows did all the talking."
  ],
  [
   "Someone returned a library book with a pressed flower inside.",
   "Do you know whose it was?",
   "No. I left it between the pages.",
   "Why leave it tucked in the book?",
   "It seemed rude to separate the flower from the story it had been keeping company."
  ],
  [
   "I tried solving a crossword with Jun.",
   "Did you finish?",
   "He spent ten minutes disputing an answer's wording.",
   "Sounds like him.",
   "We were both wrong. The answer was 'pear.' It was rather satisfying."
  ],
  [
   "I think I prefer the café when it rains.",
   "Because it's quieter?",
   "Partly. The windows fog up, and nobody complains if you sit with a book for a while.",
   "Alma doesn't mind?",
   "She brings me tea before I even ask."
  ],
  [
   "Can you help me decide whether to return this book?",
   "You didn't enjoy it?",
   "I loved the first half. The ending annoyed me.",
   "So why keep it?",
   "I want to read it again to find out whether I'm being unfair. That is a terrible reason to miss the return date."
  ],
  [
   "There's a little note taped inside the library clock.",
   "What does it say?",
   "'Remember to go home sometimes.'",
   "Who wrote it?",
   "The librarian, to herself. I think we should both take it seriously."
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
   "How did you end up with a sandwich?",
   "I clicked the wrong video and learned how to make a sandwich instead.",
   "So, no magic?",
   "Not unless you count how fast I ate the sandwich."
  ],
  [
   "There was a little frog on the sidewalk.",
   "Did you get the frog off the pavement?",
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
   "What was making all that noise?",
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
   "Anything worth staying for?",
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
   "How did you try to make her feel welcome?",
   "That being new means nobody knows your bad jokes yet.",
   "Did she laugh?",
   "A little. Then she told me one. It was awful. I loved it."
  ],
  [
   "I've been trying to cook one meal without checking my phone.",
   "How's that going?",
   "The noodles are getting better. The silence is the hard part."
  ],
  [
   "You have to hear this terrible idea.",
   "I'm listening.",
   "A talent show where every act has to involve a card trick.",
   "What would you do?",
   "I'd dramatically reveal that I don't know any card tricks. Standing ovation."
  ],
  [
   "I took my little cousin to the arcade.",
   "Who won?",
   "Her. By a lot. I said I was letting her win.",
   "Were you?",
   "She gave me such a pitying look. I think she knows."
  ],
  [
   "I tried turning an ordinary walk into a race.",
   "With who?",
   "Myself. I challenged the traffic lights.",
   "Did the traffic lights let you finish?",
   "No. But I stopped at a really good bakery, so the judges are reviewing the result."
  ],
  [
   "I practiced being quiet for an entire hour.",
   "You? On purpose?",
   "Yes. I wanted to see if I could focus without filling every silence.",
   "How'd it go?",
   "Pretty well. Then I saw a dog wearing boots and had to tell someone. Look at this photo!"
  ],
  [
   "I was supposed to cheer up my friend yesterday.",
   "Did you manage?",
   "I brought silly stickers and a terrible movie.",
   "Did the movie cheer them up?",
   "Not right away. We just sat there a bit. That was probably what they needed."
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
   "I'm guessing the crystals disagreed with you?",
   "The box promised a sparkling crystal. I have produced a blue lump.",
   "Maybe it needs time?",
   "Possibly. I've named it Control Group One."
  ],
  [
   "A busker was playing violin outside the station.",
   "Did you stay for the music?",
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
   "Did you get to meet the puppy?",
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
  ],
  [
   "I brought two different lunches and forgot which one I packed.",
   "Why two?",
   "I was testing a new recipe. I labeled the containers, then put the labels on the wrong lids.",
   "So how was the test?",
   "The mystery lunch was excellent. The data is useless."
  ],
  [
   "A child asked why the moon follows the bus.",
   "How did you explain that to a child?",
   "I started explaining distance and perspective.",
   "Did they understand?",
   "Probably not. They asked if it gets lonely. I liked that question better."
  ],
  [
   "I keep a notebook for things I can't explain.",
   "Isn't that what all your notebooks are for?",
   "Not quite. This one has things like 'why do some songs feel like old places?'",
   "Any answers?",
   "None yet. I'm enjoying not having them."
  ],
  [
   "I keep finding a little drawing in the margins of my deck notes.",
   "You drew it?",
   "A tiny umbrella. It appears whenever a match started badly.",
   "What does it mean?",
   "I don't remember. But it makes me laugh now, so I'm keeping it."
  ],
  [
   "Somebody asked me what my favorite part of tournaments is.",
   "Let me guess: collecting data.",
   "I almost said that. Then I realized it's eating together afterward.",
   "Did you tell them?",
   "Yes. They looked more surprised than you do."
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
   "How did your term as mayor end?",
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
   "Did you manage to lose?",
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
   "Was it the kind of show you enjoy?",
   "Funny and sad and completely impossible to explain.",
   "Do you recommend it?",
   "Absolutely. I'd take you, and still refuse to explain it."
  ],
  [
   "A little kid tried selling me a leaf at the park.",
   "Did the kid convince you to take the leaf?",
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
   "Was your niece fooled?",
   "She spotted the secret instantly, then promised not to tell anyone.",
   "Can you trust her?",
   "Only if I pay her in chocolate."
  ],
  [
   "Someone tried to sell me a deck box with a broken latch.",
   "And you bought it?",
   "Only after they told me why they kept it so long.",
   "What was the story?",
   "Their first tournament. I fixed the latch and gave it back at cost."
  ],
  [
   "I discovered an excellent place to buy fruit.",
   "Better prices?",
   "The owner lets you taste before choosing.",
   "Is that why you like it?",
   "Partly. She also remembers everybody's name. You can't put that on a price tag."
  ],
  [
   "I made a deal with Alma over a cake.",
   "What kind of deal?",
   "I'd stop correcting her receipts if she'd stop calling me a workaholic.",
   "Did either of you agree?",
   "No. We shared the cake and went back to arguing. Best deal I've made all week."
  ],
  [
   "I found a card with a little note on the back.",
   "Does that hurt its value?",
   "Financially, yes. But it says 'good luck, kiddo' in somebody's handwriting.",
   "Are you selling it?",
   "I haven't decided. I want to ask whether the seller knows who wrote it first."
  ],
  [
   "I bought two coffees and got charged for three.",
   "Did you complain?",
   "Of course. Politely, before you make that face.",
   "How did the café handle the mistake?",
   "They apologized, refunded me, and offered a pastry. I left a bigger tip than usual."
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
   "Is the gate quiet now?",
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
   "Did you manage to stay unplanned?",
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
  ],
  [
   "Nereo says he can tell when rain's coming by his knee.",
   "Do you believe him?",
   "Not for forecasts. But he did warn me to bring a jacket.",
   "And did it rain?",
   "No. I needed the jacket anyway. It's always colder near the water."
  ],
  [
   "I found a little painted rock along the path.",
   "Did someone leave it there?",
   "It had a note underneath saying 'take me somewhere pretty.'",
   "Where did you put it?",
   "By the old tree in the park. I hope someone keeps it traveling."
  ],
  [
   "Have you ever stayed somewhere just to hear the music?",
   "A concert?",
   "No, a café with someone practicing the piano badly.",
   "That sounds difficult to sit through.",
   "A little. But by the end they finally got the melody right. Everybody clapped."
  ],
  [
   "The river's higher than it was yesterday.",
   "Is that a problem?",
   "No. It just means the little path by the reeds is flooded.",
   "Will you take another route?",
   "Yes. Nereo showed me one years ago. I should probably thank him for remembering."
  ],
  [
   "I found a bench with a perfect view and terrible shade.",
   "Which matters more?",
   "Yesterday, the view. Today, the shade.",
   "You're not going to choose?",
   "Maybe I can move two steps to the left and have both. Amazing what a little compromise does."
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
   "How did you keep the party a surprise?",
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
   "Did you find a way to help without taking over?",
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
   "Does the music player run now?",
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
   "Does it remind you of somewhere?",
   "I picked it up on a good day. It's silly, but I like remembering it."
  ],
  [
   "There's a little food stall that never puts up a menu.",
   "How do you order?",
   "You ask what they made that day.",
   "Isn't that risky?",
   "Only if you hate surprises. Yesterday was excellent soup."
  ],
  [
   "The arcade owner offered me a job fixing a machine.",
   "Can you fix machines?",
   "Apparently, after watching me take one apart.",
   "Did you accept?",
   "I said I'd think about it. I'm better at breaking my own stuff than fixing theirs."
  ],
  [
   "An old friend sent me a postcard with no message.",
   "Just a picture?",
   "And a little drawing of a train in the corner.",
   "You know what it means?",
   "Yeah. That's enough. Some people don't need to write much."
  ],
  [
   "Someone asked whether I'd stay in town after the season.",
   "Did you answer?",
   "I said I'd see how things go. That sounds evasive, doesn't it?",
   "A little.",
   "I'm not trying to be mysterious. I just don't want to promise an answer before I know it."
  ],
  [
   "I ordered the same lunch three times this week.",
   "Found a favorite?",
   "The woman at the stall remembered my name on the second visit.",
   "And the third?",
   "She asked whether I wanted extra chili. I said yes. I'm apparently a regular now."
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
   "Did you listen for a while?",
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
   "Were you the team octopus expert?",
   "No, but I knew every octopus question.",
   "That's something.",
   "My team says I'm in charge of octopuses from now on."
  ],
  [
   "My neighbor gave me an old lamp.",
   "Does the lamp still light up?",
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
   "Was it a happy accident?",
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
  ],
  [
   "I helped an older man carry a television up the stairs.",
   "That sounds heavy.",
   "It was. He insisted on telling me its entire history between floors.",
   "Did you get the television upstairs safely?",
   "Yes. It's older than I am and has a much better story."
  ],
  [
   "A kid asked to borrow my colored pencils.",
   "Did you have any?",
   "Only three. They drew a rainbow with red, blue and green.",
   "Was that enough?",
   "Apparently. They said the missing colors were 'secret colors.'"
  ],
  [
   "I spent an afternoon teaching my cousin a card game.",
   "Was she good at it?",
   "Too good. She figured out the best move while I was explaining the rules.",
   "Did your cousin let you win even once?",
   "Not once. She says I can keep practicing."
  ],
  [
   "I almost didn't enter the practice match yesterday.",
   "What changed your mind?",
   "The person at the other table looked just as nervous as I felt.",
   "Did playing against someone equally nervous help?",
   "We both made mistakes. Then we laughed and played another game."
  ],
  [
   "I tried wrapping a birthday gift without instructions.",
   "How difficult can that be?",
   "Apparently quite. Every corner of the box has a different shape now.",
   "Does it look bad?",
   "A little. But my cousin will know I did it myself."
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
   "Did your nephew enjoy his big night?",
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
   "Did the cleaning staff appreciate the poem?",
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
   "How did you answer him?",
   "Of course. We just get better at choosing who to tell."
  ],
  [
   "I changed the music in the café for the afternoon.",
   "What did you put on?",
   "Some old records from my sister's collection.",
   "Did people notice?",
   "One customer started humming. I hadn't heard that song in years."
  ],
  [
   "A teenager asked whether they could study at the big table.",
   "Was it busy?",
   "Not then. They spread notes everywhere and ordered one tea.",
   "Did you mind?",
   "Not at all. I brought a second pot when their friends arrived."
  ],
  [
   "I found a recipe in my mother's handwriting.",
   "Are you going to make it?",
   "I already tried. She never wrote down how much cinnamon to use.",
   "How close did you get to your mother's recipe?",
   "Close enough to make me call her. That's the important part."
  ],
  [
   "Somebody left a chessboard on the café shelf.",
   "Does anyone play?",
   "A few regulars started yesterday. They only got halfway through a game.",
   "Did they leave the game unfinished?",
   "They went home and left the pieces exactly where they were. I put a little note saying 'to be continued.'"
  ],
  [
   "I'm thinking of closing an hour early one day a week.",
   "Will people mind?",
   "Probably. But I miss having dinner with my sister.",
   "Are you going to do it?",
   "Yes. I'll put up a sign with enough notice. Maybe they'll forgive me."
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
   "Does it actually play music?",
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
   "And how was your first proper peach?",
   "Best peach of my life. Don't make that dramatic."
  ],
  [
   "I repaired an old lamp for a neighbor.",
   "Was she happy?",
   "She turned it on and started crying.",
   "Did the radio mean something to her?",
   "It belonged to her father. I'm glad I fixed it."
  ],
  [
   "Tried cooking rice without the timer.",
   "Did the rice survive?",
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
  ],
  [
   "The dock's noticeboard keeps losing its pins.",
   "Is the wind taking them?",
   "That, or someone is collecting them. I tied the notices with string.",
   "Are the notices staying up?",
   "So far. Looks ugly, stays up. My kind of repair."
  ],
  [
   "Marina says I should learn a new hobby.",
   "Don't you already have hobbies?",
   "Fishing and fixing things apparently don't count.",
   "What did you choose?",
   "Baking. First loaf was heavy enough to anchor a boat."
  ],
  [
   "A kid asked why the ferry has a name.",
   "I bet you had an answer ready.",
   "Because you take better care of something once it feels familiar.",
   "Did they like that answer?",
   "They wanted to rename it 'Captain Sandwich.' Can't say I hate it."
  ],
  [
   "Someone painted the old dock bench bright blue.",
   "Without asking?",
   "They asked. I said any color was fine, so long as they sanded it first.",
   "Do you like it?",
   "It's a little brighter than I expected. But the kids have stopped calling it 'the sad bench.'"
  ],
  [
   "I made a list of things to repair and left it in my pocket.",
   "That's useful, isn't it?",
   "Until it went through the wash.",
   "Can you read anything?",
   "Just 'lamp' and something that might say 'sandwich.' I hope it was important."
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
   "Is that the magnet you bought yourself?",
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
   "Did the soup taste any better than it looked?",
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
   "Did you manage a decent stitch?",
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
  ],
  [
   "A colleague left a small plant on my desk.",
   "A gift?",
   "She said the office needed something alive besides the calendar.",
   "Do you like it?",
   "I do. I've started opening the blinds earlier to give it sunlight."
  ],
  [
   "I attended a concert without looking at my watch.",
   "Was that difficult?",
   "At first. Then I realized nobody in the room was waiting for me to finish anything.",
   "Did you enjoy it?",
   "Very much. I bought tickets for another one."
  ],
  [
   "There is a café that gets my order wrong every time.",
   "Why do you keep going?",
   "They are trying, and the tea is excellent.",
   "What do they bring?",
   "Usually the wrong biscuit. I've discovered several I like."
  ],
  [
   "I accepted an invitation without checking my calendar first.",
   "That seems risky for you.",
   "It was for a short walk after work. I knew I had an hour.",
   "And did you go?",
   "Yes. We wandered into a flower market. It was a lovely hour."
  ],
  [
   "My colleague asked why I always use the same pen.",
   "Why do you?",
   "It belonged to my father. He gave it to me before my first interview.",
   "Does it still work?",
   "Beautifully. The ink is ordinary, but I like how it feels in my hand."
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
   "I bought a packet of flower seeds and lost the label.",
   "So what are you planting?",
   "That's the fun part. Could be flowers, could be something weird.",
   "You have no idea?",
   "Nope. I gave the pot a name anyway: Classified."
  ],
  [
   "I made a playlist for a quiet afternoon.",
   "You? Quiet?",
   "Shocking, I know. Mostly piano and songs without anyone shouting.",
   "Any good?",
   "Actually, yeah. I might make a second one for you."
  ],
  [
   "My phone keeps turning 'okay' into 'okra.'",
   "Haven't you fixed it?",
   "I'm too deep into the bit now. Teo keeps asking for vegetable updates."
  ],
  [
   "Someone left a tiny toy astronaut on a park bench.",
   "Did you take it?",
   "No. I sat it upright like it was waiting for a bus.",
   "You should've taken a photo.",
   "I did. It looks more patient than most people."
  ],
  [
   "Did you know there's an octopus that looks like it has ears?",
   "No. How do you know?",
   "I got stuck watching deep-sea videos last night.",
   "Did you sleep at all?",
   "Eventually. After the octopus. I have priorities."
  ],
  [
   "I tried baking cinnamon rolls.",
   "How'd they turn out?",
   "They merged into one gigantic roll.",
   "Are you eating it?",
   "Absolutely. It still tastes good. Just bring a knife."
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
   "Did the album live up to the memory?",
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
   "Somebody put a handwritten sign on the broken bench by the park.",
   "What did it say?",
   "'Bench is resting. Please give it some space.'",
   "Did they fix it?",
   "Not yet. But people stopped trying to sit on it, so I guess it worked."
  ],
  [
   "I took my headphones off on the bus today.",
   "What made you do that?",
   "I wanted to hear the city for once. It sounded pretty good."
  ],
  [
   "I heard someone practicing guitar in the next apartment.",
   "Were they any good?",
   "Not yet. Same four chords for a week.",
   "That sounds annoying.",
   "It was. Then they finally nailed it and I cheered through the wall."
  ],
  [
   "I found a cardboard box big enough to build a little spaceship.",
   "For what?",
   "My neighbor's kid wanted to make something for a school play.",
   "Did the little spaceship survive its launch?",
   "Yeah. We used bottle caps for buttons. It looked ridiculous. Perfect."
  ],
  [
   "A friend said my handwriting looks like a storm.",
   "Does it?",
   "Only when I'm in a hurry.",
   "Can you read it afterward?",
   "Sometimes. That's why I send voice notes. It's a public safety measure."
  ],
  [
   "The arcade put up a notice asking for quiet after nine.",
   "Were you responsible?",
   "I wasn't even there yesterday!",
   "That wasn't my question.",
   "...Okay. I might have contributed last week. I bought the owner a packet of earplugs."
  ],
  [
   "Somebody asked me to draw a logo for their club.",
   "Did you agree?",
   "Yeah. I drew six versions and hated all of them.",
   "What did they think?",
   "They picked the one I almost threw away. I guess that's why you show your work."
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
   "Look at this magazine the library was giving away.",
   "Tiny houses?",
   "Yes. Some of them have staircases built right into cupboards.",
   "Could you live in one?",
   "Maybe for a weekend. I'd miss having room for all my books."
  ],
  [
   "I finally beat that rhythm-game level everyone struggles with.",
   "Seriously?",
   "On the hardest setting. I practiced the same section for ages.",
   "Were you excited?",
   "Yes, but my hands were shaking. I had to sit down afterward."
  ],
  [
   "I tried the hot sauce from that little shop.",
   "Too hot?",
   "Not at all. I went back and bought another bottle.",
   "You're full of surprises.",
   "Only some of them are edible."
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
   "Does looking at the stars make the day nicer?",
   "I made three more. It's becoming a little sky."
  ],
  [
   "I sang while making dinner yesterday.",
   "How'd that go?",
   "Dinner was good. The singing might owe my neighbor an apology."
  ],
  [
   "A cat followed me home while it was raining.",
   "Did you take it in?",
   "I checked its collar. It belonged to the family upstairs, so I walked it home.",
   "Did it seem pleased?",
   "It went straight to its food bowl. I think so."
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
   "Does the wind chime sound right again?",
   "Yes. It makes a soft sound when the window opens.",
   "Doesn't it keep you awake?",
   "No. I like knowing there's a breeze."
  ],
  [
   "My aunt taught me how to grow herbs on a windowsill.",
   "Is that hard?",
   "Not really, but I keep watering the wrong pot.",
   "Which one?",
   "The empty one. I'm going to label them this afternoon."
  ],
  [
   "There was a free piano outside the community center.",
   "Did you play?",
   "A little. A stranger came over and joined in.",
   "Did you know them?",
   "No. We never introduced ourselves. It was nice anyway."
  ],
  [
   "I went to a poetry reading.",
   "Did you read anything?",
   "No, I listened. Somebody wrote about missing the last bus and I cried a little."
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
  ],
  [
   "I brought a second copy of a book back to the library.",
   "Why two?",
   "My aunt found another one at a sale, and I didn't want it to sit unused.",
   "Did the library take it?",
   "Yes. The librarian said somebody had been looking for exactly that edition."
  ],
  [
   "I signed up for a workshop without asking anyone to come with me.",
   "Were you nervous?",
   "Terribly. Then someone asked to share my table.",
   "Were they easy to talk to?",
   "We talked the whole afternoon. I think I'll go again."
  ],
  [
   "I noticed a small poster asking for volunteers at the animal shelter.",
   "Thinking of helping?",
   "Maybe. I used to worry I'd make mistakes.",
   "You could learn.",
   "That's what I thought. I'm going to ask when they need people."
  ],
  [
   "I asked the instructor a question in front of everyone today.",
   "That sounds normal.",
   "For me it took ten minutes to work up the nerve.",
   "Did they answer?",
   "They did. And two other people said they'd been wondering the same thing."
  ],
  [
   "My desk was covered in little paper stars.",
   "Were you decorating?",
   "At first. Then I noticed one of my friends looking sad and gave her a handful.",
   "Did she like them?",
   "She put one in her phone case. I saw it later and couldn't stop smiling."
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
   "I went to the market for a single apple.",
   "So where was the apple?",
   "Came home with peaches and an old spoon. No apple.",
   "How did that happen?",
   "The spoon looked like something from my grandmother's kitchen. I got distracted."
  ],
  [
   "I learned an important cooking lesson yesterday.",
   "Which one?",
   "Don't leave the lid off the blender when making sauce.",
   "How bad was it?",
   "I found tomato on the ceiling. I'm still apologizing to it."
  ],
  [
   "I found a note in my coat pocket from last week.",
   "What did it say?",
   "'Remember the nice thing.' No other details.",
   "Do you remember?",
   "No. So I'm writing a new nice thing next to it."
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
   "Someone showed me how to carve an apple into a swan.",
   "Does it actually look like a swan?",
   "Not exactly. Mine looks like a very tired duck."
  ],
  [
   "I tried making candles this weekend.",
   "Any success?",
   "The first one leaned to one side, but it smells amazing.",
   "Are you keeping it?",
   "Of course. I made it myself."
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
   "Please tell me that outfit came home with you.",
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
   "I patched my old jeans with a little blue star.",
   "You did that yourself?",
   "Yeah! The first stitch was a disaster, but the last few were pretty good."
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
  ],
  [
   "I got halfway through rehearsal before noticing my shoes didn't match.",
   "Seriously?",
   "One stage shoe and one sneaker. I ran out the door distracted.",
   "Did anybody see?",
   "My choreographer. She laughed, then lent me a spare pair."
  ],
  [
   "Someone asked me to recommend a song for a long train ride.",
   "What did you pick?",
   "Something slow with a really good chorus.",
   "Why that one?",
   "It makes even a crowded train feel like it has a little space."
  ],
  [
   "I found a card sleeve with a drawing tucked inside.",
   "What was the drawing?",
   "A tiny Grass Pokémon with a bow. A fan gave it to me years ago.",
   "Do you still have that sleeve?",
   "Of course. I put it where I'll see it before every rehearsal."
  ],
  [
   "My manager asked me to choose between two outfits for a performance.",
   "Which one did you pick?",
   "The one that lets me move without worrying about it.",
   "Not the flashier one?",
   "Not this time. If I can dance comfortably, I can make it look good."
  ],
  [
   "A younger fan asked whether I ever have stage fright.",
   "Did you tell her you get nervous too?",
   "All the time. My hands get cold before I go on.",
   "Did that surprise her?",
   "She looked relieved. I wish somebody had told me that when I was younger."
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
   "I stopped to photograph a shadow on the pavement.",
   "A shadow?",
   "A bicycle made a shape that looked exactly like a giraffe.",
   "Did anyone notice you?",
   "One passerby. They looked at the shadow, too, and laughed."
  ],
  [
   "I tried improvising dinner.",
   "Was dinner edible?",
   "Spicy rice with orange juice. The rice was good; the juice was a mistake.",
   "What'll you do next time?",
   "Start with water. Very innovative."
  ],
  [
   "A friend gave me a cactus.",
   "Does it have a name?",
   "Professor Prickles. It sits on my windowsill, judging every photo I take."
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
   "Did the dog at least let you sit nearby?",
   "Sat on the grass. The dog was a better guest than I was."
  ],
  [
   "I have exactly one strawberry on my balcony.",
   "One?",
   "The other flowers didn't turn into fruit. I'm trying not to fuss over this one."
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
   "I tried sketching my hand instead of photographing it.",
   "Any good?",
   "Six fingers. Somehow I gave myself six fingers.",
   "Keeping it?",
   "Definitely. It makes me laugh."
  ],
  [
   "I sat for a portrait on the street.",
   "How did it turn out?",
   "The artist got my nose right, but gave me a hairstyle I've never had.",
   "Did you mind?",
   "No. I'm tempted to try it."
  ],
  [
   "A teenager asked me to sign a scrap of paper.",
   "Did you sign it for her?",
   "Yes, then we talked about her favorite music instead."
  ],
  [
   "I lost track of time watching fish in a pond.",
   "Didn't you have someplace to be?",
   "They were there, and for once I didn't need to be elsewhere."
  ],
  [
   "A magazine asked what I do to relax.",
   "What did you admit in the end?",
   "The usual polished answer. Then I admitted I like sitting by the window with noodles.",
   "Did they print that part?",
   "Yes. A reader wrote to say she does the same thing."
  ],
  [
   "I helped a younger model prepare for her first shoot.",
   "Was she nervous?",
   "Very. She kept asking if she looked all right.",
   "How did you help her settle down?",
   "That we could fix the lighting. She didn't need to fix herself."
  ],
  [
   "I missed a chance to take the perfect picture.",
   "What kept you from taking it?",
   "I was laughing with friends and forgot the camera.",
   "Do you regret it?",
   "Not really. I remember the evening perfectly."
  ],
  [
   "I found an old photo where nobody is looking at the camera.",
   "Do you like it?",
   "I think it's my favorite from that day.",
   "What makes that photo special?",
   "Everyone's laughing at something I can't remember. It looks exactly how being there felt."
  ],
  [
   "My friend told me I didn't have to bring my camera to dinner.",
   "Was that strange?",
   "Very. I kept reaching for the bag that wasn't there.",
   "Did you miss any pictures?",
   "Probably. But I didn't miss the conversation."
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
   "I saw a scarf covered in tiny ducks wearing hats.",
   "Are the ducks coming home with you?",
   "Naturally. It's going to be the centerpiece of my next outfit.",
   "What's the outfit?",
   "Don't know yet. The ducks get creative control."
  ],
  [
   "The fancy dessert I made turned into a bowl of soup.",
   "Was that in the recipe?",
   "No. I think I added too much milk.",
   "How did it taste?",
   "Actually okay. I'm calling it dessert soup and moving on."
  ],
  [
   "Someone taught me a handshake and I forgot the ending.",
   "What happens instead?",
   "Two claps, a spin, and complete social panic. Help me invent an ending."
  ],
  [
   "I helped decorate a cake with an underwater theme.",
   "What did you make?",
   "A blue jellyfish. Except I kept adding legs.",
   "Isn't that an octopus?",
   "It was by the time I finished. My friend loved it anyway."
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
   "My herb garden has been taken over.",
   "By insects?",
   "Worse. Mint. It grew into every pot.",
   "What will you do?",
   "Make tea for the entire neighborhood, apparently."
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
   "Was the record worth the soaking?",
   "Beautiful. I'm glad I got soaked."
  ],
  [
   "I've decided I need a better way to greet people.",
   "What's wrong with hello?",
   "It's fine, but a high five with a spin is more memorable.",
   "Isn't that a little much?",
   "Probably. That's why I'll practice before trying it on Jun."
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
   "I went to a puppet show with my friend's little sister.",
   "Did she enjoy it?",
   "She kept shouting warnings to the puppets.",
   "Did they listen?",
   "Not once. She's planning to write the puppeteers a stern letter."
  ],
  [
   "I found a tiny book of poems at a stall.",
   "Any good ones?",
   "One about missing a train made me miss mine."
  ],
  [
   "I tried running a treasure hunt with no prize.",
   "Did anyone play?",
   "A few people. We ended up finding things we'd never noticed around town.",
   "What was the best discovery?",
   "A tiny mural behind the bakery. And a bench just big enough for everyone."
  ],
  [
   "I brought snacks for a group and everyone canceled.",
   "That's disappointing.",
   "It was for a minute. Then I gave half to the neighbors and kept the rest.",
   "What did you do afterward?",
   "Watched a silly movie. The snacks were still excellent."
  ],
  [
   "I met someone who organizes community concerts.",
   "Are you joining them?",
   "Maybe, but I promised I'd start with just one job.",
   "Only one?",
   "I know. Jun looked so relieved when I said it."
  ],
  [
   "The park asked for volunteers to organize a tiny reading corner.",
   "You signed up?",
   "I wanted to, but I was already helping with two other things.",
   "So what did you do?",
   "I asked who could use supplies instead. Turns out they needed cushions. I can manage cushions."
  ],
  [
   "I brought too many paper lanterns to a picnic.",
   "How many is too many?",
   "Enough that the wind made them look like a flock of panicked birds.",
   "Did you put them away?",
   "Most of them. We kept two and ate under a very dramatic sky."
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
   "I bought a used book and found something between the pages.",
   "Money?",
   "Better. A bookmark with a little fox drawn on it.",
   "Better than money?",
   "Okay, maybe not better. But it made me smile."
  ],
  [
   "A paper airplane landed next to me on the bench.",
   "Where did it come from?",
   "No idea. I fixed a crooked fold and sent it off again.",
   "Did it fly?",
   "Much better than the first time. I hope whoever threw it saw."
  ],
  [
   "There was a chalk sun on the pavement outside the bakery.",
   "You took a picture?",
   "Yeah. I like those little things people leave behind for no reason."
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
   "I tried making embroidered patches.",
   "How'd the first one turn out?",
   "It's meant to be a flower. Looks more like a fried egg.",
   "Will you redo it?",
   "Nah, I like this one. It's got personality."
  ],
  [
   "Che, you have to try the lemon tart from the new bakery.",
   "That good?",
   "I went back just to ask the baker what was in it.",
   "Did she tell you?",
   "No. She gave me a smile and said 'more lemons than you'd think.'"
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
   "My cousin talked me into painting a tiny wooden boat.",
   "How did yours turn out?",
   "Bright red with white dots. It looks like a strawberry.",
   "Does it float?",
   "Don't know yet. Maybe I'll test it after work."
  ],
  [
   "Someone wrote 'you'll be okay' outside a shop.",
   "Did seeing those words make a difference?",
   "A little. I didn't know I needed to read it today."
  ],
  [
   "Che, I ran into our old swimming teacher.",
   "Did she remember us?",
   "She remembered the kid who always asked for five more minutes in the pool.",
   "That was you.",
   "She said it was both of us. I'm choosing to believe her."
  ],
  [
   "A kid at work asked me why I wear a whistle.",
   "How did you explain the whistle?",
   "So everyone can hear me when it matters.",
   "Did they get it?",
   "They asked to try it. I told them maybe after the swimming lesson."
  ],
  [
   "I saw our old neighborhood from the bus window.",
   "Has it changed?",
   "A little. The corner shop is painted blue now.",
   "Does it feel strange?",
   "Yeah. Still feels like ours, though. Even from the bus."
  ],
  [
   "I found an old photo of the pool from when we were little.",
   "Is that the one with the painted dolphin?",
   "Yeah! I thought I'd made that dolphin up.",
   "It was definitely real.",
   "Good. I was starting to wonder whether the rest of my childhood was a very elaborate dream."
  ],
  [
   "A kid at my swimming shift asked if I ever get tired.",
   "How did you answer that?",
   "Of course. Even people who love the water need breaks.",
   "Did they believe you?",
   "Not until I sat down and ate my sandwich. Apparently that was proof."
  ]
 ],
 "jun": [
  [
   "That door hinge has been bothering me for three days.",
   "You could ignore it.",
   "And let it win? Absolutely not.",
   "Is the hinge quiet now?",
   "Mostly. Now the door is silent, but I have oil on my tournament notes."
  ],
  [
   "A kid asked me which ice cream flavor was best.",
   "Which flavor did you recommend?",
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
   "Did the puppet keep performing?",
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
   "Did the ending surprise you?",
   "She warned me the ending was strange. It was stranger than she promised.",
   "Did she pick a good book for you?",
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
  ],
  [
   "I'm considering a new rule for the beginner tables.",
   "What kind of rule?",
   "No talking about 'obvious moves' when someone asks for help.",
   "That sounds reasonable.",
   "I wish it were obvious. It would make my job much easier."
  ],
  [
   "Someone brought homemade biscuits for the judges.",
   "A bribe?",
   "They were shaped like Pokémon. Terrible idea.",
   "Why terrible?",
   "I spent twenty minutes deciding whether eating a Pikachu was unethical."
  ],
  [
   "I caught myself looking at the clock during a movie.",
   "Were you bored?",
   "No. I was mentally calculating when it would end.",
   "Were you able to enjoy the film afterward?",
   "Yes. I took my watch off. The movie was much better after that."
  ],
  [
   "Two beginners were arguing about a rule before their first turn.",
   "Did you help?",
   "I asked them to read the card aloud together.",
   "Did that settle it?",
   "Almost. One of them spotted the answer and apologized. The other offered a rematch after dinner."
  ],
  [
   "I put the clipboard down early yesterday.",
   "That sounds suspicious.",
   "I went to the park and watched people play a game I didn't know.",
   "Did you learn the rules?",
   "Not even once. It was strangely relaxing."
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
   "Does it wake you on time?",
   "Too well. Every morning feels like a launch countdown."
  ],
  [
   "I drew a self-portrait yesterday.",
   "Please tell me somebody recognized you.",
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
   "What were you hoping to find?",
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
  ],
  [
   "I thought I'd lost my voice before yesterday's event.",
   "How did you save your voice?",
   "I spoke quietly all morning to save it.",
   "Was your voice ready for the event?",
   "A lot. Iris says it was the nicest morning she's had in months."
  ],
  [
   "My brother asked me to announce his cooking.",
   "You actually did the commentary?",
   "Of course. He was making toast.",
   "How dramatic can toast be?",
   "You'd be surprised. There was a tense moment when the butter wouldn't spread."
  ],
  [
   "I interviewed a player who just wanted to go home.",
   "What did you ask?",
   "One question, then I let them leave.",
   "That doesn't sound like you.",
   "It should. Nobody owes me a speech after a rough match."
  ],
  [
   "A kid asked me to say something in my announcer voice.",
   "What did you announce?",
   "That his mum had found his lost scarf.",
   "Was she amused?",
   "She laughed. The kid looked like he'd won a championship. Best call of the day."
  ],
  [
   "I spent a whole evening listening to somebody else tell stories.",
   "How did that feel?",
   "A little unnatural at first.",
   "Then?",
   "I learned more about my neighbor in an hour than I had in three years. Turns out I should do that more."
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
   "Have you pulled off the trick yet?",
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
   "Where did the crane come from?",
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
  ],
  [
   "I found a little handwritten map inside a delivery box.",
   "A map of what?",
   "The quickest route through the market. Someone drew arrows around all the potholes.",
   "Is it accurate?",
   "Mostly. I added a note about the loose step and put it back for the next driver."
  ],
  [
   "My aunt says I need to take more photos.",
   "Of what?",
   "Ordinary days, apparently. The things I usually forget to look at.",
   "Did you try?",
   "I took a picture of the harbor at closing time. It was beautiful."
  ],
  [
   "Teo returned my clipboard with a ribbon tied around it.",
   "An apology?",
   "He said it was a 'ceremonial upgrade.'",
   "Did you forgive him?",
   "Only after he promised to stop using it as a coaster."
  ],
  [
   "I made myself a checklist with only three things on it.",
   "That's unlike you.",
   "The old one had nineteen. I wanted to finish a day without carrying unfinished work home.",
   "Did you manage?",
   "Two and a half. I'm counting the half as progress."
  ],
  [
   "There's a child who waves at every delivery van.",
   "Does she wave at yours?",
   "Every time. Last week she drew me a tiny truck.",
   "Tell me you saved her drawing.",
   "It's taped inside my clipboard. Teo hasn't found it yet, thankfully."
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
   "I came home with three lemons instead of bread.",
   "How does that happen?",
   "The market had this beautiful pile of bright yellow fruit, and I got distracted.",
   "What about dinner?",
   "Toast is canceled. We're making lemonade."
  ],
  [
   "Someone told me my handwriting was beautiful.",
   "Isn't that good?",
   "Except it's completely unreadable. I think they assumed it was calligraphy.",
   "Did you correct them?",
   "I said thank you and tried not to laugh."
  ],
  [
   "I started a crossword last night and fell asleep on it.",
   "Any damage?",
   "I woke up with a pen mark on my cheek.",
   "Did you finish it?",
   "No, but I worked out the last clue at breakfast."
  ],
  [
   "I went to an outdoor flea market looking for a lamp.",
   "Did you find one?",
   "No. I found a music box shaped like a house.",
   "Does the music box still play?",
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
   "I tried learning a new dance step.",
   "How's it going?",
   "First half is fine. Second half keeps sending me into the sofa.",
   "Do you need help?",
   "Only if you're prepared to catch me."
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
   "Did you leave the gold leg?",
   "No. It looks like the chair has a secret."
  ],
  [
   "A friend asked me to teach her a simple stitch.",
   "Were you able to teach her?",
   "We spent the afternoon talking more than sewing.",
   "What did she make?",
   "One tiny crooked flower on her sleeve. She wore it home."
  ],
  [
   "There's a café around the corner with chairs that don't match.",
   "And you love it?",
   "Of course. Every chair looks like it has a different story.",
   "Which one did you choose?",
   "Green velvet, beside the window. Great light for sketching."
  ],
  [
   "A stranger complimented a scarf I'd made.",
   "Did she ask where you got it?",
   "That it was handmade. She asked me to show her how."
  ],
  [
   "I went to an outdoor concert and danced by myself.",
   "Was it awkward?",
   "For one song. Then someone else started dancing too."
  ],
  [
   "I found a bit of fabric from a costume I wore as a kid.",
   "Why keep it?",
   "I picked that color myself, even when everyone wanted me in pink.",
   "Still like the color?",
   "Absolutely. Maybe I'll use it as the lining of a new jacket."
  ],
  [
   "A customer asked me to make a deck box that looks serious.",
   "What does serious mean?",
   "Apparently black, straight lines, no glitter.",
   "Could you do it?",
   "Of course. I hid a tiny gold star inside. They loved it."
  ],
  [
   "I started cutting fabric and forgot what the original design was.",
   "What did you make instead?",
   "A little pouch with a wildly unnecessary pocket.",
   "Is the pocket useful?",
   "Not remotely. I like it more than the original plan."
  ],
  [
   "Someone asked why I keep scraps of fabric.",
   "What did you tell them?",
   "Because colors that don't belong together sometimes surprise you.",
   "Have you found a good combination?",
   "Look at this. Blue stripes and orange flowers. Strange, but it works."
  ],
  [
   "I found the perfect fabric for a jacket and it wasn't enough.",
   "Did you buy it anyway?",
   "Yes. I'm using it on the cuffs and the inside of the collar.",
   "So it'll be mostly hidden?",
   "Exactly. Not everything you love needs to be on display."
  ],
  [
   "I asked a friend to try on a design I wasn't sure about.",
   "What did she think?",
   "She said it felt like something she'd actually wear, not a costume.",
   "That's good, right?",
   "The best compliment. I want people to feel like themselves in my clothes."
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
  // permanently hiding some of the 21 topics in the 90-day season.
  const index=(day*7+Math.floor(day/4)+slot*3+hash(npc))%rows.length;
  return rows[index].map((text,i)=>({speaker:i%2?'Protagonist':npc,text}));
 }
 function validate(){
  const issues=[];
  for(const [npc,rows] of Object.entries(topics)){
   if(rows.length<21)issues.push(npc+': too few scenes');
   if(new Set(rows.map(r=>r[0])).size!==rows.length)issues.push(npc+': duplicate opener');
   if(rows.some(r=>![3,5].includes(r.length)||r.some(s=>typeof s!=='string'||!s.trim())))issues.push(npc+': malformed dialogue');
  }
  return issues;
 }
 return Object.freeze({topics,shouldUse,select,validate});
});
