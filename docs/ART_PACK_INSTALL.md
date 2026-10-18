# Neo Harbor art ZIP — build-time installation

The current production archive is the **2026-10-18 complete art pack**: 158 image files (102 previous assets + 48 new dialogue expression panels + 8 reference sheets). The images are real generated illustrations, not placeholder filenames.

## One-time upload (required)

1. Download the ZIP from the ChatGPT conversation: `neo_harbor_complete_art_pack_2026-10-18.zip` (20.2 MB).
2. Open `asset-packs/` in this repository on GitHub and choose **Add file → Upload files**.
3. Upload the **ZIP itself** (do not unzip locally or change its name). Commit it to `main`.
4. Redeploy Render. No other asset uploads are needed.

Required repository destination:

```
asset-packs/neo_harbor_complete_art_pack_2026-10-18.zip
```

Expected archive SHA-256:

```
6683a2ba03e30c88b6d8c493e238cc3822972f8efa499c93ea62686d1f1269d5
```

## Automatic installation

The repository uses only Node.js core modules—no `unzip` executable or package dependency.

- `npm install` executes `postinstall` and safely unpacks the archive during the build.
- `npm run build` also unpacks it for Render deployments with an explicit build command.
- `npm start` executes `prestart` and checks the archive again, so existing deployments recover even if the build command differs.
- `npm run assets:unpack:required` fails if the archive is absent; set `RPG_ART_REQUIRED=1` after the ZIP is committed if you want all production builds to fail when it is missing.

Only approved `rpg-assets/**` paths are extracted. Existing root `rpg-assets/hana.png`, `reina.png`, backgrounds and the canonical `manifest.json` are **never replaced**. The expansion is placed alongside them:

```
rpg-assets/characters/{character}/portraits/primary.png
rpg-assets/characters/{character}/expressions/*.png
rpg-assets/characters/{character}/chibi/*.png
rpg-assets/characters/{character}/outfits/streetwear-preview.png
rpg-assets/events/cg/*
rpg-assets/locations/panoramas/*
rpg-assets/ui/*
rpg-assets/manifest.art-expansion.json
```

The ZIP also has some top-level documentation. Those files are intentionally *not* installed so the art importer cannot overwrite code or GitHub documentation.

The installer SHA-256 verifies the entire archive, checks individual ZIP CRCs, rejects unsafe paths, and refuses to overwrite modified extracted files. It can be run repeatedly. Its generated image files are ignored in Git: Git stores the ZIP; Render gets the extracted files.

## Verify

```bash
npm run test:art
npm run assets:unpack:required
```

Then visit an extracted static URL, for example:

`/rpg-assets/characters/hana/portraits/primary.png`

The previous root RPG portraits remain in the existing UI until a separate approved art-selection integration is made. New art is now web-served and ready for visual review.

**Important:** Until the ZIP itself is uploaded through GitHub, the build skips extraction without error and the game continues using its existing artwork. The code/configuration PR by itself does not contain the binary archive.

## Six-expression artwork

Each of the eight original heroines has an independent illustrated panel for **neutral, happy, embarrassed, angry, surprised, and flirty**, at `rpg-assets/characters/{id}/vn-expressions/{emotion}.webp`. The full eight source sheets (one per heroine) are retained at `rpg-assets/characters/{id}/reference/expression-master.webp`. `rpg-assets/characters/vn-expressions-manifest.json` maps the 48 expressions to exact filenames and includes identity/age metadata. `rpg-assets/characters/vn-expression-checksums.json` records image SHA-256 and dimensions.

**Do not confuse these with transparent cut-out sprites.** These are background-backed, native-resolution dialogue portrait panels. They are additive; prior root portraits and the previous art expansion's manifest/checksums remain unchanged. The RPG UI does not automatically select the new expression per dialogue yet.
