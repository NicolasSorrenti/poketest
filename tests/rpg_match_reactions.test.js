'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const reactions=require('../rpg_match_reactions');
const castIds=['hana','reina','shiori','yuna','akari','camila','marina','kaede','jinx','luna','sol','rina','elena','sierra','jun','teo','iris','elio','alma','nereo'];
const expectedKinds=['attack','play_card','evolve','power','hurt','ko_taken','ko_scored'];
assert.deepEqual(Object.keys(reactions.VOICES).sort(),castIds.sort(),'every existing RPG opponent must have authored cut-ins');
for(const [id,voice] of Object.entries(reactions.VOICES)){
 assert.deepEqual(Object.keys(voice).sort(),expectedKinds.slice().sort(),'missing cut-in kinds for '+id);
 assert.ok(Object.values(voice).every(line=>typeof line==='string'&&line.trim().length>5),'blank or meaningless cut-in for '+id);
}
for(const kind of expectedKinds){
 const utterances=Object.values(reactions.VOICES).map(voice=>voice[kind]);
 assert.equal(new Set(utterances).size,20,'duplicated generic '+kind+' line between distinct NPCs');
}
const mkView=(human=6,cpu=6,cpuDamage=0,phase='game')=>({phase,over:phase==='done',players:[{prizeCount:human},{prizeCount:cpu,active:{id:'char',damage:cpuDamage},bench:[]}]});
const act=(seq,side,type,label)=>({seq,side,type,label});
const d=reactions.createDirector({npcId:'reina',npcName:'Reina Kurogane',random:()=>0});
assert.equal(d.update({view:mkView(),activity:[act(1,1,'attack','Scratch')]}),null,'Initial load must not replay history');
let reaction=d.update({view:mkView(),activity:[act(1,1,'attack','Scratch'),act(2,1,'attack','Slash')]});
assert.equal(reaction.kind,'attack');
assert.equal(reaction.subtitle,'Attack: Slash');
assert.match(reaction.line,/Keep up/);
assert.equal(d.update({view:mkView(),activity:[act(1,1,'attack'),act(2,1,'attack')]}),null,'Repeated polls do not replay');
assert.equal(d.update({view:mkView(),activity:[act(2,1,'attack'),act(3,1,'attack')]}),null,'Cooldown prevents spam');
reaction=d.update({view:mkView(5,6),activity:[act(3,1,'attack')]});
assert.equal(reaction.kind,'ko_taken','Player knockout is given priority and bypasses cooldown');
assert.equal(d.update({view:mkView(5,6),activity:[act(3,1,'attack')]}),null,'No duplicate knockout');
reaction=d.update({view:mkView(5,5),activity:[act(3,1,'attack')]});
assert.equal(reaction.kind,'ko_scored');
const dmg=reactions.createDirector({npcId:'yuna',random:()=>0});
dmg.update({view:mkView(),activity:[]});
assert.equal(dmg.update({view:mkView(6,6,40),activity:[act(1,0,'attack','Tackle')]}).kind,'big_hit','40 damage triggers heavy-hit reaction');
const finished=reactions.createDirector({npcId:'shiori',random:()=>0});
finished.update({view:mkView(),activity:[]});
assert.equal(finished.update({view:mkView(5,6,0,'done'),activity:[act(1,0,'attack')]}).kind,'ko_taken','Final game knockout still gets a reaction');
const roll=reactions.createDirector({npcId:'hana',random:()=>0});
roll.update({view:mkView(),activity:[]});
for(let i=1;i<=30;i++)roll.update({view:mkView(),activity:[act(i*4,1,'attack')]});
assert.equal(roll.count,4,'Reserve a contextual reaction and knockout even after generic attacks');
assert.equal(roll.update({view:mkView(5,6),activity:[act(125,0,'attack')]}).kind,'ko_taken');
assert.equal(roll.count,5);
assert.equal(roll.update({view:mkView(4,6),activity:[act(130,0,'attack')]}).kind,'ko_taken','An additional KO may consume the final reserved reaction');
assert.equal(roll.count,6);
assert.equal(roll.update({view:mkView(3,6),activity:[act(135,0,'attack')]}),null,'Enforce hard cap');
roll.reset();assert.equal(roll.count,0);
assert.equal(roll.update({view:mkView(),activity:[act(500,1,'attack')]}),null,'Reset ignores past actions');
const noLuck=reactions.createDirector({npcId:'hana',random:()=>.999});
noLuck.update({view:mkView(),activity:[]});
assert.equal(noLuck.update({view:mkView(),activity:[act(1,1,'play_trainer')]}),null,'Normal events are optional');
const firstAttack=reactions.createDirector({npcId:'reina',random:()=>.999});
firstAttack.update({view:mkView(),activity:[]});
assert.equal(firstAttack.update({view:mkView(),activity:[act(1,1,'attack','Flamethrower')]}).kind,'attack',
 'The first CPU attack in RPG always displays its character cut-in');
assert.equal(firstAttack.update({view:mkView(),activity:[act(5,1,'attack','Slash')]}),null,
 'Later attacks still use the limited/random reaction system');
firstAttack.reset();
assert.equal(firstAttack.update({view:mkView(),activity:[act(100,1,'attack')]}),null,'Loading never replays old NPC cut-ins');
assert.equal(firstAttack.update({view:mkView(),activity:[act(101,1,'attack')]}).kind,'attack','Reset permits the first cinematic again');
assert.equal(reactions.durationFor('attack'),2800,'Attack artwork must remain readable');
assert.equal(reactions.durationFor('attack',true),2800,'Reduced motion must not hide the image early');
assert.equal(reactions.durationFor('ko_scored'),2600,'Finishing reaction remains visible');
assert.equal(reactions.assetFor({characters:{reina:{attack:'/rpg-assets/reactions/reina/attack.webp'}}},'reina','attack'),'/rpg-assets/reactions/reina/attack.webp');
assert.equal(reactions.assetFor({characters:{reina:{attack:'https://host.test/image.png'}}},'reina','attack'),'/rpg-assets/characters/reina/portraits/primary.png','Reject remote art, keep own portrait');
assert.equal(reactions.assetFor({characters:{reina:{attack:'/rpg-assets/characters/hana/vn-expressions/neutral.webp'}}},'reina','attack'),'/rpg-assets/characters/reina/portraits/primary.png','Never display another NPC from a misassigned art manifest');
assert.equal(reactions.assetFor({},'jinx','attack'),'/rpg-assets/characters/jinx/neutral.png','Character packs show their own battle portrait');
assert.equal(reactions.assetFor({},'sierra','attack'),'/rpg-assets/characters/sierra/portrait.png','Use Sierra installed portrait');
assert.equal(reactions.assetFor({},'rina','attack'),null,'Uninstalled art must not borrow another character portrait');
assert.equal(reactions.assetFor({},'reina','attack'),'/rpg-assets/characters/reina/portraits/primary.png');
const installedManifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../rpg-assets/reactions/manifest.json'),'utf8'));
assert.equal(Object.keys(installedManifest.characters).length,20,'NPC artwork manifest must load for the whole cast');
assert.equal(reactions.assetFor(installedManifest,'reina','default'),'/rpg-assets/characters/reina/portraits/primary.png','Reina uses her own approved portrait');
assert.equal(reactions.assetFor(installedManifest,'rina','default'),'/rpg-assets/rina.png','Rina uses the installed manifest artwork');


const cards={
 'my-lightning':{types:['Lightning']},
 'my-fire':{types:['Fire']},
 'cpu-water':{types:['Water'],weaknesses:[{type:'Lightning',value:'×2'}]},
 'cpu-neutral':{types:['Colorless'],weaknesses:[]}
};
const getCard=id=>cards[id]||null;
const battle=(cpu,playerId='my-lightning',prizes=[6,6])=>({
 phase:'game',over:false,players:[
  {prizeCount:prizes[0],active:{id:playerId,damage:0}},
  {prizeCount:prizes[1],active:{id:'cpu-water',damage:cpu.damage??0,
   status:cpu.status||null,poison:!!cpu.poison,weaknessOverride:cpu.weaknessOverride||null},bench:[]}
 ]
});
function reactAfter(before,after,{roll=0,actor=0,type='attack'}={}){
 const director=reactions.createDirector({npcId:'reina',getCard,random:()=>roll});
 assert.equal(director.update({view:before,activity:[]}),null);
 return director.update({view:after,activity:[act(1,actor,type,'Spark')]});
}
assert.equal(reactAfter(battle({damage:0}),battle({damage:30})).kind,'weakness_hit',
 'A real player attack into the target’s Weakness must show the shocked reaction');
assert.equal(reactAfter(battle({damage:0},'my-fire'),battle({damage:30},'my-fire')).kind,'hurt',
 'No weakness reaction when attacker type does not match');
assert.equal(reactAfter(battle({damage:0}),battle({damage:0})),null,
 'Matching types without actual damage must not invent a Weakness hit');
assert.equal(reactAfter(battle({damage:0,weaknessOverride:'Fire'},'my-fire'),
 battle({damage:30,weaknessOverride:'Fire'},'my-fire')).kind,'weakness_hit',
 'A current Weakness override changes which type should trigger the reaction');
assert.equal(reactAfter(battle({damage:0,weaknessOverride:'Psychic'}),
 battle({damage:30,weaknessOverride:'Psychic'})).kind,'hurt',
 'A Weakness override must suppress the previous printed weakness');
assert.equal(reactAfter(battle({damage:0},'my-fire'),battle({damage:0,status:'Asleep'},'my-fire')).kind,'status_hit',
 'New Sleep condition triggers a contextual reaction even without damage');
assert.equal(reactAfter(battle({damage:0},'my-fire'),battle({damage:0,poison:true},'my-fire')).kind,'status_hit',
 'New Poison condition triggers a contextual reaction');
assert.equal(reactAfter(battle({damage:0,poison:true},'my-fire'),
 battle({damage:0,poison:true},'my-fire')),null,'Already-poisoned Pokémon do not trigger twice');
assert.equal(reactAfter(battle({damage:0},'my-fire'),
 battle({damage:55,status:'Paralyzed'},'my-fire')).kind,'status_hit',
 'New status outranks heavy damage when no Weakness was hit');
assert.equal(reactAfter(battle({damage:0}),battle({damage:55,status:'Asleep'})).kind,'weakness_hit',
 'Weakness outranks simultaneous new status and big hit');
assert.equal(reactAfter(battle({damage:0},'my-fire'),
 battle({damage:55},'my-fire')).kind,'big_hit','Heavy direct attack triggers special expression');
assert.equal(reactAfter(battle({damage:0}),battle({damage:30}),{actor:1}).kind,'attack',
 'Only a player attack may trigger a Weakness reaction, not the CPU’s own move');
assert.equal(reactAfter(battle({damage:0}),battle({damage:30}),{type:'play_trainer'}),null,
 'Damage changes outside attacks are not misclassified as Weakness hits');
assert.equal(reactAfter(battle({damage:0}),battle({damage:30},'my-lightning',[5,6])).kind,'ko_taken',
 'A player knockout outranks Weakness');
const noLuckSpecial=reactAfter(battle({damage:0}),battle({damage:30}),{roll:.999});
assert.equal(noLuckSpecial.kind,'weakness_hit','Important weakness reactions bypass random chance');
assert.match(noLuckSpecial.line,/matchup|switch/i,'Context-specific NPC voice line used');
assert.equal(reactions.durationFor('weakness_hit'),2300,'Contextual expression holds long enough to read');
const contextualManifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../rpg-assets/reactions/manifest.json'),'utf8'));
for(const [id,entry] of Object.entries(contextualManifest.characters)){
 for(const [kind,url] of Object.entries(entry)){
  assert.ok(url.startsWith('/rpg-assets/characters/'+id+'/')||url.startsWith('/rpg-assets/reactions/'+id+'/')||url.startsWith('/rpg-assets/'+id+'.'),
    id+' '+kind+': must not borrow another NPC image');
  assert.ok(fs.existsSync(path.join(__dirname,'..',url.slice(1))),id+' '+kind+': referenced art must exist');
 }
}
assert.match(reactions.assetFor(contextualManifest,'reina','weakness_hit'),/reina\/vn-expressions\/surprised\.webp$/,
 'Reina reacts to Weakness using her surprised expression');
assert.match(reactions.assetFor(contextualManifest,'reina','status_hit'),/reina\/vn-expressions\/angry\.webp$/,
 'Reina reacts to Special Conditions with an appropriate expression');
assert.equal(reactions.assetFor({characters:{reina:{weakness_hit:'/rpg-assets/characters/hana/expressions/neutral.png',hurt:'/rpg-assets/characters/reina/expressions/flustered.png'}}},'reina','weakness_hit'),
 '/rpg-assets/characters/reina/expressions/flustered.png','Invalid cross-NPC expression falls back to own hurt art');

assert.equal(reactions.assetFor({},'unknown_npc','attack'),null,'Unknown NPC gets silhouette');
const js=fs.readFileSync(path.join(__dirname,'../classic_live.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../classic_live.html'),'utf8');
const rpg=fs.readFileSync(path.join(__dirname,'../rpg.js'),'utf8');
assert.match(html,/id="npcReaction"/);
assert.doesNotMatch(html,/id="rpgOpponentPortrait"/,'Permanent rival portrait mount removed');
assert.doesNotMatch(js,/showRpgOpponent\(/,'No permanent portrait rendering');
assert.match(js,/getCard:id=>cards\.get\(id\)\|\|null/,'NPC reactions inspect public card types');
assert.match(html,/src="rpg_match_reactions.js"/);
assert.match(js,/rpgMode&&rpgNpc/,'Non-RPG CPU duel does not show NPC reactions');
assert.match(js,/reactions\?\.update\(current\)/,'Reactions observe battle updates');
assert.match(js,/setTimeout\(notifyRpg,3000\)/,'Final knockout waits for the complete NPC image');
assert.match(rpg,/encodeURIComponent\(duel.npc\)/,'NPC identity is passed to classic duel');
const css=fs.readFileSync(path.join(__dirname,'../rpg_duel.css'),'utf8');
assert.match(css,/z-index:680/,'NPC artwork overlays the generic attack banner');
assert.match(css,/\.npc-reaction-card\.npc-reaction-attack\{animation-duration:2\.8s\}/,
 'NPC attack animation must match its 2.8-second lifetime');
console.log('PASS RPG NPC cut-ins: action feed, damage, KO, final KO, cooldown, cap, art, integration');
