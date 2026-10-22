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
  /\b(?:concept|asset|design|promotional)\s+(?:boards?|galleries|showcases?)\b/i,
  /\b(?:line.?ups?|multiple.panels?|split.frames?|multi.panels?|tiled|side.by.side)\b/i,
  /\b(?:four|eight|sixteen|32)\s+(?:scenes?|characters?|portraits?|images?|variations?|panels?)\b/i,
  /\b(?:4\s*[x×]\s*4|2\s*[x×]\s*2|3\s*[x×]\s*3)\b/i,
];
const VALID_REWARDS = new Set(['booster', 'battle-result']);
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
    if (reward === 'booster') {
      description = 'After a friendly card duel, the character warmly offers a sealed booster pack toward the viewer as a personal reward.';
      framing = 'Portrait-oriented medium shot from the player viewpoint, face and reward pack both clearly visible.';
      expression = 'Bright, personal congratulations with a playful smile.';
    } else {
      description = 'The character reacts emotionally to the end of a closely fought card match, with a deck case held at their side.';
      framing = 'Portrait-oriented medium shot emphasizing a distinct, readable facial expression.';
      expression = 'Expressive competitive energy with restrained theatrical confidence.';
    }
    outfit = 'Their established everyday outfit with signature accessories.';
    setting = 'The warm interior of the local card club, with softly blurred playing tables and evening light.';
  }

  const canonical = clean(queue.characters[character], 'canonical character identity');
  const prompt = [
    'Create one complete, standalone, cinematic anime visual-novel illustration: a single continuous scene capturing one focal moment.',
    'Feature ' + canonical,
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
  return {
    id, kind, character, path: target,
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
