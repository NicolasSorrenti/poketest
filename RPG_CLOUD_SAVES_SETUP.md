# RPG cloud saves — free Supabase setup

Browser localStorage remains the primary offline backup. Cloud sync is disabled until Supabase is configured.

## One-time setup

1. Create a **Free** project at https://supabase.com/dashboard.
2. Open SQL Editor in the project and run the SQL in **supabase/migrations/20261022_rpg_cloud_saves.sql**. This creates the owner-only save table and atomic revision RPC.
3. In Project Settings → API Keys, copy the **publishable** key (starts with sb_publishable_) and the project URL. Never use a secret or service_role key.
4. In Render's web-service Environment page, add:
   - SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   - SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   A legacy public SUPABASE_ANON_KEY also works. Redeploy/restart the service.
5. In Supabase Authentication → URL Configuration, set the app Site URL to https://poketest-4y5u.onrender.com/rpg.html. Enable email/password authentication. If email confirmation is enabled, confirm the signup email before signing in.
6. Open /rpg.html, click the cloud button, create an account, sign in, and choose the cloud or existing device progress if prompted.

## Expected behavior

- Each signed-in user stores one RPG save in Supabase Postgres. RLS limits access to their own user ID, and revision compare-and-swap rejects outdated writes.
- Existing browser saves remain available. Signing in uploads an existing device save if no cloud save exists. If both versions differ, the player explicitly chooses which to keep.
- RPG actions and the Deck Studio save locally immediately, then upload after a short debounce. The Save button in the RPG can trigger a cloud sync, and the account dialog has Sync now.
- Signed-in sessions persist on the browser using Supabase refresh tokens. Passwords are sent directly to Supabase Auth over HTTPS, not to Render.
- Unfinished duels use in-memory server sessions, so cloud sync waits for the duel to finish. Cloud saves are for completed RPG progress, not live combat transfers.
- Custom uploaded playmat images remain device-local (IndexedDB). Built-in and gift unlocks are represented in the RPG save.
- Concurrent device edits are not merged automatically. A version conflict shows Load cloud progress / Use this device in the RPG. This prevents silent overwrites but players should normally use one device at a time.
- Free Supabase projects can pause after inactivity and have usage limits; the local backup still works when Supabase is unavailable.

## Verification

1. On PC, choose a starter and advance the story. Sign in and sync.
2. On phone, log into the same account. Import cloud save and verify day, decks, cards and bonds.
3. Finish a duel on phone, return to the RPG, and verify the save can be loaded on PC.
4. Edit the campaign on two devices offline, then reconnect both. A conflict choice should appear rather than silent overwrites.
5. Test that an authenticated account cannot SELECT another user's row through Supabase REST.
6. Disconnect the network or leave Supabase unconfigured and verify the local save remains available.

Run smoke tests locally with: node --test tests/rpg_cloud_save.test.js

## Deployment notes

Only SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or legacy anon key) are needed in Render. Do not store service credentials, player passwords or database passwords in the repository. Confirm the existing Render service is using HTTPS.
