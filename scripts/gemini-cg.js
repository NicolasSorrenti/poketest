'use strict';
/**
 * Generate REVIEW CANDIDATES with Gemini, never overwrite playable game art.
 *
 *   GEMINI_API_KEY=... node scripts/gemini-cg.js --scene hana_first_meeting
 *   GEMINI_API_KEY=... node scripts/gemini-cg.js --next --count 3
 *   node scripts/gemini-cg.js --next --dry-run
 *
 * Requires Node 20+; does not install packages or expose secrets in logs.
 */
const fs = require('node:fs');
const path = require('node:path');
const {createPrompt} = require('./rpg-art-prompt');
const queue = require('../docs/cg-art-queue.json');
const root = path.resolve(__dirname, '..');
const staging = path.join(root, 'art-production', 'gemini-candidates');
const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const safeId = s => typeof s === 'string' && /^[a-z0-9_]+$/.test(s);
const exists = relative => fs.existsSync(path.join(root, relative.replace(/^\//,'')));
function options(argv) {
  const o = {count:1};
  for (let i=0;i<argv.length;i++) {
    const v=argv[i];
    if(v==='--next'||v==='--dry-run') {o[v.slice(2).replace('-','_')]=true;continue;}
    if((v==='--scene'||v==='--count')&&argv[i+1]) {o[v.slice(2)]=argv[++i];continue;}
    throw Error('Usage: --scene ID OR --next [--count 1..10] [--dry-run]');
  }
  o.count=Number(o.count);
  if(!Number.isInteger(o.count)||o.count<1||o.count>10) throw Error('--count must be 1..10');
  if(Boolean(o.scene)===Boolean(o.next)) throw Error('Choose either --scene ID or --next');
  if(o.scene&&!safeId(o.scene)) throw Error('Invalid scene ID');
  return o;
}
function availableMissingScenes() {
  return queue.scenes.filter(s=>s.path && !exists(s.path));
}
function pngOrJpegImage(response) {
  const chunks=response.candidates?.[0]?.content?.parts||[];
  const image=chunks.map(p=>p.inlineData).find(d=>d && /^image\/(png|jpeg|webp)$/.test(d.mimeType));
  if(!image||!image.data) throw Error('Gemini returned no image; inspect safety/prompt feedback and retry manually');
  const ext={'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp'}[image.mimeType];
  const buffer=Buffer.from(image.data,'base64');
  if(buffer.length<1024||buffer.length>25*1024*1024) throw Error('Unexpected image size');
  return {ext,buffer,mime:image.mimeType};
}
function referenceFor(asset) {
  const file=path.join(root,asset.referencePath);
  if(!fs.existsSync(file)) return null;
  const ext=path.extname(file).toLowerCase();
  const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}[ext];
  if(!mime) return null;
  const bytes=fs.readFileSync(file);
  if(bytes.length>7*1024*1024) throw Error('Character reference is too large: '+asset.referencePath);
  return {inlineData:{mimeType:mime,data:bytes.toString('base64')}};
}
async function generate(asset) {
  const key=process.env.GEMINI_API_KEY;
  if(!key) throw Error('Set GEMINI_API_KEY in your environment; never commit it');
  const parts=[{text:asset.prompt+' Output one 16:9 landscape illustration for review. No captions, writing or watermarks.'}];
  const ref=referenceFor(asset);
  if(ref) parts.push(ref);
  else process.stderr.write('Warning: approved character reference missing: '+asset.referencePath+'\n');
  const url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent';
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),120000);
  let response;
  try {
    response=await fetch(url,{
      method:'POST',
      headers:{'content-type':'application/json','x-goog-api-key':key},
      body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{responseModalities:['TEXT','IMAGE']}}),
      signal:controller.signal
    });
  } finally {clearTimeout(timer);}
  if(!response.ok) throw Error('Gemini API returned HTTP '+response.status+': '+(await response.text()).slice(0,350));
  const data=await response.json();
  return pngOrJpegImage(data);
}
async function main() {
  const args=options(process.argv.slice(2));
  const ids=args.next?availableMissingScenes().slice(0,args.count).map(x=>x.id):[args.scene];
  if(!ids.length) {console.log('No missing CG paths in the canonical queue. Existing CGs were not regenerated.');return;}
  for(const id of ids) {
    const asset=createPrompt({sceneId:id});
    if(args.dry_run) {console.log(JSON.stringify({id,path:asset.path,alreadyPresent:exists(asset.path),reference:asset.referencePath,model}));continue;}
    const dir=path.join(staging,id);
    // A prior candidate requires manual review; never silently replace it.
    if(fs.existsSync(dir)) {console.log('SKIP candidate already exists: '+id);continue;}
    const result=await generate(asset);
    fs.mkdirSync(dir,{recursive:true});
    const filename='candidate'+result.ext;
    fs.writeFileSync(path.join(dir,filename),result.buffer,{flag:'wx'});
    fs.writeFileSync(path.join(dir,'review.json'),JSON.stringify({
      id,character:asset.character,model,promptSha256:asset.promptSha256,
      expectedGamePath:asset.path,referencePath:asset.referencePath,
      existingGameAsset:exists(asset.path),candidate:filename,
      mime:result.mime,approved:false,review:asset.review,
      notice:'Not approved, not installed, not automatically pushed.'
    },null,2)+'\n',{flag:'wx'});
    console.log('CREATED REVIEW CANDIDATE: '+path.relative(root,dir));
  }
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={options,availableMissingScenes,pngOrJpegImage};
