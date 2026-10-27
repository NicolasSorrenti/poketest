from pathlib import Path
import shutil

base = Path(__file__).resolve().parent
repo = Path.cwd()
target = repo / 'rpg.js'
if not target.is_file():
    raise SystemExit('Please run from the Neo Campus repository root (containing rpg.js).')
source = target.read_text(encoding='utf-8')
needle = "function stagePortraitPaths(id,expression,sceneId){\n return personaCStageCandidates(id,expression,portraitPaths(id,expression,sceneId));\n}"
replacement = """// NEO_DAILY_PORTRAIT_ROTATION_V2
// Day-stable cosmetic choices. Never modify the underlying canonical portraits.
const DAILY_PORTRAIT_ALTERNATES={
 akari:[1,2,3,4,5].map(n=>'/rpg-assets/characters/akari/portraits/special-day-'+n+'.png'),
 barb:[1,2,3,4,5,6,7,8,9,10].map(n=>'/rpg-assets/characters/barb/portraits/special-day-'+n+'.png')
};
function dailyAlternatePortrait(id,day){
 const files=DAILY_PORTRAIT_ALTERNATES[id];
 const d=Number(day);
 if(!files||!Number.isInteger(d)||d<1)return null;
 // Deterministic across reloads, independent per character, ~30% of days.
 const salt=id==='akari'?0x51a3:0x9b27;
 let h=(Math.imul(d ^ salt, 2246822519) ^ 0x85ebca6b)>>>0;
 h^=h>>>16; h=Math.imul(h,3266489917)>>>0; h^=h>>>13;
 if(h%10>=3)return null;
 return files[Math.floor(h/10)%files.length];
}
function stagePortraitPaths(id,expression,sceneId){
 const normal=personaCStageCandidates(id,expression,portraitPaths(id,expression,sceneId));
 const selected=dailyAlternatePortrait(id,state.day);
 return selected?[selected,...normal.filter(p=>p!==selected)]:normal;
}"""
marker = '// NEO_DAILY_PORTRAIT_ROTATION_V2'
if marker in source:
    start=source.index(marker)
    end=source.find('\nfunction scenePortraitSource(',start)
    if end<0 or 'function stagePortraitPaths(' not in source[start:end]:
        raise SystemExit('Unexpected existing rotation block; refusing modification.')
    updated=source[:start]+replacement+source[end:]
else:
    old=next((m for m in ('// NEO_DAILY_PORTRAIT_ROTATION_V1','// NEO_AKARI_DAY_ROTATION_V3','// NEO_AKARI_DAY_ROTATION_V2','// NEO_AKARI_DAY_VARIANT_V1') if m in source),None)
    if old:
        start=source.index(old)
        end=source.find('\nfunction scenePortraitSource(',start)
        if end<0 or 'function stagePortraitPaths(' not in source[start:end]:
            raise SystemExit('Unexpected older portrait rotation block; refusing modification.')
        updated=source[:start]+replacement+source[end:]
    elif needle in source:
        updated=source.replace(needle,replacement,1)
    else:
        raise SystemExit('Expected stagePortraitPaths() not found; nothing changed.')
# Verify assets before making any repository changes.
assets=[]
for id,count in [('akari',5),('barb',10)]:
    for i in range(1,count+1):
        rel=Path(f'rpg-assets/characters/{id}/portraits/special-day-{i}.png')
        src=base/rel
        if not src.is_file():raise SystemExit(f'Missing pack asset {rel}')
        assets.append((src,repo/rel))
if updated!=source:
    target.write_text(updated,encoding='utf-8')
for src,dest in assets:
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,dest)
print('Installed Akari (5) + Barb (10) day rotations. Stable whole-day selection, 30% alternate days per character; normal art fallback preserved.')
