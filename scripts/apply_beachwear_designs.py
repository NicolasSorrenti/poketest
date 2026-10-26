#!/usr/bin/env python3
"""Apply approved remaining beachwear designs to a Neo Campus working copy.
Run from the repository root: python scripts/apply_beachwear_designs.py
Safe to rerun; preserves unrelated events and approved art.
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'rpg-assets/references/beachwear/remaining_designs.json'
EVENTS = ROOT / 'rpg_cross_character_events.js'
DOC = ROOT / 'RPG_BARB_BEACHWEAR_DESIGN.md'


def run():
    data = json.loads(MANIFEST.read_text(encoding='utf-8'))
    if not EVENTS.is_file() or not DOC.is_file():
        raise SystemExit('Run after extracting the ZIP into the poketest repository root (missing game files).')
    original = EVENTS.read_text(encoding='utf-8')
    marker = 'events.push(...'
    start = original.find(marker)
    if start == -1:
        raise SystemExit('Expected crossover event array not found. No files changed.')
    array_start = start + len(marker)
    decoder = json.JSONDecoder()
    rows, consumed = decoder.raw_decode(original[array_start:])
    if not isinstance(rows, list):
        raise SystemExit('Crossover entries are not an array. No files changed.')
    existing = {e['id']: e for e in rows}
    changes = []
    for name, outfit in data['characters'].items():
        event_id = f'crossover_barb_{name}_beachwear_design'
        event = existing.get(event_id)
        if event is None:
            raise SystemExit(f'Missing target event {event_id}; no files changed.')
        if 'beachwear' not in event or 'art' not in event:
            raise SystemExit(f'Expected metadata missing: {event_id}; no files changed.')
        old = event['beachwear']
        for key in ('palette', 'cut', 'detail'):
            old_value = old.get(key, '')
            for line in event.get('lines', []):
                if isinstance(line.get('text'), str) and old_value:
                    line['text'] = line['text'].replace(old_value, outfit[key])
            if isinstance(event['art'].get('scene'), str) and old_value:
                event['art']['scene'] = event['art']['scene'].replace(old_value, outfit[key])
            old[key] = outfit[key]
        old['visualReference'] = data['reference']
        event['art']['scene'] += '' if data['reference'] in event['art']['scene'] else (
            ' Bold final swimsuit concept, with the proposed piece visible ONLY on Barb’s garment '
            'sketch: ' + outfit['detail'] + '. Visual styling reference: ' + data['reference'] + '.'
        )
        event['art']['outfit'] = (event['art'].get('outfit', '') +
            ' Design the swimsuit using the reference palette and detailed trims; '
            'both participants remain in their canonical daytime outfits. '
            'Do not use the poster for face, hairstyle or body identity.')
        changes.append((name, event))

    original_doc = DOC.read_text(encoding='utf-8')
    updated_doc = original_doc
    for name, event in changes:
        line = (f'| {name} | {event["title"]} | {event["beachwear"]["palette"]} | '
                f'{event["beachwear"]["cut"]} | `{event["id"]}.webp` |')
        regex = re.compile(r'^\| ' + re.escape(name) + r' \|[^\n]*\|\s*`' +
                           re.escape(event['id']) + r'\.webp`\s*\|$', re.MULTILINE)
        if not regex.search(updated_doc):
            raise SystemExit(f'Could not locate catalog row for {name}; no files changed.')
        updated_doc = regex.sub(lambda _: line, updated_doc, count=1)
    section = '''\n## Remaining 11 bold beachwear concepts — illustrated reference\n\nThe concept artwork and the exact design metadata are checked into this repository:\n\n- `rpg-assets/references/beachwear/remaining_designs.png`\n- `rpg-assets/references/beachwear/remaining_designs.json`\n\nThese are the approved swimsuit/beachwear styling references for Shiori, Yuna, Camila, Marina, Kaede, Iris, Elena, Jun, Teo, Elio and Nereo. The image is **not** a facial or body-canon reference. Follow the approved visual bibles for all character identity details. Male characters wear coordinated boardshorts/shirts; their Barb events may involve collaboration on a bikini collection rather than wearing one. In existing design-table events, the swimsuit is only a garment sketch, not a fitting scene.\n'''
    if '## Remaining 11 bold beachwear concepts — illustrated reference' not in updated_doc:
        updated_doc += section
    updated_events = (original[:array_start] + json.dumps(rows, ensure_ascii=False, indent=1) +
                      original[array_start + consumed:])
    DOC.write_text(updated_doc, encoding='utf-8')
    full = json.loads((ROOT / 'rpg-assets/references/beachwear/all_character_references.json').read_text(encoding='utf-8'))['characters']
    for event in rows:
        if event.get('beachwear', {}).get('stage') == 'concept':
            ch = event['participants'][1]
            if ch in full:
                event['beachwear']['visualReference'] = full[ch]['image']
    updated_events = original[:array_start] + json.dumps(rows, ensure_ascii=False, indent=1) + original[array_start + consumed:]
    EVENTS.write_text(updated_events, encoding='utf-8')
    print(f'Updated {len(changes)} remaining designs and references for all 21 events.')
    print('Next: run Node syntax and RPG tests, review the diff, then commit/push.')


if __name__ == '__main__':
    run()
