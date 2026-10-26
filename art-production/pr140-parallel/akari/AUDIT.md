# Scoped overworld audit

Branch: art/overworld-character-refresh; audited GitHub head: 8902bb3ed26c8f3f2c8646a1a26c14b2522b8e49. Read-only fetch and git tree/blob inspection; no checkout, commit or GitHub mutation.

## Result
Eight ready files reuse acceptable installed artwork. No image generation required. Reviewed two expression slots per character: happy and soft. Original /rpg-assets/{id}.png images are canonical references; characters/{id}/portraits/primary.png and VN closeups are separate renders, not canonical references. White and dark alpha composites reviewed in the four audit JPEGs. Invisible RGB under alpha zero was not used as a rejection criterion.

## Runtime findings
rpg.js portraitPaths currently excludes these four from expressionGuests, and they have no generated character packs. Its base fallback therefore uses /rpg-assets/{id}.png, bypassing the installed expression-portraits set. rpg_outfits.js sources only selects expression art when provided through art.expressions or outfit variants.

rpg_match_reactions.js separately uses vn-expressions for these four, including happy, neutral, surprised, angry, embarrassed and flirty. Those files exist, but the viewed neutral/happy VN examples have scenic backgrounds and different closeup framing. Do not replace battle reaction paths automatically with overworld assets. Discreet mode uses expression-faces/neutral.webp and chibi paths independently.

## Coordinator integration
For the four scoped IDs, add a portraitPaths resolver preferring /rpg-assets/characters/{id}/expression-portraits/{name}.webp, retaining /rpg-assets/{id}.png fallback. happy -> happy; soft -> soft. This is a mapping fix; the eight target files already exist in the audited branch. Existing neutral.webp is available, but this batch only approves happy/soft expression slots. Keep unreviewed concerned/surprised and battle slots outside this batch.

| Character | Expression | Exact runtime target |
|---|---|---|
| akari | happy | `/rpg-assets/characters/akari/expression-portraits/happy.webp` |
| akari | soft | `/rpg-assets/characters/akari/expression-portraits/soft.webp` |
| camila | happy | `/rpg-assets/characters/camila/expression-portraits/happy.webp` |
| camila | soft | `/rpg-assets/characters/camila/expression-portraits/soft.webp` |
| kaede | happy | `/rpg-assets/characters/kaede/expression-portraits/happy.webp` |
| kaede | soft | `/rpg-assets/characters/kaede/expression-portraits/soft.webp` |
| marina | happy | `/rpg-assets/characters/marina/expression-portraits/happy.webp` |
| marina | soft | `/rpg-assets/characters/marina/expression-portraits/soft.webp` |

## Candidate reuse review
Archived overworld neutral and happy/soft candidates were viewed against the original portraits. They retain recognizable identity/outfit and must not be discarded because of alpha-hidden RGB. The installed happy/soft set has clearer visible expression changes and is already compatible; duplicating or regenerating it adds no runtime coverage. All sources and attempts remain untouched. No missing files were found for the eight selected targets; the concrete blocker to visible overworld expression changes is coordinator integration of the resolver.

manifest.json records exact SHA256, dimensions, alpha extrema, source commit, target paths and ready/thumbnail files. ready/ contains isolated byte-identical copies, not repo edits.
