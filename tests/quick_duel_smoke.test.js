'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createGame, applyCommand, CATALOG} = require('../headless_duel');
const {isBasicPokemon, countCards} = require('../core_rules');

test('a duel starts, both players choose a Basic, and a turn advances', () => {
 const deck = [...Array(4).fill('base1-7'), ...Array(4).fill('base1-61'),
  ...Array(4).fill('base1-52'), ...Array(4).fill('base1-91'),
  ...Array(4).fill('base1-94'), ...Array(4).fill('base1-93'),
  ...Array(4).fill('base1-95'), ...Array(32).fill('base1-97')];
 const game = createGame({decks:[deck,deck], seed:2026, format:'classic'});
 const act = (side,type,payload={}) => {
  const result = applyCommand(game,side,{type,payload});
  assert.ok(result.ok, `${type}: ${result.error}`);
 };
 for (let side=0; side<2; side++) {
  const index = game.players[side].hand.findIndex(id => isBasicPokemon(CATALOG.get(id)));
  assert.ok(index >= 0, 'opening hand must have a Basic Pokémon');
  act(side,'setup_select',{handIndex:index});
  act(side,'setup_confirm');
 }
 if (game.mulliganBonus) {
  const side=game.mulliganBonus.side;
  act(side,'setup_bonus_draw',{count:0});
  if (game.mulliganBonus) act(side,'setup_bonus_done');
 }
 assert.equal(game.phase,'game');
 assert.ok(game.players.every(player=>player.active));
 const first=game.turn;
 act(first,'end_turn');
 assert.equal(game.turn,1-first);
 for (const player of game.players) assert.equal(countCards(player),60);
});
