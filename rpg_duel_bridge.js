'use strict';
// Small shared browser/Node contract. No card rules or story domain logic live here.
(function (root, create) {
  const bridge = create();
  if (typeof module === 'object' && module.exports) module.exports = bridge;
  if (root) root.NeoRpgDuelBridge = bridge;
})(typeof window !== 'undefined' ? window : undefined, function () {
  const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{4,119}$/i;
  function duelUrl(duel) {
    if (!duel || typeof duel.id !== 'string' || !ID_PATTERN.test(duel.id)) throw Error('Invalid RPG duel ID');
    if (typeof duel.playerDeck !== 'string' || !duel.playerDeck || typeof duel.opponent !== 'string' || !duel.opponent) throw Error('RPG duel needs two decks');
    const p = new URLSearchParams({rpg: '1', duelId: duel.id, deck: duel.playerDeck, opponent: duel.opponent});
    return '/classic_live.html?' + p;
  }
  function context(search) {
    const p = new URLSearchParams(search || '');
    const duelId = p.get('duelId');
    if (p.get('rpg') !== '1' || !duelId || !ID_PATTERN.test(duelId)) return null;
    return {duelId};
  }
  function storageKey(ctx) {
    return ctx ? 'neoRpgDuelToken:' + ctx.duelId : 'neoClassicLiveToken';
  }
  function finishedMessage(ctx, response) {
    if (!ctx || !response || !response.view || response.view.over !== true || (response.winner !== 0 && response.winner !== 1)) return null;
    return {type: 'neo-rpg-duel-finished', duelId: ctx.duelId, winner: response.winner};
  }
  function isExpectedOutcome(pending, message) {
    return !!(pending && pending.resolved !== true && typeof pending.id === 'string' &&
      message && message.type === 'neo-rpg-duel-finished' &&
      message.duelId === pending.id && (message.winner === 0 || message.winner === 1));
  }
  return Object.freeze({duelUrl, context, storageKey, finishedMessage, isExpectedOutcome});
});
