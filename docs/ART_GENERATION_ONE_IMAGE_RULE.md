# RPG artwork production: one standalone image per request

## Important: this document is NOT an image-generation prompt

**Never paste this Markdown file into an image model.** The earlier procedure instructed agents to copy a long negative prefix and included examples of prohibited layouts. That put the same words associated with unwanted compositions directly into the model input. In addition, some previous actual image-generation calls affirmatively requested portfolios/collages, contrary to the user's intent. We cannot fix those past calls by changing repository text: the *actual model-facing prompt* must be checked before each call.

### Authoritative model-facing prompt source

Generate a positive, compact, one-asset prompt from the canonical queue using the Node script:

~~~sh
# One story CG from the 32-scene game queue
node scripts/rpg-art-prompt.js --scene hana_first_meeting

# One reward illustration for an established adult character
node scripts/rpg-art-prompt.js --reward booster --character hana
node scripts/rpg-art-prompt.js --reward battle-result --character reina

# Include path, character, and target dimensions for the packager
node scripts/rpg-art-prompt.js --scene hana_first_meeting --json

# Validate a custom positive prompt from a local text file before use
node scripts/rpg-art-prompt.js --validate /tmp/single-asset-prompt.txt

# Automated tests covering every canonical scene, reward, and rejected layouts
npm run test:art-prompts
~~~

**Copy ONLY the script's standard-output prompt into the image-generation request.** Do not supply other scenes, entire art handoffs, reference galleries, character lists, manifests or negative example text. Model image count is **one** per request. The generated result must be a single continuous illustration of the requested moment.

The script takes **one** canonical scene ID, or **one** supported reward type plus **one** known character ID. Unsupported IDs fail rather than guessing. Use the exact output path in its JSON metadata when accepting a deliverable. Work across a batch by invoking the script separately for each asset; this is not a single batch image request.

Other art types (expressions, backgrounds, reactions, standing sprites) must likewise be prompted individually. Draft a short, positive one-scene request describing subject, action, outfit, setting, camera, lighting, and desired native dimensions. Validate the actual text using the script's --validate option; include the required phrase "Create one complete, standalone" and describe a "single continuous scene" and "one focal moment". Do not paste the entire source reference document.

## Production QA (separate from the model prompt)

Never render the following prohibited layouts for a standalone runtime art slot:

- Collage, montage, tiled grid, contact sheet, concept sheet, sprite/expression sheet, mood board, character lineup, storyboard, portfolio, asset catalog or marketing showcase.
- Two or more framed visual examples in one image, inset panels, captions, baked game interface or text.
- Multiple separate events combined in one picture or a pasted selection of unrelated character portraits.

These are **inspection and rejection criteria**, not words to include in the model-facing prompt. The agent should describe the image it wants, not spend the prompt listing the image formats it fears.

Inspect the actual generated image before treating it as a valid asset. A bad image must be **rejected, not cropped into a pretend original**. Check anatomy, character identity, canonical hair/clothing, event action, framing, scene independence, the absence of printed UI, and age-appropriate SFW content. A reward image must actually depict the reward moment; a CG must match its authored scene, not merely feature the right person.

Target dimensions follow the actual type: CG **1920×1080** plus a programmatically derived **640×360** thumbnail; reaction/result/booster portrait normally **768×1024**; standing character portrait **1024×1536 PNG with real transparency** when required. Preserve agreed canonical files, optimize production images, and include file size, dimensions, and SHA-256 in a manifest. ZIP paths begin at the repository root, e.g., rpg-assets/events/cg/season01/hana_first_meeting.webp.

## Failure investigation: mandatory after every rejected collage

1. Retrieve the **actual complete model-facing text** used in the failed call. Do not substitute this Markdown file or a conversational promise for that evidence.
2. Compare it to the one-asset script output or validated custom prompt, and identify the exact source/template that assembled it.
3. If it contains a request for multiple images, update that source/template and add a regression test BEFORE retrying. Then rerun npm run test:art-prompts.
4. If the prompt contains only one event and still yields a multi-layout image, report an **image-generation failure**, rather than inventing a repository-prompt cause. Reject it and try a different positive, narrowly scoped scene request or a different image model.
5. Only record success when the next **actual generated artwork** is one complete, scene-accurate image with its correct runtime file and checksum.

**Limitation:** Repository instructions and static tests cannot automatically control or inspect a ChatGPT image-generation tool's internal generation context. They guard the written request assembled by participating agents. Human visual inspection (or a separate image-layout QA tool) is still necessary for the generated pixels.
