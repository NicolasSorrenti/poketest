'use strict';
/**
 * Produce ONE positive, model-facing prompt from the canonical RPG art queue.
 * Examples:
 *   node scripts/rpg-art-prompt.js --scene hana_first_meeting
 *   node scripts/rpg-art-prompt.js --reward booster --character hana
 *   node scripts/rpg-art-prompt.js --reward battle-result --character reina --json
 *   node scripts/rpg-art-prompt.js --validate /tmp/candidate-prompt.txt
 *
 * IMPORTANT: Feed ONLY the prompt field (or default stdout) to the image
 * generator; do not supply entire handoff docs, manifests, or multi-asset lists.
 */
const fs = require('node:fs');
const path = require('node:path');
const queue = require(path.join(__dirname, '..', 'docs', 'cg-art-queue.json'));

const LAYOUT_TRIGGERS = [
  /\bcollag(?:e|es)\b/i,
  /\b(?:grids?|montages?|mood.?boards?|story.?boards?|contact.sheets?)\b/i,
  /\b(?:concept|character|expression|sprite|reference|style)\s+sheets?\b/i,
  /\b(?:concept|asset|design|promotional)\s+(?:boards?|galler(?:y|ies)|showcases?)\b/i,
  /\b(?:line.?ups?|multiple.panels?|split.frames?|multi.panels?|tiled)\b/i,
  /\b(?:four|eight|sixteen|32)\s+(?:scenes?|characters?|portraits?|images?|variations?|panels?)\b/i,
  /\b(?:4\s*[x×]\s*4|2\s*[x×]\s*2|3\s*[x×]\s*3)\b/i,
];
const VALID_REWARDS = new Set(['booster', 'battle-result']);
// Scene-specific reward settings prevent generic bedroom/pin-up prompts from
// replacing a recognisable in-game action. Each maps to ONE image only.
const REWARD_SCENES = Object.freeze({
  hana: {place:'Behind the wooden checkout counter of the Lucky Draw card shop, warm afternoon light falling across boxed decks and card binders.', gesture:'Hana extends her hand across the shop counter with a single sealed booster pack.'},
  reina: {place:'At the tournament registration table under dark-red banners, with a quiet card battle arena receding behind her.', gesture:'Reina offers one sealed booster pack with a composed, challenging half-smile.'},
  shiori: {place:'At a quiet wooden reading table in the campus library, sunlight catching shelves and neatly stacked books.', gesture:'Shiori slides one sealed booster pack across an open notebook toward the viewer.'},
  yuna: {place:'At a vividly lit neon arcade card counter, cyan and raspberry arcade lights glowing behind her.', gesture:'Yuna holds up one sealed booster pack triumphantly next to her sticker-covered deck box.'},
  akari: {place:'At a tidy campus strategy-club table, a tablet and color-coded planning notes set beside a deck box.', gesture:'Akari adjusts her square glasses and offers a single sealed booster pack across the table.'},
  camila: {place:'In a tasteful warm-lit collector lounge with burgundy upholstery and glass card display cabinets.', gesture:'Camila smiles knowingly and extends a single sealed booster pack from her gold-chained card case.'},
  marina: {place:'At the riverside community-card kiosk, evening reflections gleaming on the harbor beyond.', gesture:'Marina presents one sealed booster pack, her canvas bag resting beside her on the counter.'},
  kaede: {place:'At the industrial-style underground card-club counter, violet and acid-green neon painting the brickwork.', gesture:'Kaede holds out one sealed booster pack with a playful punk-rock grin and her safety-pin charms visible.'}
});

const safeId = v => typeof v === 'string' && /^[a-z0-9_]+$/.test(v);

function assertSingleImagePrompt(prompt) {
  if (typeof prompt !== 'string' || !prompt.startsWith('Create one complete, standalone')) {
    throw new Error('Art prompt must begin with a single finished illustration.');
  }
  if (prompt.length > 2500) throw new Error('Art prompt is too long: use only one scene.');
  for (const pattern of LAYOUT_TRIGGERS) {
    if (pattern.test(prompt)) {
      throw new Error('Layout-trigger wording detected (' + pattern + '). Rewrite the actual model-facing prompt.');
    }
  }
  if (!/single continuous scene/i.test(prompt)) {
    throw new Error('Art prompt must call for a single continuous scene.');
  }
  if (!/one focal moment/i.test(prompt)) {
    throw new Error('Art prompt must describe one focal moment.');
  }
  return true;
}

function clean(value, label) {
  if (typeof value !== 'string') throw new Error('Missing ' + label);
  const result = value.replace(/\s+/g, ' ').trim();
  if (!result || result.length > 700) throw new Error('Invalid ' + label);
  for (const pattern of LAYOUT_TRIGGERS) {
    if (pattern.test(result)) throw new Error('Multi-image wording in ' + label);
  }
  return result;
}

function createPrompt({sceneId, reward, characterId}) {
  if (sceneId && (reward || characterId)) throw new Error('One scene OR one reward, never both.');
  if (!sceneId && !(reward && characterId)) throw new Error('Choose exactly one --scene OR --reward with --character.');
  let id, target, description, framing, outfit, expression, setting, character;
  let kind;
  if (sceneId) {
    if (!safeId(sceneId)) throw new Error('Invalid scene ID');
    const matches = queue.scenes.filter(s => s.id === sceneId);
    if (matches.length !== 1) throw new Error('Scene must match one exact canonical ID');
    const s = matches[0];
    id = s.id;
    kind = 'scene';
    character = s.character;
    target = s.path.replace(/^\//, '');
    description = clean(s.scene, 'scene action');
    framing = clean(s.composition, 'camera composition');
    outfit = clean(s.outfit, 'costume');
    expression = clean(s.expression, 'expression');
    setting = clean(s.environment, 'environment');
  } else {
    if (!VALID_REWARDS.has(reward)) throw new Error('Unsupported reward type');
    if (!safeId(characterId) || !Object.hasOwn(queue.characters, characterId)) {
      throw new Error('Unknown canonical adult character; check visual references first');
    }
    id = characterId + '_' + reward.replace(/-/g, '_');
    kind = reward;
    character = characterId;
    target = 'rpg-assets/characters/' + characterId + '/events/' + reward + '.webp';
    const rewardScene = REWARD_SCENES[characterId];
    if (reward === 'booster') {
      description = rewardScene.gesture;
      framing = 'Portrait-format medium shot from the player viewpoint: the face and the single sealed booster pack must be clearly visible together.';
      expression = 'A personal, playful congratulatory smile following a finished card duel.';
    } else {
      description = 'After a close card match, ' + characterId + ' faces the viewer holding a deck case and reacting to the result.';
      framing = 'Portrait-format medium shot emphasizing the face, shoulders and deck case.';
      expression = 'Distinct competitive energy, with a natural post-match reaction.';
    }
    outfit = 'The established canonical everyday outfit and signature accessories in the character description.';
    setting = rewardScene.place;
  }

  const canonical = clean(queue.characters[character], 'canonical character identity');
  const prompt = [
    'Create one complete, standalone, cinematic anime visual-novel illustration: a single continuous scene capturing one focal moment.',
    'Feature ' + canonical,
    'Match the supplied original in-game character portrait for the same face, hair silhouette, hair colors, skin tone and signature accessories; change only the pose needed for this event.',
    'Moment: ' + description,
    'Location: ' + setting,
    'Wardrobe: ' + outfit,
    'Acting: ' + expression,
    'Camera: ' + framing,
    'Make the subject immediately recognizable, with polished original JRPG illustration, natural anatomy, cinematic lighting, and a coherent background that fills the canvas.',
    'Keep the image usable as game artwork with clean visual space for separately rendered dialogue; include only visual elements naturally belonging in this moment.',
    'All depicted people are clearly adults; keep the scene tasteful and suitable for a general-audience game.'
  ].join(' ');
  assertSingleImagePrompt(prompt);
  if (!target.startsWith('rpg-assets/') || !target.endsWith('.webp') || target.includes('..')) {
    throw new Error('Invalid game asset path');
  }
  const referencePath = 'rpg-assets/' + character + '.png';
  const review = [
    'The output is one standalone complete scene, not a composite layout.',
    'The face, hair silhouette, colors and signature accessories agree with ' + referencePath + '.',
    'The image depicts the requested in-game venue and physical action.',
    kind === 'booster'
      ? 'Exactly one clearly visible sealed booster pack is presented to the player.'
      : 'The intended scene/event is immediately recognizable.',
    'The final image has no interface elements, labels, watermarks or unrelated characters.'
  ];
  return {
    id, kind, character, path: target,
    referencePath, review,
    width: kind === 'scene' ? 1920 : 768,
    height: kind === 'scene' ? 1080 : 1024,
    prompt
  };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--json') { args.json = true; continue; }
    const key = {'--scene':'sceneId','--reward':'reward','--character':'characterId','--validate':'validate'}[k];
    if (!key || !argv[i + 1] || argv[i + 1].startsWith('--') || args[key]) {
      throw new Error('Usage: --scene ID OR --reward booster|battle-result --character ID [--json]; or --validate FILE');
    }
    args[key] = argv[++i];
  }
  return args;
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.validate) {
      if (args.sceneId || args.reward || args.characterId) throw new Error('Validation accepts a single prompt file only.');
      assertSingleImagePrompt(fs.readFileSync(args.validate, 'utf8').trim());
      process.stdout.write('OK: single-asset prompt passed\n');
    } else {
      const asset = createPrompt(args);
      process.stdout.write(args.json ? JSON.stringify(asset, null, 2) + '\n' : asset.prompt + '\n');
    }
  } catch (error) {
    process.stderr.write('ART PROMPT REJECTED: ' + error.message + '\n');
    process.exitCode = 1;
  }
}

module.exports = {createPrompt, assertSingleImagePrompt, parseArgs};
