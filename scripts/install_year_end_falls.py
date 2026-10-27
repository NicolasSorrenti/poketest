from pathlib import Path
p=Path('rpg.js')
s=p.read_text(encoding='utf-8')
if 'function maybeShowYearEndFallReel()' in s:
 print('Year-end reel already installed');raise SystemExit(0)
function=Path('scripts/year_end_falls_function.js.txt').read_text(encoding='utf-8')
anchor='function render(){'
assert s.count(anchor)==1,'Could not find exactly one render function'
s=s.replace(anchor,function+'\n'+anchor,1)
start=s.index('function render(){')
end=s.index("$('deckStudioBtn').onclick",start)
region=s[start:end]
needle=' syncSceneCG();'
assert region.count(needle)==1,'Unexpected render layout — check manually'
region=region.replace(needle,needle+'\n if(state.day>90)queueMicrotask(maybeShowYearEndFallReel);',1)
s=s[:start]+region+s[end:]
p.write_text(s,encoding='utf-8')
print('Installed Day 91 year-end blooper reel')
