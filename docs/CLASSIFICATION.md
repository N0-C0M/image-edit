# Icon classification model

AERO Icon Atlas classifies every icon along several independent axes. The goal is to make search predictable for humans and AI agents even when the repository contains hundreds of thousands of SVG files.

## 1. Family

Family describes where the icon came from or how it was produced.

- `core` — stable general-purpose UI, system, brand, emoji and game collections.
- `beautiful` — curated modern product/UI collections.
- `handdrawn` — native or generated freehand-looking variants.
- `extended` — additional original open collections not already present in the main curated layers.
- `neon` — generated neon/glow treatment.
- `sticker` — generated sticker-like treatment.
- `soft` — generated softer/rounded visual treatment.
- `glass` — generated glass-like visual treatment.

Family is not the same as semantic category. A `security` icon may exist in several families.

## 2. Pack

A pack is one source collection inside one family. Pack IDs use the form:

```text
<family>:<prefix>
```

Examples:

```text
core:tabler
beautiful:lucide
handdrawn:streamline-freehand
neon:ph
```

Keep related toolbar/navigation icons inside one pack when possible.

## 3. Semantic category

The classifier assigns a dominant semantic category using icon names and source metadata. Current taxonomy covers areas such as:

- `actions`
- `navigation`
- `communication`
- `users`
- `security`
- `files`
- `commerce`
- `finance`
- `media`
- `devices`
- `development`
- `gaming`
- `maps-travel`
- `weather`
- `health`
- `education`
- `time-calendar`
- `social-brands`
- `arrows`
- `shapes`
- `misc`

Classification is heuristic. Exact semantic name always has priority over a broad category.

## 4. Visual style tags

An icon may have multiple style tags. Typical tags include:

- `outline`
- `filled`
- `duotone`
- `color`
- `monochrome`
- `rounded`
- `sharp`
- `thin`
- `bold`
- `pixel`
- `emoji`
- `brand`
- `handdrawn`
- `neon`
- `sticker`
- `soft`
- `glass`

Generated families always retain provenance in their manifests.

## 5. Variant / provenance

`variant` identifies how the asset was produced. Examples:

- `original`
- `native-freehand`
- `generated-freehand`
- `generated-neon`
- `generated-sticker`
- `generated-soft`
- `generated-glass`

For derived assets, `sourceId` points back to the original icon. The source author and source license stay in metadata.

## 6. Search order for AI agents

1. Determine the exact semantic action/entity.
2. Determine required visual family/style from the current screen.
3. Search by exact English term and synonyms.
4. Filter by family/category/style only after semantic search.
5. Prefer one pack per toolbar/navigation region.
6. Open 2–5 SVG candidates and compare optical weight.
7. Use an external source only when no local icon is appropriate.

## 7. CLI examples

```bash
node scripts/search-icons.mjs shield --category=security
node scripts/search-icons.mjs upload --family=beautiful --style=outline
node scripts/search-icons.mjs sword --category=gaming
node scripts/search-icons.mjs camera --family=neon
node scripts/search-icons.mjs wallet --pack=ph
```

## 8. Machine-readable indexes

The canonical taxonomy is stored in:

```text
catalog/taxonomy.json
```

Generated summaries:

```text
catalog/packs.json
catalog/categories.json
catalog/styles.json
catalog/classification-stats.json
catalog/icon-map.json
```

Full icon records remain in `manifest*.jsonl`.

## 9. Consistency rule

A large icon library is valuable because it gives more chances to find the right icon. It is not a reason to mix visual languages. Semantics first, consistency second, novelty third.
