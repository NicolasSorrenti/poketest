'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const packs=require('../rpg_character_packs.generated');
const reactions=require('../rpg_match_reactions');
const root=path.resolve(__dirname,'..');
const onDisk=url=>url.startsWith('/rpg-assets/')&&fs.existsSync(path.join(root,url.slice(1)));
const canonical={
 hana:'/rpg-assets/hana.png',
 reina:'/rpg-assets/characters/reina/portraits/primary.png',
 shiori:'/rpg-assets/shiori.png',
 yuna:'/rpg-assets/yuna.png',
 akari:'/rpg-assets/akari.png',
 camila:'/rpg-assets/camila.png',
 marina:'/rpg-assets/marina.png',
 kaede:'/rpg-assets/kaede.png',
 jun:'/rpg-assets/jun.png',
 teo:'/rpg-assets/teo.png',
 iris:'/rpg-assets/iris.png',
 elio:'/rpg-assets/elio.png',
 alma:'/rpg-assets/alma.png',
 nereo:'/rpg-assets/nereo.png',
 elena:'/rpg-assets/characters/elena/portrait.png',
 jinx:'/rpg-assets/characters/jinx/neutral.png',
 luna:'/rpg-assets/characters/luna/neutral.png',
 sierra:'/rpg-assets/characters/sierra/portrait.png',
 sol:'/rpg-assets/sol.png'
};
for(const [npc,url] of Object.entries(canonical)){
 assert.ok(onDisk(url),npc+': canonical portrait not installed: '+url);
 assert.equal(reactions.assetFor({},npc,'attack'),url,npc+': battle art differs from the canonical identity');
}
for(const pack of packs.packs){
 const id=pack.id,portrait=pack.cast.portrait;
 assert.ok(portrait.startsWith('/rpg-assets/characters/'+id+'/')||portrait==='/rpg-assets/'+id+'.png',id+': portrait points outside its own directory');
 // Rina's artwork is not yet installed; she should show initials rather than another character.
 if(id!=='rina')assert.ok(onDisk(portrait),id+': character-pack portrait is missing');
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'rpg-assets/reactions/manifest.json'),'utf8'));
for(const [id,entry] of Object.entries(manifest.characters)){
 const attack=reactions.assetFor(manifest,id,'attack');
 assert.equal(attack,entry.attack||canonical[id],id+': reaction must use installed NPC-specific art');
 assert.ok(onDisk(attack),id+': reaction artwork is missing');
 for(const kind of ['weakness_hit','status_hit','big_hit','hurt']){
  const image=reactions.assetFor(manifest,id,kind);
  assert.ok(onDisk(image),id+': '+kind+' expression must exist');
  assert.ok(image.startsWith('/rpg-assets/characters/'+id+'/')||image.startsWith('/rpg-assets/reactions/'+id+'/')||image.startsWith('/rpg-assets/'+id+'.'),id+': '+kind+' must not borrow another character');
 }
}
assert.equal(reactions.assetFor({characters:{reina:{attack:'/rpg-assets/characters/jinx/neutral.webp'}}},'reina','attack'),canonical.reina,'Cross-NPC references must fall back to the correct character');
assert.equal(reactions.assetFor({},'rina','attack'),null,'Missing Rina art must never borrow a different NPC');
const rpg=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
assert.match(rpg,/const focused=speaking\|\|null/,'Only the actual speaker may be highlighted');
assert.match(rpg,/\[focused,\.\.\.ids,portraitId\]/,'Speakers must have priority over the six visible-character limit');
assert.match(rpg,/request===packArtSerial/,'Async booster image responses must be checked against the current giver');
assert.match(rpg,/characters\/sol\/expressions\//,'Sol must use installed PNG expressions, not non-existent guest WebPs');
console.log('PASS RPG portrait identity mappings and asynchronous image guards');
