'use strict';
// Browser navigation regression: a Cube duel must not be treated as Single Match.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(__dirname+'/'+path,'utf8');
const client=read('cube_client.js'),live=read('classic_live.js'),cube=read('cube.html');
assert.match(live,/rpgParams\.get\('cubeSolo'\)==='1'/,'Mode should be explicit');
assert.match(live,/cubeSoloMode\?'neoCubeLiveToken':'neoClassicLiveToken'/,'Use separate per-mode keys');
assert.match(live,/if\(cubeSoloMode&&!current\)throw Error\(/,'Do not silently create a Single Match when Cube expires');
assert.match(client,/sessionStorage\.setItem\('neoCubeLiveToken',result\.duelToken\)/);
assert.match(client,/sessionStorage\.setItem\('neoCubeLiveToken',state\.tournament\.activeDuelToken\)/);
assert.equal(client.includes("sessionStorage.setItem('neoClassicLiveToken'"),false,'Cube must never overwrite Single Match key');
assert.match(client,/location\.assign\('\/classic_live\.html\?cubeSolo=1'\)/);
assert.match(cube,/id="resumeMatch"[^>]*href="\/classic_live\.html\?cubeSolo=1"/,'Resume link should keep mode marker');
console.log('PASS Cube and Single Match use separate tokens and mode-aware navigation');
