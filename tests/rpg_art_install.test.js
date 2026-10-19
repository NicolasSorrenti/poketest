'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const {install,installG5,parseZip,crc32,ARCHIVE,EXPECTED_SHA256,G5_ARCHIVE,G5_EXPECTED_SHA256}=require('../scripts/install-rpg-art');
function zipEntries(entries) {
  const locals=[],central=[];let offset=0;
  for(const [name,value] of entries){
    const filename=Buffer.from(name,'utf8'),data=Buffer.from(value),compressed=zlib.deflateRawSync(data);
    const crc=crc32(data),hdr=Buffer.alloc(30),dir=Buffer.alloc(46);
    hdr.writeUInt32LE(0x04034b50,0);hdr.writeUInt16LE(20,4);hdr.writeUInt16LE(8,6);hdr.writeUInt16LE(8,8);
    hdr.writeUInt32LE(crc,14);hdr.writeUInt32LE(compressed.length,18);hdr.writeUInt32LE(data.length,22);hdr.writeUInt16LE(filename.length,26);
    const l=Buffer.concat([hdr,filename,compressed]);locals.push(l);
    dir.writeUInt32LE(0x02014b50,0);dir.writeUInt16LE(20,4);dir.writeUInt16LE(20,6);
    dir.writeUInt16LE(8,8);dir.writeUInt16LE(8,10);dir.writeUInt32LE(crc,16);
    dir.writeUInt32LE(compressed.length,20);dir.writeUInt32LE(data.length,24);
    dir.writeUInt16LE(filename.length,28);dir.writeUInt32LE(offset,42);
    central.push(Buffer.concat([dir,filename]));offset+=l.length;
  }
  const body=Buffer.concat(locals),table=Buffer.concat(central),end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);
  end.writeUInt32LE(table.length,12);end.writeUInt32LE(body.length,16);
  return Buffer.concat([body,table,end]);
}
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const sample=[['rpg-assets/characters/hana/portraits/primary.png','a real PNG would go here'],['rpg-assets/manifest.art-expansion.json','{}'],['docs/agent-status/art.md','ignored repo doc']];
function withRepo(run){const root=fs.mkdtempSync(path.join(os.tmpdir(),'art-zip-'));
  try{return run(root)}finally{fs.rmSync(root,{recursive:true,force:true})}}
function write(root,content){const archive=path.join(root,ARCHIVE);fs.mkdirSync(path.dirname(archive),{recursive:true});fs.writeFileSync(archive,content);return archive;}
test('verified ZIP extracts only additive RPG paths; idempotent and preserves tracked artwork',()=>withRepo(root=>{
  const original=path.join(root,'rpg-assets/hana.png');fs.mkdirSync(path.dirname(original),{recursive:true});fs.writeFileSync(original,'original canonical image');
  const zip=zipEntries(sample),archivePath=write(root,zip),expectedSha=sha(zip);
  const a=install({root,archivePath,expectedSha,required:true});assert.equal(a.installed,2);
  assert.equal(fs.readFileSync(original,'utf8'),'original canonical image');
  assert.equal(fs.readFileSync(path.join(root,'rpg-assets/characters/hana/portraits/primary.png'),'utf8'),'a real PNG would go here');
  assert.equal(fs.existsSync(path.join(root,'docs/agent-status/art.md')),false,'never extract docs from archive');
  const b=install({root,archivePath,expectedSha,required:true});assert.equal(b.installed,0);assert.equal(b.skipped,2);
}));
test('modified existing art aborts without overwriting',()=>withRepo(root=>{
 const zip=zipEntries(sample),archivePath=write(root,zip),expectedSha=sha(zip);
 const file=path.join(root,'rpg-assets/characters/hana/portraits/primary.png');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'new manual edit');
 assert.throws(()=>install({root,archivePath,expectedSha,required:true}),/refusing to overwrite modified asset/);
 assert.equal(fs.readFileSync(file,'utf8'),'new manual edit');
 assert.equal(fs.existsSync(path.join(root,'rpg-assets/manifest.art-expansion.json')),false,'check all conflicts before writing');
}));
test('wrong checksum, traversal and symlink parents all fail closed',()=>withRepo(root=>{
 const zip=zipEntries(sample),archivePath=write(root,zip);
 assert.throws(()=>install({root,archivePath,expectedSha:'0'.repeat(64),required:true}),/SHA-256/);
 assert.throws(()=>parseZip(zipEntries([['rpg-assets/characters/../escape.png','danger']])),/unsafe entry path/);
 assert.throws(()=>parseZip(zipEntries([['rpg-assets/stray.png','danger']])),/unexpected file/);
 assert.throws(()=>parseZip(zipEntries([['rpg-assets/characters/hana/x.png','ok'],['rpg-assets/characters/hana/x.png','bad']])),/duplicate entry/);
 const outside=fs.mkdtempSync(path.join(os.tmpdir(),'art-outside-'));
 try{fs.mkdirSync(path.join(root,'rpg-assets'),{recursive:true});fs.symlinkSync(outside,path.join(root,'rpg-assets/characters'));
  assert.throws(()=>install({root,archivePath,expectedSha:sha(zip),required:true}),/symlink/);
 }finally{fs.rmSync(outside,{force:true,recursive:true})}
}));
test('missing archive is safe during development but can be required in release',()=>withRepo(root=>{
 assert.equal(install({root}).status,'missing');
 assert.throws(()=>install({root,required:true}),/required but missing/);
}));
test('archive version and exact expected checksum are pinned',()=>{
 assert.match(ARCHIVE,/^asset-packs\/.*\.zip$/);
 assert.match(EXPECTED_SHA256,/^[a-f0-9]{64}$/);
});

test('supporting NPC portraits and guest manifest are permitted, but arbitrary root artwork is rejected',()=>withRepo(root=>{
 const zip=zipEntries([
  ['rpg-assets/jun.png','image test data'],
  ['rpg-assets/teo.png','second portrait'],
  ['rpg-assets/guest-portraits-manifest.json','{}'],
  ['rpg-assets/complete-art-manifest.json','{}'],
  ['rpg-assets/complete-art-checksums.json','{}'],
 ]);
 const archivePath=write(root,zip),result=install({root,archivePath,expectedSha:sha(zip),required:true});
 assert.equal(result.installed,5);
 assert.equal(fs.readFileSync(path.join(root,'rpg-assets/jun.png'),'utf8'),'image test data');
 assert.throws(()=>parseZip(zipEntries([['rpg-assets/unrelated.png','unsafe']])),/unexpected file/);
}));

test('optional G5 situation CG pack installs after the base and is safe to run twice',()=>withRepo(root=>{
  assert.equal(installG5({root}).status,'missing');
  const bytes=zipEntries([
    ['rpg-assets/events/cg/season01/akari_notes_whirl.webp','sample full image'],
    ['rpg-assets/events/cg/season01/thumbs/akari_notes_whirl.webp','sample thumb'],
    ['rpg-assets/events/cg/season01/g5-art-manifest.json','{}']
  ]);
  const dest=path.join(root,G5_ARCHIVE);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,bytes);
  const first=installG5({root,expectedSha:sha(bytes)});
  assert.equal(first.installed,3);
  assert.equal(installG5({root,expectedSha:sha(bytes)}).skipped,3);
  assert.throws(()=>installG5({root,expectedSha:'0'.repeat(64)}),/SHA-256/);
  assert.ok(G5_ARCHIVE.startsWith('asset-packs/') && G5_ARCHIVE.endsWith('.zip'));
  assert.match(G5_EXPECTED_SHA256,/^[a-f0-9]{64}$/);
}));

// Optional G5 artwork must never replace newer checked-in CGs or abort deployment.
test('optional G5 preserves existing differing artwork and installs missing scenes',()=>withRepo(root=>{
 const existing=path.join(root,'rpg-assets/events/cg/season01/akari_notes_whirl.webp');
 fs.mkdirSync(path.dirname(existing),{recursive:true});fs.writeFileSync(existing,'newer committed artwork');
 const bytes=zipEntries([
  ['rpg-assets/events/cg/season01/akari_notes_whirl.webp','older ZIP artwork'],
  ['rpg-assets/events/cg/season01/new_scene.webp','new optional scene']
 ]);
 const dest=path.join(root,G5_ARCHIVE);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);
 const result=installG5({root,expectedSha:sha(bytes)});
 assert.equal(result.installed,1);assert.equal(result.skipped,1);assert.equal(result.conflicts,1);
 assert.equal(fs.readFileSync(existing,'utf8'),'newer committed artwork');
 assert.equal(fs.readFileSync(path.join(root,'rpg-assets/events/cg/season01/new_scene.webp'),'utf8'),'new optional scene');
 assert.equal(installG5({root,expectedSha:sha(bytes)}).installed,0);
}));
