# Rina / Sierra / Sol coordinator handoff

Audited PR140 branch art/overworld-character-refresh at 8902bb3ed26c8f3f2c8646a1a26c14b2522b8e49. GitHub recursive tree verified, not truncated; local audit checkout matches HEAD. No commits, GitHub mutations, or runtime edits. Zero generated attempts. All pre-existing attempts preserved.

## Runtime findings

rpg.js:1962-1976 uses OUTFITS.sources (rpg_outfits.js:29-33): art.expressions[expression], legacy, art.portrait, base. Generated pack art is copied from characters/<id>/art_manifest.json into rpg_character_packs.generated.js (rina:5242, sierra:5825, sol:6652). All 15 root-level expression paths in those three manifests are absent from the verified tree. Their portrait fallbacks exist and match the original rpg-assets/<id>.png identities.

Rina and Sierra have no scene legacy expression route. Dialogue emits neutral/happy/surprised/vulnerable/irritated/determined; their manifest keys mostly differ, so expressions silently fall back to portraits. Sol has a working PNG legacy route: neutral->neutral, happy->smile, surprised->surprised, vulnerable/irritated->worried, determined->neutral. Sol's missing manifest surprised path is tried before its valid legacy PNG; most other runtime dialogue keys bypass the differently named manifest expressions.

rpg_match_reactions.js:31-49,70-88 already routes all three to existing expression-portraits/{neutral,happy,concerned,surprised,soft}.webp. No missing battle expression artwork in this five-expression set. Dedicated attack artwork can retain precedence. Do not replace this compatible artwork with archived redesigns.

## Six missing manifest slots checked (two per character)

Prefer remapping to the existing compatible path over adding duplicate assets. Ready files are byte-identical copies of the source WebPs. Exact target/source paths, dimensions and SHA256 are in manifest.json.

| Character | Missing manifest target | Existing compatible source |
|---|---|---|
| rina | /rpg-assets/characters/rina/neutral.webp | /rpg-assets/characters/rina/expression-portraits/neutral.webp |
| rina | /rpg-assets/characters/rina/sparkle.webp | /rpg-assets/characters/rina/expression-portraits/happy.webp (cheerful alias; not a distinct new sparkle expression) |
| sierra | /rpg-assets/characters/sierra/neutral.webp | /rpg-assets/characters/sierra/expression-portraits/neutral.webp |
| sierra | /rpg-assets/characters/sierra/soft.webp | /rpg-assets/characters/sierra/expression-portraits/soft.webp |
| sol | /rpg-assets/characters/sol/smile.webp | /rpg-assets/characters/sol/expression-portraits/happy.webp |
| sol | /rpg-assets/characters/sol/surprised.webp | /rpg-assets/characters/sol/expression-portraits/surprised.webp |

Coordinator should also normalize dialogue keys (happy/surprised/vulnerable/irritated/determined) to compatible existing expression-portraits paths in source manifests and regenerate the pack; copying these six missing targets alone does not resolve all scene key mismatches. Remaining absent manifest paths are recorded as findings, not new expression checks in this batch: rina determined/shy/stage; sierra cool/focused/tired; sol neutral/worried/soft.

## Visual audit and blockers

Viewed originals and candidate sets on true white and dark (#20232c) alpha composites in audit-1.jpg through audit-4.jpg. Canonical Rina has pastel pink curls/twin tails, bows and pink/white stagewear; Sierra has long brown hair, coral outfit, floral overshirt and sunglasses; Sol has coral curls, flower accessories and turquoise/coral tropical outfit. Installed expression-portraits preserve these identities. Existing legacy Sierra closeups and Sol PNGs also retain recognizable identities. No invisible RGB under alpha zero was used to reject artwork.

Archived next-overworld-v2 and pr140-next-batch originals/runtime-4af4204 candidates visibly change Rina to a brunette in a dark dress, Sierra to different dark clothing, and Sol to a blonde in trousers. Excluded for identity/outfit drift, not alpha data. Four v4 archive files fail Pillow decoding (unreadable.json); preserve bytes and investigate separately if needed. They are not generation references. No missing compatible artwork blocker for the six selected slots; routing integration is the remaining action, exclusively for coordinator.
