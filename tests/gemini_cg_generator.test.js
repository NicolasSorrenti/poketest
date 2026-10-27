'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {options,availableMissingScenes,pngOrJpegImage}=require('../scripts/gemini-cg');
test('requires exactly one safe selection',()=>{
  assert.throws(()=>options([]));
  assert.throws(()=>options(['--next','--scene','hana_first_meeting']));
  assert.throws(()=>options(['--scene','../../oops']));
  assert.deepEqual(options(['--next','--count','3','--dry-run']),{count:3,next:true,dry_run:true});
});
test('missing list excludes all existing canonical files',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const root=path.resolve(__dirname,'..');
  const list=availableMissingScenes();
  for(const scene of list)assert.equal(fs.existsSync(path.join(root,scene.path.replace(/^\//,''))),false);
});
test('rejects text-only responses',()=>{
  assert.throws(()=>pngOrJpegImage({candidates:[{content:{parts:[{text:'No image'}]}}]}),/no image/i);
});
