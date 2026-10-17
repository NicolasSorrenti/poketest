# Neo Campus TCG v0.43 — CPU and online UI parity + Gym attack-copy fixes

## One matching battlefield interface

CPU duel (`/classic_live.html`) now uses the same battle-layout styles as the online room: two always-visible Benches and Active Pokémon, floating three-card hand preview and expandable hand tray, separate Powers drawer, compact toolbar, deck counters, clickable discard-pile viewers, and a collapsible Match Log. It also uses the same numbered Prize fallback and now redraws once in-flight actions finish so Prize buttons cannot remain disabled after a Knock Out. Coin and KO banners run from authoritative CPU match output, and the Match Log includes rule messages and coin outcomes. The deck-selection lobby is still CPU-specific; the chat drawer is omitted because the opponent is a bot.

The CPU UI still calls `/api/classic/` and never runs client-side damage or Trainer rules. The live online UI is not modified.

## Gym card fixes

Misty's Psyduck's ESP can now copy three additional switch-related attack classes on three heads: Lure / Taunt (the attacker chooses an opposing Benched replacement), Teleport (the attacker chooses one of their own Benched Pokémon), and Whirlwind / Knock Back (the defending player picks a new Active after damage). The 3-head copy ignores the other attack's Energy cost but respects target ownership. This builds on the existing v0.41–v0.42 handling for coin damage, recoil, and target-Bench attacks.

Blaine's Quiz #1 remains intentionally unsupported. Extremely complex attack copies with deeper choice/payment chains still need dedicated handlers and are not claimed as complete.

## Verification

- `npm test` passes (including new `test_cpu_parity_v043.js` and `test_gym_copy_switch_v043.js`).
- Playwright Chromium in-page fixture confirmed the CPU battlefield at 1440×900 and 390×844, both Benches in the viewport with no page overflow, the floating hand opening/closing, and Match Log drawer behavior. No page JS errors. This is a controlled browser fixture, not a completed Render two-player match.
- Existing v0.38–v0.42 hosted-game, Secret Plan, Chaos Gym, and Psyduck regressions remain green.

## Deployment

Updating Render restarts current in-memory games. The `HOST=0.0.0.0` and dynamic `PORT` settings are unchanged.
