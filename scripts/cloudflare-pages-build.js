#!/usr/bin/env node
'use strict';

// Produces a least-privilege Cloudflare Pages static deployment from the same
// public-file allowlist as server.js. Node-only source, tests, docs, packs, and
// development art never enter dist/.
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const out = path.join(root, 'dist');
const serverFile = path.join(root, 'server.js');
if (!fs.existsSync(serverFile)) throw new Error('server.js is required to build the public asset list.');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const server = fs.readFileSync(serverFile, 'utf8');
const block = server.match(/const publicScripts=new Set\(\[([\s\S]*?)\]\);/);
if (!block) throw new Error('Could not find the publicScripts allowlist in server.js.');
const publicScripts = new Set([...block[1].matchAll(/['"]([^'"]+\.js)['"]/g)].map(m => m[1]));
for (const match of server.matchAll(/publicScripts\.add\(['"]([^'"]+\.js)['"]\)/g)) publicScripts.add(match[1]);
publicScripts.delete('rpg_character_packs.generated.js');

const htmlPages = new Set([
  'classic_live.html', 'cube.html', 'cube_room.html', 'deck_builder.html',
  'mat_generator.html', 'online.html', 'play.html', 'rpg-overworld.html',
  'rpg.html', 'rpg_card_library.html', 'rpg_deck_studio.html',
  'overworld-prototype.html'
]);
const staticExt = new Set(['.css', '.png', '.jpg', '.jpeg', '.svg', '.webp']);
const excludedAssetSegments = new Set(['references', 'rejected-artwork', 'expression-sheets']);
const explicitJson = new Set([
  'rpg-assets/reactions/manifest.json',
  'rpg-assets/outfit-chime-focus.json',
  'rpg-assets/outfit-chime-focus-top.json',
  'rpg-assets/characters/hana/overworld-variants/chime-focus.json'
]);
let copied = 0;
let bytes = 0;

function shouldExclude(pathname) {
  const parts = pathname.split('/');
  return parts.some(part => excludedAssetSegments.has(part)) ||
    parts.some(part => part.startsWith('test-')) ||
    pathname.includes('/__tests__/');
}
function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const destination = path.join(out, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  copied++;
  bytes += fs.statSync(source).size;
}
function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = path.posix.join(directory.replaceAll(path.sep, '/'), entry.name);
    if (shouldExclude(relative)) continue;
    const full = path.join(root, relative);
    if (entry.isDirectory()) {
      walk(relative);
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (staticExt.has(ext) && (relative.startsWith('rpg-assets/') || relative.startsWith('overworld/'))) {
      copyFile(relative);
    } else if (/^cards\/[^/]+\.json$/i.test(relative) || explicitJson.has(relative)) {
      copyFile(relative);
    }
  }
}

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const name = entry.name;
  if (htmlPages.has(name) || staticExt.has(path.extname(name).toLowerCase()) &&
      !['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(name).toLowerCase())) {
    copyFile(name);
  }
}
for (const script of publicScripts) {
  const source = path.join(root, script);
  if (fs.existsSync(source) && fs.statSync(source).isFile()) copyFile(script);
}
walk('rpg-assets');
walk('overworld');

fs.writeFileSync(path.join(out, '_redirects'), '/ /play.html 302\n');
const files = [];
function countFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) countFiles(full);
    else if (entry.isFile()) files.push({ path: full, size: fs.statSync(full).size });
  }
}
countFiles(out);
if (files.length > 20000) throw new Error('Cloudflare Pages Free limit exceeded: ' + files.length + ' files.');
const tooLarge = files.find(file => file.size > 25 * 1024 * 1024);
if (tooLarge) throw new Error('Cloudflare Pages asset exceeds 25 MiB: ' + path.relative(out, tooLarge.path));
console.log('Cloudflare Pages package: ' + files.length + ' files, ' + (bytes / (1024 * 1024)).toFixed(1) + ' MiB copied.');
