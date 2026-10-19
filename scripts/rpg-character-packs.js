'use strict';
// Neo Harbor Character Packs v1 — Node 22, no external dependencies.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'),DIR=path.join(ROOT,'characters'),OUT=path.join(ROOT,'rpg_character_packs.generated.js');
const places=new Set(['home','shop','arcade','park','cafe','center','library']);
const slug=/^[a-z][a-z0-9_]{1,39}$/,artPath=/^\/rpg-assets\/[a-zA-Z0-9_/-]+\.(png|webp|jpe?g)$/i;
const metrics=new Set(['affection','trust','respect','attraction','duels']);
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x),words=x=>typeof x==='string'&&x.trim().length>0;
function ensure(ok,msg){if(!ok)throw Error('Character Pack: '+msg);}
function json(filename){try{return JSON.parse(fs.readFileSync(filename,'utf8'));}catch(e){throw Error(filename+': '+e.message);}}
function read(dir){return {def:json(path.join(dir,'character.json')),stories:json(path.join(dir,'stories.json')),art:json(path.join(dir,'art_manifest.json')),bible:fs.readFileSync(path.join(dir,'bible.md'),'utf8'),dir};}
function decks(){return new Set(require('../classic_local_service').deckOptions().map(d=>d.id));}
function validate(p,legalDecks=decks()){
 const d=p.def,s=p.stories,a=p.art,id=d?.id;
 ensure(plain(d)&&d.schemaVersion===1&&slug.test(id)&&id===path.basename(p.dir),'schemaVersion 1 and folder-matching lowercase ID required');
 ensure(words(d.name)&&Number.isInteger(d.age)&&d.age>=18&&d.age<=100,id+': character must be a named adult');
 ensure(['romance','friendship','supporting'].includes(d.role),id+': invalid role');
 ensure(legalDecks.has(d.deck),id+': unavailable Classic deck '+d.deck);
 ensure(words(d.style)&&Number.isInteger(d.arrivalDay)&&d.arrivalDay>=1&&d.arrivalDay<=90,id+': style and arrivalDay required');
 ensure(d.stories==='stories.json'&&d.artManifest==='art_manifest.json'&&d.bible==='bible.md',id+': standard linked filenames required');
 ensure(plain(d.dialogue),id+': missing dialogue');
 for(const key of ['intro','repeat','flirt','duelWin','duelLose'])ensure(words(d.dialogue[key]),id+': missing '+key);
 for(const key of ['talk','hangouts'])ensure(Array.isArray(d.dialogue[key])&&d.dialogue[key].length>=2&&d.dialogue[key].every(words),id+': '+key+' needs at least two entries');
 ensure(plain(d.appearance),id+': missing appearance');
 for(const key of ['silhouette','palette','hair','expressions','renderNotes'])ensure(words(d.appearance[key]),id+': missing appearance.'+key);
 ensure(Array.isArray(d.schedule)&&d.schedule.length===7&&d.schedule.every(day=>Array.isArray(day)&&day.length===3&&day.every(loc=>places.has(loc))),id+': schedule needs 7 days × 3 known places');
 ensure(words(p.bible)&&p.bible.length>=300,id+': bible.md needs at least 300 characters');
 ensure(plain(s)&&s.schemaVersion===1&&s.characterId===id&&Array.isArray(s.events),id+': invalid stories.json');
 const ids=new Set();
 for(const e of s.events){
  ensure(plain(e)&&slug.test(e.id)&&!ids.has(e.id),id+': bad/duplicate scene '+e?.id);ids.add(e.id);
  ensure(e.npc===id&&words(e.title)&&Number.isInteger(e.start)&&Number.isInteger(e.end)&&e.start>=d.arrivalDay&&e.end<=90&&e.start<=e.end,e.id+': bad scene actor, title or date');
  ensure(places.has(e.place)&&e.place!=='home'&&Number.isInteger(e.slot)&&e.slot>=0&&e.slot<=2&&Number.isInteger(e.minBond)&&e.minBond>=0,e.id+': invalid scene venue or requirements');
  ensure(!e.prerequisite||slug.test(e.prerequisite),e.id+': invalid prerequisite');
  ensure(Array.isArray(e.lines)&&e.lines.length>=3&&e.lines.every(x=>plain(x)&&words(x.speaker)&&words(x.text)),e.id+': dialogue must have speaker/text');
  ensure(Array.isArray(e.choices)&&e.choices.length>=2,e.id+': at least two choices needed');
  const flags=new Set();
  for(const c of e.choices){
   ensure(plain(c)&&words(c.label)&&words(c.reply)&&words(c.kind)&&words(c.flag)&&plain(c.delta),e.id+': invalid choice');
   ensure(!flags.has(c.flag),e.id+': duplicate flag '+c.flag);flags.add(c.flag);
   ensure(Object.entries(c.delta).every(([k,v])=>metrics.has(k)&&Number.isFinite(v)),e.id+': invalid relationship delta');
  }
  if(e.participants!==undefined)ensure(Array.isArray(e.participants)&&e.participants.every(x=>slug.test(x)),e.id+': invalid participants');
  if(e.openingByFlag!==undefined)ensure(plain(e.openingByFlag)&&Object.values(e.openingByFlag).every(words),e.id+': invalid dialogue callbacks');
 }
 for(const e of s.events)if(e.prerequisite){const previous=s.events.find(x=>x.id===e.prerequisite);ensure(previous&&previous.end<e.end,e.id+': prerequisite must be earlier scene in the same pack');}
 ensure(plain(a)&&a.schemaVersion===1&&a.characterId===id,id+': invalid art_manifest.json');
 const validImage=(u,label)=>ensure(typeof u==='string'&&artPath.test(u)&&!u.includes('..')&&!u.includes('//'),id+': invalid /rpg-assets/ image '+label);
 validImage(a.portrait,'portrait');
 if(a.expressions!==undefined){ensure(plain(a.expressions),id+': invalid expressions');for(const [k,v] of Object.entries(a.expressions)){ensure(slug.test(k),id+': invalid expression key');validImage(v,k);}}
 if(a.eventImages!==undefined){ensure(Array.isArray(a.eventImages),id+': eventImages must be array');for(const img of a.eventImages){ensure(ids.has(img.sceneId)&&words(img.prompt),id+': invalid event image reference/prompt');validImage(img.path,img.sceneId);}}
 return true;
}
function discover(){
 if(!fs.existsSync(DIR))return [];
 const folders=fs.readdirSync(DIR,{withFileTypes:true}).filter(x=>x.isDirectory()&&fs.existsSync(path.join(DIR,x.name,'character.json'))).map(x=>x.name).sort();
 const legal=decks(),packs=folders.map(name=>read(path.join(DIR,name))),ids=new Set();
 for(const p of packs){validate(p,legal);for(const e of p.stories.events){ensure(!ids.has(e.id),'duplicate scene ID '+e.id);ids.add(e.id);}}
 return packs;
}
function bundle(packs){
 const data=packs.map(p=>({id:p.def.id,cast:{name:p.def.name,age:p.def.age,deck:p.def.deck,style:p.def.style,...p.def.dialogue,portrait:p.art.portrait},looks:p.def.appearance,schedule:p.def.schedule,arrivalDay:p.def.arrivalDay,events:p.stories.events,art:p.art}));
 const serialized=JSON.stringify(data,null,1).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return "'use strict';\n// AUTO-GENERATED by scripts/rpg-character-packs.js. Edit characters/<id>/*.json, not this file.\n"+
 "(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgCharacterPacks=api;})(typeof window!=='undefined'?window:null,function(){\n"+
 "const packs="+serialized+";\nconst cast={},looks={},schedules={},arrivals={},events=[];\n"+
 "for(const p of packs){cast[p.id]=p.cast;looks[p.id]=p.looks;schedules[p.id]=p.schedule;arrivals[p.id]=p.arrivalDay;events.push(...p.events);}\n"+
 "return Object.freeze({packs,cast,looks,schedules,arrivals,events,byId:id=>packs.find(p=>p.id===id)||null});\n});\n";
}
function copyImages(p){
 const base=path.join(p.dir,'assets');if(!fs.existsSync(base))return;
 function walk(relative=''){for(const e of fs.readdirSync(path.join(base,relative),{withFileTypes:true})){
  ensure(!e.isSymbolicLink(),'symlinks forbidden in assets');
  const rel=path.join(relative,e.name);
  if(e.isDirectory()){walk(rel);continue;}
  ensure(e.isFile()&&/\.(png|webp|jpe?g)$/i.test(e.name),'only image files in assets: '+rel);
  const file=path.join(base,rel);ensure(fs.statSync(file).size<=12*1024*1024,'image exceeds 12 MB');
  const target=path.join(ROOT,'rpg-assets','characters',p.def.id,rel);
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);
 }}walk();
}
function build(write=true){
 const packs=discover(),output=bundle(packs);
 if(write){for(const p of packs)copyImages(p);fs.writeFileSync(OUT,output);}
 return {packs,output};
}
function check(){
 const {packs,output}=build(false);
 ensure(fs.existsSync(OUT)&&fs.readFileSync(OUT,'utf8')===output,'generated asset stale: npm run characters:build');
 return packs;
}
function importFolder(source){
 const src=path.resolve(source);ensure(fs.existsSync(src)&&fs.statSync(src).isDirectory(),'expected pack directory');
 const d=json(path.join(src,'character.json'));ensure(slug.test(d.id),'invalid character ID');
 const destination=path.join(DIR,d.id);ensure(!fs.existsSync(destination),'ID already installed: '+d.id);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'neo-character-'));
 try{
  const stage=path.join(tmp,d.id);fs.mkdirSync(stage);
  for(const name of ['character.json','stories.json','art_manifest.json','bible.md'])fs.copyFileSync(path.join(src,name),path.join(stage,name));
  const assets=path.join(src,'assets');if(fs.existsSync(assets)){
   function safe(folder){for(const e of fs.readdirSync(folder,{withFileTypes:true})){
    ensure(!e.isSymbolicLink(),'symlinks forbidden');if(e.isDirectory())safe(path.join(folder,e.name));
    else ensure(e.isFile()&&/\.(png|webp|jpe?g)$/i.test(e.name)&&fs.statSync(path.join(folder,e.name)).size<=12*1024*1024,'invalid image '+e.name);
   }}safe(assets);fs.cpSync(assets,path.join(stage,'assets'),{recursive:true});
  }
  validate(read(stage));
  fs.mkdirSync(DIR,{recursive:true});fs.cpSync(stage,destination,{recursive:true,force:false,errorOnExist:true});
  build(true);return d.id;
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
}
function importZip(filename){
 const file=path.resolve(filename);ensure(fs.existsSync(file),'ZIP not found');
 const list=cp.spawnSync('unzip',['-Z','-1',file],{encoding:'utf8',maxBuffer:128*1024});
 ensure(list.status===0,'ZIP import requires unzip; alternatively extract folder first');
 const entries=list.stdout.split(/\r?\n/).filter(Boolean);ensure(entries.length>0&&entries.length<=100,'ZIP must contain 1–100 entries');
 for(const name of entries)ensure(!path.isAbsolute(name)&&!name.includes('\\')&&!name.startsWith('.')&&!name.split('/').includes('..'),'unsafe ZIP path '+name);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'neo-character-zip-'));
 try{
  const run=cp.spawnSync('unzip',['-q',file,'-d',tmp],{encoding:'utf8',maxBuffer:128*1024});
  ensure(run.status===0,'ZIP extraction failed');
  const top=fs.readdirSync(tmp,{withFileTypes:true});
  const inner=fs.existsSync(path.join(tmp,'character.json'))?tmp:top.length===1&&top[0].isDirectory()?path.join(tmp,top[0].name):null;
  ensure(inner,'ZIP must have pack files at root or one folder down');
  return importFolder(inner);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
}
if(require.main===module){try{
 const mode=process.argv[2]||'validate';
 if(mode==='validate')console.log('Validated packs:',discover().map(x=>x.def.id).join(', '));
 else if(mode==='build')console.log('Built packs:',build().packs.map(x=>x.def.id).join(', '));
 else if(mode==='check')console.log('Verified packs:',check().map(x=>x.def.id).join(', '));
 else if(mode==='import'){ensure(process.argv[3],'usage: import <folder-or-zip>');console.log('Imported:',/\.zip$/i.test(process.argv[3])?importZip(process.argv[3]):importFolder(process.argv[3]));}
 else throw Error('Unknown mode '+mode);
}catch(err){console.error(err.message);process.exitCode=1;}}
module.exports={discover,validate,build,check,importFolder,importZip,bundle};
