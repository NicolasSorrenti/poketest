'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'rpg_discreet_avatars.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'rpg_discreet.css'),'utf8');
const rpg=fs.readFileSync(path.join(__dirname,'rpg.js'),'utf8');
const duel=fs.readFileSync(path.join(__dirname,'rpg_match_reactions.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'rpg.html'),'utf8');
const live=fs.readFileSync(path.join(__dirname,'classic_live.html'),'utf8');
const made=[];
const nodes=[];
const root={dataset:{rpgDiscreet:'off'}};
const document={
 documentElement:root,
 createElement(tag){
  const image={tagName:tag,className:'',dataset:{},hidden:false,src:''};
  image.classList={contains:cls=>image.className.split(' ').includes(cls)};
  made.push(image);
  return image;
 },
 querySelectorAll:()=>nodes
};
const win={document};
vm.runInNewContext(source,{window:win});
const api=win.NeoRpgDiscreetAvatars;
assert.ok(api,'The browser exposes a single SFW art API');
const happy=api.url('reina','happy'),sad=api.url('reina','vulnerable');
assert.equal(api.url('reina','happy'),happy);
assert.ok(happy.includes('10.x/lorelei/svg?'));
assert.ok(happy.includes('mouthVariant=happy08'));
assert.ok(sad.includes('mouthVariant=sad04'));
assert.equal(happy.split('&')[0],sad.split('&')[0],'Emotions preserve character seed');
assert.notEqual(api.url('reina').split('&')[0],api.url('sol').split('&')[0]);
const box={dataset:{},children:[],append(el){this.children.push(el);}};
nodes.push(box);
api.set(box,'reina','neutral','Reina Kurogane');
assert.equal(made.length,0,'No external avatar request before opt-in');
root.dataset.rpgDiscreet='on';
api.refresh();
assert.equal(box.children.length,1);
assert.match(box.children[0].src,/neo-harbor-discreet-reina/);
api.set(box,'reina','happy','Reina Kurogane');
assert.equal(box.children.length,1,'Rendering reuses the existing img element');
assert.equal(box.children[0].src,happy);
box.children[0].onerror();
assert.equal(box.children[0].hidden,true,'Broken API artwork fails closed');
assert.match(css,/\.rpg-safe-avatar\[hidden\]/);
assert.match(css,/\.npc-reaction-portrait img:not\(\.rpg-safe-avatar\)/);
assert.ok(!css.includes('.pack-card img'),'Pokémon card artwork is not suppressed');
assert.match(rpg,/NeoRpgDiscreetAvatars\?\.set\?\.\(button,id,expression/);
assert.match(rpg,/NeoRpgDiscreetAvatars\?\.set\?\.\(avatar,id,'neutral'/);
assert.match(duel,/NeoRpgDiscreetAvatars\?\.set/);
assert.match(html,/rpg_discreet_avatars\.js/);
assert.match(live,/rpg_discreet_avatars\.js/);
assert.doesNotMatch(source,/\b(?:persist|saveCampaign|localStorage\.setItem|sessionStorage\.setItem)\s*\(/);
console.log('RPG SFW avatars: stable characters, expressions, opt-in, API fallback and surface wiring passed.');
