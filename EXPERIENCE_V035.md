# Neo Campus TCG v0.35 — Combat readability and turn coaching

Based on v0.34. Both the authoritative CPU duel and two-human online duel share the improvements.

## Improvements

- **HP at a glance:** every Pokémon on the battlefield shows remaining HP, total HP, and a color-changing health bar. Statuses such as Sleep and Poison are clearly labeled. Damage counters remain server-authoritative, including damage beyond the printed HP.
- **Always-visible attack explanations:** attack effect text is shown beneath attack name, printed cost, and damage. The full text is also available in the button tooltip/card inspection; small displays clamp the description to three lines.
- **Contextual turn coach:** a compact heading and tip respond to setup, waiting, card decisions, targeting mode, turn status, and duel completion. Energy and Bench reminders are hints only, not additional client rules.
- **Card type labels:** your hand shows Basic Pokémon, Evolution, Energy, Trainer, or Stadium.
- **Less duplication:** the old passive next-move sidebar hides during normal game turns, but still appears during setup, actual decisions, targeting, or duel completion.
- Preserves all official theme decks, v0.34 battlefield targeting, centered choices, opponent animations, private hands, online room chat, and server validation.

## Running

From the `neo-campus-work` folder:

```bash
npm start
```

Open `http://localhost:8000/classic_live.html` for CPU play or `http://localhost:8000/online.html` for two-human play.

## Tests

- `npm test` includes the v0.35 turn-coach and HP unit tests along with all earlier regressions.
- `npm run test:experience:v035` runs a focused UI-focused compatibility subset.

Some expansion cards outside official theme decks still have incomplete/preview rule fidelity. This update changes only presentation, not the rules engine.
