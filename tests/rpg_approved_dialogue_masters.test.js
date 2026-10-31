'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const rpg=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
const world=fs.readFileSync(path.join(root,'rpg-overworld-integration.js'),'utf8');
const images={
 iris:'rpg-assets/characters/iris/dialogue/neutral.png',
 alma:'rpg-assets/characters/alma/overworld/standing-front.png',
 barb:'rpg-assets/characters/barb/portraits/primary.png',
 elena:'rpg-assets/characters/elena/overworld/standing-portfolio.png',
 jun:'rpg-assets/characters/jun/standing-front.png',
 teo:'rpg-assets/characters/teo/dialogue/neutral.png',
 nereo:'rpg-assets/characters/nereo/dialogue/neutral.png',
 elio:'rpg-assets/characters/elio/dialogue/neutral.png',
 shiori:'rpg-assets/characters/shiori/dialogue/neutral.png',
 marina:'rpg-assets/characters/marina/dialogue/neutral.png',
 kaede:'rpg-assets/characters/kaede/dialogue/neutral.png'
};
test('approved masters are existing binary files; Iris copy is unmodified',()=>{
 for(const [id,p] of Object.entries(images)){
  assert.ok(fs.existsSync(path.join(root,p)),id+' master source missing: '+p);
  assert.match(rpg,new RegExp(id+":'\\/rpg-assets\\/characters\\/"));
 }
 assert.deepEqual(fs.readFileSync(path.join(root,images.iris)),
  fs.readFileSync(path.join(root,'rpg-assets/characters/iris/overworld/standing-front.png')));
});
test('portrait selector only uses masters for neutral expression and keeps day-locked variants',()=>{
 assert.doesNotThrow(()=>new vm.Script(rpg,{filename:'rpg.js'}));
 assert.match(rpg,/return expression==='neutral'\?APPROVED_DIALOGUE_MASTERS\[id\]\|\|null:null;/);
 assert.match(rpg,/return alternate\?\[alternate,\.\.\.dialogue\.filter\(path=>path!==alternate\)\]:dialogue;/);
 assert.match(rpg,/const dialogue=master\?\[master,\.\.\.normal\.filter\(path=>path!==master\)\]:normal;/);
 assert.match(rpg,/approvedMaster\?\[\.06,0,\.88,\.47\]/);
 assert.match(rpg,/const sources=srcs\?\.length\?srcs:/);
});
test('standalone crop is active only when image actually loads the approved file',()=>{
 assert.doesNotThrow(()=>new vm.Script(world,{filename:'rpg-overworld-integration.js'}));
 for(const p of Object.values(images))assert.ok(world.includes('/'+p),'missing source guard for '+p);
 assert.match(world,/person\.classList\.toggle\('neo-ow-dialogue-front-master',isApprovedMaster\)/);
 assert.match(world,/person\.classList\.remove\('neo-ow-dialogue-front-master'\)/);
 assert.match(world,/#neoOverworldStoryDock #scene:has\(#rpgSceneCG:not\(\[hidden\]\)\) #neoOverworldScenePeople\{display:none!important\}/);
});

test('Jun uses the exact existing overworld file for neutral dialogue',()=>{
 const approved='rpg-assets/characters/jun/standing-front.png';
 assert.ok(fs.existsSync(path.join(root,approved)),'Jun full-body image must exist');
 assert.ok(rpg.includes("jun:'/rpg-assets/characters/jun/standing-front.png'"));
 assert.ok(world.includes('/'+approved));
 assert.ok(rpg.includes("return expression==='neutral'?APPROVED_DIALOGUE_MASTERS[id]||null:null;"));
});

test('Teo dialogue master is a byte-identical copy of the existing front pose',()=>{
 const original='rpg-assets/characters/teo/overworld/standing-front.png';
 const copy='rpg-assets/characters/teo/dialogue/neutral.png';
 assert.deepEqual(fs.readFileSync(path.join(root,copy)),
                  fs.readFileSync(path.join(root,original)));
 assert.ok(rpg.includes("teo:'/rpg-assets/characters/teo/dialogue/neutral.png'"));
 assert.ok(world.includes('/'+copy));
 // Keep fallback to original expression portraits for non-neutral emotions.
 assert.ok(rpg.includes("return expression==='neutral'?APPROVED_DIALOGUE_MASTERS[id]||null:null;"));
});

test('Nereo dialogue master preserves original front pose bytes',()=>{
 const original='rpg-assets/characters/nereo/standing-front.png';
 const copy='rpg-assets/characters/nereo/dialogue/neutral.png';
 assert.deepEqual(fs.readFileSync(path.join(root,copy)),fs.readFileSync(path.join(root,original)));
 assert.ok(rpg.includes("nereo:'/rpg-assets/characters/nereo/dialogue/neutral.png'"));
 assert.ok(world.includes('/'+copy));
});

test('Elio dialogue master preserves original front pose bytes',()=>{
 const original='rpg-assets/characters/elio/standing-front.png';
 const copy='rpg-assets/characters/elio/dialogue/neutral.png';
 assert.deepEqual(fs.readFileSync(path.join(root,copy)),fs.readFileSync(path.join(root,original)));
 assert.ok(rpg.includes("elio:'/rpg-assets/characters/elio/dialogue/neutral.png'"));
 assert.ok(world.includes('/'+copy));
});


test('Shiori dialogue master is the unchanged standing-book artwork',()=>{
 const original='rpg-assets/characters/shiori/overworld/standing-book.png';
 const copy='rpg-assets/characters/shiori/dialogue/neutral.png';
 assert.deepEqual(fs.readFileSync(path.join(root,copy)),fs.readFileSync(path.join(root,original)));
 assert.ok(rpg.includes("shiori:'/rpg-assets/characters/shiori/dialogue/neutral.png'"));
 assert.ok(world.includes('/'+copy));
});


test('Marina approved dialogue PNG retains its exact uploaded bytes and registration',()=>{
 const approved='rpg-assets/characters/marina/dialogue/neutral.png';
 const bytes=fs.readFileSync(path.join(root,approved));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '3b9e86991583b765908279503dfa491b035f9bc6d2211bf677e0c2598d24afbf');
 assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 assert.equal(bytes.readUInt32BE(16),1024);
 assert.equal(bytes.readUInt32BE(20),1536);
 assert.ok(rpg.includes("marina:'/rpg-assets/characters/marina/dialogue/neutral.png'"));
 assert.ok(world.includes('/'+approved));
});


test('Kaede approved dialogue image is the exact transparent PNG uploaded by the creator',()=>{
 const approved='rpg-assets/characters/kaede/dialogue/neutral.png';
 const bytes=fs.readFileSync(path.join(root,approved));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '79eb36864a8a3cfd61b6cedf30d08f87d241ade59933827e2d470fac4b9726b1');
 assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 assert.equal(bytes.readUInt32BE(16),1086);
 assert.equal(bytes.readUInt32BE(20),1448);
 assert.ok(rpg.includes("kaede:'/rpg-assets/characters/kaede/dialogue/neutral.png'"));
 assert.ok(world.includes('/'+approved));
});


test('neutral dialogue defaults reuse existing front or idle overworld assets for remaining characters',()=>{
 const defaults={
 akari:'rpg-assets/characters/akari/overworld/standing-clipboard.png',
 daisy:'rpg-assets/characters/daisy/overworld/idle.png',
 hana:'rpg-assets/characters/hana/overworld/phone-standing.png',
 jicy:'rpg-assets/characters/jicy/overworld/standing.webp',
 jinx:'rpg-assets/characters/jinx/overworld/idle.png',
 luna:'rpg-assets/characters/luna/overworld/standing-front.png',
 reina:'rpg-assets/characters/reina/overworld/standing.png',
 rina:'rpg-assets/characters/rina/overworld/alternate-card-pose.png',
 sierra:'rpg-assets/characters/sierra/overworld/standing-wink.png',
 sol:'rpg-assets/characters/sol/standing-front.png',
 yuna:'rpg-assets/characters/yuna/overworld/gamer-idle.png'
 };
 for(const [id,source] of Object.entries(defaults)){
  assert.ok(fs.existsSync(path.join(root,source)),id+' missing overworld front source: '+source);
  assert.ok(rpg.includes(id+":'/"+source+"'"),id+' not registered in RPG');
  assert.ok(world.includes(id+":'/"+source+"'"),id+' not registered in standalone overworld');
 }
 const laca={casual:'rpg-assets/characters/laca/overworld/casual/reaching-out.png',lifeguard:'rpg-assets/characters/laca/overworld/lifeguard/front-leaning.png'};
 for(const source of Object.values(laca)){
  assert.ok(fs.existsSync(path.join(root,source)),"Laca's front variant missing: "+source);
  assert.ok(rpg.includes('/'+source));
  assert.ok(world.includes('/'+source));
 }
 // Explicit creator-approved masters and day outfits keep priority; expressions keep their originals.
 assert.ok(rpg.includes("if(expression!=='neutral'||APPROVED_DIALOGUE_MASTERS[id]||id==='camila')return null;"));
 assert.ok(rpg.includes('const master=dialogueMasterSource(id,expression)||defaultOverworldDialogueSource(id,expression,normal)||'));
 assert.ok(rpg.includes('return alternate?[alternate,...dialogue.filter(path=>path!==alternate)]:dialogue;'));
 assert.ok(rpg.includes('Object.values(LACA_OVERWORLD_DIALOGUE_DEFAULTS).some(path=>src.includes(path))'));
 assert.ok(world.includes("person.classList.toggle('neo-ow-dialogue-front-master',isApprovedMaster)"));
});
