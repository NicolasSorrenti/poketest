'use strict';
// Optional reminder only: never changes the duel's legal actions.
(function () {
  const button = document.getElementById('endTurn');
  if (!button) return;
  button.addEventListener('click', function (event) {
    const game = window.NeoCampus?.engine;
    if (!game || game.phase !== 'game' || game.turn !== 0 || game.over) return;
    const player = game.me;
    if (!player) return;
    const reminders = [];
    // Attack buttons already use the engine's affordability and legality checks.
    if (document.querySelector('#attacks button[data-attack]:not(:disabled)')) {
      reminders.push('You have not attacked yet.');
    }
    if (!player.energyUsed && Array.isArray(player.hand)) {
      const units = [player.active, ...(player.bench || [])].filter(Boolean);
      const canAttach = player.hand.some(id => {
        const card = window.NeoCampus.lookup.get(id);
        return units.some(unit => window.CORE?.legalAttachment?.({
          card, unit, energyUsed: player.energyUsed, round: game.round,
          pureBody: game.unitHasPower(unit, 'Pure Body'),
          cardName: game.card(unit)?.name || ''
        }));
      });
      if (canAttach) reminders.push('You have not attached an Energy card yet.');
    }
    if (!reminders.length) return;
    if (!window.confirm(reminders.join('\\n') + '\\n\\nEnd your turn anyway?')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
})();
