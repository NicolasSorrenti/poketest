'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const queue = require('../docs/cg-art-queue.json');
const fs = require('node:fs');
const path = require('node:path');
const {createPrompt, assertSingleImagePrompt, parseArgs} = require('../scripts/rpg-art-prompt.js');

test('each of the 32 real CGs produces its own isolated positive prompt and path', () => {
  assert.equal(queue.scenes.length, 32);
  for (const scene of queue.scenes) {
    const a = createPrompt({sceneId: scene.id});
    assert.equal(a.id, scene.id);
    assert.equal(a.character, scene.character);
    assert.equal(a.path, scene.path.replace(/^\//, ''));
    assert.deepEqual([a.width, a.height], [1920, 1080]);
    assert.ok(a.prompt.length < 2500, scene.id);
    assert.ok(a.prompt.includes(scene.scene), scene.id);
    assert.equal(assertSingleImagePrompt(a.prompt), true);
    assert.doesNotMatch(a.prompt, /collag|grid|gallery|contact sheet|concept art|moodboard|montage|character sheet|multi.panel/i);
    assert.doesNotMatch(a.prompt, /\b\d{2}\s+(?:CGs|scenes|portraits)\b/i);
  }
});

test('eight original characters can each receive one booster or result prompt', () => {
  for (const id of Object.keys(queue.characters)) {
    for (const kind of ['booster','battle-result']) {
      const p = createPrompt({characterId:id,reward:kind});
      assert.equal(p.path, 'rpg-assets/characters/' + id + '/events/' + kind + '.webp');
      assert.deepEqual([p.width,p.height], [768, 1024]);
      assert.ok(p.prompt.includes(queue.characters[id]));
      assertSingleImagePrompt(p.prompt);
    }
  }
});

test('reward art keeps the character in her assigned game venue with an actual pack', () => {
  const scenes = {
    hana: ['Lucky Draw card shop','Hana extends her hand'],
    reina: ['tournament registration table','Reina offers one sealed booster'],
    shiori: ['campus library','Shiori slides one sealed booster'],
    yuna: ['neon arcade card counter','Yuna holds up one sealed booster'],
    akari: ['campus strategy-club table','Akari adjusts her square glasses'],
    camila: ['collector lounge','Camila smiles knowingly'],
    marina: ['riverside community-card kiosk','Marina presents one sealed booster'],
    kaede: ['underground card-club counter','Kaede holds out one sealed booster'],
  };
  for (const [id,[venue,action]] of Object.entries(scenes)) {
    const {prompt,path} = createPrompt({reward:'booster',characterId:id});
    assert.ok(prompt.includes(venue), id + ' missing venue');
    assert.ok(prompt.includes(action), id + ' missing reward action');
    assert.match(prompt,/the face and the single sealed booster pack must be clearly visible together/);
    assert.doesNotMatch(prompt,/bedroom|dormitory|lingerie|bunny|pin.up|sunset bedroom/i);
    assert.equal(path,'rpg-assets/characters/' + id + '/events/booster.webp');
  }
});

test('every canonical character is linked to an existing portrait reference, without injecting a gallery into the request', () => {
  for (const id of Object.keys(queue.characters)) {
    for (const type of ['booster', 'battle-result']) {
      const result = createPrompt({reward:type,characterId:id});
      assert.equal(result.referencePath, 'rpg-assets/' + id + '.png');
      assert.ok(fs.existsSync(path.join(__dirname, '..', result.referencePath)), id + ' missing canonical portrait');
      assert.match(result.prompt, /Match the supplied original in-game character portrait/);
      assert.match(result.prompt, /same face, hair silhouette, hair colors, skin tone and signature accessories/);
      assert.equal(result.review.length, 5);
      assert.doesNotMatch(result.prompt, /collage|grid|sheet|portfolio|storyboard|moodboard|gallery/i);
      if (type === 'booster') assert.ok(result.review.some(line => line.includes('clearly visible sealed booster')));
    }
  }
});

test('legacy gallery requests and even negative mentions of layouts are rejected', () => {
  const opening='Create one complete, standalone illustration showing a single continuous scene and one focal moment. ';
  for (const bad of [
    'Make a 4x4 grid.',
    'Create a collage of heroines.',
    'No concept sheet or collage!',
    'Show an expression sheet.',
    'Put four characters side-by-side.',
    'Produce a montage of battle reactions.',
    'Compose an asset gallery.',
    'Arrange a contact sheet of poses.',
  ]) assert.throws(()=>assertSingleImagePrompt(opening+bad), /Layout-trigger/);
});

test('unsupported, combined, invalid and noncanonical requests are rejected', () => {
  assert.throws(()=>createPrompt({sceneId:'not_a_scene'}), /Scene must match/);
  assert.throws(()=>createPrompt({sceneId:'../../bad'}), /Invalid scene ID/);
  assert.throws(()=>createPrompt({sceneId:'hana_first_meeting',reward:'booster',characterId:'hana'}), /never both/);
  assert.throws(()=>createPrompt({reward:'booster',characterId:'unknown'}), /Unknown canonical/);
  assert.throws(()=>createPrompt({reward:'win',characterId:'hana'}), /Unsupported reward/);
  assert.throws(()=>createPrompt({}), /Choose exactly one/);
  assert.throws(()=>parseArgs(['--scene','hana_first_meeting','--scene','reina_rival_intro']), /Usage/);
  assert.deepEqual(parseArgs(['--scene','hana_first_meeting','--json']),{sceneId:'hana_first_meeting',json:true});
});
