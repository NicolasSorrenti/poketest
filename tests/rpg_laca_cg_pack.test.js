'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CG = require('../rpg_cg_gallery');
const STORY = require('../rpg_story');
const SITUATIONS = require('../rpg_situations');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'LACA_CG_ASSET_MANIFEST.json'), 'utf8'));
const entries = manifest.entries;

function localAsset(webPath) {
  return path.join(root, webPath.replace(/^\//, ''));
}

function webpSize(file) {
  const data = fs.readFileSync(file);
  assert.equal(data.toString('ascii', 0, 4), 'RIFF');
  assert.equal(data.toString('ascii', 8, 12), 'WEBP');
  const chunk = data.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return {width: 1 + data.readUIntLE(24, 3), height: 1 + data.readUIntLE(27, 3)};
  }
  if (chunk === 'VP8 ') {
    const start = 26;
    return {width: data.readUInt16LE(start) & 0x3fff, height: data.readUInt16LE(start + 2) & 0x3fff};
  }
  if (chunk === 'VP8L') {
    const b0 = data[21], b1 = data[22], b2 = data[23], b3 = data[24], b4 = data[25];
    return {width: 1 + (((b2 & 0x3f) << 8) | b1 << 0), height: 1 + (((b4 & 0xf) << 10) | b3 << 2 | ((b2 & 0xc0) >> 6))};
  }
  throw new Error(`Unsupported WebP chunk ${chunk}`);
}

const state = (day = 80, slot = 2) => ({
  day, slot, location: 'park',
  relationships: {laca: {affection: 10, trust: 8, attraction: 3, respect: 3}},
  bonds: {laca: {affection: 10, trust: 8}},
  storyDone: {}, situationDone: {}, cgUnlocked: {}, cgViewed: {}
});

test('Laca pack contains exactly 13 complete full-size and thumbnail WebP assets', () => {
  assert.equal(entries.length, 13);
  for (const item of entries) {
    const full = localAsset('/' + item.full);
    const thumb = localAsset('/' + item.thumbnail);
    assert.ok(fs.existsSync(full), `missing full CG ${item.id}`);
    assert.ok(fs.existsSync(thumb), `missing thumbnail ${item.id}`);
    assert.deepEqual(webpSize(full), {width: 1920, height: 1080}, item.id);
    assert.deepEqual(webpSize(thumb), {width: 640, height: 360}, `${item.id} thumbnail`);
    const gallery = CG.byId(item.id);
    assert.ok(gallery, `missing gallery entry ${item.id}`);
    assert.equal(gallery.path, '/' + item.full);
    assert.equal(gallery.thumb, '/' + item.thumbnail);
  }
});

test('all 13 pack scenes map to one authored route or optional situation', () => {
  const routeIds = new Set(STORY.events.filter(e => e.npc === 'laca').map(e => e.id));
  const situationIds = new Set(SITUATIONS.events.filter(e => e.npc === 'laca').map(e => e.id));
  assert.deepEqual(entries.map(e => e.id).filter(id => id.startsWith('laca_route_')), [
    'laca_route_1', 'laca_route_2', 'laca_route_3', 'laca_route_4', 'laca_route_5'
  ]);
  for (const item of entries) {
    assert.ok(routeIds.has(item.id) || situationIds.has(item.id), `${item.id} has no authored event`);
    assert.equal(CG.byId(item.id).character, 'laca');
    assert.equal(CG.byId(item.id).id, item.id);
  }
});

test('route and situation CGs unlock only after their own completed event and persist through save/load', () => {
  const s = state();
  s.storyDone.laca_route_5 = {day: 80, slot: 2, choice: 0};
  assert.deepEqual(CG.record(s, 'story_milestone', 'laca', {eventId: 'laca_route_5'}).map(e => e.id), ['laca_route_5']);
  const situationState = state(24, 1);
  situationState.location = 'shop';
  assert.deepEqual(CG.record(situationState, 'situation', 'laca', {eventId: 'laca_card_floor'}), []);
  situationState.situationDone.laca_card_floor = {day: 24, slot: 1, choice: 0};
  assert.deepEqual(CG.record(situationState, 'situation', 'laca', {eventId: 'laca_card_floor'}).map(e => e.id), ['laca_card_floor']);
  CG.markViewed(situationState, 'laca_card_floor');
  s.cgUnlocked.laca_card_floor = situationState.cgUnlocked.laca_card_floor;
  s.cgViewed.laca_card_floor = situationState.cgViewed.laca_card_floor;
  const restored = JSON.parse(JSON.stringify(s));
  CG.hydrate(restored);
  assert.equal(CG.unlocked(restored, 'laca_route_5'), true);
  assert.equal(CG.unlocked(restored, 'laca_card_floor'), true);
  assert.equal(restored.cgViewed.laca_card_floor, true);
  assert.deepEqual(CG.record(restored, 'story_milestone', 'laca', {eventId: 'laca_route_5'}), []);
});

test('installed artwork is preferred and missing artwork still has a safe fallback candidate', () => {
  const entry = CG.byId('laca_route_1');
  assert.deepEqual(CG.artCandidates(entry).slice(0, 1), [{path: entry.path, kind: 'event'}]);
  const missing = {...entry, path: '/rpg-assets/events/cg/season01/not-installed.webp'};
  assert.ok(CG.artCandidates(missing).some(candidate => candidate.kind === 'portrait'));
});

