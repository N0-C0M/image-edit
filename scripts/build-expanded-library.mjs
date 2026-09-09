// Expands the repository with 100k hand-drawn-style SVGs and 100k additional curated SVGs.
// Source data: Iconify open-source icon sets. Native freehand sets are preserved as-is;
// the remaining hand-drawn variants are deterministic derivatives and retain source license metadata.
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseIconSet, iconToSVG } from '@iconify/utils';

const sourceRoot = process.argv[2] || '.cache/iconify';
const handdrawnTarget = Number(process.argv[3] || '100000');
const beautifulTarget = Number(process.argv[4] || '100000');
const maxBeautifulPerCollection = Number(process.env.MAX_BEAUTIFUL_PER_COLLECTION || '4000');
const maxHanddrawnPerCollection = Number(process.env.MAX_HANDDRAWN_PER_COLLECTION || '3000');

const collections = JSON.parse(await fs.readFile(path.join(sourceRoot, 'collections.json'), 'utf8'));
const coreSelected = JSON.parse(await fs.readFile('collections-selected.json', 'utf8'));
const corePrefixes = new Set(Object.keys(coreSelected));

const NATIVE_HANDDRAWN = ['streamline-freehand', 'streamline-freehand-color'];
const BEAUTIFUL_NAME_RE = /(streamline|lucide|remix|carbon|hero|mingcute|iconpark|bootstrap|ionicons|clarity|teeny|octicons|feather|myna|gravity|radix|majest|fluent|phosphor|tabler|solar|huge|iconamoon|griddy|plump|sharp|flex|ultimate|cyber)/i;
const UI_CATEGORY_RE = /(^|\b)ui\b|interface|mixed grid|multicolor/i;
const DEPRIORITIZE_CATEGORY_RE = /flags?|maps?|logos?|brands?|emoji|programming/i;

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'icon';
}

function licenseText(meta) {
  const license = meta?.license;
  if (!license) return 'Unknown';
  if (typeof license === 'string') return license;
  return [license.title, license.spdx].filter(Boolean).join(' / ') || 'Unknown';
}

function allowedForProjectLibrary(meta) {
  const text = licenseText(meta);
  if (/noncommercial|\bNC\b|CC-BY-NC|BY-NC/i.test(text)) return false;
  // Iconify collections are open-source/free licensed; exclude clearly restrictive/unknown entries.
  return /(MIT|Apache|CC0|CC BY|CC-BY|BSD|ISC|Open Font|OFL|MPL|GPL)/i.test(text);
}

function collectionScore(prefix, meta) {
  let score = 0;
  const name = `${meta?.name || ''} ${prefix}`;
  const category = String(meta?.category || '');
  if (BEAUTIFUL_NAME_RE.test(name)) score += 250;
  if (UI_CATEGORY_RE.test(category)) score += 180;
  if (meta?.palette === true) score += 35;
  if (Number(meta?.total || 0) >= 1000) score += 40;
  if (DEPRIORITIZE_CATEGORY_RE.test(category)) score -= 180;
  if (/deprecated|legacy/i.test(name)) score -= 100;
  return score;
}

function renderSvg(iconData, bodyTransform = null) {
  const render = iconToSVG(iconData, { height: 'auto' });
  const attrs = {
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    ...render.attributes,
  };
  const attrString = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  const body = bodyTransform ? bodyTransform(render.body, render.attributes) : render.body;
  return `<svg ${attrString}>${body}</svg>`;
}

function stableHash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function handdrawnBody(body, attrs, id) {
  const viewBox = String(attrs.viewBox || '0 0 24 24').trim().split(/\s+/).map(Number);
  const maxDim = Math.max(viewBox[2] || 24, viewBox[3] || 24);
  const hash = stableHash(id);
  const seed = (hash % 997) + 1;
  const scale = Math.max(0.15, Math.min(maxDim * (0.006 + ((hash >>> 8) % 5) * 0.001), maxDim * 0.012));
  const freqX = (0.020 + ((hash >>> 12) % 9) * 0.002).toFixed(3);
  const freqY = (0.024 + ((hash >>> 16) % 9) * 0.002).toFixed(3);
  const filterId = `hd-${seed}`;
  return `<defs><filter id="${filterId}" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freqX} ${freqY}" numOctaves="2" seed="${seed}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale.toFixed(3)}" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g filter="url(#${filterId})" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
}

async function loadSet(prefix) {
  try {
    return JSON.parse(await fs.readFile(path.join(sourceRoot, 'json', `${prefix}.json`), 'utf8'));
  } catch {
    return null;
  }
}

async function exportCollection({ prefix, meta, outputRoot, remaining, maxPerCollection, transform = null, family, variant }) {
  if (remaining <= 0) return [];
  const data = await loadSet(prefix);
  if (!data) return [];

  const items = [];
  parseIconSet(data, (iconName, iconData) => {
    if (!iconData || items.length >= Math.min(remaining, maxPerCollection)) return;
    const id = `${prefix}:${iconName}`;
    const filename = `${safeName(iconName)}.svg`;
    const relPath = path.posix.join(outputRoot, prefix, filename);
    const svg = renderSvg(iconData, transform ? (body, attrs) => transform(body, attrs, id) : null);
    items.push({
      id: `${family}:${id}`,
      sourceId: id,
      prefix,
      name: iconName,
      collection: meta.name,
      category: meta.category ?? null,
      palette: meta.palette ?? null,
      author: meta.author ?? null,
      license: meta.license ?? null,
      family,
      variant,
      path: relPath,
      svg,
    });
  });

  if (!items.length) return [];
  const outDir = path.join(outputRoot, prefix);
  await fs.mkdir(outDir, { recursive: true });
  for (const item of items) {
    await fs.writeFile(item.path, item.svg, 'utf8');
    delete item.svg;
  }
  return items;
}

async function writeJsonl(file, rows) {
  await fs.writeFile(file, rows.map((x) => JSON.stringify(x)).join('\n') + '\n', 'utf8');
}

function addSelected(map, prefix, meta, count, family, variant) {
  const key = `${family}:${prefix}`;
  map[key] = { ...meta, prefix, family, variant, exported: (map[key]?.exported || 0) + count };
}

// -------------------- Beautiful originals --------------------
await fs.rm('library-beautiful', { recursive: true, force: true });
await fs.mkdir('library-beautiful', { recursive: true });
const beautifulManifest = [];
const beautifulSelected = {};

const beautifulCandidates = Object.entries(collections)
  .filter(([prefix, meta]) => !corePrefixes.has(prefix) && allowedForProjectLibrary(meta))
  .sort((a, b) => {
    const score = collectionScore(b[0], b[1]) - collectionScore(a[0], a[1]);
    return score || Number(b[1].total || 0) - Number(a[1].total || 0);
  });

for (const [prefix, meta] of beautifulCandidates) {
  if (beautifulManifest.length >= beautifulTarget) break;
  const items = await exportCollection({
    prefix,
    meta,
    outputRoot: 'library-beautiful',
    remaining: beautifulTarget - beautifulManifest.length,
    maxPerCollection: maxBeautifulPerCollection,
    family: 'beautiful',
    variant: 'original',
  });
  if (!items.length) continue;
  beautifulManifest.push(...items);
  addSelected(beautifulSelected, prefix, meta, items.length, 'beautiful', 'original');
  console.log(`beautiful ${prefix}: +${items.length} (${beautifulManifest.length}/${beautifulTarget})`);
}
if (beautifulManifest.length !== beautifulTarget) {
  throw new Error(`Beautiful library contains ${beautifulManifest.length}; expected ${beautifulTarget}`);
}
await writeJsonl('manifest-beautiful.jsonl', beautifulManifest);
await fs.writeFile('collections-beautiful.json', JSON.stringify(beautifulSelected, null, 2) + '\n', 'utf8');

// -------------------- Hand-drawn --------------------
await fs.rm('library-handdrawn', { recursive: true, force: true });
await fs.mkdir('library-handdrawn', { recursive: true });
const handdrawnManifest = [];
const handdrawnSelected = {};

// 1) Preserve true hand-drawn Streamline sets first.
for (const prefix of NATIVE_HANDDRAWN) {
  if (handdrawnManifest.length >= handdrawnTarget) break;
  const meta = collections[prefix];
  if (!meta || !allowedForProjectLibrary(meta)) continue;
  const items = await exportCollection({
    prefix,
    meta,
    outputRoot: 'library-handdrawn',
    remaining: handdrawnTarget - handdrawnManifest.length,
    maxPerCollection: Number(meta.total || 10000),
    family: 'handdrawn',
    variant: 'native-freehand',
  });
  handdrawnManifest.push(...items);
  addSelected(handdrawnSelected, prefix, meta, items.length, 'handdrawn', 'native-freehand');
  console.log(`handdrawn native ${prefix}: +${items.length} (${handdrawnManifest.length}/${handdrawnTarget})`);
}

// 2) Fill to 100k with deterministic rough/freehand derivatives of open-source UI icons.
const handdrawnCandidates = Object.entries(collections)
  .filter(([prefix, meta]) => !NATIVE_HANDDRAWN.includes(prefix) && allowedForProjectLibrary(meta))
  .filter(([, meta]) => !DEPRIORITIZE_CATEGORY_RE.test(String(meta?.category || '')))
  .sort((a, b) => {
    const score = collectionScore(b[0], b[1]) - collectionScore(a[0], a[1]);
    return score || Number(b[1].total || 0) - Number(a[1].total || 0);
  });

for (const [prefix, meta] of handdrawnCandidates) {
  if (handdrawnManifest.length >= handdrawnTarget) break;
  const items = await exportCollection({
    prefix,
    meta,
    outputRoot: 'library-handdrawn',
    remaining: handdrawnTarget - handdrawnManifest.length,
    maxPerCollection: maxHanddrawnPerCollection,
    transform: handdrawnBody,
    family: 'handdrawn',
    variant: 'generated-freehand',
  });
  if (!items.length) continue;
  handdrawnManifest.push(...items);
  addSelected(handdrawnSelected, prefix, meta, items.length, 'handdrawn', 'generated-freehand');
  console.log(`handdrawn generated ${prefix}: +${items.length} (${handdrawnManifest.length}/${handdrawnTarget})`);
}
if (handdrawnManifest.length !== handdrawnTarget) {
  throw new Error(`Hand-drawn library contains ${handdrawnManifest.length}; expected ${handdrawnTarget}`);
}
await writeJsonl('manifest-handdrawn.jsonl', handdrawnManifest);
await fs.writeFile('collections-handdrawn.json', JSON.stringify(handdrawnSelected, null, 2) + '\n', 'utf8');

// -------------------- Map, stats and notices --------------------
const coreCount = Object.values(coreSelected).reduce((sum, meta) => sum + Number(meta.exported || 0), 0);
const total = coreCount + beautifulManifest.length + handdrawnManifest.length;

const coreRows = Object.entries(coreSelected).map(([prefix, meta]) => ({ prefix, ...meta, family: 'core', variant: 'original' }));
const beautifulRows = Object.values(beautifulSelected);
const handdrawnRows = Object.values(handdrawnSelected);

const mapJson = {
  generatedAt: new Date().toISOString(),
  total,
  families: {
    core: { count: coreCount, root: 'library/', manifest: 'manifest.jsonl', collections: coreRows.map((x) => x.prefix) },
    handdrawn: { count: handdrawnManifest.length, root: 'library-handdrawn/', manifest: 'manifest-handdrawn.jsonl', collections: handdrawnRows.map((x) => x.prefix) },
    beautiful: { count: beautifulManifest.length, root: 'library-beautiful/', manifest: 'manifest-beautiful.jsonl', collections: beautifulRows.map((x) => x.prefix) },
  },
};
await fs.mkdir('catalog', { recursive: true });
await fs.writeFile('catalog/icon-map.json', JSON.stringify(mapJson, null, 2) + '\n', 'utf8');

function mdRows(rows) {
  return rows
    .sort((a, b) => Number(b.exported || 0) - Number(a.exported || 0))
    .map((meta) => `| ${meta.prefix} | ${meta.name || ''} | ${meta.exported || 0} | ${meta.variant || 'original'} | ${licenseText(meta)} |`)
    .join('\n');
}

const iconMap = `# Icon Map\n\nКарта локальной библиотеки для разработчиков и AI-агентов. Полный поиск выполняется по JSONL-манифестам; этот файл показывает семейства, коллекции и стратегию выбора.\n\n## Быстрый выбор\n\n| Семейство | Путь | Количество | Когда использовать |\n|---|---|---:|---|\n| Core | \`library/\` | ${coreCount} | Базовый UI, системные действия, бренды, emoji, игровые и общие пиктограммы |\n| Hand-drawn | \`library-handdrawn/\` | ${handdrawnManifest.length} | Friendly UI, onboarding, карточки, empty states, игровые/креативные интерфейсы |\n| Beautiful | \`library-beautiful/\` | ${beautifulManifest.length} | Современные landing/SaaS/mobile интерфейсы, где нужен более выразительный визуальный стиль |\n\n**Всего: ${total} SVG.**\n\n## Как искать\n\n\`\`\`bash\nnode scripts/search-icons.mjs calendar\nnode scripts/search-icons.mjs \"security shield\" --family=beautiful --limit=30\nnode scripts/search-icons.mjs upload --family=handdrawn\n\`\`\`\n\nДля машинного доступа:\n- \`manifest.jsonl\` — core;\n- \`manifest-handdrawn.jsonl\` — hand-drawn;\n- \`manifest-beautiful.jsonl\` — beautiful;\n- \`catalog/icon-map.json\` — компактная карта семейств и коллекций.\n\n> В hand-drawn семействе варианты \`native-freehand\` — исходные hand-drawn иконки автора; \`generated-freehand\` — детерминированные производные SVG с rough/freehand-эффектом. Исходный \`sourceId\`, автор и лицензия сохраняются в манифесте.\n\n## Core collections\n\n| Prefix | Collection | Icons | Variant | License |\n|---|---|---:|---|---|\n${mdRows(coreRows)}\n\n## Hand-drawn collections\n\n| Prefix | Collection | Icons | Variant | License |\n|---|---|---:|---|---|\n${mdRows(handdrawnRows)}\n\n## Beautiful collections\n\n| Prefix | Collection | Icons | Variant | License |\n|---|---|---:|---|---|\n${mdRows(beautifulRows)}\n`;
await fs.writeFile('ICON_MAP.md', iconMap, 'utf8');

const stats = `# Icon Library Stats\n\n- Total SVG icons: **${total}**\n- Core: **${coreCount}**\n- Hand-drawn: **${handdrawnManifest.length}**\n- Beautiful: **${beautifulManifest.length}**\n- Source: Iconify open-source icon sets + clearly labelled generated hand-drawn derivatives\n- Beautiful per-collection cap: **${maxBeautifulPerCollection}**\n- Generated hand-drawn per-source cap: **${maxHanddrawnPerCollection}**\n\nSee [ICON_MAP.md](ICON_MAP.md) for the collection map and search workflow.\n`;
await fs.writeFile('ICON_LIBRARY_STATS.md', stats, 'utf8');

const allNoticeRows = [...coreRows, ...beautifulRows, ...handdrawnRows];
const notices = allNoticeRows.map((meta) => {
  const author = typeof meta.author === 'object' ? (meta.author.name ?? JSON.stringify(meta.author)) : (meta.author ?? 'Unknown');
  const license = licenseText(meta);
  const url = typeof meta.license === 'object' ? (meta.license.url ?? '') : '';
  return `## ${meta.name ?? meta.prefix} (${meta.family}:${meta.prefix})\n\n- Family: ${meta.family}\n- Variant: ${meta.variant || 'original'}\n- Author/source: ${author}\n- License: ${license}\n- License/source URL: ${url || 'See Iconify collection metadata'}\n- Exported icons in this family: ${meta.exported || 0}\n`;
}).join('\n');

const licenseHeader = `# Third-party icon notices\n\nGenerated from Iconify collection metadata. Some sets require attribution. Preserve this file and the manifest metadata when redistributing icons.\n\nHand-drawn entries marked \`generated-freehand\` are derivative renderings of the named source collection; the source collection license and attribution requirements still apply.\n\n`;
await fs.writeFile('THIRD_PARTY_LICENSES.md', licenseHeader + notices, 'utf8');

console.log(`Done: core=${coreCount}, handdrawn=${handdrawnManifest.length}, beautiful=${beautifulManifest.length}, total=${total}`);
