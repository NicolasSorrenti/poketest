# PR140 parallel artwork integration

Base and lease: `4cf9765467176dfc1479eaee0044a25b5b6612eb`, exclusively `art/overworld-character-refresh`. No main update or merge.

Akari/Camila/Kaede/Marina: scene happy and soft use existing reviewed expression portraits. Other states retain original static portrait. Their existing battle routes remain intact.

Reina/Shiori/Yuna: scene and battle use reviewed neutral/happy/surprised transparent expression portraits. Unreviewed scene emotions fall back to canonical neutral. Battle damage uses surprised; KO uses neutral. Dedicated declared attack art still takes precedence.

Rina/Sierra/Sol: source pack manifests now use existing expression-portraits; dialogue keys and old manifest aliases point to compatible reviewed images or neutral. No duplicate missing root assets added. Sparkle/smile are explicit happy aliases; unknown and unaudited dialogue states use neutral. Battle portrait routes retained.

Iris/Jinx/Jun/Luna/Nereo/Teo: approved canonical neutral conversions and existing happy/surprised installed from worker manifest. Wrong-identity installed neutral/VN files are preserved under `rpg-assets/rejected-artwork/pr140-parallel/replaced/`. Guest scene/battle routes avoid old legacy vulnerable/irritated/determined identities. Jinx/Luna source pack maps repaired and generated bundle rebuilt; Jinx judgy aliases annoyed; fire and Luna shy/blush use neutral. Jinx concerned aliases annoyed; generated soft and exact PNG attempt/prompt retained. Other older root assets remain untouched and inactive in these maps.

Hana: matching installed transparent neutral/happy/surprised/concerned/soft now serve scenes; vulnerable aliases soft, irritated concerned, determined neutral. Battle uses reviewed neutral/happy/surprised with dedicated attacks preserved.

Barb: supplied 887x1774 PNGs decode, SHA256 matches worker manifest, alpha 0..255; reviewed beside actual branch canonical neutral on white and #20242c. Copper hair, cap, rose tattoo, black outfit and boots retain identity. Exact PNG bytes installed as expression-portraits/concerned.png and soft.png, and scene manifest selects them (vulnerable -> soft, irritated -> concerned). Battle damage/status uses concerned, KO-taken soft. Existing attack art and remaining VN routes retained. Corrupt historical concerned.webp/soft.webp remain preserved, including explicit archive copies. All worker attempts, originals, prompts, reference and thumbnails retained. No resizing or raster modifications.

All four original worker reports/manifests and review composites are retained here; their historical scratch paths document provenance. `manifest.json` supplies repository runtime paths, dimensions, SHA256, Git blob IDs and thumbnail paths. `artifact-inventory.json` additionally records every preserved artifact, including deliberate decode failures and the zero-byte damaged staging attempt. Hidden RGB at alpha zero never caused rejection.

Validation: 30 focused Node tests passed across parallel portrait resolvers, reaction behavior/HTTP, Alma, Laca and character packs. Outfit selection, deterministic generated-pack check and JS syntax checks pass. Existing portrait identity suite has obsolete static-only battle expectations (documented in earlier audit); no full-suite-green claim. Reviewed portraits have mixed full-body and cropped framing; native dimensions preserved, existing contain-fit styling retained. Browser gameplay not manually exercised.

The pack build copies legacy pack images and temporarily restores an older Barb neutral/chibi. Those two unrelated copies were restored byte-for-byte from the leased base after bundle generation. No canonical originals were replaced by those legacy copies; generated-pack check still passes.
