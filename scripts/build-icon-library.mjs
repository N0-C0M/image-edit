// Generates a diverse, redistributable 100k SVG library from current Iconify collections.
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseIconSet, iconToSVG } from '@iconify/utils';

const sourceRoot = process.argv[2] || '.cache/iconify';
const target = Number(process.argv[3] || '100000');
const maxPerCollection = Number(process.env.MAX_PER_COLLECTION || '5000');
const outputRoot = 'library';

const collections = JSON.parse(await fs.readFile(path.join(sourceRoot, 'collections.json'), 'utf8'));
const prefixes = Object.entries(collections)
  .filter(([, meta]) => Number(meta.total || 0) > 0)
  .sort((a, b) => Number(b[1].total || 0) - Number(a[1].total || 0));

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });

const manifest = [];
const selected = {};
let total = 0;

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'icon';
}

for (const [prefix, meta] of prefixes) {
  if (total >= target) break;

  const jsonPath = path.join(sourceRoot, 'json', `${prefix}.json`);
  let data;
  try {
    data = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
  } catch {
    continue;
  }

  const outDir = path.join(outputRoot, prefix);
  await fs.mkdir(outDir, { recursive: true });

  let exported = 0;
  parseIconSet(data, (iconName, iconData) => {
    if (!iconData || total >= target || exported >= maxPerCollection) return;

    const render = iconToSVG(iconData, { height: 'auto' });
    const attrs = {
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      ...render.attributes,
    };
    const attrString = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
    const svg = `<svg ${attrString}>${render.body}</svg>`;
    const filename = `${safeName(iconName)}.svg`;
    const relPath = path.posix.join('library', prefix, filename);

    manifest.push({
      id: `${prefix}:${iconName}`,
      prefix,
      name: iconName,
      collection: meta.name,
      category: meta.category ?? null,
      palette: meta.palette ?? null,
      author: meta.author ?? null,
      license: meta.license ?? null,
      path: relPath,
      svg,
    });
    exported++;
    total++;
  });

  if (!exported) {
    await fs.rm(outDir, { recursive: true, force: true });
    continue;
  }

  selected[prefix] = { ...meta, exported };
  console.log(`${prefix}: ${exported} exported (${total}/${target})`);
}

if (total < target) {
  throw new Error(`Only ${total} icons exported; target is ${target}`);
}

for (const item of manifest) {
  await fs.writeFile(item.path, item.svg, 'utf8');
  delete item.svg;
}

await fs.writeFile('manifest.jsonl', manifest.map((x) => JSON.stringify(x)).join('\n') + '\n', 'utf8');
await fs.writeFile('collections-selected.json', JSON.stringify(selected, null, 2) + '\n', 'utf8');

const rows = Object.entries(selected)
  .map(([prefix, meta]) => `| ${prefix} | ${meta.name ?? ''} | ${meta.exported} | ${meta.license?.title ?? meta.license?.spdx ?? ''} |`)
  .join('\n');

const stats = `# Icon Library Stats\n\n- Total SVG icons: **${total}**\n- Collections used: **${Object.keys(selected).length}**\n- Per-collection cap: **${maxPerCollection}**\n- Source: Iconify open-source icon sets\n\n| Prefix | Collection | Exported | License |\n|---|---|---:|---|\n${rows}\n`;
await fs.writeFile('ICON_LIBRARY_STATS.md', stats, 'utf8');

const notices = Object.entries(selected).map(([prefix, meta]) => {
  const author = typeof meta.author === 'object' ? (meta.author.name ?? JSON.stringify(meta.author)) : (meta.author ?? 'Unknown');
  const license = typeof meta.license === 'object' ? (meta.license.title ?? meta.license.spdx ?? JSON.stringify(meta.license)) : (meta.license ?? 'Unknown');
  const url = typeof meta.license === 'object' ? (meta.license.url ?? '') : '';
  return `## ${meta.name ?? prefix} (${prefix})\n\n- Author: ${author}\n- License: ${license}\n- License/source URL: ${url || 'See Iconify collection metadata'}\n- Exported icons: ${meta.exported}\n`;
}).join('\n');

await fs.writeFile('THIRD_PARTY_LICENSES.md', `# Third-party icon notices\n\nGenerated from Iconify collection metadata. Some icon sets require attribution; preserve this file when redistributing the icon library.\n\n${notices}\n`, 'utf8');

console.log(`Done: ${total} icons across ${Object.keys(selected).length} collections.`);
