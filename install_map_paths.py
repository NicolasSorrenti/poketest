from pathlib import Path
import re
p=Path('overworld/manifest.js')
if not p.exists(): raise SystemExit('Run from repository root: overworld/manifest.js not found')
s=p.read_text(encoding='utf-8')
for loc in ('home','park','cafe','center','library','shop'):
    pattern=r"(?P<head>\b"+loc+r"\s*:\s*\{[^{}]*?\bid\s*:\s*['\"]"+loc+r"['\"][^{}]*?\bimage\s*:\s*)['\"][^'\"]+['\"]"
    replacement='/rpg-assets/locations/'+loc+'/overworld-map-candidate-20261029.webp'
    s,n=re.subn(pattern,lambda m:m.group('head')+repr(replacement),s,count=1,flags=re.S)
    if n!=1: raise SystemExit('Could not safely locate '+loc+' in manifest; no file written')
# update only image URLs; preserve original dimensions, anchors and hotspots
p.write_text(s,encoding='utf-8')
print('Manifest image paths updated. Verify placements in-game; artwork remains candidate.')
