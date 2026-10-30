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

(async()=>{
 const made=[],nodes=[],requests=[],draws=[],observations=[];
 const root={dataset:{rpgDiscreet:'off'}};
 const ctx={
  createLinearGradient(){return {addColorStop(){}};},
  fillRect(){},
  drawImage(...args){draws.push(args);}
 };
 class SourceImage{
  set src(src){
   this._src=src;requests.push(src);this.naturalWidth=256;this.naturalHeight=256;
   // Browser images fail when their local asset does not exist.
   if(src.startsWith('/rpg-assets/')&&fs.existsSync(path.join(__dirname,src.slice(1))))this.onload?.();
   else this.onerror?.();
  }
  get src(){return this._src;}
 }
 const document={
  documentElement:root,
  createElement(tag){
   if(tag==='canvas')return {getContext:()=>ctx,toDataURL:()=> 'data:image/webp;base64,AAAA'};
   const image={tagName:tag,className:'',dataset:{},hidden:false,src:''};
   image.classList={contains:cls=>image.className.split(' ').includes(cls)};
   made.push(image);
   return image;
  },
  querySelectorAll:selector=>selector==='[data-rpg-safe-id]'?nodes:[]
 };
 const win={document,Image:SourceImage};
 // The real browser supplies MutationObserver. Record registration without
 // synthesizing DOM mutations unrelated to this avatar behavior test.
 class MutationObserver{observe(target,options){observations.push({target,options});}}
 vm.runInNewContext(source,{window:win,Promise,MutationObserver});
 assert.equal(observations.length,1,'Dynamic character images must be observed');
 const api=win.NeoRpgDiscreetAvatars;
 assert.ok(api,'Browser exports the local anime headshot API');
 const ids=['akari','alma','camila','elio','hana','iris','jun','kaede',
  'marina','nereo','reina','shiori','sol','teo','yuna',
  'jinx','luna','rina','elena','sierra'];
 for(const id of ids){
  const localPath=api.url(id);
  assert.ok(localPath.startsWith('/rpg-assets/'),id+' should only load local art');
  assert.ok(fs.existsSync(path.join(__dirname,localPath.slice(1))),id+' should have an existing asset');
  for(const [w,h] of [[256,256],[188,281],[264,380]]){
   const {sx,sy,size}=api.cropBox(id,w,h);
   assert.ok(size>0&&sx>=0&&sy>=0&&sx+size<=w+0.01&&sy+size<=h+0.01,id+' crop must stay inside the asset');
   assert.ok(size<w*0.8,id+' must use a tightly cropped headshot');
  }
 }
 assert.equal(api.url('../bad'),'');
 assert.equal(api.url('https://example.com'),'');
 assert.equal(api.url(''),'');
 assert.equal(api.emotion('weakness-hit'),'weakness_hit');
 assert.equal(api.initials('Jinx Rivera'),'JR');
 assert.ok(!source.includes('api.dicebear.com'),'No external cartoon avatar dependency');
 assert.match(source,/characters\/yuna\/discreet\/neutral\.webp/,'Approved art uses its own Discreet Mode path');

 const box={dataset:{},children:[],append(img){this.children.push(img);}};
 nodes.push(box);
 api.set(box,'reina','neutral','Reina Kurogane');
 assert.equal(made.length,0,'No image is loaded while Discreet Mode is disabled');
 root.dataset.rpgDiscreet='on';
 api.refresh();
 await Promise.resolve();
 await Promise.resolve();
 assert.equal(box.children.length,1);
 assert.deepEqual(requests,[
  '/rpg-assets/characters/reina/chibi/front.png'
 ],'The installed Reina chibi is preferred before missing portrait variants');
 assert.equal(box.children[0].src,'/rpg-assets/characters/reina/chibi/front.png');
 assert.equal(box.children[0].hidden,false);
 assert.equal(box.dataset.rpgSafeKind,'chibi');
 assert.equal(draws.length,0,'Installed chibis bypass the canvas head crop');
 api.set(box,'reina','happy','Reina Kurogane');
 assert.equal(box.children.length,1,'Keep the same headshot image between emotions');
 assert.equal(requests.length,1,'Emotion changes reuse the cached chibi');
 box.children[0].onerror();
 assert.equal(box.children[0].hidden,true,'Broken headshot fails closed, never showing full art');

 const yunaBox={dataset:{},children:[],append(img){this.children.push(img);}};
 api.set(yunaBox,'yuna','happy','Yuna');
 await Promise.resolve();
 await Promise.resolve();
 assert.equal(yunaBox.dataset.rpgSafeKind,'chibi');
 assert.equal(yunaBox.children[0].src,'/rpg-assets/characters/yuna/chibi/front.png',
  'Prefer the installed Yuna chibi over the portrait-only discreet variant');
 assert.equal(draws.length,0,'Chibi must bypass the head-only canvas crop');
 assert.match(css,/\[data-rpg-safe-kind="chibi"\]/);
 assert.match(css,/\.rpg-safe-avatar\[hidden\]/);
 assert.match(css,/\.npc-reaction-portrait img:not\(\.rpg-safe-avatar\)/);
 assert.ok(!css.includes('data-rpg-discreet="on"] #scene{'),'Location backgrounds are not overridden');
 assert.ok(!css.includes('.pack-card img'),'Pokémon card art remains visible');
 assert.match(rpg,/NeoRpgDiscreetAvatars\?\.set\?\.\(button,id,expression/);
 assert.match(rpg,/NeoRpgDiscreetAvatars\?\.set\?\.\(avatar,id,'neutral'/);
 assert.match(duel,/NeoRpgDiscreetAvatars\?\.set/);
 assert.match(html,/rpg_discreet_avatars\.js/);
 assert.match(live,/rpg_discreet_avatars\.js/);
 assert.doesNotMatch(source,/\b(?:persist|saveCampaign|localStorage\.setItem|sessionStorage\.setItem)\s*\(/);
 console.log('RPG Discreet Mode: 20 local portraits, face crops, toggle, fallback and UI wiring passed.');
})().catch(err=>{console.error(err);process.exitCode=1;});
