'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PACK = require('../rpg_character_packs.generated');
const SCHEDULES = require('../rpg_schedules');
const SLICE = require('../rpg_slice_of_life');
const CG = require('../rpg_cg_gallery');

const root = path.join(__dirname, '..');
const ids = ['barb_room_after_hours', 'barb_pool_day_off'];
const fullPaths = ids.map(id => path.join(root, 'rpg-assets/events/cg/season01', id + '.webp'));
const thumbPaths = ids.map(id => path.join(root, 'rpg-assets/events/cg/season01/thumbs', id + '.webp'));

function size(file) {
  const data = fs.readFileSync(file);
  assert.equal(data.toString('ascii', 0, 4), 'RIFF');
  assert.equal(data.toString('ascii', 8, 12), 'WEBP');
  const chunk = data.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return {width: 1 + data.readUIntLE(24, 3), height: 1 + data.readUIntLE(27, 3)};
  }
  assert.equal(chunk, 'VP8 ');
  const bits = data.readUInt16LE(26);
  const heightBits = data.readUInt16LE(28);
  return {width: bits & 0x3fff, height: heightBits & 0x3fff};
}

function state(day, slot, location) {
  return {
    day, slot, location, met_barb: true, focus: 50,
    relationships: {barb: {affection: 5, trust: 5, respect: 2, attraction: 0}},
    bonds: {barb: {affection: 5, trust: 5}},
    sliceOfLifeDone: {}, sliceOfLifeLastDay: 0, activeSliceOfLife: null,
    storyDone: {}, situationDone: {}, cgUnlocked: {}, cgViewed: {}
  };
}

test('Barb two-scene pack has valid approved full CGs and thumbnails', () => {
  const barb = PACK.byId('barb');
  assert.ok(barb);
  for (const file of fullPaths) assert.deepEqual(size(file), {width: 1672, height: 941});
  for (const file of thumbPaths) assert.deepEqual(size(file), {width: 480, height: 270});
  for (const id of ids) {
    const event = barb.events.find(e => e.id === id);
    const art = barb.art.eventImages.find(e => e.sceneId === id);
    const gallery = CG.byId(id);
    assert.ok(event && art && gallery, id);
    assert.equal(event.encounterType, 'slice');
    assert.equal(gallery.path, '/rpg-assets/events/cg/season01/' + id + '.webp');
    assert.equal(gallery.thumb, '/rpg-assets/events/cg/season01/thumbs/' + id + '.webp');
  }
});

test('both Barb scenes are reachable naturally and the second requires the first', () => {
  const barb = PACK.byId('barb');
  const first = barb.events.find(e => e.id === ids[0]);
  const second = barb.events.find(e => e.id === ids[1]);
  const firstDay = Array.from({length: first.end - first.start + 1}, (_, i) => first.start + i)
    .find(day => SCHEDULES.locationFor('barb', day, first.slot) === first.place);
  const secondDay = Array.from({length: second.end - second.start + 1}, (_, i) => second.start + i)
    .find(day => SCHEDULES.locationFor('barb', day, second.slot) === second.place);
  assert.ok(firstDay);
  assert.ok(secondDay);
  const before = state(secondDay, second.slot, second.place);
  assert.equal(SLICE.available(before, ['barb'], 'entry', 'barb').some(e => e.id === second.id), false);
  const after = state(secondDay, second.slot, second.place);
  after.sliceOfLifeDone[first.id] = {day: firstDay, slot: first.slot, choice: 2, flag: 'barb_room_compliment'};
  assert.equal(SLICE.available(after, ['barb'], 'entry', 'barb').some(e => e.id === second.id), true);
});

test('Barb continuity opening uses the actual first choice and CG unlock persists', () => {
  const barb = PACK.byId('barb');
  const second = barb.events.find(e => e.id === ids[1]);
  const s = state(24, 1, 'center');
  s.sliceOfLifeDone[ids[0]] = {day: 20, slot: 1, choice: 0, flag: 'barb_room_heart'};
  const opening = SLICE.linesFor(s, second.id)[0].text;
  assert.match(opening, /little heart/i);
  const noHistory = state(24, 1, 'center');
  assert.doesNotMatch(SLICE.linesFor(noHistory, second.id)[0].text, /little heart|balance|style/i);
  s.location = 'shop';
  const firstUnlock = CG.record(s, 'slice', 'barb', {eventId: ids[0]});
  assert.deepEqual(firstUnlock.map(e => e.id), [ids[0]]);
  s.sliceOfLifeDone[ids[1]] = {day: 24, slot: 1, choice: 0, flag: 'barb_pool_company'};
  s.location = 'center';
  const secondUnlock = CG.record(s, 'slice', 'barb', {eventId: ids[1]});
  assert.deepEqual(secondUnlock.map(e => e.id), [ids[1]]);
  const restored = JSON.parse(JSON.stringify(s));
  CG.hydrate(restored);
  assert.equal(CG.unlocked(restored, ids[0]), true);
  assert.equal(CG.unlocked(restored, ids[1]), true);
});

