'use strict';
// Save-safe, optional mini-conversation arcs. No stats, time, rewards or relationship changes.
// A reply is recorded only when the player actually chooses it. The later callback
// is marked seen only on reaching its last line, including after save/reload.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgDialogueMemory=api;
})(typeof window!=='undefined'?window:null,function(){
 const threads={
 "hana": {
  "topic": "basilisk",
  "intro": [
   "I have to find a new spot for my little basil plant. The shop window gets better light than my apartment.",
   "The one you named Basilisk?",
   "Exactly. Should I bring it to work or keep it at home?"
  ],
  "choices": {
   "a": {
    "label": "Bring Basilisk to the shop.",
    "reply": "The beginner table could use a mascot. I'll clear a place away from the cards.",
    "followup": [
     "Remember when you told me to bring Basilisk to the shop?",
     "How is the new mascot doing?",
     "Thriving. Someone made it a tiny name tag. I'm making sure nobody waters the card sleeves."
    ]
   },
   "b": {
    "label": "Give it a bigger pot at home.",
    "reply": "Practical advice. I was hoping for something theatrical, but you're right.",
    "followup": [
     "Remember the basil you told me to keep at home?",
     "Did the bigger pot help?",
     "It did. I've got new leaves already. I brought you one in a little paper bag, if you want to smell it."
    ]
   }
  }
 },
 "reina": {
  "topic": "rookie",
  "intro": [
   "A new player asked me to fix their deck. I could see six problems before they finished asking.",
   "Did you tell them all six?",
   "Not yet. How would you start?"
  ],
  "choices": {
   "a": {
    "label": "Ask what they enjoy playing.",
    "reply": "Hmph. Find out what they're trying to do before dismantling it. Fine.",
    "followup": [
     "I tried your idea with that new player's deck.",
     "You asked what they liked first?",
     "Yes. Turns out their favorite card was the whole point. We kept it and fixed the rest. Don't make a speech about it."
    ]
   },
   "b": {
    "label": "Show them one fix at a time.",
    "reply": "One clear improvement beats a lecture. That I can agree with.",
    "followup": [
     "That beginner came back with their deck.",
     "Did your one-change approach help?",
     "They made the first adjustment, then found the second themselves. Much better than copying my list."
    ]
   }
  }
 },
 "shiori": {
  "topic": "margins",
  "intro": [
   "Someone has left questions in the margins of an old tournament book.",
   "Questions for the author?",
   "And sometimes for another reader. I can't decide what to do with the empty space beside them."
  ],
  "choices": {
   "a": {
    "label": "Write a reply of your own.",
    "reply": "An argument across years. That's unexpectedly tempting.",
    "followup": [
     "You remember those notes in the book's margins?",
     "Did you write back?",
     "One sentence, in pencil. Someone else has already added a question mark. I may have started something."
    ]
   },
   "b": {
    "label": "Leave space for the next reader.",
    "reply": "Perhaps the best answer is to leave the conversation open.",
    "followup": [
     "I opened that annotated tournament book again.",
     "Any new notes?",
     "Two. I didn't write either. Leaving room for someone else's thought was the right choice."
    ]
   }
  }
 },
 "yuna": {
  "topic": "deckname",
  "intro": [
   "I have a new deck name: Electric Marshmallow Disaster. Be honest.",
   "I can't tell whether that's a warning or a promise.",
   "Exactly! What should I put on the deck box?"
  ],
  "choices": {
   "a": {
    "label": "Draw a ridiculous lightning marshmallow.",
    "reply": "You understand branding. This is going to be magnificent.",
    "followup": [
     "Do you remember my Electric Marshmallow Disaster deck box?",
     "How could I forget that name?",
     "Someone recognized the marshmallow before they recognized me. It may be my greatest achievement."
    ]
   },
   "b": {
    "label": "Keep the box plain and surprise people.",
    "reply": "Stealth marshmallow. Very sinister. I'm in.",
    "followup": [
     "Remember when you told me not to decorate my new deck box?",
     "Did it fool anyone?",
     "Reina opened it expecting a serious control list. Her face when she saw Clefable was worth the restraint."
    ]
   }
  }
 },
 "akari": {
  "topic": "notes",
  "intro": [
   "I found an old match sheet with detailed calculations. At the bottom I wrote, 'That was fun.'",
   "Does that surprise you?",
   "A little. I'm organizing my new notes. Where would you put a line like that?"
  ],
  "choices": {
   "a": {
    "label": "Put enjoyment right beside the result.",
    "reply": "An extra data field. That's reasonable, actually.",
    "followup": [
     "I added a new line to my match records because of our conversation.",
     "For whether you enjoyed a game?",
     "Yes. The most exciting match this week was a loss. That's useful information I would have discarded."
    ]
   },
   "b": {
    "label": "Keep a separate page of good moments.",
    "reply": "A record of what the numbers leave out. I like that.",
    "followup": [
     "Do you remember suggesting I keep a separate page?",
     "Did you start one?",
     "Three entries so far. None mentions a win or a loss. I think I needed that distinction."
    ]
   }
  }
 },
 "camila": {
  "topic": "sleeves",
  "intro": [
   "Hana is giving away spare sleeves again. I can help, but she won't let me call it an investment.",
   "Would she take the help if you didn't call it that?",
   "Probably. How would you make it useful?"
  ],
  "choices": {
   "a": {
    "label": "Match her donation quietly.",
    "reply": "No announcement? You're making this difficult for a businesswoman.",
    "followup": [
     "Remember the spare sleeves I said I'd contribute?",
     "Did Hana accept them?",
     "She did. Quietly, as instructed. A kid used them for their first deck. That was worth more than the publicity."
    ]
   },
   "b": {
    "label": "Set up a free beginner supply box.",
    "reply": "A box with clear labels and no pricing discussion. I can handle that.",
    "followup": [
     "The beginner supply box we discussed is working.",
     "People are using it?",
     "And restocking it. Someone left a handwritten thank-you note. Hana is keeping it; I'm keeping the inventory."
    ]
   }
  }
 },
 "marina": {
  "topic": "break",
  "intro": [
   "I've been watching the tide since sunrise. For once I want an afternoon with no view of the water.",
   "You? Really?",
   "Just a few hours. Where would you escape to?"
  ],
  "choices": {
   "a": {
    "label": "Go somewhere loud, like the arcade.",
    "reply": "A place where the only waves are on a screen. Perfect.",
    "followup": [
     "I took your advice about escaping the waterfront.",
     "You went to the arcade?",
     "For an hour. Then I found myself telling a stranger how the harbor lights look at dusk. Some habits survive a day off."
    ]
   },
   "b": {
    "label": "Find a quiet bookshop.",
    "reply": "Somewhere the only tide is people turning pages. I could do that.",
    "followup": [
     "I tried that quiet bookshop you suggested.",
     "Did it feel like a real break?",
     "It did. I came back wanting to look at the river again instead of feeling obliged to."
    ]
   }
  }
 },
 "kaede": {
  "topic": "noodles",
  "intro": [
   "Found a tiny noodle place near the station. No sign, just steam in the window.",
   "Is the food any good?",
   "Very. I'm debating whether to tell everyone about it."
  ],
  "choices": {
   "a": {
    "label": "Share the address with your friends.",
    "reply": "Good food deserves company. Fine, I'll tell a few people.",
    "followup": [
     "Remember that little noodle shop I mentioned?",
     "Did your friends go?",
     "Yuna showed up with four people. The owner looked terrified until they all ordered seconds."
    ]
   },
   "b": {
    "label": "Keep it a quiet retreat for now.",
    "reply": "You're right. Not everything needs a crowd.",
    "followup": [
     "Remember the noodle place I was keeping to myself?",
     "Still your quiet spot?",
     "Mostly. The owner now nods when I come in. I like that more than being recognized."
    ]
   }
  }
 },
 "elio": {
  "topic": "risk",
  "intro": [
   "I passed up another risky play. It might have won the game, but I couldn't bring myself to try.",
   "Do you regret it?",
   "Maybe. I'm writing a practice plan. Where should I start?"
  ],
  "choices": {
   "a": {
    "label": "Try one risky line in a friendly match.",
    "reply": "One experiment where losing doesn't ruin anything. I can do that.",
    "followup": [
     "You remember that risky play I was afraid to try?",
     "Did you test it?",
     "In practice. It failed, but now I know why. I think I'll try a better version next time."
    ]
   },
   "b": {
    "label": "Write down the odds before you play.",
    "reply": "That makes the risk something I can understand, not just feel.",
    "followup": [
     "I followed your suggestion about recording the odds.",
     "Did it change how you played?",
     "A little. I still hesitated, but this time I knew what I was choosing."
    ]
   }
  }
 },
 "alma": {
  "topic": "cups",
  "intro": [
   "People keep leaving their cups after evening events. I don't mind cleaning, but it would be nice to stay and talk once.",
   "Have you asked anyone to help?",
   "Not directly. How would you handle it?"
  ],
  "choices": {
   "a": {
    "label": "Put up a friendly closing-time sign.",
    "reply": "A reminder without scolding anyone. That's my style.",
    "followup": [
     "Remember the closing-time sign you suggested?",
     "Did it work?",
     "Mostly. Someone drew a tiny smiling cup on it. I got to sit down before midnight for once."
    ]
   },
   "b": {
    "label": "Ask the regulars to lend a hand.",
    "reply": "I suppose they're regulars because they care about this place.",
    "followup": [
     "I asked two regulars for help like you suggested.",
     "How did they react?",
     "They practically argued over who got the drying towel. I should have asked sooner."
    ]
   }
  }
 },
 "nereo": {
  "topic": "cats",
  "intro": [
   "Those dock cats have figured out where I keep the biscuits. Marina says I'm too soft.",
   "Are you going to stop feeding them?",
   "No. But I need to stop them climbing into the supply shed."
  ],
  "choices": {
   "a": {
    "label": "Make them a sheltered spot outside.",
    "reply": "A proper place that isn't full of ropes and tools. Sensible.",
    "followup": [
     "About the dock cats you helped me plan for...",
     "Did they take to their new spot?",
     "One did. The other sat in the empty box the shelter arrived in. Cats have their own rules."
    ]
   },
   "b": {
    "label": "Keep the shed closed and move the biscuits.",
    "reply": "You make that sound obvious. I'll pretend it was my idea.",
    "followup": [
     "Remember your advice about the dock cats and the shed?",
     "Any more surprise visitors?",
     "Not in the shed. They wait by the gate now. I still bring biscuits. Don't tell Marina."
    ]
   }
  }
 },
 "elena": {
  "topic": "evening",
  "intro": [
   "I cleared my schedule for one evening. I keep reaching for my planner out of habit.",
   "An empty evening sounds nice.",
   "It does. I just haven't decided what to do with it."
  ],
  "choices": {
   "a": {
    "label": "Watch something silly without making a plan.",
    "reply": "A comedy film with no productivity attached. Radical.",
    "followup": [
     "About that free evening I told you about...",
     "Did you manage to relax?",
     "I watched a ridiculous film and didn't take notes. It was surprisingly difficult. And very good."
    ]
   },
   "b": {
    "label": "Take a walk and leave the phone away.",
    "reply": "An unmeasured walk. You're encouraging reckless behavior.",
    "followup": [
     "I tried your suggestion to take a walk without checking my phone.",
     "Did you enjoy it?",
     "Yes. I took the wrong turn and found a quiet garden. Apparently not every detour requires correction."
    ]
   }
  }
 },
 "jinx": {
  "topic": "patch",
  "intro": [
   "I fixed a stranger's torn backpack with black thread. Now somebody wants me to patch their jacket.",
   "You carry a sewing kit everywhere?",
   "You never know. Should I make the repair invisible or let it show?"
  ],
  "choices": {
   "a": {
    "label": "Make the patch bold and visible.",
    "reply": "Exactly. A scar can look better than pretending nothing happened.",
    "followup": [
     "Remember that jacket patch you encouraged me to make bold?",
     "How did it turn out?",
     "Bright red thread on black denim. The owner asked for a second patch just because they liked the first."
    ]
   },
   "b": {
    "label": "Match the fabric and keep it subtle.",
    "reply": "Okay, stealth repair. I can do subtle. Sometimes.",
    "followup": [
     "That jacket repair we talked about is finished.",
     "Did you keep it subtle?",
     "Almost invisible. Then I stitched a tiny star inside the lining, just for me."
    ]
   }
  }
 },
 "luna": {
  "topic": "boundaries",
  "intro": [
   "Someone grabbed a box from me without asking. They meant well, but I wish people checked first.",
   "Did you tell them?",
   "Not then. I'm thinking about what to say if it happens again."
  ],
  "choices": {
   "a": {
    "label": "Ask them to check before helping.",
    "reply": "Simple. No big explanation needed. I can try that.",
    "followup": [
     "I remembered what you said about asking people to check first.",
     "Did someone offer to help?",
     "Yeah. I asked them to wait while I got a better grip, then we carried it together. It felt easier."
    ]
   },
   "b": {
    "label": "Tell them what kind of help you need.",
    "reply": "That's better than pretending I don't need any help at all.",
    "followup": [
     "Remember when we talked about telling people what help I need?",
     "Did you get a chance to try?",
     "I did. Somebody held the door instead of taking the box. Exactly what I needed."
    ]
   }
  }
 },
 "rina": {
  "topic": "coffee",
  "intro": [
   "I have coffee with an old friend later. I'm already rehearsing what to say.",
   "Why? You know each other.",
   "I know. I just get nervous when I want something to go well."
  ],
  "choices": {
   "a": {
    "label": "Skip the rehearsed greeting and be yourself.",
    "reply": "No script at all? That's terrifying. Maybe you're right.",
    "followup": [
     "You remember telling me not to rehearse that coffee meeting?",
     "How did it go?",
     "I forgot my carefully planned opening. We laughed about an old story instead. Much better."
    ]
   },
   "b": {
    "label": "Bring up a shared memory to break the ice.",
    "reply": "One familiar little thing to start with. That feels manageable.",
    "followup": [
     "I tried your idea about opening with a shared memory.",
     "Did your friend remember it?",
     "Every embarrassing detail. We ended up talking for hours. I'm glad I went."
    ]
   }
  }
 },
 "sierra": {
  "topic": "weekend",
  "intro": [
   "I'm trying to keep a weekend free of bookings. My manager asked what I intend to do with it.",
   "Do you need an answer?",
   "Apparently the blank space makes everyone uncomfortable."
  ],
  "choices": {
   "a": {
    "label": "Tell her it's time for your friends.",
    "reply": "That's honest. And it's something I don't want to keep postponing.",
    "followup": [
     "That free weekend we discussed?",
     "Did you get to see your friends?",
     "I did. No photos, no schedule. Someone made terrible pancakes. I'd do it again."
    ]
   },
   "b": {
    "label": "Say you don't have to justify a day off.",
    "reply": "A boundary without an excuse. I needed to hear that.",
    "followup": [
     "Remember when you told me I didn't need a reason to take a break?",
     "Did it stick?",
     "I said it politely, and the booking stayed closed. I'm starting to get used to the silence."
    ]
   }
  }
 },
 "sol": {
  "topic": "sunset",
  "intro": [
   "I'm planning a little sunset tea break. Jun says not every afternoon needs an official ceremony.",
   "Does it need to be official?",
   "No! But a name makes it special. What should I do?"
  ],
  "choices": {
   "a": {
    "label": "Invite people, even if it's only two of you.",
    "reply": "A tiny festival! I love it. I'll bring the cups.",
    "followup": [
     "Remember the sunset tea break you helped me plan?",
     "Did anyone show up?",
     "Jun did. He complained about the title and stayed for two cups. That counts as a roaring success."
    ]
   },
   "b": {
    "label": "Keep it simple and enjoy the sunset.",
    "reply": "A quiet festival of one. Okay, I can do that too.",
    "followup": [
     "Do you remember telling me to keep the sunset tea simple?",
     "How did that go?",
     "No banners, no program. Just a warm cup and pink clouds. I might actually do that again."
    ]
   }
  }
 },
 "laca": {
  "topic": "race",
  "intro": [
   "I found an old photo of the schoolyard where we used to race. You can almost see where I moved the finish line.",
   "You still admit you cheated?",
   "Strategic course adjustment. I was wondering what to do with the photo."
  ],
  "choices": {
   "a": {
    "label": "Keep it as evidence of your famous shortcut.",
    "reply": "Evidence? You sound like a prosecutor. Fine, I'll keep it.",
    "followup": [
     "Remember the old schoolyard photo I found?",
     "Did you keep the incriminating evidence?",
     "It's in my notebook now. I wrote 'historic victory' on the back. You may submit your appeal in writing."
    ]
   },
   "b": {
    "label": "Try taking a new photo there someday.",
    "reply": "A rematch for the camera, then? I'd like that.",
    "followup": [
     "I've kept thinking about that old schoolyard photo.",
     "About going back?",
     "Yeah. Even if the place has changed, it might be fun to see what's still familiar. No moving finish lines. Probably."
    ]
   }
  }
 },
 "jun": {
  "topic": "ruling",
  "intro": [
   "A beginner caught a mistake in one of my rulings. I corrected it, but I can tell they're still nervous around me.",
   "You thanked them, right?",
   "Yes. I wonder if there's something more useful I could do."
  ],
  "choices": {
   "a": {
    "label": "Invite them to help at a practice table.",
    "reply": "Give them a place to use that sharp eye. That's a good idea.",
    "followup": [
     "Remember the beginner who corrected my ruling?",
     "Did they help at the practice table?",
     "They did. Caught a second mistake before it reached a match. I think we may have a future judge."
    ]
   },
   "b": {
    "label": "Tell everyone you appreciated the correction.",
    "reply": "Public credit instead of a private thank-you. Fair point.",
    "followup": [
     "About that player who corrected my ruling...",
     "Did you thank them publicly?",
     "Yes. They looked embarrassed, then proud. More importantly, the other players started asking better questions."
    ]
   }
  }
 },
 "teo": {
  "topic": "announcer",
  "intro": [
   "I practiced a dramatic tournament introduction and the only audience was the cleaner.",
   "Did she appreciate it?",
   "She applauded with a mop. I'm wondering how to use that energy at the next event."
  ],
  "choices": {
   "a": {
    "label": "Start with a short, warm welcome.",
    "reply": "You want me to trim the dramatic pause? Cruel. Probably wise.",
    "followup": [
     "Remember the introduction you told me to shorten?",
     "How did the crowd take it?",
     "They actually listened to the rules before cheering. A radical new era in broadcasting."
    ]
   },
   "b": {
    "label": "Give the volunteers a proper shout-out.",
    "reply": "The unsung heroes get the opening line. I can work with that.",
    "followup": [
     "I tried that volunteer shout-out we discussed.",
     "Did it go over well?",
     "The cleaner cheered louder than the players. I nearly lost my place. Worth it."
    ]
   }
  }
 },
 "iris": {
  "topic": "chairs",
  "intro": [
   "Somebody stacked all the event chairs the wrong way again. It looks harmless until somebody has to carry them.",
   "Can't you put up instructions?",
   "I could. The question is how to make anybody read them."
  ],
  "choices": {
   "a": {
    "label": "Draw a simple diagram on the wall.",
    "reply": "Clear, visible, difficult to misunderstand. My kind of art.",
    "followup": [
     "Remember that chair-stacking diagram you suggested?",
     "Did anybody actually read it?",
     "Yes. Somebody even corrected a stack without being asked. I'm trying not to celebrate too visibly."
    ]
   },
   "b": {
    "label": "Show the volunteers why the stacks matter.",
    "reply": "A thirty-second demonstration instead of another rule. Sensible.",
    "followup": [
     "I tried explaining the chairs to the volunteers like you suggested.",
     "Did it help?",
     "They rearranged everything before closing. One of them said, 'Now I get it.' Best sentence I've heard all week."
    ]
   }
  }
 },
 "barb": {
  "topic": "jacket",
  "intro": [
   "I've been drawing a jacket that can't decide whether it's fierce or cozy. The sketches keep arguing with each other.",
   "Maybe the jacket can be both?",
   "That's what I want. I just can't pick which detail to start with."
  ],
  "choices": {
   "a": {
    "label": "Start with the bold silhouette.",
    "reply": "Strong shape first, soft details later. I like that.",
    "followup": [
     "Remember that fierce-and-cozy jacket I was sketching?",
     "Did the bold silhouette work?",
     "It did. The inside lining is soft enough to nap in. From the outside it looks ready to start a band."
    ]
   },
   "b": {
    "label": "Choose the comfortable fabric first.",
    "reply": "Build something I'll actually want to wear. That's the point, isn't it?",
    "followup": [
     "I finished a prototype of the jacket we talked about.",
     "Did the comfortable fabric work?",
     "I wore it all day without fussing with the seams. Then I added a little metal detail. Both sides won."
    ]
   }
  }
 }
};
 const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const hash=value=>{let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
 const key=(npc,topic)=>npc+':'+topic;
 function hydrate(state){
  if(!plain(state.dialogueMemory))state.dialogueMemory={};
  if(!plain(state.dialogueMemory.entries))state.dialogueMemory.entries={};
  return state.dialogueMemory;
 }
 // Returns only authored, evidenced memories: never infer a past chat from the calendar.
 function offer(state,npc){
  const t=threads[npc],day=state?.day;
  if(!t||!Number.isInteger(day)||day<1||day>90)return null;
  const entry=state?.dialogueMemory?.entries?.[key(npc,t.topic)];
  if(plain(entry)&&['a','b'].includes(entry.choice)&&Number.isInteger(entry.day)&&entry.day>=1&&entry.day<=day){
   if(entry.seen||day<entry.day+2)return null;
   return {id:'memory:'+npc+':'+t.topic+':followup',kind:'followup',lines:t.choices[entry.choice].followup.map((text,i)=>({speaker:i%2?'Protagonist':npc,text})),choices:[]};
  }
  if(day<4||day>86||(day+hash(npc))%3!==0)return null;
  return {id:'memory:'+npc+':'+t.topic+':intro',kind:'intro',
   lines:t.intro.map((text,i)=>({speaker:i%2?'Protagonist':npc,text})),
   choices:Object.entries(t.choices).map(([id,branch])=>[branch.label,'memoryChoice:'+npc+':'+id])};
 }
 function choose(state,npc,id){
  const t=threads[npc],day=state?.day;
  if(!t||!Object.hasOwn(t.choices,id)||!Number.isInteger(day)||day<1||day>90)return null;
  const entries=hydrate(state).entries,k=key(npc,t.topic);
  if(entries[k])return null; // never overwrite the player's recorded choice
  entries[k]={choice:id,day,seen:false};
  return [{speaker:'Protagonist',text:t.choices[id].label},{speaker:npc,text:t.choices[id].reply}];
 }
 function mark(state,id){
  if(typeof id!=='string'||id.length>150)return false;
  const match=/^memory:([a-z]+):([a-z]+):followup$/.exec(id);
  if(!match)return false;
  const [,npc,topic]=match,t=threads[npc];
  if(!t||t.topic!==topic)return false;
  const entry=state?.dialogueMemory?.entries?.[key(npc,topic)];
  if(!plain(entry)||!['a','b'].includes(entry.choice)||entry.seen)return false;
  entry.seen=true;
  return true;
 }
 function validate(){
  const errors=[];
  for(const [npc,t] of Object.entries(threads)){
   if(!/^[a-z]+$/.test(npc)||!/^[a-z]+$/.test(t.topic)||t.intro.length!==3)errors.push(npc+': intro');
   for(const c of Object.values(t.choices)){
    if(!c.label||!c.reply||c.followup.length!==3||c.followup.some(x=>typeof x!=='string'||!x.trim()))errors.push(npc+': followup');
   }
  }
  return errors;
 }
 return Object.freeze({threads,hydrate,offer,choose,mark,validate});
});
