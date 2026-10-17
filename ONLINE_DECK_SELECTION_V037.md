# Neo Campus TCG v0.37 — Independent Online Deck Selection

## Fixed behavior

The guest used to pick a deck on the join screen, then become unable to change it in the waiting room. Now both host and guest have their own **Your Deck** picker inside the private lobby. Each player can select an official theme deck or their locally saved custom deck, and click **Use this deck** to apply it. They can do so until the match starts.

- Changing either saved deck clears both players' Ready confirmations. Both must opt in again.
- A pending but unsaved change disables that player's Ready action (and the host's Start Duel action).
- The host sees the guest's selected deck name, not their private hand or the deck's card order.
- Changes are authenticated to the sender's seat and rejected after the match begins.
- Custom decks remain validated as 60 cards. If you edit a custom deck while in a room, click **Use this deck** again to update it.
- Stale revisions, invalid deck IDs, and unauthorized updates are rejected without changing the room.
- All existing 28 official theme decks, attack cues, chat, and battlefield UI remain.

## How to test with two people

1. Run `npm start` and open `/online.html`.
2. Host creates a room and shares its invite link.
3. Friend opens the link in a different browser/private session, picks a starting deck, and joins.
4. In the waiting room, friend changes **Your Deck** and clicks **Use this deck**. Host should see the updated deck label after the next poll.
5. Both click **Ready**; the host can now start.
6. To verify consent, change one player's deck while both are Ready: both Ready statuses reset and the host can no longer start until each clicks Ready again.

## Tests

- `npm run test:online:v037` tests independent deck changes, 32 mixed-deck starts, full match opening, privacy, rejection paths, and readiness.
- `npm test` runs all prior regression tests.
- Static desktop/mobile waiting-room screenshots were verified for overflow.

Note: full browser navigation to the local HTTP server was blocked by this environment, so the two-client browser click-through should also be exercised manually after installation. Server-side live HTTP tests and static browser layout tests passed.
