# Neo Harbor art ZIP — build-time installation

The art expansion is distributed as **one verified ZIP**, not 102 independent binary commits.

## One-time upload (required)

1. Download the ZIP from the ChatGPT conversation: `neo_harbor_art_expansion_2026-10-17.zip` (10.6 MB).
2. Open `asset-packs/` in this repository on GitHub and choose **Add file → Upload files**.
3. Upload the **ZIP itself** (do not unzip locally or change its name). Commit it to `main`.
4. Redeploy Render. No other asset uploads are needed.

Required repository destination:

```
asset-packs/neo_harbor_art_expansion_2026-10-17.zip
```

Expected archive SHA-256:

```
2a7173080138c1264eb8d012d462a540c74c775507b1b756c46e1bd9545840ed
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
