'use strict';
// Safe, dependency-free extractor for the optional Neo Harbor art archive.
// Only rpg-assets/ additions are installed. Canonical portraits are never overwritten.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const ARCHIVE = 'asset-packs/neo_harbor_art_expansion_2026-10-17.zip';
const EXPECTED_SHA256 = '2a7173080138c1264eb8d012d462a540c74c775507b1b756c46e1bd9545840ed';
const LIMIT_BYTES = 64 * 1024 * 1024;
const LIMIT_ENTRIES = 300;
const ALLOWED_PREFIXES = [
  'rpg-assets/characters/',
  'rpg-assets/events/',
  'rpg-assets/locations/',
  'rpg-assets/ui/',
];
const ALLOWED_FILES = new Set([
  'rpg-assets/manifest.art-expansion.json',
  'rpg-assets/checksums.json',
  'rpg-assets/ART_EXPANSION_README.md',
]);
function ensure(condition, message) { if (!condition) throw new Error('RPG art archive: ' + message); }
function hash(data) { return crypto.createHash('sha256').update(data).digest('hex'); }
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (const byte of data) {
    crc ^= byte;
    for (let i=0;i<8;i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function safeName(name) {
  return name.startsWith('rpg-assets/') && !name.includes('\\') && !name.includes('\0') &&
    !name.startsWith('/') && !name.split('/').some(part => part === '.' || part === '..') &&
    !name.includes('//') && !name.includes(':');
}
function parseZip(buffer) {
  ensure(buffer.length >= 22, 'file is too short');
  let eocd = -1;
  for (let i=buffer.length-22;i>=Math.max(0,buffer.length-65557);i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50 && i + 22 + buffer.readUInt16LE(i+20) === buffer.length) { eocd = i; break; }
  }
  ensure(eocd >= 0, 'ZIP end-of-central-directory record missing');
  ensure(buffer.readUInt16LE(eocd+4) === 0 && buffer.readUInt16LE(eocd+6) === 0, 'multi-disk ZIP not supported');
  const count=buffer.readUInt16LE(eocd+10),start=buffer.readUInt32LE(eocd+16),size=buffer.readUInt32LE(eocd+12);
  ensure(count>0 && count<=LIMIT_ENTRIES, 'unexpected entry count');
  ensure(buffer.readUInt16LE(eocd+8)===count, 'multi-disk ZIP entries not supported');
  ensure(start+size<=eocd, 'invalid central directory bounds');
  const found=[],names=new Set();
  let cursor=start,total=0;
  for (let i=0;i<count;i++) {
    ensure(cursor+46 <= start+size && buffer.readUInt32LE(cursor)===0x02014b50,'invalid central directory header');
    const flags=buffer.readUInt16LE(cursor+8),method=buffer.readUInt16LE(cursor+10);
    const checksum=buffer.readUInt32LE(cursor+16),compressed=buffer.readUInt32LE(cursor+20),uncompressed=buffer.readUInt32LE(cursor+24);
    const nameLen=buffer.readUInt16LE(cursor+28),extraLen=buffer.readUInt16LE(cursor+30),commentLen=buffer.readUInt16LE(cursor+32);
    const attrs=buffer.readUInt32LE(cursor+38),localOffset=buffer.readUInt32LE(cursor+42);
    ensure(cursor+46+nameLen+extraLen+commentLen<=start+size, 'truncated directory entry');
    const name=buffer.subarray(cursor+46,cursor+46+nameLen).toString('utf8');
    cursor+=46+nameLen+extraLen+commentLen;
    // ZIP may bundle docs and local scripts. Ignore them; never extract outside rpg-assets/.
    if (!name.startsWith('rpg-assets/')) continue;
    ensure(safeName(name), 'unsafe entry path: '+name);
    ensure(!names.has(name), 'duplicate entry: '+name);names.add(name);
    ensure((flags&1)===0 && (method===0||method===8), 'encrypted or unsupported compression: '+name);
    ensure(((attrs>>>16)&0xF000)!==0xA000, 'symlink not allowed: '+name);
    ensure(ALLOWED_PREFIXES.some(prefix=>name.startsWith(prefix))||ALLOWED_FILES.has(name)||name==='rpg-assets/', 'unexpected file: '+name);
    if(name.endsWith('/'))continue;
    ensure(uncompressed<=LIMIT_BYTES-total && compressed<=LIMIT_BYTES, 'size limit exceeded');total+=uncompressed;
    ensure(localOffset+30<=start && buffer.readUInt32LE(localOffset)===0x04034b50, 'invalid local header: '+name);
    const localFlags=buffer.readUInt16LE(localOffset+6),localMethod=buffer.readUInt16LE(localOffset+8);
    ensure((localFlags&1)===0 && localMethod===method, 'local header mismatch: '+name);
    const nameSize=buffer.readUInt16LE(localOffset+26),extraSize=buffer.readUInt16LE(localOffset+28);
    const dataStart=localOffset+30+nameSize+extraSize;
    ensure(dataStart+compressed<=start, 'invalid compressed entry bounds: '+name);
    ensure(buffer.subarray(localOffset+30,localOffset+30+nameSize).toString('utf8')===name,'local name mismatch: '+name);
    const input=buffer.subarray(dataStart,dataStart+compressed);
    const bytes=method===0?Buffer.from(input):zlib.inflateRawSync(input,{maxOutputLength:uncompressed+1});
    ensure(bytes.length===uncompressed, 'uncompressed size mismatch: '+name);
    ensure(crc32(bytes)===checksum,'CRC mismatch: '+name);
    found.push({name,bytes});
  }
  ensure(cursor===start+size, 'directory trailing data');
  ensure(found.length>0, 'no supported art assets found');
  return found;
}
function install({root=path.resolve(__dirname,'..'),archivePath=path.join(root,ARCHIVE),expectedSha=EXPECTED_SHA256,required=false}={}) {
  if(!fs.existsSync(archivePath)){
    if(required) throw new Error('RPG art archive required but missing: '+archivePath);
    return {status:'missing',archivePath,installed:0,skipped:0};
  }
  const zip=fs.readFileSync(archivePath);
  ensure(hash(zip)===expectedSha, 'SHA-256 does not match the verified archive; refusing extraction');
  const entries=parseZip(zip);
  // Check ALL destination conflicts before writing any file. Never replace canonical or manually edited assets.
  const rootReal=fs.realpathSync(root);
  const targets=[];
  for(const e of entries){
    const target=path.resolve(rootReal,e.name);
    ensure(target.startsWith(rootReal+path.sep), 'entry escapes repository: '+e.name);
    let parent=path.dirname(target);
    while(parent!==rootReal){
      if(fs.existsSync(parent)) ensure(!fs.lstatSync(parent).isSymbolicLink(),'destination parent is a symlink: '+e.name);
      parent=path.dirname(parent);
    }
    const exists=fs.existsSync(target);
    if(exists) ensure(fs.statSync(target).isFile()&&hash(fs.readFileSync(target))===hash(e.bytes),'refusing to overwrite modified asset: '+e.name);
    targets.push({...e,target,exists});
  }
  let installed=0,skipped=0;
  for(const e of targets){
    if(e.exists){skipped++;continue;}
    fs.mkdirSync(path.dirname(e.target),{recursive:true});
    fs.writeFileSync(e.target,e.bytes,{flag:'wx'});installed++;
  }
  return {status:'ok',archivePath,installed,skipped,sha256:expectedSha};
}
if(require.main===module){
  try{
    const result=install({required:process.argv.includes('--required')||process.env.RPG_ART_REQUIRED==='1'});
    if(result.status==='missing')console.log('[art] ZIP not present yet. Existing RPG art remains available. Upload '+ARCHIVE+' to activate expansion.');
    else console.log('[art] Installed '+result.installed+' asset files; '+result.skipped+' already verified.');
  }catch(err){console.error(err.message);process.exitCode=1;}
}
module.exports={ARCHIVE,EXPECTED_SHA256,parseZip,install,crc32};
