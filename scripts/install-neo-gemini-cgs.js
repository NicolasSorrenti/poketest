#!/usr/bin/env node
'use strict';
// Run at repository root: node scripts/install-neo-gemini-cgs.js
// Idempotent, refuses unknown source layout; creates a .bak snapshot on edit.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'rpg_slice_of_life.js');
const events=require('./neo_gemini_cgs_events.json');
const begin=' // BEGIN NEO GEMINI CG PACK 20261027';
const end=' // END NEO GEMINI CG PACK 20261027';
const anchor=' const index=new Map(scenes.map(e=>[e.id,e]));';
if(!fs.existsSync(file)) throw Error('Run from the Neo Campus repo root; rpg_slice_of_life.js is missing');
const current=fs.readFileSync(file,'utf8');
if(current.includes(begin)&&current.includes(end)) {console.log('Gemini CG events already installed; no changes made.');process.exit(0);}
if(!current.includes(anchor))throw Error('Unexpected slice-of-life loader version; refusing unsafe patch');
for(const e of events){
  if(!/^[a-z0-9_]+$/.test(e.id))throw Error('Invalid event ID');
  if(current.includes('"id": "'+e.id+'"'))throw Error('Event already exists outside Gemini pack: '+e.id);
  if(!fs.existsSync(path.join(root,e.image.slice(1))))throw Error('Missing CG artwork: '+e.image);
}
const block='\n'+begin+'\n scenes.push(...'+JSON.stringify(events,null,2).replace(/\n/g,'\n ') +');\n'+end+'\n';
fs.writeFileSync(file+'.neo-gemini.bak',current,'utf8');
fs.writeFileSync(file,current.replace(anchor,block+anchor),'utf8');
console.log('Installed '+events.length+' CG events into rpg_slice_of_life.js');
console.log('Run node --check rpg_slice_of_life.js and your RPG tests before committing.');
