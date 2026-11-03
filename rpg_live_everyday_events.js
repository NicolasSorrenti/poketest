/* Live's ordinary apartment scenes. Each entry is a replayable, CG-only encounter.
 * Art is intentionally declared by filename: upload the approved image pack to
 * rpg-assets/characters/live/events/ and the scene uses it automatically.
 * Until then, the RPG presenter can display a shipped legacy CG as a fallback.
 * Villain reveal images do not belong in this catalog.
 */
(function(root){
 'use strict';
 const base='/rpg-assets/characters/live/events/';
 const scene=(id,title,image,fallback,slots,lines,choices,extra={})=>({
   id,title,kind:'season',priority:88,earliestDay:extra.earliestDay||3,
   delivery:'world',timeCost:0,expiry:'never',fallback:'queue',
   trigger:{dayGte:extra.earliestDay||3},slots,
   lines:lines.map(([speaker,text])=>({speaker,text})),
   choices:choices.map(([label,reply,flag])=>({label,reply,flag:flag||id+'_choice'})),
   image:base+image+'.png',fallbackArt:base+fallback,
   ...(extra.secondArt?{secondArt:base+extra.secondArt+'.png',switchAtLine:extra.switchAtLine||3}: {})
 });
 const events=[
  scene('live_balcony_sunny_afternoon','Tea on the Balcony','live_balcony_sunny_afternoon','live_relaxing_sofa.png',[1],
   [['Narrator','Sunlight spills across the balcony. Live has claimed the wicker chair and set out two cups.'],['Live','Oh, there you are! I was wondering whether you would join me.'],['Protagonist','You look comfortable.'],['Live','That is the plan. There is a perfectly good chair beside me, you know.']],
   [['Sit with her for a while','Good. We can enjoy the breeze before the day gets busy.','live_balcony_company'],['Ask about the plants','I am trying very hard not to drown the hydrangeas this week.','live_balcony_plants']]),
  scene('live_groceries_home_arrival','Two Bags Too Many','live_groceries_home_arrival','live_getting_ready.png',[1,2],
   [['Narrator','The front door swings open. Live steps inside, balancing two overstuffed grocery bags.'],['Live','Oh, you are home! Perfect timing. Could you take one of these?'],['Protagonist','You bought half the store.'],['Live','Only the useful half! I may have gotten carried away with the strawberries.']],
   [['Take the heavier bag','Thank you, honey. You have saved both the groceries and my arms.','live_groceries_help'],['Ask what she is planning','Dinner, breakfast, and possibly a very ambitious cake.','live_groceries_plan']]),
  scene('live_cooking_taste_test','Just One Taste','live_cooking_taste_test','live_cooking_evening.png',[1,2],
   [['Narrator','The kitchen smells wonderful. Live turns from the stove, holding up a wooden spoon.'],['Live','You arrived at exactly the right moment. Taste this for me?'],['Protagonist','Is this a test?'],['Live','Only of my seasoning! I promise I can handle an honest answer.']],
   [['Taste and compliment the sauce','Really? Then I am keeping the recipe.','live_taste_good'],['Suggest a little more salt','You are right. That is what was missing!','live_taste_salt']]),
  scene('live_gaming_on_couch','One More Round','live_gaming_on_couch','live_couch_sweater.png',[2],
   [['Narrator','Game sounds drift from the living room. Live has sprawled across the couch with a controller.'],['Live','Wait—no, no, no! That was the jump button!'],['Protagonist','Having trouble?'],['Live','I was winning until you walked in. That is my official explanation.']],
   [['Offer to play co-op','Deal! But if we lose, we lose together.','live_game_coop'],['Cheer her on','That is a lot of faith in someone who just walked into a wall.','live_game_cheer']]),
  scene('live_morning_stretching','A Very Slow Warm-Up','live_morning_stretching','live_workout_break.png',[0],
   [['Narrator','You find Live stretching in a patch of morning sunlight, entirely focused on balancing.'],['Live','One... two... and absolutely no more than that.'],['Protagonist','You know it is still early, right?'],['Live','Exactly. I am getting my complaining done before breakfast.']],
   [['Stretch with her','Oh! An exercise partner. Now I actually have to finish.','live_stretch_join'],['Fetch some water','Thank you. Apparently I am less flexible than I remember.','live_stretch_water']]),
  scene('live_watering_plants_window','The Little Garden','live_watering_plants_window','live_cleaning_table.png',[1],
   [['Narrator','Live hums quietly at the window, carefully watering a small flowering plant. She has not noticed you.'],['Live','There we go. Look at you, finally growing.'],['Protagonist','Talking to the plants again?'],['Live','Oh! You scared me. Of course I talk to them. Someone has to encourage them.']],
   [['Ask which one is her favorite','Do not make me pick. They will hear us.','live_plants_favorite'],['Offer to help water them','Yes, please. The smaller pot by the curtain is yours.','live_plants_help']]),
  scene('live_sunday_nap','Five More Minutes','live_sunday_nap','live_waking_up_lavender.png',[0,1],
   [['Narrator','Live has fallen asleep sideways on the couch. An open book rests on the table.'],['Protagonist','Live? Are you asleep?'],['Narrator','She makes a sleepy noise and pulls the cushion closer.'],['Live','Mmm... five more minutes, honey.'],['Narrator','A few moments later she lifts her head, realizes how long she has been asleep, and laughs.'],['Live','Oh no. Did I really sleep through half the morning?']],
   [['Tell her she earned the rest','You are very sweet. Maybe I will make us tea when I wake up properly.','live_nap_rest'],['Tease her about the book','I was reading it! For at least three whole pages.','live_nap_book']],{secondArt:'live_sunday_nap_wakeup',switchAtLine:4}),
  scene('live_floor_nap_overhead','An Unusual Place to Sleep','live_floor_nap_overhead','live_relaxing_sofa.png',[1],
   [['Narrator','A pillow has somehow made its way onto the rug. Live is fast asleep beside it, arms spread in every direction.'],['Protagonist','Live? What happened here?'],['Narrator','A gentle snore answers you.'],['Live','Mmm... the couch was too far away...']],
   [['Put a blanket over her','Thank you... I was not cold, but this is nice.','live_floor_blanket'],['Leave her to rest','A few minutes later, you hear a surprisingly loud yawn.','live_floor_rest']]),
  scene('live_night_out_red_dress_arrival','Home After Midnight','live_night_out_red_dress_arrival','live_getting_ready.png',[2],
   [['Narrator','The apartment door clicks open late at night. Live steps in carrying her handbag, a little unsteady but smiling.'],['Live','Oh! Did I wake you? I thought I was being so quiet.'],['Protagonist','You are talking at full volume.'],['Live','Am I? Oops. I had a nice night out. Let me find some water.']],
   [['Bring her a glass of water','You are a lifesaver. And tomorrow I am definitely sleeping in.','live_night_water'],['Help her put her things away','Thank you, honey. I will try not to drop the keys again.','live_night_keys']]),
  scene('live_after_party_floor_asleep','The Great Rug Incident','live_after_party_floor_asleep','live_waking_up_casual.png',[0],
   [['Narrator','You wake to find Live sprawled across the living-room rug, still in her going-out clothes. One shoe is near the door.'],['Protagonist','Live?! Are you okay?'],['Narrator','She gives a spectacularly loud snore, then mumbles something about the floor being surprisingly comfortable.'],['Live','Five... more... minutes...'],['Narrator','You realize she came home exhausted and simply fell asleep where she landed.']],
   [['Bring a pillow and blanket','Mmm. Thank you... remind me to find the bed next time.','live_party_blanket'],['Leave water by her side','Oh, that is thoughtful... I am never going out on a weekday again.','live_party_water']],{earliestDay:12}),
  scene('live_laundry_mismatched_socks','The Missing Sock Case','live_laundry_mismatched_socks_01','live_laundry.png',[1],
   [['Narrator','You find Live surrounded by piles of washing, holding two socks that do not remotely match.'],['Live','Eleven... twelve... Wait. That cannot be right.'],['Protagonist','Should I be worried?'],['Narrator','Live looks up and turns toward you, still studying the mismatched pair.'],['Live','Oh! Perfect timing, honey. I have a mystery for you: I washed twelve socks and found eleven.'],['Protagonist','And the two in your hands?'],['Live','They do not match! I think the washing machine is eating them.']],
   [['Help search the basket','Excellent. You take the towels; I will interrogate the washing machine.','live_socks_search'],['Suggest the sock escaped','Do not laugh! It probably has a whole new life behind the dryer.','live_socks_joke']],{secondArt:'live_laundry_mismatched_socks_02',switchAtLine:4}),
  scene('live_bathroom_brushing_friendly','Morning at the Sink','live_bathroom_brushing_friendly','live_brushing_teeth.png',[0],
   [['Narrator','You pass the bathroom and see Live brushing her teeth. She is completely absorbed in her morning routine.'],['Live','Oh! Hey there! Happy to see you. Give me just a second.'],['Protagonist','You have a little toothpaste in your hair.'],['Live','What? Oh, you are kidding. I really should not try to multitask before coffee.']],
   [['Hand her a towel','Thanks, honey. Bathroom is all yours in a moment.','live_bathroom_towel'],['Laugh with her','I know, I know! A very glamorous start to the day.','live_bathroom_laugh']]),
  scene('live_everyday_grocery_unpacking','The Shopping List','live_everyday_grocery_unpacking','live_cleaning_table.png',[1],
   [['Narrator','Shopping bags cover the kitchen counter. Live is arranging groceries by an extremely complicated system.'],['Live','If I put everything in the right place now, I will thank myself later.'],['Protagonist','Does the bread really need its own category?'],['Live','It most certainly does. It is important bread.']],
   [['Help her unpack','There we go. Teamwork makes groceries much less dramatic.','live_unpack_help'],['Volunteer for snack duty','An excellent assignment. You have my complete confidence.','live_unpack_snacks']]),
  scene('live_everyday_making_bed','A Crooked Corner','live_everyday_making_bed','live_cleaning.jpg',[0,1],
   [['Narrator','Live stands at the foot of her bed, attempting to get a fitted sheet to cooperate.'],['Live','I swear this corner was fine a second ago.'],['Protagonist','Want me to take the other side?'],['Live','Yes, please. We can defeat a bedsheet together.']],
   [['Help straighten the sheet','Victory! It almost looks like a professional made this bed.','live_bed_help'],['Suggest leaving it for later','Tempting. But then the sheet wins.','live_bed_later']]),
  scene('live_everyday_plant_care_floor','A Tiny Repotting Project','live_everyday_plant_care_floor','live_cleaning_table.png',[1],
   [['Narrator','You find Live sitting on the floor with a little pot, some fresh soil and a very stubborn plant.'],['Live','Almost there. Now please, little roots, cooperate.'],['Protagonist','Need a second pair of hands?'],['Live','Maybe just someone to hold the pot steady.']],
   [['Hold the pot for her','Perfect. I think this one will be much happier now.','live_repot_help'],['Ask how she learned this','Mostly trial and error. The plants are patient teachers.','live_repot_ask']]),
  scene('live_everyday_skincare_mirror','The Morning Ritual','live_everyday_skincare_mirror','live_getting_ready.png',[0],
   [['Narrator','Live is carefully checking her morning skincare routine in the mirror.'],['Live','One moment! I am almost done.'],['Protagonist','How many steps does that take?'],['Live','Honestly? I lost count after moisturizer.']],
   [['Ask for her advice','Start with water and sleep. I am still working on that second part.','live_skincare_advice'],['Offer her a towel','Oh, thank you. That was exactly what I needed.','live_skincare_towel']]),
  scene('live_everyday_couch_sweater','The Cozy Corner','live_everyday_couch_sweater','live_couch_sweater.png',[2],
   [['Narrator','Live has claimed the softest corner of the couch and wrapped herself in a sweater.'],['Live','Ah. Perfect. I am not moving for at least twenty minutes.'],['Protagonist','Even if I make tea?'],['Live','For tea I might make an exception.']],
   [['Make tea together','All right, that is worth getting up for.','live_cozy_tea'],['Let her enjoy the quiet','Thank you. Sometimes doing nothing is exactly enough.','live_cozy_quiet']]),
  scene('live_everyday_reading','Just One More Page','live_everyday_reading','live_reading.png',[1],
   [['Narrator','Live has a book open and keeps turning pages as if the rest of the world has disappeared.'],['Protagonist','That good?'],['Live','Oh! Sorry. I am at the part where everything finally makes sense.'],['Protagonist','I will leave you to it.']],
   [['Ask for a spoiler-free summary','There are secrets, misunderstandings, and a very suspicious neighbor.','live_read_summary'],['Sit down and read too','That sounds lovely. Quiet company is still company.','live_read_company']]),
  scene('live_everyday_cooking','A Recipe in Progress','live_everyday_cooking','live_cooking.jpg',[1,2],
   [['Narrator','Live is comparing a handwritten recipe to a pot on the stove.'],['Live','It says a pinch. How much is a pinch, exactly?'],['Protagonist','I think you are supposed to improvise.'],['Live','Then I am extremely qualified.']],
   [['Offer to measure ingredients','Thank you! I would rather not accidentally make soup for twenty.','live_recipe_measure'],['Taste the result','Well? Be kind. I only changed three things.','live_recipe_taste']]),
  scene('live_everyday_relaxing','The Tea Break','live_everyday_relaxing','live_relaxing_sofa.png',[1,2],
   [['Narrator','The apartment is quiet. Live is relaxing with a warm drink after finishing her chores.'],['Live','Oh, hello! Come sit. I made enough tea for two.'],['Protagonist','You deserve a break.'],['Live','I agree wholeheartedly. See? We are already getting along.']],
   [['Keep her company','That sounds like a perfect afternoon.','live_tea_company'],['Offer to do tomorrow’s chores','That would be lovely, but we can share them.','live_tea_share']])
 ];
 const byId=new Map(events.map(event=>[event.id,event]));
 const art=Object.fromEntries(events.map(event=>[event.id,event.image]));
 const followups=Object.fromEntries(events.map(event=>[event.id,[
   'It was nice having you around earlier. I have finished what I was doing.',
   'I have put everything away for tonight. What a full day!'
 ]]));
 Object.assign(followups,{
  live_sunday_nap:['I woke up properly at last. I think I needed that rest.','I am setting an alarm tomorrow. Maybe two.'],
  live_night_out_red_dress_arrival:['I am staying in tonight. That was enough excitement for one week.','I found my keys! They were in my handbag the whole time.'],
  live_laundry_mismatched_socks:['I still have not found the missing sock. The investigation continues.','The laundry is folded. The sock remains at large.'],
  live_bathroom_brushing_friendly:['The bathroom is yours now. I even cleaned up the toothpaste.','I managed to get ready without another disaster. Almost.'],
  live_gaming_on_couch:['I finally beat that level! You can be proud of me.','My controller is charging. I have earned a break.']
 });
 function artAt(id,index){const event=byId.get(id);if(!event)return null;return event.secondArt&&index>=event.switchAtLine?event.secondArt:event.image;}
 function finalArt(id){const event=byId.get(id);return event?.secondArt||event?.image||null;}
 function fallback(id){return byId.get(id)?.fallbackArt||null;}
 root.NeoRpgLiveEverydayEvents=Object.freeze({events,art,followups,byId:id=>byId.get(id)||null,artAt,finalArt,fallback});
})(typeof window!=='undefined'?window:globalThis);
