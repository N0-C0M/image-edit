import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createClassifier, familyFromManifest, loadTaxonomy, compactLicense, safeFilePart, words } from './lib/classifier.mjs';

const outRoot = process.argv[2] || '.pages-dist';
const taxonomy = await loadTaxonomy();
const classify = createClassifier(taxonomy);
const concurrency = Math.max(8, Math.min(96, Number(process.env.SPRITE_CONCURRENCY || Math.max(24, os.cpus().length * 4))));

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) await copyDir(from, to);
    else await fs.copyFile(from, to);
  }
}

function hash32(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function symbolId(id) {
  return `i-${hash32(id).toString(36)}`;
}

function normalizeSvgForSymbol(svg, sid) {
  const open = svg.match(/<svg\b([^>]*)>/i);
  const attrs = open?.[1] || '';
  let viewBox = attrs.match(/viewBox=["']([^"']+)["']/i)?.[1];
  if (!viewBox) {
    const width = attrs.match(/width=["']?([0-9.]+)/i)?.[1] || '24';
    const height = attrs.match(/height=["']?([0-9.]+)/i)?.[1] || '24';
    viewBox = `0 0 ${width} ${height}`;
  }
  let body = svg.replace(/^\s*<svg\b[^>]*>/i, '').replace(/<\/svg>\s*$/i, '');
  const ids = [...body.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]);
  for (const oldId of ids) {
    const next = `${sid}-${safeFilePart(oldId)}`;
    body = body
      .replaceAll(`id="${oldId}"`, `id="${next}"`)
      .replaceAll(`id='${oldId}'`, `id='${next}'`)
      .replaceAll(`url(#${oldId})`, `url(#${next})`)
      .replaceAll(`href="#${oldId}"`, `href="#${next}"`)
      .replaceAll(`href='#${oldId}'`, `href='#${next}'`)
      .replaceAll(`xlink:href="#${oldId}"`, `xlink:href="#${next}"`)
      .replaceAll(`xlink:href='#${oldId}'`, `xlink:href='#${next}'`);
  }
  return `<symbol id="${sid}" viewBox="${viewBox}">${body}</symbol>`;
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

await fs.rm(outRoot, { recursive: true, force: true });
await copyDir('site', outRoot);
await fs.mkdir(path.join(outRoot, 'data', 'packs'), { recursive: true });
await fs.mkdir(path.join(outRoot, 'data', 'sprites'), { recursive: true });
await fs.mkdir(path.join(outRoot, 'data', 'search'), { recursive: true });

const manifestFiles = (await fs.readdir('.'))
  .filter((name) => /^manifest(?:-[a-z0-9-]+)?\.jsonl$/i.test(name))
  .sort();

const packs = new Map();
const familyTotals = {};
const categoryTotals = Object.fromEntries(Object.keys(taxonomy.categories).map((x) => [x, 0]));
const styleTotals = {};
const searchShards = new Map();
let totalIcons = 0;

for (const manifestFile of manifestFiles) {
  const family = familyFromManifest(manifestFile);
  const text = await fs.readFile(manifestFile, 'utf8');
  for (const line of text.split('\n')) {
    if (!line) continue;
    const item = JSON.parse(line);
    const prefix = item.prefix || 'unknown';
    const packId = `${family}:${prefix}`;
    const { category, styles } = classify(item, family);
    const sid = symbolId(item.id || `${packId}:${item.name}`);
    const variant = item.variant || 'original';

    if (!packs.has(packId)) {
      packs.set(packId, {
        id: packId,
        fileId: safeFilePart(packId),
        family,
        prefix,
        name: item.collection || prefix,
        author: item.author || null,
        license: compactLicense(item.license),
        count: 0,
        categories: {},
        styles: {},
        preview: [],
        icons: [],
      });
    }
    const pack = packs.get(packId);
    const ordinal = pack.icons.length;
    const record = {
      n: item.name,
      i: item.id,
      s: sid,
      c: category,
      t: styles,
      p: item.path,
      v: variant,
      o: ordinal,
    };
    pack.icons.push(record);
    pack.count++;
    pack.categories[category] = (pack.categories[category] || 0) + 1;
    for (const style of styles) pack.styles[style] = (pack.styles[style] || 0) + 1;
    if (pack.preview.length < 8) pack.preview.push(record);

    familyTotals[family] = (familyTotals[family] || 0) + 1;
    categoryTotals[category] = (categoryTotals[category] || 0) + 1;
    for (const style of styles) styleTotals[style] = (styleTotals[style] || 0) + 1;

    const shardKeys = new Set(words(item.name).map((token) => /^[a-z0-9]/.test(token) ? token[0] : '_'));
    if (!shardKeys.size) shardKeys.add('_');
    for (const shardKey of shardKeys) {
      if (!searchShards.has(shardKey)) searchShards.set(shardKey, []);
      searchShards.get(shardKey).push([item.name, packId, sid, category, styles, item.path, variant]);
    }
    totalIcons++;
  }
}

const packRows = [...packs.values()].sort((a,b) => b.count-a.count || a.name.localeCompare(b.name));
for (let packIndex = 0; packIndex < packRows.length; packIndex++) {
  const pack = packRows[packIndex];
  const spritePath = path.join(outRoot, 'data', 'sprites', `${pack.fileId}.svg`);
  const packPath = path.join(outRoot, 'data', 'packs', `${pack.fileId}.json`);
  const icons = pack.icons;
  const symbols = await mapLimit(icons, concurrency, async (icon) => {
    try {
      const svg = await fs.readFile(icon.p, 'utf8');
      return normalizeSvgForSymbol(svg, icon.s);
    } catch {
      return `<symbol id="${icon.s}" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor"/><path d="M8 12h8" stroke="currentColor"/></symbol>`;
    }
  });
  await fs.writeFile(spritePath, `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols.join('')}</svg>`);
  await fs.writeFile(packPath, JSON.stringify({
    id: pack.id,
    fileId: pack.fileId,
    family: pack.family,
    prefix: pack.prefix,
    name: pack.name,
    author: pack.author,
    license: pack.license,
    count: pack.count,
    categories: pack.categories,
    styles: pack.styles,
    sprite: `data/sprites/${pack.fileId}.svg`,
    icons,
  }));
  console.log(`Pages pack ${packIndex + 1}/${packRows.length}: ${pack.id} (${pack.count})`);
}

for (const [key, rows] of searchShards) {
  await fs.writeFile(path.join(outRoot, 'data', 'search', `${safeFilePart(key)}.json`), JSON.stringify(rows));
}

const catalogPacks = packRows.map((pack) => ({
  id: pack.id,
  fileId: pack.fileId,
  family: pack.family,
  prefix: pack.prefix,
  name: pack.name,
  author: pack.author,
  license: pack.license,
  count: pack.count,
  categories: pack.categories,
  styles: pack.styles,
  dominantCategory: Object.entries(pack.categories).sort((a,b) => b[1]-a[1])[0]?.[0] || 'misc',
  dominantStyles: Object.entries(pack.styles).sort((a,b) => b[1]-a[1]).slice(0,4).map(([name]) => name),
  sprite: `data/sprites/${pack.fileId}.svg`,
  preview: pack.preview,
}));

await fs.writeFile(path.join(outRoot, 'data', 'catalog.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalIcons,
  packCount: catalogPacks.length,
  families: familyTotals,
  categories: categoryTotals,
  styles: styleTotals,
  packs: catalogPacks,
}));

await fs.writeFile(path.join(outRoot, 'data', 'taxonomy.json'), JSON.stringify(taxonomy));
await fs.writeFile(path.join(outRoot, '.nojekyll'), '');
console.log(`Pages data ready: ${totalIcons} icons, ${catalogPacks.length} packs, ${searchShards.size} search shards.`);
