# Barb — final consolidated Neo Campus pack

Extract into repository root, preserving paths. Contains characters/barb (Character Pack files and pack-local assets), and rpg-assets/characters/barb (publish-ready images).

All five story CGs are included with 1920×1080 images and 640×360 gallery thumbs. CG5 is the exact image provided by the user, resized for in-game use. Character portraits, expressions and chibi included.

Install/check:
```sh
npm run characters:validate
npm run characters:build
npm run test:rpg
```

Art_manifest scene paths match the packed images. HOWEVER: Story #4 describes a public showcase whereas the approved illustration depicts a private bedroom/studio design reveal; story #5 may also need dialogue tweaks to fit the rooftop confession. Update the story and test it before shipping. CGI images are not necessarily auto-wired to the game's gallery; confirm the CG event binder. The cut-in preview is NOT a clean transparent asset and remains review-only. No deploy/commit is claimed.
