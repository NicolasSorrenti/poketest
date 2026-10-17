# Neo Campus Online — First Multiplayer Preview (v0.22)

This version uses the **same authoritative `headless_duel.js` reducer as the Classic local mode**. It adds two-human private rooms, a new browser page, no bots in online matches, revision-checked actions, and polling for room and turn updates. Existing Classic CPU play remains available at `/classic_live.html`.

## Quick start on Windows (free, no cloud account required)

1. Install **Node.js 18+** and extract the ZIP.
2. Open `neo-campus-work` and double-click `START_ONLINE_LOCAL.bat` (or run `npm start`).
3. Open `http://localhost:8000/online.html` on your PC. You can test two clients in separate browser profiles or a normal/incognito window.
4. For a friend elsewhere on the internet, install **cloudflared** using https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/.
5. In a second terminal run `cloudflared tunnel --url http://127.0.0.1:8000` (or double-click `SHARE_WITH_CLOUDFLARE.bat`).
6. Cloudflare prints a temporary `https://...trycloudflare.com` URL. **Open THAT URL with `/online.html` on your own browser** before creating a room, so the Copy Invite Link control contains an address your friend can reach. Alternatively send the friend the public site URL plus the six-character room code separately.
7. Create a room, pick a deck, send the link or code. Your friend joins with their own deck. Each player clicks **Ready**, then the host clicks **Start Duel**. Both choose an Active Basic Pokémon and confirm opening setup.

Cloudflare Quick Tunnels are for temporary development/testing and do not require owning a domain or setting up port forwarding. They are not a production hosting guarantee. Anyone who knows the *public site URL* can access the public site; joining an occupied match additionally requires the six-character code. Never share your private player token.

**The host PC must stay awake with Node.js and cloudflared running.** Stopping either process ends remote access. Restarting Node.js loses in-progress games and rooms, as the current service is in-memory only.

## Friends on the same Wi-Fi / LAN

Double-click `START_ONLINE_LAN.bat` (sets `HOST=0.0.0.0`), run `ipconfig` to find your Windows PC's private IPv4 address, then share `http://192.168.x.x:8000/online.html` (substitute the actual address). If Windows Firewall prompts you, allow Node.js on **Private networks only**. A LAN IP cannot be reached by a friend on another ISP; direct public IP hosting needs port forwarding and careful firewall management, so a tunnel is recommended instead.

## How it works

- `classic_online_service.js` owns player room credentials, lobby readiness, deck choices and server-side game state.
- `headless_duel.js` alone applies card actions. Every submitted command is revision-checked; invalid commands do not commit state.
- `duel_protocol.js` produces a per-player view; neither browser receives the other's hidden hand or Prize identities.
- `online.html`/`online.js` are a two-human client. Updates are short-interval **HTTP polling** (about 1.2 seconds), not WebSockets.
- The host can start only after both players join and ready up. The host has no privileged gameplay actions.
- A match can be resumed on refresh in the same tab/browser session using `sessionStorage`. Tokens are never embedded in invite links.
- Rooms have a six-hour inactivity expiry and a bounded capacity. There is no persistent match storage or rejoin-from-a-different-device flow yet.

## Known limitations

- **Experimental multiplayer**: the online HTTP flow has automated two-client tests, and static browser UI tests pass; real graphical mouse/touch interaction could not be exercised in this environment due to browser access restrictions.
- The Gym and Neo cards remain previews with unimplemented interactions; unsupported effects return an error rather than silently pretending to work.
- There is no spectator mode, public matchmaking, account sign-in, spectator chat, ranked play, automatic reconnect from another device, or crash recovery.
- The in-memory match state is lost if the Node.js process exits or reboots.
- Leaving a finished match doesn't destroy it immediately. Leaving a lobby before starting properly frees the guest seat or closes the host room.
- Each participant needs a separate browser profile or device (different session token), and the host needs to keep the server running.
- Because the site contains Pokémon-related fan content and external art URLs, publicly hosting it may implicate intellectual-property restrictions even when not monetized.

## Test commands

`npm run test:online`

`npm test`

The tests include two HTTP clients joining an invite room, matching readiness/startup, independent setup, hidden information, rejected stale/wrong-player commands, change of turns with no bot, reactive Trainer choices during the opponent's turn, private server file blocking, and all 30 theme-deck pairings.

## Future hosting

The authoritative reducer is independent of the HTTP transport. The room store is in memory today. A later deployment can add a persistent room adapter (for example Durable Objects) without maintaining a second set of card rules.
