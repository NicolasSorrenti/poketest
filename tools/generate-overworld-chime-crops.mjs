#!/usr/bin/env node
/**
 * Generate candidate overworld chime crops without touching live special-outfit presets.
 *
 * Usage:
 *   node tools/generate-overworld-chime-crops.mjs
 *   node tools/generate-overworld-chime-crops.mjs --root rpg-assets/characters --out rpg-assets/outfit-chime-overworld-candidates.json
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const root = path.resolve(getArg('--root', 'rpg-assets/characters'));
const out = path.resolve(getArg('--out', 'rpg-assets/outfit-chime-overworld-candidates.json'));
const imageExt = /\.(png|jpe?g|webp)$/i;
const labels = {};
const characters = {};
const overridesPath = path.resolve(getArg('--overrides', 'tools/overworld-chime-crop-overrides.json'));
const overrides = fs.existsSync(overridesPath) ? JSON.parse(fs.readFileSync(overridesPath, 'utf8')) : {};

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && imageExt.test(entry.name)) files.push(full);
  }
  return files;
}

function focusFor(name) {
  const n = name.toLowerCase();
  // A "back" filename is rear-only. Never mix it with a frontal crop.
  if (/\bback\b|back[-_]/i.test(n)) {
    return { left: 0.16, right: 0.84, top: 0.24, bottom: 0.62, mode: 'rear' };
  }
  if (/over[-_]?shoulder|looking[-_]?back|three[-_]?quarter/i.test(n)) {
    return { left: 0.14, right: 0.86, top: 0.22, bottom: 0.58, mode: 'three-quarter' };
  }
  if (/seated|kneeling|crouch/i.test(n)) {
    return { left: 0.12, right: 0.88, top: 0.25, bottom: 0.68, mode: 'front-lower' };
  }
  return { left: 0.12, right: 0.88, top: 0.22, bottom: 0.58, mode: 'front' };
}

for (const file of walk(root)) {
  const rel = path.relative(root, file).split(path.sep);
  const id = rel[0];
  const variantDir = rel.slice(1, -1).join('/');
  if (!/(^|\/)overworld(?:-variants)?$/i.test(variantDir) &&
      !/(^|\/)overworld\//i.test(variantDir)) continue;
  const name = rel.at(-1);
  const f = { ...focusFor(name), ...(overrides[id]?.[name] || {}) };
  const image = '/' + path.relative(process.cwd(), file).split(path.sep).join('/');
  labels[id] ||= id[0].toUpperCase() + id.slice(1);
  characters[id] ||= { variants: {} };
  characters[id].variants[name] = {
    image,
    left: f.left,
    right: f.right,
    top: f.top,
    bottom: f.bottom,
    notes: 'Auto-generated candidate; review in the crop tester.',
    focusMode: f.mode
  };
}

const result = {
  version: 1,
  coordinateSystem: 'normalized-image',
  source: 'rpg-assets/characters/**/overworld*',
  rule: 'Names containing back use rear-only focus; all others use frontal focus with pose adjustments.',
  labels,
  characters
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log('Generated', Object.values(characters).reduce((n, c) => n + Object.keys(c.variants).length, 0), 'candidates at', out);
