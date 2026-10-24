'use strict';
// Optional multi-character Talk. Both NPCs must be present AND already met.
// The existing multi-speaker renderer displays every participant; no rewards/flags.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgGroupChats=api;
})(typeof window!=='undefined'?window:null,function(){
 const groups=[
 {
  "pair": [
   "hana",
   "camila"
  ],
  "scenes": [
   [
    [
     "hana",
     "Please tell Camila the suggestion box isn't a bidding system."
    ],
    [
     "camila",
     "I offered one credit for every useful suggestion. An incentive."
    ],
    [
     "Protagonist",
     "How many suggestions came in?"
    ],
    [
     "hana",
     "Forty-two. Thirty were from Camila."
    ],
    [
     "camila",
     "And the other twelve were about the suggestion box."
    ],
    [
     "Protagonist",
     "So is anyone getting paid?"
    ],
    [
     "hana",
     "I'm buying biscuits for everyone. Final offer."
    ]
   ],
   [
    [
     "camila",
     "Hana is giving away all the spare sleeves again."
    ],
    [
     "hana",
     "Only to people who need them."
    ],
    [
     "Protagonist",
     "What's the disagreement?"
    ],
    [
     "camila",
     "None. I'm matching her donation."
    ],
    [
     "hana",
     "You could have said that."
    ],
    [
     "camila",
     "And miss the chance to negotiate?"
    ],
    [
     "hana",
     "You're impossible. Thank you."
    ]
   ],
   [
    [
     "camila",
     "Someone wants to buy the old display cabinet."
    ],
    [
     "hana",
     "I told them it wasn't for sale."
    ],
    [
     "Protagonist",
     "Is it valuable?"
    ],
    [
     "camila",
     "Not especially. That's what made the offer interesting."
    ],
    [
     "hana",
     "It's where we keep the first-tournament photos."
    ],
    [
     "Protagonist",
     "Then you'd lose more than a cabinet."
    ],
    [
     "camila",
     "Fine. I'll find them another one. I'm not heartless."
    ]
   ],
   [
    [
     "hana",
     "I need to choose prizes for the beginners' event."
    ],
    [
     "camila",
     "Practical prizes. Sleeves, a few cards, something they'll use."
    ],
    [
     "Protagonist",
     "What was your idea, Hana?"
    ],
    [
     "hana",
     "A little handmade badge for everyone who finishes."
    ],
    [
     "camila",
     "That's actually not bad."
    ],
    [
     "Protagonist",
     "You sound surprised."
    ],
    [
     "camila",
     "I know a good investment when I see one."
    ]
   ],
   [
    [
     "hana",
     "Somebody suggested a trade night where nobody mentions card prices."
    ],
    [
     "camila",
     "And I said I'd help run it."
    ],
    [
     "Protagonist",
     "You? Really?"
    ],
    [
     "camila",
     "People still need to know whether a trade is fair."
    ],
    [
     "hana",
     "She's bringing a price guide but keeping it behind the counter."
    ],
    [
     "Protagonist",
     "Sounds like a compromise."
    ],
    [
     "camila",
     "Don't tell anyone. They'll expect more of them."
    ]
   ]
  ]
 },
 {
  "pair": [
   "reina",
   "yuna"
  ],
  "scenes": [
   [
    [
     "yuna",
     "Reina, tell them about our co-op victory."
    ],
    [
     "reina",
     "We lost."
    ],
    [
     "Protagonist",
     "That sounds more familiar."
    ],
    [
     "yuna",
     "We unlocked a bonus level first. A spiritual victory."
    ],
    [
     "reina",
     "You pressed pause instead of jumping."
    ],
    [
     "yuna",
     "I was making time for teamwork."
    ],
    [
     "reina",
     "Next time I get the jump button."
    ]
   ],
   [
    [
     "reina",
     "Yuna is announcing all her moves like stage tricks."
    ],
    [
     "yuna",
     "Because they ARE stage tricks. Surprise! A Trainer card!"
    ],
    [
     "Protagonist",
     "Doesn't announcing it ruin the surprise?"
    ],
    [
     "yuna",
     "No. Anticipation."
    ],
    [
     "reina",
     "It tells me exactly what's coming."
    ],
    [
     "yuna",
     "Then why did you fall for it yesterday?"
    ],
    [
     "reina",
     "I didn't. I wanted to see what you'd do."
    ]
   ],
   [
    [
     "yuna",
     "Reina said something nice about my deck."
    ],
    [
     "reina",
     "I said your opening hand was consistent."
    ],
    [
     "Protagonist",
     "That's practically a compliment."
    ],
    [
     "yuna",
     "I'm framing it."
    ],
    [
     "reina",
     "Don't you dare."
    ],
    [
     "Protagonist",
     "Maybe just write it on the deck box."
    ],
    [
     "yuna",
     "Too late. I've already told three people."
    ]
   ],
   [
    [
     "reina",
     "Why is there a rubber duck next to your damage counters?"
    ],
    [
     "yuna",
     "It's my tactical adviser."
    ],
    [
     "Protagonist",
     "Does it give good advice?"
    ],
    [
     "yuna",
     "It reminds me not to take every turn so seriously."
    ],
    [
     "reina",
     "That's... not entirely terrible."
    ],
    [
     "Protagonist",
     "There it is. Another compliment."
    ],
    [
     "reina",
     "I should have stayed home."
    ]
   ],
   [
    [
     "yuna",
     "Reina sat through my entire terrible magic show."
    ],
    [
     "reina",
     "There were three tricks. You dropped the cards during two."
    ],
    [
     "Protagonist",
     "What was the third trick?"
    ],
    [
     "yuna",
     "I made a coin disappear!"
    ],
    [
     "reina",
     "It rolled under a chair."
    ],
    [
     "Protagonist",
     "Did you ever get it back?"
    ],
    [
     "yuna",
     "Yes. With Reina's help. She's my assistant now."
    ]
   ]
  ]
 },
 {
  "pair": [
   "shiori",
   "akari"
  ],
  "scenes": [
   [
    [
     "shiori",
     "Akari has been trying to catalog my book notes."
    ],
    [
     "akari",
     "You have seven different symbols for 'important.'"
    ],
    [
     "Protagonist",
     "Why seven?"
    ],
    [
     "shiori",
     "Different kinds of important."
    ],
    [
     "akari",
     "Two are the same star with different points."
    ],
    [
     "shiori",
     "That distinction matters."
    ],
    [
     "Protagonist",
     "I think I've found your next collaborative project."
    ]
   ],
   [
    [
     "akari",
     "I calculated the odds of a particular opening hand."
    ],
    [
     "shiori",
     "I asked whether it was fun, not whether it was likely."
    ],
    [
     "Protagonist",
     "Can't both be true?"
    ],
    [
     "akari",
     "Yes. I've added 'enjoyment' to the margin."
    ],
    [
     "shiori",
     "And I tried reading the calculations."
    ],
    [
     "Protagonist",
     "Successful exchange?"
    ],
    [
     "shiori",
     "We both needed tea afterward, but yes."
    ]
   ],
   [
    [
     "akari",
     "I found a mistake in my own probability chart."
    ],
    [
     "shiori",
     "You seem oddly relieved."
    ],
    [
     "Protagonist",
     "Why relieved?"
    ],
    [
     "akari",
     "I've been staring at it for days. At least now I know what felt wrong."
    ],
    [
     "shiori",
     "There's something satisfying about finding the right question."
    ],
    [
     "Protagonist",
     "Even if you don't have the answer?"
    ],
    [
     "akari",
     "Especially then."
    ]
   ],
   [
    [
     "shiori",
     "Akari asked me to lend her a novel with an unreliable narrator."
    ],
    [
     "akari",
     "I thought it would be an interesting exercise."
    ],
    [
     "Protagonist",
     "Did you work out who was lying?"
    ],
    [
     "akari",
     "I took notes for forty pages."
    ],
    [
     "shiori",
     "Then she stopped taking notes and just read."
    ],
    [
     "Protagonist",
     "Who convinced you?"
    ],
    [
     "akari",
     "The book. I'd rather know how it ends."
    ]
   ],
   [
    [
     "shiori",
     "I found Akari asleep over a library book."
    ],
    [
     "akari",
     "I was resting my eyes. Briefly."
    ],
    [
     "Protagonist",
     "How briefly?"
    ],
    [
     "shiori",
     "Long enough for me to finish two chapters."
    ],
    [
     "akari",
     "You could have woken me."
    ],
    [
     "Protagonist",
     "Would you have gone home?"
    ],
    [
     "akari",
     "...Probably not. Thank you for letting me sleep."
    ]
   ]
  ]
 },
 {
  "pair": [
   "marina",
   "nereo"
  ],
  "scenes": [
   [
    [
     "nereo",
     "The dock sign's been repaired. Again."
    ],
    [
     "marina",
     "Because you refuse to replace it."
    ],
    [
     "Protagonist",
     "What's wrong with it?"
    ],
    [
     "nereo",
     "Nothing two bolts won't fix."
    ],
    [
     "marina",
     "And paint. And a legible arrow."
    ],
    [
     "nereo",
     "I said nothing serious."
    ],
    [
     "marina",
     "I'll bring the paint. You bring the bolts."
    ]
   ],
   [
    [
     "marina",
     "Nereo says he knows when the weather will turn."
    ],
    [
     "nereo",
     "I know when my knee complains. Different thing."
    ],
    [
     "Protagonist",
     "Does it work?"
    ],
    [
     "marina",
     "Sometimes. He warned me about rain last week."
    ],
    [
     "nereo",
     "I also warned you about a loose step."
    ],
    [
     "marina",
     "That was more useful."
    ],
    [
     "nereo",
     "Practical forecasts. That's my specialty."
    ]
   ],
   [
    [
     "marina",
     "Nereo, the little ferry waiting area needs more chairs."
    ],
    [
     "nereo",
     "I know. I already borrowed two from the office."
    ],
    [
     "Protagonist",
     "Is the ferry delayed?"
    ],
    [
     "marina",
     "Only a little, but an older couple have been standing."
    ],
    [
     "nereo",
     "They'll have seats in a minute."
    ],
    [
     "Protagonist",
     "Want help carrying them?"
    ],
    [
     "nereo",
     "Grab that end. And watch the loose step."
    ]
   ],
   [
    [
     "nereo",
     "Marina thinks I should replace my old coat."
    ],
    [
     "marina",
     "The sleeve's held together with tape."
    ],
    [
     "Protagonist",
     "That does seem like a sign."
    ],
    [
     "nereo",
     "It's good tape."
    ],
    [
     "marina",
     "I found a repair shop that can do the seam properly."
    ],
    [
     "Protagonist",
     "You'd still get to keep the coat."
    ],
    [
     "nereo",
     "...Fine. Write down the address."
    ]
   ],
   [
    [
     "marina",
     "We found a little bird's nest near the dock steps."
    ],
    [
     "nereo",
     "Right where people leave their bags."
    ],
    [
     "Protagonist",
     "Is it safe there?"
    ],
    [
     "marina",
     "We've put a rope around that corner for now."
    ],
    [
     "nereo",
     "A proper sign goes up tomorrow."
    ],
    [
     "Protagonist",
     "Did the birds seem bothered?"
    ],
    [
     "marina",
     "Not at all. They're much less worried than we are."
    ]
   ]
  ]
 },
 {
  "pair": [
   "jun",
   "teo"
  ],
  "scenes": [
   [
    [
     "teo",
     "Jun banned 'historic upset' from my commentary."
    ],
    [
     "jun",
     "You used it for a coin flip."
    ],
    [
     "Protagonist",
     "Was it an important flip?"
    ],
    [
     "teo",
     "Every flip matters to someone."
    ],
    [
     "jun",
     "They were starting a practice match."
    ],
    [
     "teo",
     "A historic practice match."
    ],
    [
     "jun",
     "I'm adding that phrase to the list too."
    ]
   ],
   [
    [
     "jun",
     "Teo brought snacks to the judges' table."
    ],
    [
     "teo",
     "Biscuits shaped like trophies."
    ],
    [
     "Protagonist",
     "That sounds thoughtful."
    ],
    [
     "jun",
     "He made a speech for every biscuit."
    ],
    [
     "teo",
     "A short speech!"
    ],
    [
     "jun",
     "I missed a rules question during one."
    ],
    [
     "teo",
     "A moment of silence for the fallen biscuit."
    ]
   ],
   [
    [
     "teo",
     "I promised Jun I'd keep my commentary down today."
    ],
    [
     "jun",
     "For the beginner matches. They were trying to concentrate."
    ],
    [
     "Protagonist",
     "How quiet did you manage?"
    ],
    [
     "teo",
     "I whispered the entire final turn."
    ],
    [
     "jun",
     "He was still louder than the players."
    ],
    [
     "Protagonist",
     "But quieter than usual?"
    ],
    [
     "jun",
     "Significantly. I bought him a drink afterward."
    ]
   ],
   [
    [
     "jun",
     "Teo wants a microphone at the next rules workshop."
    ],
    [
     "teo",
     "People need to hear the important details."
    ],
    [
     "Protagonist",
     "Is there going to be a big crowd?"
    ],
    [
     "jun",
     "Eight people, if everyone turns up."
    ],
    [
     "teo",
     "An intimate and exclusive audience."
    ],
    [
     "Protagonist",
     "Could you just sit at the table?"
    ],
    [
     "teo",
     "Fine. But I'm bringing my best introduction."
    ]
   ],
   [
    [
     "teo",
     "Jun has decided I need to learn the difference between commentary and interruption."
    ],
    [
     "jun",
     "You announced a ruling while I was explaining it."
    ],
    [
     "Protagonist",
     "Did you disagree with the ruling?"
    ],
    [
     "teo",
     "No. I was being supportive."
    ],
    [
     "jun",
     "He introduced it as 'the most dramatic comma in tournament history.'"
    ],
    [
     "Protagonist",
     "That is quite a comma."
    ],
    [
     "jun",
     "Please don't encourage him."
    ]
   ]
  ]
 },
 {
  "pair": [
   "hana",
   "iris"
  ],
  "scenes": [
   [
    [
     "iris",
     "If someone moves those boxes again, I'm labeling the floor."
    ],
    [
     "hana",
     "I needed the table for a beginner match."
    ],
    [
     "Protagonist",
     "What's the problem?"
    ],
    [
     "iris",
     "Three boxes say 'miscellaneous.' No one knows what's inside."
    ],
    [
     "hana",
     "One has sleeves. One has signs."
    ],
    [
     "iris",
     "And the third?"
    ],
    [
     "hana",
     "...I was hoping you knew."
    ]
   ],
   [
    [
     "hana",
     "Iris caught me carrying the tables alone."
    ],
    [
     "iris",
     "She said it would be faster."
    ],
    [
     "Protagonist",
     "Was it?"
    ],
    [
     "hana",
     "Not when I got stuck in the doorway."
    ],
    [
     "iris",
     "The volunteers moved everything in five minutes."
    ],
    [
     "hana",
     "I promised to ask next time."
    ],
    [
     "iris",
     "I have it in writing."
    ]
   ],
   [
    [
     "iris",
     "Hana, I put labels on every storage box."
    ],
    [
     "hana",
     "I saw! It's wonderful."
    ],
    [
     "Protagonist",
     "Did it take long?"
    ],
    [
     "iris",
     "Longer than it should have. One box was entirely old event ribbons."
    ],
    [
     "hana",
     "We should keep those."
    ],
    [
     "Protagonist",
     "Maybe make a little memory board?"
    ],
    [
     "iris",
     "As long as somebody else hangs it. I've got deliveries."
    ]
   ],
   [
    [
     "hana",
     "We actually finished setting up early today."
    ],
    [
     "iris",
     "Nobody moved the tables after I measured the space."
    ],
    [
     "Protagonist",
     "A peaceful morning, then?"
    ],
    [
     "hana",
     "Until I noticed we were missing the sign-up pens."
    ],
    [
     "iris",
     "They're in the drawer, labeled 'pens.'"
    ],
    [
     "Protagonist",
     "Sometimes the simplest system wins."
    ],
    [
     "hana",
     "Don't tell her. She'll label me next."
    ]
   ],
   [
    [
     "iris",
     "The volunteers made a system for returning borrowed cards."
    ],
    [
     "hana",
     "Color-coded tags and everything."
    ],
    [
     "Protagonist",
     "Does it help?"
    ],
    [
     "iris",
     "A lot. Except nobody agreed which color meant 'returned.'"
    ],
    [
     "hana",
     "We were arguing about blue versus green."
    ],
    [
     "Protagonist",
     "Could you write the words on the tags?"
    ],
    [
     "iris",
     "...You have just saved us an hour."
    ]
   ]
  ]
 },
 {
  "pair": [
   "elio",
   "hana"
  ],
  "scenes": [
   [
    [
     "elio",
     "Someone left a deck here by mistake."
    ],
    [
     "hana",
     "It's a free practice deck. Green sticker."
    ],
    [
     "Protagonist",
     "People borrow them?"
    ],
    [
     "elio",
     "I did when I first came here."
    ],
    [
     "hana",
     "He returned it in perfect order."
    ],
    [
     "elio",
     "I thought that was the rule."
    ],
    [
     "hana",
     "It isn't, but I appreciated it."
    ]
   ],
   [
    [
     "hana",
     "Elio volunteered to teach someone to shuffle."
    ],
    [
     "elio",
     "Then my sleeves split down the middle."
    ],
    [
     "Protagonist",
     "What did the beginner say?"
    ],
    [
     "elio",
     "That she'd been afraid of doing that."
    ],
    [
     "hana",
     "We got them fresh sleeves and started over."
    ],
    [
     "elio",
     "Neither of us dropped anything the second time."
    ],
    [
     "hana",
     "That counts as a win."
    ]
   ],
   [
    [
     "elio",
     "Hana asked me to greet new players at the door."
    ],
    [
     "hana",
     "Only if he wanted to."
    ],
    [
     "Protagonist",
     "How did it go?"
    ],
    [
     "elio",
     "I was nervous. Then someone asked where to get a beginner deck."
    ],
    [
     "hana",
     "And he showed them our whole starter table."
    ],
    [
     "Protagonist",
     "Sounds like you handled it."
    ],
    [
     "elio",
     "It felt easier once there was something useful to do."
    ]
   ],
   [
    [
     "hana",
     "Elio's been helping tidy the practice decks."
    ],
    [
     "elio",
     "There's a card in one of them with a little smiley face on the sleeve."
    ],
    [
     "Protagonist",
     "Whose is it?"
    ],
    [
     "hana",
     "Probably a child's. I haven't seen them in weeks."
    ],
    [
     "elio",
     "I left the sleeve there in case they come back."
    ],
    [
     "Protagonist",
     "Good call."
    ],
    [
     "hana",
     "That's exactly what I told him."
    ]
   ],
   [
    [
     "elio",
     "I had a question about setting up a practice match."
    ],
    [
     "hana",
     "And you answered it before I could."
    ],
    [
     "Protagonist",
     "What was the question?"
    ],
    [
     "elio",
     "Whether a beginner can ask to read the opponent's card."
    ],
    [
     "hana",
     "I was about to tell them yes."
    ],
    [
     "Protagonist",
     "That must've felt good."
    ],
    [
     "elio",
     "It did. I was that beginner not so long ago."
    ]
   ]
  ]
 },
 {
  "pair": [
   "alma",
   "sol"
  ],
  "scenes": [
   [
    [
     "sol",
     "Alma won't let me call this tea an official festival."
    ],
    [
     "alma",
     "Because it's a pot of tea, Sol."
    ],
    [
     "Protagonist",
     "How many guests are coming?"
    ],
    [
     "sol",
     "Three, counting you."
    ],
    [
     "alma",
     "You haven't asked if they're staying."
    ],
    [
     "Protagonist",
     "I could stay for a cup."
    ],
    [
     "sol",
     "See? We're growing. Alma, bring the good cups!"
    ]
   ],
   [
    [
     "alma",
     "Sol helped me rearrange the chairs."
    ],
    [
     "sol",
     "I made a little stage in the corner."
    ],
    [
     "Protagonist",
     "For what?"
    ],
    [
     "sol",
     "No idea. It seemed promising."
    ],
    [
     "alma",
     "I needed that corner for delivery boxes."
    ],
    [
     "sol",
     "A stage for very important boxes."
    ],
    [
     "alma",
     "At least you'll help carry them."
    ]
   ],
   [
    [
     "sol",
     "I brought an extra chair for the reading corner."
    ],
    [
     "alma",
     "And I brought cushions. We don't need to make a festival out of it."
    ],
    [
     "Protagonist",
     "Is that even possible with Sol involved?"
    ],
    [
     "sol",
     "Yes! A very quiet festival."
    ],
    [
     "alma",
     "You're calling it that already."
    ],
    [
     "Protagonist",
     "I could help arrange the books."
    ],
    [
     "alma",
     "Please. And if she brings bunting, hide it."
    ]
   ],
   [
    [
     "alma",
     "Sol has been telling me to leave the café for an evening."
    ],
    [
     "sol",
     "Just one evening! The shop won't fall down."
    ],
    [
     "Protagonist",
     "What would you do?"
    ],
    [
     "alma",
     "Visit my sister, probably. We haven't had dinner together in ages."
    ],
    [
     "sol",
     "See? That's a better plan than mine."
    ],
    [
     "Protagonist",
     "What was your plan?"
    ],
    [
     "sol",
     "Lantern parade. But dinner with her sister wins."
    ]
   ],
   [
    [
     "sol",
     "Alma's letting me plan one little activity for the café."
    ],
    [
     "alma",
     "One. Little. Activity."
    ],
    [
     "Protagonist",
     "What are you thinking?"
    ],
    [
     "sol",
     "A table where people teach each other a card game."
    ],
    [
     "alma",
     "No microphones, no stage, and nothing glued to the furniture."
    ],
    [
     "Protagonist",
     "Those seem like fair conditions."
    ],
    [
     "sol",
     "Fine. I'll leave my glitter at home."
    ]
   ]
  ]
 },
 {
  "pair": [
   "jinx",
   "luna"
  ],
  "scenes": [
   [
    [
     "jinx",
     "Luna, stop pretending you're bad at rhythm games."
    ],
    [
     "luna",
     "I said I got lucky."
    ],
    [
     "Protagonist",
     "How lucky?"
    ],
    [
     "jinx",
     "Forty thousand points above my score."
    ],
    [
     "luna",
     "I just knew the song."
    ],
    [
     "jinx",
     "Great. Teach me, then."
    ],
    [
     "luna",
     "Okay. But I choose the practice speed."
    ]
   ],
   [
    [
     "luna",
     "Jinx repaired the strap on my bag."
    ],
    [
     "jinx",
     "It was held together by one thread."
    ],
    [
     "Protagonist",
     "You sew?"
    ],
    [
     "jinx",
     "After ruining two jackets, yeah."
    ],
    [
     "luna",
     "She added a tiny star on the inside."
    ],
    [
     "jinx",
     "It's how I remember which side I stitched."
    ],
    [
     "luna",
     "I like it anyway."
    ]
   ],
   [
    [
     "jinx",
     "I tried teaching Luna how to draw graffiti-style letters."
    ],
    [
     "luna",
     "She made it look easy."
    ],
    [
     "Protagonist",
     "Can I see what you made?"
    ],
    [
     "luna",
     "It's a little uneven."
    ],
    [
     "jinx",
     "It's good! You gave the letters little stars."
    ],
    [
     "Protagonist",
     "That makes it yours."
    ],
    [
     "luna",
     "I might try it again, actually."
    ]
   ],
   [
    [
     "luna",
     "Jinx stayed while I practiced a song yesterday."
    ],
    [
     "jinx",
     "It sounded fine after the first run."
    ],
    [
     "Protagonist",
     "Why were you still there?"
    ],
    [
     "jinx",
     "Someone had to turn the pages."
    ],
    [
     "luna",
     "She also remembered where I kept getting lost."
    ],
    [
     "Protagonist",
     "That's pretty good support."
    ],
    [
     "jinx",
     "Don't make it weird. She's teaching me the chorus later."
    ]
   ],
   [
    [
     "luna",
     "Jinx found the last missing piece of my puzzle."
    ],
    [
     "jinx",
     "It was under the arcade bench."
    ],
    [
     "Protagonist",
     "How did a puzzle piece get there?"
    ],
    [
     "luna",
     "I brought some pieces to show her the pattern."
    ],
    [
     "jinx",
     "Then I knocked the little bag off the table. My fault."
    ],
    [
     "Protagonist",
     "Did you finish the puzzle?"
    ],
    [
     "luna",
     "Yes. We saved the last piece for when she visited."
    ]
   ]
  ]
 },
 {
  "pair": [
   "rina",
   "sierra"
  ],
  "scenes": [
   [
    [
     "rina",
     "Sierra says I should stop practicing my smile for photographs."
    ],
    [
     "sierra",
     "Look at the person holding the camera. That's all."
    ],
    [
     "Protagonist",
     "Does it help?"
    ],
    [
     "rina",
     "It makes me laugh when they're nervous."
    ],
    [
     "sierra",
     "And I usually get the picture I wanted."
    ],
    [
     "Protagonist",
     "So you're coaching each other?"
    ],
    [
     "rina",
     "Apparently. She's learning to shuffle cards next."
    ]
   ],
   [
    [
     "sierra",
     "Rina said I should sing on the train."
    ],
    [
     "rina",
     "Quietly! I said quietly."
    ],
    [
     "Protagonist",
     "Why on the train?"
    ],
    [
     "sierra",
     "She thinks it's relaxing before work."
    ],
    [
     "rina",
     "Humming is fine too."
    ],
    [
     "sierra",
     "I tried. Somebody recognized the song."
    ],
    [
     "rina",
     "You made their commute better."
    ]
   ],
   [
    [
     "sierra",
     "The photographer wanted us both looking at the camera."
    ],
    [
     "rina",
     "But Sierra kept laughing at the wind blowing my hair everywhere."
    ],
    [
     "Protagonist",
     "Did you get a usable picture?"
    ],
    [
     "sierra",
     "Several. The candid one is my favorite."
    ],
    [
     "rina",
     "Mine too. We look like actual friends."
    ],
    [
     "Protagonist",
     "You are actual friends."
    ],
    [
     "rina",
     "Exactly. That's why I like it."
    ]
   ],
   [
    [
     "rina",
     "Sierra helped me pick a small gift for my crew."
    ],
    [
     "sierra",
     "She wanted to buy everyone the same thing."
    ],
    [
     "Protagonist",
     "What did you choose?"
    ],
    [
     "rina",
     "Little notebooks, all different colors."
    ],
    [
     "sierra",
     "And she wrote a note inside each."
    ],
    [
     "Protagonist",
     "That's a lot of work."
    ],
    [
     "rina",
     "They do a lot for me. It didn't feel like work."
    ]
   ],
   [
    [
     "sierra",
     "Rina caught me watching an old concert recording."
    ],
    [
     "rina",
     "And immediately started pointing out everything the cameras missed."
    ],
    [
     "Protagonist",
     "Like what?"
    ],
    [
     "rina",
     "The drummer making faces and the stage crew dancing backstage."
    ],
    [
     "sierra",
     "Those were the best parts."
    ],
    [
     "Protagonist",
     "Did you keep watching?"
    ],
    [
     "rina",
     "Twice. We made popcorn for the second round."
    ]
   ]
  ]
 },
 {
  "pair": [
   "elena",
   "shiori"
  ],
  "scenes": [
   [
    [
     "elena",
     "Shiori wants me to borrow a novel without reading its reviews."
    ],
    [
     "shiori",
     "I said the first chapter was wonderful. Nothing more."
    ],
    [
     "Protagonist",
     "What's the risk?"
    ],
    [
     "elena",
     "I usually prefer to know what to expect."
    ],
    [
     "shiori",
     "Then this will be a small, safe surprise."
    ],
    [
     "Protagonist",
     "You'll have to report back."
    ],
    [
     "elena",
     "Privately. I'm not starting a book committee."
    ]
   ],
   [
    [
     "shiori",
     "Elena returned my book early."
    ],
    [
     "elena",
     "I couldn't put it down."
    ],
    [
     "Protagonist",
     "Did you like the ending?"
    ],
    [
     "elena",
     "It left three questions unanswered."
    ],
    [
     "shiori",
     "And?"
    ],
    [
     "elena",
     "...I enjoyed it."
    ],
    [
     "shiori",
     "I won't tell a soul."
    ]
   ],
   [
    [
     "shiori",
     "Elena just finished the mystery novel I lent her."
    ],
    [
     "elena",
     "I was wrong about the culprit."
    ],
    [
     "Protagonist",
     "Did that annoy you?"
    ],
    [
     "elena",
     "For perhaps five minutes."
    ],
    [
     "shiori",
     "Then she sent me three theories about the ending."
    ],
    [
     "Protagonist",
     "And now you're discussing it?"
    ],
    [
     "elena",
     "Yes. She has been intolerably gracious about being right."
    ]
   ],
   [
    [
     "elena",
     "I asked Shiori for a book that had nothing to do with work."
    ],
    [
     "shiori",
     "I gave her a travel diary."
    ],
    [
     "Protagonist",
     "Any good?"
    ],
    [
     "elena",
     "It made me want to visit places without an agenda."
    ],
    [
     "shiori",
     "I told her the train station is a start."
    ],
    [
     "Protagonist",
     "An actual day trip?"
    ],
    [
     "elena",
     "Perhaps. If nobody calls it a personal-development exercise."
    ]
   ],
   [
    [
     "elena",
     "Shiori has suggested keeping a journal of pleasant surprises."
    ],
    [
     "shiori",
     "Only because you keep calling them scheduling disruptions."
    ],
    [
     "Protagonist",
     "Have you written anything yet?"
    ],
    [
     "elena",
     "Three things. One was a surprisingly good cup of coffee."
    ],
    [
     "shiori",
     "And what was the second?"
    ],
    [
     "Protagonist",
     "You don't have to tell us."
    ],
    [
     "elena",
     "Thank you. I'd like to keep one surprise to myself."
    ]
   ]
  ]
 },
 {
  "pair": [
   "kaede",
   "yuna"
  ],
  "scenes": [
   [
    [
     "yuna",
     "Kaede has been watching my arcade technique."
    ],
    [
     "kaede",
     "You've been shouting at the machine."
    ],
    [
     "Protagonist",
     "Does that work?"
    ],
    [
     "yuna",
     "The machine respects confidence."
    ],
    [
     "kaede",
     "It doesn't respect physics, apparently."
    ],
    [
     "yuna",
     "Show me how you'd do it?"
    ],
    [
     "kaede",
     "Only if you stop shouting for thirty seconds."
    ]
   ],
   [
    [
     "kaede",
     "Yuna says the snack machine owes her money."
    ],
    [
     "yuna",
     "I paid for chips. Got two packs of mints."
    ],
    [
     "Protagonist",
     "Could be worse."
    ],
    [
     "kaede",
     "She spent ten minutes plotting revenge."
    ],
    [
     "yuna",
     "I spent ten minutes finding the refund button!"
    ],
    [
     "kaede",
     "Then I bought the mints off her."
    ],
    [
     "yuna",
     "At a substantial emotional loss."
    ]
   ],
   [
    [
     "kaede",
     "Yuna says I have to pick a song for the arcade playlist."
    ],
    [
     "yuna",
     "Every regular gets one pick."
    ],
    [
     "Protagonist",
     "What did you choose?"
    ],
    [
     "kaede",
     "A quiet instrumental. I thought it would be funny."
    ],
    [
     "yuna",
     "And it is! Everyone got weirdly focused."
    ],
    [
     "Protagonist",
     "Maybe you found the secret to high scores."
    ],
    [
     "kaede",
     "Don't tell the manager. They'll start charging for silence."
    ]
   ],
   [
    [
     "yuna",
     "I'm teaching Kaede my special victory dance."
    ],
    [
     "kaede",
     "I learned it by watching you lose twice."
    ],
    [
     "Protagonist",
     "That still counts as practice."
    ],
    [
     "yuna",
     "Thank you! Finally, someone understands art."
    ],
    [
     "kaede",
     "The last step is tripping over your own foot."
    ],
    [
     "Protagonist",
     "Is that intentional?"
    ],
    [
     "yuna",
     "It's an advanced technique."
    ]
   ],
   [
    [
     "yuna",
     "Kaede finally tried my favorite racing game."
    ],
    [
     "kaede",
     "It's better than I expected."
    ],
    [
     "Protagonist",
     "Did you beat her high score?"
    ],
    [
     "kaede",
     "No. I crashed into the first wall."
    ],
    [
     "yuna",
     "Then she calmly worked out every shortcut."
    ],
    [
     "Protagonist",
     "Sounds familiar."
    ],
    [
     "kaede",
     "I'm not done with that machine yet."
    ]
   ]
  ]
 },
 {
  "pair": [
   "hana",
   "camila",
   "elio"
  ],
  "scenes": [
   [
    [
     "hana",
     "I want the beginner table to have a small trading corner."
    ],
    [
     "camila",
     "With a price guide. Nobody should feel pressured."
    ],
    [
     "elio",
     "Could we have a box for cards people just want to swap?"
    ],
    [
     "Protagonist",
     "Maybe two boxes: trades and donations."
    ],
    [
     "camila",
     "Good. Then nobody mistakes a gift for a deal."
    ],
    [
     "hana",
     "Elio, would you help label them?"
    ],
    [
     "elio",
     "Sure. I'm better at labels than I am at bargaining."
    ]
   ],
   [
    [
     "elio",
     "I found cards that could finish my practice deck."
    ],
    [
     "camila",
     "And all three are in the free exchange box."
    ],
    [
     "hana",
     "Told you the box was worth keeping."
    ],
    [
     "Protagonist",
     "So what's missing now?"
    ],
    [
     "elio",
     "Someone to test it against."
    ],
    [
     "camila",
     "I'll play. No discounts on the match, though."
    ],
    [
     "hana",
     "I'll find you both a table."
    ]
   ],
   [
    [
     "elio",
     "The beginner shelf needs more commons."
    ],
    [
     "camila",
     "I've got a box of extras nobody is buying."
    ],
    [
     "hana",
     "Don't make him negotiate over it."
    ],
    [
     "Protagonist",
     "Could you donate a few?"
    ],
    [
     "camila",
     "A few? I brought the whole box."
    ],
    [
     "elio",
     "Then we can actually finish the practice decks."
    ],
    [
     "hana",
     "This is why I like having you both around."
    ]
   ],
   [
    [
     "hana",
     "We need a name for the practice-deck lending program."
    ],
    [
     "elio",
     "What about 'Borrow a Deck'?"
    ],
    [
     "camila",
     "Accurate, but hardly memorable."
    ],
    [
     "Protagonist",
     "Maybe the sign can explain it instead of being clever."
    ],
    [
     "hana",
     "That's exactly what I wanted."
    ],
    [
     "camila",
     "Fine. But I'm designing the sign."
    ],
    [
     "elio",
     "I'll check the spelling."
    ]
   ],
   [
    [
     "hana",
     "Elio wants to organize a beginner card-swap afternoon."
    ],
    [
     "elio",
     "I thought it might help people finish their decks."
    ],
    [
     "camila",
     "I have one condition: somebody explains card values before the swaps."
    ],
    [
     "Protagonist",
     "So nobody feels taken advantage of?"
    ],
    [
     "camila",
     "Exactly. You can be generous without being careless."
    ],
    [
     "elio",
     "I'll make a simple guide if you help me."
    ],
    [
     "hana",
     "And I'll bring snacks. We might actually pull this off."
    ]
   ]
  ]
 },
 {
  "pair": [
   "yuna",
   "kaede",
   "teo"
  ],
  "scenes": [
   [
    [
     "teo",
     "Welcome to the most unofficial arcade championship in town!"
    ],
    [
     "kaede",
     "There's one machine and no bracket."
    ],
    [
     "yuna",
     "That's what makes it exclusive."
    ],
    [
     "Protagonist",
     "What's the prize?"
    ],
    [
     "teo",
     "I was thinking an elaborate trophy."
    ],
    [
     "kaede",
     "You have an empty snack cup."
    ],
    [
     "yuna",
     "Perfect. I'll take it when I win."
    ]
   ],
   [
    [
     "kaede",
     "Teo keeps announcing my score while I play."
    ],
    [
     "teo",
     "The audience deserves to know history is happening."
    ],
    [
     "yuna",
     "It's just us three. Four, counting the new arrival."
    ],
    [
     "Protagonist",
     "Do I need a ticket?"
    ],
    [
     "teo",
     "No, but I appreciate your professionalism."
    ],
    [
     "kaede",
     "Can you ask them both to be quiet for one round?"
    ],
    [
     "yuna",
     "I can try. No promises."
    ]
   ],
   [
    [
     "teo",
     "Today's arcade challenge has a new rule."
    ],
    [
     "kaede",
     "Nobody told me there was a challenge."
    ],
    [
     "yuna",
     "That's part of the challenge."
    ],
    [
     "Protagonist",
     "What actually are the rules?"
    ],
    [
     "teo",
     "Highest score after three games."
    ],
    [
     "kaede",
     "That's surprisingly normal."
    ],
    [
     "yuna",
     "Wait until you see the trophy."
    ]
   ],
   [
    [
     "yuna",
     "Teo made a sound effect every time Kaede scored."
    ],
    [
     "teo",
     "A supportive sound effect."
    ],
    [
     "kaede",
     "It sounded like a broken kettle."
    ],
    [
     "Protagonist",
     "Did it help?"
    ],
    [
     "yuna",
     "Kaede beat the high score anyway."
    ],
    [
     "kaede",
     "Mostly because I was trying to finish before he made another noise."
    ],
    [
     "teo",
     "Motivation comes in many forms."
    ]
   ],
   [
    [
     "teo",
     "I need a volunteer to introduce the next arcade match."
    ],
    [
     "yuna",
     "I volunteer Kaede!"
    ],
    [
     "kaede",
     "I didn't agree to anything."
    ],
    [
     "Protagonist",
     "You could just say the players' names."
    ],
    [
     "kaede",
     "I can manage that."
    ],
    [
     "teo",
     "A concise, confident introduction. I approve."
    ],
    [
     "yuna",
     "Boooo! At least add dramatic music."
    ]
   ]
  ]
 }
];
 const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
 function met(state,id){return state?.['met_'+id]===true||(id==='reina'&&state?.metReina===true);}
 function candidates(state,npc,present){
  if(!Array.isArray(present)||!present.includes(npc)||!met(state,npc))return [];
  const p=new Set(present);
  return groups.filter(g=>g.pair.includes(npc)&&g.pair.every(id=>p.has(id)&&met(state,id)));
 }
 function select(state,npc,present){
  const pool=candidates(state,npc,present);
  if(!pool.length)return null;
  const day=Number(state?.day)||1,slot=Number(state?.slot)||0;
  // Rare enough not to displace the independent everyday/social routines.
  if((day+slot+hash(npc))%3!==0)return null;
  const g=pool[hash(npc+':'+day+':'+slot)%pool.length];
  // Deliberately decouple authored-scene rotation from the weekly routine
  // and the occasional group Talk gate. Covers every variant even when a
  // different account's character roster reshuffles location attendance.
  const variant=(Math.floor(day/11)+slot*2+hash(g.pair.join(':')))%g.scenes.length;
  return g.scenes[variant].map(([speaker,text])=>({speaker,text}));
 }
 function validate(){
  const faults=[],unique=new Set();
  for(const g of groups){
   const key=[...g.pair].sort().join(':');
   if(g.pair.length<2||g.pair.length>3||new Set(g.pair).size!==g.pair.length||unique.has(key))faults.push('bad group '+key);
   unique.add(key);
   if(g.scenes.length!==5)faults.push('missing variants '+key);
   for(const scene of g.scenes){
    const speakers=new Set(scene.map(row=>row[0]));
    if(scene.length!==7||!g.pair.every(id=>speakers.has(id))||!speakers.has('Protagonist')||
       scene.some(row=>row.length!==2||typeof row[1]!=='string'||!row[1].trim()))faults.push('invalid scene '+key);
   }
  }
  return faults;
 }
 return Object.freeze({groups,candidates,select,validate});
});
