# Neo Campus TCG — 20 close-up NPC battle cut-ins

Contains all twenty newly generated NPC battle close-ups, with original transparent PNGs and game-ready PNGs.

## Install
Extract the ZIP at the **root of the poketest repository**, keeping the folder structure intact. The installable cut-ins reside under `rpg-assets/reactions/<character>/attack.png`; `rpg-assets/reactions/manifest.json` references these files and approved root portraits for fallbacks.

All game-ready cut-ins are 1280×720 transparent PNG. Original generated source images are kept in `art-production/source-battle-closeups/`, which you can omit from production deployments to save space. No existing game code, dialogue or unrelated assets are modified in the archive.

This package upgrades the attack cut-in visual only. Other reaction types still use existing fallback art; they will require their own new expression-specific illustrations if desired.

The images are close-up compositions and some deliberately have dynamic hand/face foreshortening. Review final in-game cropping/placement before release.
