'use strict';
/* Run: node audit_rpg_art.js
 * Static integrity audit; visual identity still requires human review.
 */
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const issues=[];
const report=(kind,detail)=>issues.push({kind,detail});
const exists=p=>fs.existsSync(path.join(root,p.replace(/^\//,'')));
const readJson=p=>{try{return JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));}catch(e){report('invalid-json',p+': '+e.message);return null;}};
const manifest=readJson('rpg-assets/reactions/manifest.json');
let checked=0;
if(manifest){
 for(const [id,entry] of Object.entries(manifest.characters||{})){
  for(const [kind,url] of Object.entries(entry)){
   if(typeof url!=='string'||!/^\/rpg-assets\/[\w/.-]+\.(png|webp|jpe?g)$/i.test(url)){report('invalid-path',id+'.'+kind+': '+url);continue;}
   if(!url.startsWith('/rpg-assets/'+id+'.')&&!url.startsWith('/rpg-assets/reactions/'+id+'/')&&!url.startsWith('/rpg-assets/characters/'+id+'/'))
    report('wrong-character-path',id+'.'+kind+': '+url);
   checked++;
   if(!exists(url))report('missing-reaction-art',id+'.'+kind+': '+url);
  }
 }
}
const base=path.join(root,'rpg-assets/characters');
let characterManifests=0;
if(fs.existsSync(base)){
 for(const entry of fs.readdirSync(base,{withFileTypes:true})){
  if(!entry.isDirectory())continue;
  const relative='rpg-assets/characters/'+entry.name+'/art_manifest.json';
  if(!exists(relative))continue;
  characterManifests++;
  const doc=readJson(relative);
  if(!doc)continue;
  if(doc.id&&doc.id!==entry.name)report('manifest-character-mismatch',relative+' declares '+doc.id);
  const visit=(value,key)=>{
   if(typeof value==='string'&&/\.(png|webp|jpe?g)$/i.test(value)){
    checked++;
    if(!exists(value))report('missing-manifest-art',relative+' '+key+': '+value);
   }else if(value&&typeof value==='object')for(const [k,v] of Object.entries(value))visit(v,key+'.'+k);
  };
  for(const key of ['portrait','portraitStructured','avatar','expressions','events'])if(doc[key])visit(doc[key],key);
 }
}
console.log(JSON.stringify({checkedPaths:checked,characterManifests,issueCount:issues.length,issues},null,2));
if(issues.length)process.exitCode=1;
